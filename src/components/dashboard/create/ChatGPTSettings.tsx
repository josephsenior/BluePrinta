"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type Account = { clientId: string; label: string; email?: string; connected: boolean };
type Status = { provider: string; activeClientId?: string; accounts: Account[]; models: { slug: string; display_name: string }[]; modelError?: string; signIn: { status: string; error?: string } };

export function ChatGPTSettings({ onModels }: { onModels: (models: { slug: string; display_name: string }[]) => void }) {
  const [status, setStatus] = useState<Status>();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const refresh = useCallback(async (withModels = false) => {
    const response = await fetch(`/api/chatgpt${withModels ? "?models=1" : ""}`, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to load ChatGPT settings");
    setStatus(data);
    if (withModels) onModels(data.models || []);
    return data as Status;
  }, [onModels]);
  useEffect(() => { void refresh(true).catch(error => setMessage(error.message)); }, [refresh]);
  useEffect(() => {
    if (!busy) return;
    const timer = setInterval(() => {
      void refresh().then(result => {
        if (result.signIn.status === "success") { setBusy(false); setMessage("Connected to ChatGPT."); void refresh(true); }
        if (result.signIn.status === "error") { setBusy(false); setMessage(result.signIn.error || "Sign-in failed."); }
      }).catch(error => { setBusy(false); setMessage(error.message); });
    }, 2000);
    return () => clearInterval(timer);
  }, [busy, refresh]);
  const action = async (action: string, clientId?: string) => {
    const popup = action === "sign-in" ? window.open("about:blank", "_blank") : null;
    try {
      if (action === "sign-in" && !popup) throw new Error("Allow pop-ups to continue with ChatGPT.");
      setMessage("");
      const response = await fetch("/api/chatgpt", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, clientId }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "ChatGPT operation failed");
      if (action === "sign-in") {
        if (!popup) throw new Error("Allow pop-ups to continue with ChatGPT.");
        popup.location.href = result.url;
        setBusy(true);
      } else {
        if (action === "cancel") { setBusy(false); setMessage("Sign-in cancelled."); }
        if (action === "sign-out" && !result.revoked) setMessage("Signed out locally, but remote revocation could not be confirmed. Disconnect Blueprinta in ChatGPT settings.");
        await refresh(true);
      }
    } catch (error) { popup?.close(); setMessage(error instanceof Error ? error.message : "ChatGPT operation failed"); }
  };
  if (!status) return message ? <p role="status" className="px-4 py-2 text-xs">{message}</p> : null;
  const active = status.accounts.find(a => a.clientId === status.activeClientId);
  return <div className="px-4 py-2 border-b text-xs space-y-2">
    <div className="flex flex-wrap items-center gap-2">
      <span>{active ? `ChatGPT: ${active.label}${active.email ? ` (${active.email})` : ""}` : "ChatGPT not connected"}</span>
      <Button data-oai-siwc-button type="button" size="sm" variant="outline" disabled={busy} onClick={() => void action("sign-in")}>{busy ? "Waiting for sign-in…" : "Continue with ChatGPT"}</Button>
      {busy && <Button type="button" size="sm" variant="ghost" onClick={() => void action("cancel")}>Cancel</Button>}
      {active && <Button type="button" size="sm" variant="ghost" onClick={() => void action("sign-out", active.clientId)}>Sign out</Button>}
      <a className="underline" href="https://chatgpt.com/#settings/usage" target="_blank" rel="noreferrer">Usage and limits</a>
    </div>
    {status.accounts.filter(a => a.clientId !== status.activeClientId).map(account => <div key={account.clientId} className="flex items-center gap-2"><span>{account.label}{account.email ? ` (${account.email})` : ""}</span><Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => void action(account.connected ? "select" : "sign-in", account.clientId)}>{account.connected ? "Use account" : "Sign in again"}</Button></div>)}
    {(message || status.modelError) && <p role="status">{message || status.modelError}</p>}
  </div>;
}
