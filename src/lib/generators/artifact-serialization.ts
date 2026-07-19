import type { Diagram } from "@/types/diagram";
import type { MetaSOPResult } from "@/lib/metasop/types";

export type MetaSOPArtifactKey = keyof MetaSOPResult["artifacts"];

export function getArtifactContent(diagram: Diagram, key: MetaSOPArtifactKey): unknown {
  return diagram.metadata?.metasop_artifacts?.[key]?.content;
}

export function getAllArtifacts(diagram: Diagram): unknown {
  return diagram.metadata?.metasop_artifacts;
}

export function getAllArtifactsContent(diagram: Diagram): Record<string, unknown> | undefined {
  const artifacts = diagram.metadata?.metasop_artifacts;
  if (!artifacts || typeof artifacts !== "object") return undefined;

  const out: Record<string, unknown> = {};
  for (const [key, artifact] of Object.entries(artifacts as Record<string, any>)) {
    out[key] = artifact?.content;
  }
  return out;
}

export function stringifyArtifact(value: unknown): string {
  if (value === undefined) return "";
  return JSON.stringify(
    value,
    (_key, v) => (typeof v === "bigint" ? v.toString() : v),
    2
  );
}

export const ARTIFACT_LABELS: Record<string, string> = {
  pm_spec: "Product Specification",
  arch_design: "Architecture Design",
  devops_infrastructure: "Infrastructure & DevOps",
  security_architecture: "Security Architecture",
  ui_design: "UI & Design System",
  engineer_impl: "Engineering Blueprint",
  qa_verification: "Quality Assurance & Testing",
};

export function artifactLabel(key: string): string {
  return ARTIFACT_LABELS[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function artifactSummary(content: unknown): string | undefined {
  if (typeof content === "string") return content;
  if (!content || typeof content !== "object" || Array.isArray(content)) return undefined;

  const record = content as Record<string, unknown>;
  for (const key of ["summary", "description", "architecture_overview", "overview", "project_name", "title"]) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}
