// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { EventEmitter } from "node:events";
import { generateKeyPairSync } from "node:crypto";
import { promises as fs } from "node:fs";
import { join } from "node:path";
import jwt from "jsonwebtoken";

const serverHolder = vi.hoisted(() => ({ server: undefined as any }));
vi.mock("node:http", async (importOriginal) => ({ ...(await importOriginal<typeof import("node:http")>()), createServer: () => {
  const server = new EventEmitter() as EventEmitter & { listen: (...args: any[]) => void; address: () => object; close: () => void };
  server.listen = (_port, _host, callback) => callback();
  server.address = () => ({ port: 43210 });
  server.close = () => {};
  serverHolder.server = server;
  return server;
} }));

import { getAccessToken, getAccounts, getSignInStatus, startSignIn } from "@/lib/chatgpt/session";

let directory: string;
beforeEach(async () => {
  directory = await fs.mkdtemp(join(process.cwd(), ".chatgpt-test-"));
  process.env.BLUEPRINTA_CHATGPT_DIR = directory;
});
afterEach(async () => {
  vi.unstubAllGlobals();
  delete process.env.BLUEPRINTA_CHATGPT_DIR;
  await fs.rm(directory, { recursive: true, force: true });
});

describe("ChatGPT plan sign-in", () => {
  it("validates the signed identity, saves the account, and refreshes its token", async () => {
    const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    let nonce = "";
    let refreshes = 0;
    vi.stubGlobal("fetch", vi.fn(async (url: string, init?: RequestInit) => {
      if (url.endsWith("openid-configuration")) return Response.json({ issuer: "https://auth.openai.com", jwks_uri: "https://auth.openai.com/jwks" });
      if (url.endsWith("/jwks")) return Response.json({ keys: [{ ...publicKey.export({ format: "jwk" }), kid: "key1", alg: "RS256", use: "sig" }] });
      if (url.endsWith("/oauth/token")) {
        const body = init?.body as URLSearchParams;
        if (body.get("grant_type") === "refresh_token") { refreshes++; return Response.json({ access_token: "new-access", refresh_token: "new-refresh", expires_in: 3600, token_type: "Bearer" }); }
        const idToken = jwt.sign({ nonce, email: "user@example.com" }, privateKey, { algorithm: "RS256", keyid: "key1", issuer: "https://auth.openai.com", audience: "client-1", subject: "user-1", expiresIn: "1h" });
        return Response.json({ access_token: "access", refresh_token: "refresh", id_token: idToken, expires_in: 1, token_type: "Bearer", scope: "openid chatgpt.tokens.use.direct" });
      }
      throw new Error(`unexpected URL: ${url}`);
    }));
    const url = new URL(await startSignIn());
    nonce = url.searchParams.get("nonce")!;
    expect(url.searchParams.get("client_id")).toBe("dynamic_agent_client");
    expect(url.searchParams.get("redirect_uri")).toBe("http://127.0.0.1:43210/auth/callback");
    const rejected = await new Promise<number>(resolve => {
      serverHolder.server.emit("request", { url: "/auth/callback?state=incorrect&code=code&client_id=client-1" }, { writeHead: resolve, end: () => {} });
    });
    expect(rejected).toBe(400);
    expect(getSignInStatus().status).toBe("pending");
    const result = await new Promise<number>(resolve => {
      const response = { writeHead: (status: number) => { resolve(status); }, end: () => {} };
      serverHolder.server.emit("request", { url: `/auth/callback?state=${url.searchParams.get("state")}&code=code&client_id=client-1` }, response);
    });
    expect(result).toBe(200);
    expect(getSignInStatus().status).toBe("success");
    const accounts = await getAccounts();
    expect(accounts.accounts[0]).toMatchObject({ clientId: "client-1", email: "user@example.com", connected: true });
    expect(await Promise.all([getAccessToken(), getAccessToken()])).toEqual(["new-access", "new-access"]);
    expect(refreshes).toBe(1);
    expect(JSON.stringify(accounts)).not.toContain("refresh");
  });

  it("rejects a signed identity with a different nonce and does not save credentials", async () => {
    const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      if (url.endsWith("openid-configuration")) return Response.json({ issuer: "https://auth.openai.com", jwks_uri: "https://auth.openai.com/jwks" });
      if (url.endsWith("/jwks")) return Response.json({ keys: [{ ...publicKey.export({ format: "jwk" }), kid: "key1", alg: "RS256" }] });
      const idToken = jwt.sign({ nonce: "wrong" }, privateKey, { algorithm: "RS256", keyid: "key1", issuer: "https://auth.openai.com", audience: "client-2", subject: "user-2", expiresIn: "1h" });
      return Response.json({ access_token: "access", refresh_token: "refresh", id_token: idToken, expires_in: 3600, token_type: "Bearer", scope: "openid chatgpt.tokens.use.direct" });
    }));
    const url = new URL(await startSignIn());
    const result = await new Promise<number>(resolve => {
      serverHolder.server.emit("request", { url: `/auth/callback?state=${url.searchParams.get("state")}&code=code&client_id=client-2` }, { writeHead: resolve, end: () => {} });
    });
    expect(result).toBe(400);
    expect((await getAccounts()).accounts).toHaveLength(0);
    expect(getSignInStatus().status).toBe("error");
  });

});
