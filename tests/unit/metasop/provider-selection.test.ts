import { describe, expect, it } from "vitest";
import { providerForModel } from "@/lib/metasop/utils/llm-helper";

describe("provider selection", () => {
  it("selects the provider for the chosen model independently of the default", () => {
    expect(providerForModel("gemini-3.7-flash", "chatgpt")).toBe("gemini");
    expect(providerForModel("gpt-6.1-terra", "gemini")).toBe("chatgpt");
    expect(providerForModel(undefined, "gemini")).toBe("gemini");
  });
  it("keeps the explicit mock provider offline", () => {
    expect(providerForModel("gpt-6.1-terra", "mock")).toBe("mock");
    expect(providerForModel("gemini-3.7-flash", "mock")).toBe("mock");
  });
});
