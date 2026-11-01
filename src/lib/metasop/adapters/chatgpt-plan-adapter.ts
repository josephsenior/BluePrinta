import type { LLMOptions, LLMProvider } from "./llm-adapter";

/** Responses API transport for an OAuth token authorized for ChatGPT plan usage. */
export class ChatGPTPlanProvider implements LLMProvider {
  constructor(private readonly getToken: () => Promise<string>, private readonly defaultModel = "gpt-6.1-terra") {}

  async generate(prompt: string, options?: LLMOptions): Promise<string> {
    return this.generateStream(prompt, () => {}, options);
  }

  async generateStructured<T>(prompt: string, schema: unknown, options?: LLMOptions): Promise<T> {
    const text = await this.generate(`${prompt}\n\nReturn only a JSON value matching this schema:\n${JSON.stringify(schema)}`, { ...options, responseSchema: schema });
    try {
      return JSON.parse(text.replace(/^\s*```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "")) as T;
    } catch {
      throw new Error("ChatGPT returned invalid JSON for structured output");
    }
  }

  async generateStream(prompt: string, onChunk: (chunk: string) => void, options?: LLMOptions): Promise<string> {
    const token = await this.getToken();
    if (!token) throw new Error("ChatGPT plan access token is missing; sign-in is required");
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      signal: AbortSignal.timeout(900_000),
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: options?.model && !options.model.startsWith("gemini-") ? options.model : this.defaultModel,
        input: [{ role: "user", content: prompt }],
        ...(options?.systemInstruction ? { instructions: options.systemInstruction } : {}),
        ...(options?.reasoning ? { reasoning: { effort: "high" } } : {}),
        ...(options?.responseSchema ? { text: { format: { type: "json_object" } } } : {}),
        store: false,
        stream: true,
      }),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null) as { error?: { code?: string } } | null;
      const code = body?.error?.code;
      const suffix = code && /^[a-zA-Z0-9_-]{1,100}$/.test(code) ? `: ${code}` : "";
      throw new Error(`ChatGPT plan request failed (HTTP ${response.status})${suffix}`);
    }
    if (!response.body) throw new Error("ChatGPT plan response has no stream");
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let output = "";
    let completed = false;
    const handleEvent = (event: string) => {
      const data = event.split(/\r?\n/).filter(line => line.startsWith("data:")).map(line => line.slice(5).trimStart()).join("\n");
      if (!data || data === "[DONE]") return;
      let payload: { type?: string; delta?: string; error?: { code?: string }; response?: { error?: { code?: string } } };
      try { payload = JSON.parse(data); } catch { throw new Error("Invalid ChatGPT stream event"); }
      if (payload.type === "response.output_text.delta" && typeof payload.delta === "string") {
        output += payload.delta;
        onChunk(payload.delta);
      } else if (payload.type === "response.completed") {
        completed = true;
      } else if (payload.type === "response.failed" || payload.type === "response.incomplete" || payload.type === "error") {
        throw new Error(`ChatGPT plan response failed: ${payload.response?.error?.code || payload.error?.code || payload.type}`);
      }
    };
    try {
      while (true) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value, { stream: !done });
        const events = buffer.split(/\r?\n\r?\n/);
        buffer = events.pop() || "";
        for (const event of events) handleEvent(event);
        if (done) break;
      }
      if (buffer.trim()) handleEvent(buffer);
    } finally {
      reader.releaseLock();
    }
    if (!completed) throw new Error("ChatGPT plan stream ended before completion");
    return output;
  }
}
