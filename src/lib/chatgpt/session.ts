import { createHash, createPublicKey, randomBytes, randomUUID } from "node:crypto";
import { createServer } from "node:http";
import { promises as fs } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import jwt from "jsonwebtoken";

const ISSUER = "https://auth.openai.com";
const RESOURCE = "https://api.openai.com/v1";
const SCOPES = "openid profile email offline_access resource.invoke chatgpt.tokens.use.direct";
const storageDir = () => process.env.BLUEPRINTA_CHATGPT_DIR || join(homedir(), ".blueprinta", "chatgpt");
const storagePath = () => join(storageDir(), "accounts.json");

type Account = {
  clientId: string; subject: string; email?: string; label: string;
  accessToken?: string; refreshToken?: string; idToken?: string; expiresAt?: number; scopes: string[];
};
type Store = { hostId: string; activeClientId?: string; accounts: Account[] };
type TokenResponse = { access_token: string; refresh_token?: string; id_token?: string; expires_in: number; token_type: string; scope?: string };

async function readStore(): Promise<Store> {
  try { return JSON.parse(await fs.readFile(storagePath(), "utf8")) as Store; }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    return { hostId: `urn:uuid:${randomUUID()}`, accounts: [] };
  }
}
async function writeStore(store: Store): Promise<void> {
  await fs.mkdir(storageDir(), { recursive: true, mode: 0o700 });
  const tmp = join(storageDir(), `accounts-${randomUUID()}.tmp`);
  try {
    await fs.writeFile(tmp, JSON.stringify(store), { mode: 0o600, flag: "wx" });
    await fs.rename(tmp, storagePath());
  } finally { await fs.unlink(tmp).catch(() => {}); }
}

// The lock covers both disk updates and token refresh, including across local app processes.
let serial: Promise<unknown> = Promise.resolve();
function locked<T>(fn: () => Promise<T>): Promise<T> {
  const next = serial.then(async () => {
    await fs.mkdir(storageDir(), { recursive: true, mode: 0o700 });
    const lockPath = join(storageDir(), "accounts.lock");
    const deadline = Date.now() + 30_000;
    for (;;) {
      try { await fs.mkdir(lockPath, { mode: 0o700 }); break; }
      catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
        // Requests have bounded timeouts; an old lock is left by a crashed process.
        const info = await fs.stat(lockPath).catch(() => undefined);
        if (info && Date.now() - info.mtimeMs > 120_000) { await fs.rmdir(lockPath).catch(() => {}); continue; }
        if (Date.now() >= deadline) throw new Error("ChatGPT account is busy; try again");
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    try { return await fn(); } finally { await fs.rmdir(lockPath).catch(() => {}); }
  });
  serial = next.catch(() => {});
  return next;
}

async function tokenRequest(body: URLSearchParams): Promise<TokenResponse> {
  const response = await fetch(`${ISSUER}/api/accounts/oauth/token`, {
    method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body, signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`ChatGPT sign-in failed (HTTP ${response.status}). Please sign in again.`);
  const result = await response.json() as TokenResponse;
  if (!result.access_token || !result.expires_in || result.token_type?.toLowerCase() !== "bearer") throw new Error("Invalid token response from OpenAI");
  return result;
}

async function validateIdToken(token: string, clientId: string, nonce: string): Promise<jwt.JwtPayload> {
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded || decoded.header.alg !== "RS256" || !decoded.header.kid) throw new Error("Invalid ID token header");
  const response = await fetch(`${ISSUER}/.well-known/openid-configuration`);
  if (!response.ok) throw new Error("Could not load OpenAI identity configuration");
  const discovery = await response.json() as { issuer?: string; jwks_uri?: string };
  if (discovery.issuer !== ISSUER || !discovery.jwks_uri || new URL(discovery.jwks_uri).origin !== ISSUER) throw new Error("Invalid OpenAI identity configuration");
  const keysResponse = await fetch(discovery.jwks_uri);
  if (!keysResponse.ok) throw new Error("Could not load OpenAI signing keys");
  const keys = await keysResponse.json() as { keys: (JsonWebKey & { kid?: string; alg?: string; use?: string })[] };
  const jwk = keys.keys.find(key => key.kid === decoded.header.kid && (!key.alg || key.alg === "RS256") && (!key.use || key.use === "sig"));
  if (!jwk) throw new Error("OpenAI signing key not found");
  const key = createPublicKey({ key: jwk as import("node:crypto").JsonWebKey, format: "jwk" });
  const claims = jwt.verify(token, key, { algorithms: ["RS256"], issuer: ISSUER, audience: clientId });
  if (typeof claims === "string" || !claims.sub || !claims.exp || !claims.iat || claims.nonce !== nonce) throw new Error("Invalid OpenAI identity claims");
  return claims;
}

export async function getAccounts() {
  const store = await readStore();
  return { activeClientId: store.activeClientId, accounts: store.accounts.map(({ clientId, email, label, accessToken, refreshToken }) => ({ clientId, email, label, connected: !!(accessToken && refreshToken) })) };
}

export async function selectAccount(clientId: string) {
  await locked(async () => {
    const store = await readStore();
    const account = store.accounts.find(a => a.clientId === clientId);
    if (!account?.refreshToken) throw new Error("Sign in to this account first");
    store.activeClientId = clientId;
    await writeStore(store);
  });
}

export async function getAccessToken(): Promise<string> {
  return locked(async () => {
    const store = await readStore();
    const account = store.accounts.find(a => a.clientId === store.activeClientId);
    if (!account?.accessToken || !account.refreshToken) throw new Error("Continue with ChatGPT to connect your account");
    if ((account.expiresAt || 0) > Date.now() + 60_000) return account.accessToken;
    const result = await tokenRequest(new URLSearchParams({ grant_type: "refresh_token", client_id: account.clientId, refresh_token: account.refreshToken, resource: RESOURCE }));
    if (!result.refresh_token) throw new Error("ChatGPT refresh did not return a replacement token; sign in again");
    const scopes = result.scope ? result.scope.split(/\s+/) : account.scopes;
    if (!scopes.includes("chatgpt.tokens.use.direct")) throw new Error("ChatGPT plan permission was not granted");
    account.accessToken = result.access_token;
    account.refreshToken = result.refresh_token;
    account.expiresAt = Date.now() + result.expires_in * 1000;
    account.scopes = scopes;
    await writeStore(store);
    return account.accessToken;
  });
}

let pending: { status: "pending" | "success" | "error"; error?: string } | undefined;
export function getSignInStatus() { return pending || { status: "idle" }; }
let cancelPending: (() => void) | undefined;
export function cancelSignIn() {
  cancelPending?.();
}

export async function startSignIn(existingClientId?: string): Promise<string> {
  if (pending?.status === "pending") throw new Error("A sign-in is already in progress");
  const store = await locked(async () => { const value = await readStore(); await writeStore(value); return value; });
  const existing = existingClientId ? store.accounts.find(a => a.clientId === existingClientId) : undefined;
  if (existingClientId && !existing) throw new Error("Account not found");
  const state = randomBytes(32).toString("base64url");
  const nonce = randomBytes(32).toString("base64url");
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  pending = { status: "pending" };
  const server = createServer();
  try {
    await new Promise<void>((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  } catch (error) {
    pending = { status: "error", error: "Could not start the local sign-in callback." };
    throw error;
  }
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Could not start sign-in callback");
  const redirectUri = `http://127.0.0.1:${address.port}/auth/callback`;
  const timeout = setTimeout(() => { pending = { status: "error", error: "Sign-in timed out. Please try again." }; server.close(); }, 5 * 60_000);
  let consumed = false;
  cancelPending = () => {
    clearTimeout(timeout);
    server.close();
    cancelPending = undefined;
    pending = { status: "error", error: "Sign-in cancelled." };
  };
  server.on("request", async (request, response) => {
    const url = new URL(request.url || "/", redirectUri);
    if (url.pathname !== "/auth/callback") { response.writeHead(404); response.end(); return; }
    if (url.searchParams.get("state") !== state) { response.writeHead(400); response.end("Invalid sign-in state."); return; }
    if (consumed) { response.writeHead(400); response.end("Sign-in already used."); return; }
    consumed = true;
    cancelPending = undefined;
    clearTimeout(timeout);
    server.close();
    try {
      if (url.searchParams.has("error")) throw new Error("ChatGPT sign-in was declined or cancelled.");
      const code = url.searchParams.get("code");
      const returnedClient = url.searchParams.get("client_id");
      if (existing && returnedClient && returnedClient !== existing.clientId) throw new Error("Unexpected ChatGPT client ID");
      const clientId = existing?.clientId || returnedClient;
      if (!code || !clientId || clientId === "dynamic_agent_client") throw new Error("Incomplete ChatGPT registration");
      const result = await tokenRequest(new URLSearchParams({ grant_type: "authorization_code", client_id: clientId, code, code_verifier: verifier, redirect_uri: redirectUri, resource: RESOURCE }));
      if (!result.id_token || !result.refresh_token || !result.scope?.split(/\s+/).includes("chatgpt.tokens.use.direct")) throw new Error("ChatGPT plan permission was not granted");
      const claims = await validateIdToken(result.id_token, clientId, nonce);
      if (existing && existing.subject !== claims.sub) throw new Error("The signed-in account does not match the selected account");
      await locked(async () => {
        const current = await readStore();
        const previous = current.accounts.find(a => a.clientId === clientId);
        if (previous && previous.subject !== claims.sub) throw new Error("The signed-in account does not match the existing registration");
        const account: Account = { clientId, subject: claims.sub!, email: typeof claims.email === "string" ? claims.email : undefined, label: existing?.label || `Account ${current.accounts.length + 1}`, accessToken: result.access_token, refreshToken: result.refresh_token, idToken: result.id_token, expiresAt: Date.now() + result.expires_in * 1000, scopes: result.scope!.split(/\s+/) };
        current.accounts = [...current.accounts.filter(a => a.clientId !== clientId), account];
        current.activeClientId = clientId;
        await writeStore(current);
      });
      pending = { status: "success" };
      response.writeHead(200, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
      response.end("Connected to ChatGPT. You can close this window and return to Blueprinta.");
    } catch (error) {
      pending = { status: "error", error: error instanceof Error ? error.message : "Sign-in failed" };
      response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" });
      response.end("Sign-in failed. Return to Blueprinta for details.");
    }
  });
  const params = new URLSearchParams({ client_id: existing?.clientId || "dynamic_agent_client", ext_agent_host_id: store.hostId, response_type: "code", redirect_uri: redirectUri, scope: SCOPES, resource: RESOURCE, state, nonce, code_challenge_method: "S256", code_challenge: challenge });
  if (!existing) params.set("agent_name_hint", "Blueprinta");
  else if (existing.idToken) params.set("id_token_hint", existing.idToken);
  else if (existing.email) params.set("login_hint", existing.email);
  return `${ISSUER}/api/accounts/authorize?${params}`;
}

export async function signOut(clientId: string): Promise<boolean> {
  return locked(async () => {
    const store = await readStore();
    const account = store.accounts.find(a => a.clientId === clientId);
    if (!account) throw new Error("Account not found");
    let revoked = !account.refreshToken;
    if (account.refreshToken) {
      try {
        const discovery = await fetch(`${ISSUER}/.well-known/openid-configuration`, { signal: AbortSignal.timeout(20_000) });
        const config = await discovery.json() as { revocation_endpoint?: string };
        if (discovery.ok && config.revocation_endpoint && new URL(config.revocation_endpoint).origin === ISSUER) {
          const result = await fetch(config.revocation_endpoint, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ token: account.refreshToken, token_type_hint: "refresh_token", client_id: clientId }), signal: AbortSignal.timeout(20_000) });
          revoked = result.ok;
        }
      } catch { revoked = false; }
    }
    delete account.accessToken; delete account.refreshToken; delete account.idToken; delete account.expiresAt;
    account.scopes = [];
    if (store.activeClientId === clientId) delete store.activeClientId;
    await writeStore(store);
    return revoked;
  });
}

export async function listModels(): Promise<{ slug: string; display_name: string }[]> {
  const token = await getAccessToken();
  const response = await fetch(`${RESOURCE}/models`, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error(`Unable to load ChatGPT models (HTTP ${response.status})`);
  const result = await response.json() as { models?: { slug: string; display_name: string; visibility: string }[] };
  if (!Array.isArray(result.models)) throw new Error("Invalid ChatGPT model catalog");
  return result.models.filter(model => model.visibility === "list" && typeof model.slug === "string").map(({ slug, display_name }) => ({ slug, display_name }));
}
