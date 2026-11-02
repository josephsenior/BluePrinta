import { describe, expect, it } from "vitest";
import { DocumentationGenerator } from "@/lib/generators/documentation-generator";
import type { Diagram } from "@/types/diagram";

const diagram: Diagram = {
  id: "export-fixture",
  userId: "guest_fixture",
  title: "Export Fixture",
  description: "A structured export fixture.",
  status: "completed",
  createdAt: "2026-07-19T12:00:00.000Z",
  updatedAt: "2026-07-19T12:00:00.000Z",
  metadata: {
    generated_at: "2026-07-19T12:00:00.000Z",
    metasop_artifacts: {
      pm_spec: { content: { project_name: "Export Fixture", summary: "A concise product summary." } },
      arch_design: { content: { architecture_overview: "A local-first architecture." } },
    } as any,
  },
};

describe("DocumentationGenerator", () => {
  it("creates a structured Markdown document with artifact sections", () => {
    const markdown = new DocumentationGenerator(diagram).generateMarkdown();

    expect(markdown).toContain("# Export Fixture");
    expect(markdown).toContain("## Export details");
    expect(markdown).toContain("## Product Specification");
    expect(markdown).toContain("## Architecture Design");
    expect(markdown).toContain("### Structured data");
  });
});
