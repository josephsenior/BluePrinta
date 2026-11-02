import { describe, expect, it } from "vitest";
import { pmSchema } from "@/lib/metasop/artifacts/product-manager/schema";

describe("Product Manager Gemini schema", () => {
  it("requires an ID for every user story to match the artifact validator", () => {
    const userStorySchema = pmSchema.properties.user_stories.items;

    expect(userStorySchema.required).toContain("id");
  });
});
