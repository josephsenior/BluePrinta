import type { Diagram } from "@/types/diagram"
import { artifactLabel, artifactSummary, getAllArtifactsContent, stringifyArtifact } from "@/lib/generators/artifact-serialization"

interface DocumentationOptions {
  includeDiagrams?: boolean
  includeCode?: boolean
  includeDatabase?: boolean
  includeAPIs?: boolean
  includeEstimates?: boolean
}

export class DocumentationGenerator {
  private diagram: Diagram
  // Options retained for compatibility, but content is data-only.
  private options: DocumentationOptions

  constructor(diagram: Diagram, options: DocumentationOptions = {}) {
    this.diagram = diagram
    this.options = options
  }

  generateMarkdown(): string {
    const artifacts = getAllArtifactsContent(this.diagram) ?? {}
    const projectName = this.diagram.title || "Blueprinta Project"
    const description = this.diagram.description?.trim()
    const generatedAt = this.diagram.metadata?.generated_at ?? this.diagram.updatedAt

    const sections = Object.entries(artifacts).map(([key, content]) => {
      const summary = artifactSummary(content)
      const summaryBlock = summary ? `\n### Summary\n\n${summary}\n` : ""
      return `## ${artifactLabel(key)}${summaryBlock}\n### Structured data\n\n\`\`\`json\n${stringifyArtifact(content)}\n\`\`\``
    })

    return [
      `# ${projectName}`,
      description ? `\n${description}` : "",
      "\n## Export details",
      `- Generated: ${new Date(generatedAt).toISOString()}`,
      `- Artifacts included: ${Object.keys(artifacts).length}`,
      "",
      ...sections,
      "",
    ].join("\n")
  }
}
