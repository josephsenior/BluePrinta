import { describe, expect, it } from "vitest";
import { validateCreateDiagramRequest, validateScopeRequest } from "@/lib/diagrams/schemas";

describe("diagram request validation", () => {
  it("accepts a bounded local generation request", () => {
    expect(validateCreateDiagramRequest({
      prompt: "Design a local notes application",
      documents: [{ name: "brief.md", type: "md", content: "A short brief" }],
    }).prompt).toBe("Design a local notes application");
  });

  it("rejects oversized prompts and attachments", () => {
    expect(() => validateScopeRequest({ prompt: "x".repeat(50_001) })).toThrow();
    expect(() => validateCreateDiagramRequest({
      prompt: "Design an app",
      documents: [{ name: "large.txt", type: "txt", content: "x".repeat(1_000_001) }],
    })).toThrow();
  });
});
