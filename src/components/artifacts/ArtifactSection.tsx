"use client"

import type { ComponentType, ReactNode } from "react"
import { cn } from "@/lib/utils"

const headings: Record<string, string> = {
  overview: "Overview", stories: "User stories", acceptance: "Acceptance criteria", invest: "Story quality", assumptions: "Assumptions", outofscope: "Out of scope", swot: "SWOT analysis", stakeholders: "Stakeholders",
  design: "Architecture overview", api: "API contracts", db: "Database schema", decisions: "Architecture decisions", integrations: "Integrations", stack: "Technology stack", advanced: "Further considerations", tasks: "Tasks",
  infra: "Infrastructure", deploy: "Deployment", monitor: "Monitoring", cicd: "CI/CD pipeline", recovery: "Recovery", ops: "Operations",
  threats: "Threat model", controls: "Security controls", data: "Data security", management: "Security management", arch: "Architecture", tokens: "Design tokens", library: "Components", atomic: "Design structure", accessibility: "Accessibility", sitemap: "Pages and navigation",
  plan: "Implementation plan", struct: "File structure", deps: "Dependencies", scripts: "Scripts", tech: "Technical details", risks: "Risks", manual: "Manual verification", security: "Security testing", strategy: "Test strategy", cases: "Test cases", uat: "User acceptance testing",
}

/** Agent reports are continuous; links provide optional shortcuts, not hidden tabs. */
export function ArtifactSection({ value, children, className }: { value: string; children?: ReactNode; className?: string }) {
  return <section id={`section-${value}`} className={cn("scroll-mt-4 border-b border-border/50 py-7 last:border-0", className?.replace(/\bm-0\b/g, ""))}>
    <h3 className="mb-4 text-base font-semibold tracking-tight text-foreground">{headings[value] || value}</h3>
    {children}
  </section>
}

export function ArtifactSectionNav({ children }: { children: ReactNode }) {
  return <nav aria-label="Report sections" className="flex flex-wrap gap-2 border-b border-border/50 px-4 py-3">{children}</nav>
}

export function ArtifactSectionLink({ value, icon: Icon, label, count }: { value: string; icon: ComponentType<{ className?: string }>; label: string; count?: number }) {
  return <a href={`#section-${value}`} className="inline-flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary">
    <Icon className="h-3.5 w-3.5" />{label}{count !== undefined && <span className="text-muted-foreground">{count}</span>}
  </a>
}
