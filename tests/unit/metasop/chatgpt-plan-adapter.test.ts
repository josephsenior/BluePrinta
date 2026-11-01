import { afterEach, describe, expect, it, vi } from "vitest";
import { ChatGPTPlanProvider } from "@/lib/metasop/adapters/chatgpt-plan-adapter";

const stream = (events: unknown[]) => new Response(events.map(event => `data: ${JSON.stringify(event)}\n\n`).join(""), { status: 200 });

afterEach(() => vi.unstubAllGlobals());

describe("ChatGPT plan provider", () => {
  it("uses the subscription endpoint and requires a completed stream", async () => {
    const fetchMock = vi.fn().mockResolvedValue(stream([
      { type: "response.output_text.delta", delta: "hello" },
      { type: "response.completed" },
    ]));
    vi.stubGlobal("fetch", fetchMock);
    const provider = new ChatGPTPlanProvider(async () => "oauth-token");
    expect(await provider.generate("hi", { temperature: 0.5, maxTokens: 10 })).toBe("hello");
    const [url, request] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.openai.com/v1/responses");
    expect(JSON.parse(request.body)).toEqual({ model: "gpt-6.1-terra", input: [{ role: "user", content: "hi" }], store: false, stream: true });
  });

  it("rejects a stream that ends without completion", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(stream([{ type: "response.output_text.delta", delta: "partial" }])));
    await expect(new ChatGPTPlanProvider(async () => "token").generate("hi")).rejects.toThrow("before completion");
  });

  it("reports subscription errors after streaming begins", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(stream([{ type: "response.failed", response: { error: { code: "subscription_sharing_usage_limit_exceeded" } } }])));
    await expect(new ChatGPTPlanProvider(async () => "token").generate("hi")).rejects.toThrow("subscription_sharing_usage_limit_exceeded");
  });

  it("assembles events split across network chunks and parses structured output", async () => {
    const events = [{ type: "response.output_text.delta", delta: JSON.stringify({ ok: true }) }, { type: "response.completed" }];
    const bytes = new TextEncoder().encode(events.map(event => `data: ${JSON.stringify(event)}\r\n\r\n`).join(""));
    const body = new ReadableStream({ start(controller) {
      for (let i = 0; i < bytes.length; i += 7) controller.enqueue(bytes.slice(i, i + 7));
      controller.close();
    } });
    const fetchMock = vi.fn().mockResolvedValue(new Response(body));
    vi.stubGlobal("fetch", fetchMock);
    const provider = new ChatGPTPlanProvider(async () => "token");
    expect(await provider.generateStructured("test", { type: "object" }, { model: "gemini-3.7-flash", reasoning: true })).toEqual({ ok: true });
    const bodySent = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(bodySent.model).toBe("gpt-6.1-terra");
    expect(bodySent.reasoning).toEqual({ effort: "high" });
  });

  it("surfaces a safe error code for HTTP failures", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ error: { code: "subscription_sharing_usage_unavailable", message: "private details" } }, { status: 429 })));
    await expect(new ChatGPTPlanProvider(async () => "token").generate("hi")).rejects.toThrow("subscription_sharing_usage_unavailable");
  });

});
