import { NextRequest, NextResponse } from "next/server";
import { cancelSignIn, getAccounts, getSignInStatus, listModels, selectAccount, signOut, startSignIn } from "@/lib/chatgpt/session";
import { getRuntimeConfig } from "@/lib/runtime-config";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function localRequest(request: NextRequest): boolean {
  const url = new URL(request.url);
  const host = request.headers.get("host") || "";
  const hostName = host.replace(/:\d+$/, "").toLowerCase();
  if (!["localhost", "127.0.0.1", "[::1]"].includes(hostName)) return false;
  const origin = request.headers.get("origin");
  return !origin || origin === `${url.protocol}//${host}`;
}

export async function GET(request: NextRequest) {
  if (!localRequest(request)) return NextResponse.json({ error: "Local access only" }, { status: 403 });
  try {
    const accounts = await getAccounts();
    const active = accounts.accounts.find(a => a.clientId === accounts.activeClientId && a.connected);
    let models: Awaited<ReturnType<typeof listModels>> = [];
    let modelError: string | undefined;
    if (active && request.nextUrl.searchParams.get("models") === "1") {
      try { models = await listModels(); } catch (error) { modelError = error instanceof Error ? error.message : "Could not load models"; }
    }
    return NextResponse.json({ ...accounts, signIn: getSignInStatus(), models, modelError, provider: getRuntimeConfig().llm.provider, defaultModel: getRuntimeConfig().llm.model }, { headers: { "Cache-Control": "no-store" } });
  } catch { return NextResponse.json({ error: "Could not read ChatGPT account settings" }, { status: 500 }); }
}

export async function POST(request: NextRequest) {
  if (!localRequest(request) || !request.headers.get("origin")) return NextResponse.json({ error: "Local same-origin access required" }, { status: 403 });
  try {
    const body = await request.json() as { action?: string; clientId?: string };
    if (body.action === "cancel") { cancelSignIn(); return NextResponse.json({ ok: true }); }
    if (body.action === "sign-in") return NextResponse.json({ url: await startSignIn(body.clientId) }, { headers: { "Cache-Control": "no-store" } });
    if (body.action === "select" && body.clientId) { await selectAccount(body.clientId); return NextResponse.json({ ok: true }); }
    if (body.action === "sign-out" && body.clientId) return NextResponse.json({ revoked: await signOut(body.clientId) });
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "ChatGPT operation failed" }, { status: 400 }); }
}
