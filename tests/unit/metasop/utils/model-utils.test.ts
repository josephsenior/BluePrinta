import { describe, it, expect } from "vitest";
import { resolveGeminiModel, GEMINI_PRO_MODEL } from "@/lib/metasop/utils/model-utils";

describe("resolveGeminiModel", () => {
  it("maps retired gemini-3-pro-preview to gemini-3.1-pro-preview", () => {
    expect(resolveGeminiModel("gemini-3-pro-preview")).toBe(GEMINI_PRO_MODEL);
  });

  it("passes through supported models unchanged", () => {
    expect(resolveGeminiModel("gemini-3.5-flash")).toBe("gemini-3.5-flash");
    expect(resolveGeminiModel("gemini-3.1-pro-preview")).toBe("gemini-3.1-pro-preview");
  });
});
