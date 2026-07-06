import { describe, it, expect } from "vitest";
import { getDefaultScopeQuestions } from "@/lib/metasop/scoping/scope-prompt";

describe("scope-prompt", () => {
  it("returns 3 default fallback questions with valid shape", () => {
    const questions = getDefaultScopeQuestions();
    expect(questions).toHaveLength(3);
    for (const q of questions) {
      expect(q.id.length).toBeGreaterThan(0);
      expect(q.label.length).toBeGreaterThan(0);
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      expect(q.options.length).toBeLessThanOrEqual(4);
    }
  });
});
