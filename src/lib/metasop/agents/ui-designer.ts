import type { AgentContext, MetaSOPArtifact, MetaSOPEvent } from "../types";
import type { UIDesignerBackendArtifact } from "../artifacts/ui-designer/types";
import { uiDesignerSchema as uiSchema } from "../artifacts/ui-designer/schema";
import { generateStreamingStructuredWithLLM } from "../utils/llm-helper";
import { logger } from "../utils/logger";
import { FEW_SHOT_EXAMPLES, getDomainContext, getQualityCheckPrompt } from "../utils/prompt-standards";
import { getAgentTemperature, getAgentMaxTokens } from "../config";

/**
 * Sanitizes a color value to ensure it's a valid hex code.
 * Extracts the first valid hex code from malformed strings.
 */
function sanitizeColorValue(colorValue: string | undefined): string {
  if (!colorValue || typeof colorValue !== "string") {
    return colorValue || "";
  }

  // If already valid hex code, return it
  const hexPattern = /^#[0-9A-Fa-f]{6}$/;
  if (hexPattern.test(colorValue)) {
    return colorValue;
  }

  // Try to extract a valid hex code from the string
  const hexMatch = colorValue.match(/#[0-9A-Fa-f]{6}/i);
  if (hexMatch) {
    return hexMatch[0].toUpperCase();
  }

  // Return original value if no valid hex found
  return colorValue;
}

/**
 * Sanitizes all color values in design_tokens.colors
 */
function sanitizeDesignTokensColors(colors: any): Record<string, string> {
  if (!colors || typeof colors !== "object" || Array.isArray(colors)) {
    return {};
  }

  const sanitized: Record<string, string> = {};
  for (const [key, value] of Object.entries(colors)) {
    if (typeof value === "string") {
      sanitized[key] = sanitizeColorValue(value);
    }
  }
  return sanitized;
}

const DEFAULT_COLOR_PALETTE: Record<string, string> = {
  primary: "#4F46E5",
  primary_foreground: "#FFFFFF",
  secondary: "#6366F1",
  secondary_foreground: "#FFFFFF",
  background: "#0B1220",
  foreground: "#E5E7EB",
  muted: "#1F2937",
  muted_foreground: "#9CA3AF",
  card: "#111827",
  card_foreground: "#F9FAFB",
  popover: "#111827",
  popover_foreground: "#F9FAFB",
  border: "#374151",
  input: "#374151",
  ring: "#4F46E5",
  accent: "#1F2937",
  accent_foreground: "#F9FAFB",
  destructive: "#EF4444",
  destructive_foreground: "#FFFFFF",
};

function buildColorPalette(primary?: string): Record<string, string> {
  const palette = { ...DEFAULT_COLOR_PALETTE };
  if (primary && /^#[0-9A-Fa-f]{6}$/.test(primary)) {
    palette.primary = primary;
    palette.ring = primary;
  }
  return palette;
}

/**
 * Gemini sometimes returns design_tokens.colors as a string (JSON blob or single hex).
 * Coerce to the object shape required by the schema before validation.
 */
function coerceDesignTokensColors(colors: unknown): Record<string, string> | undefined {
  if (colors == null) return undefined;

  if (typeof colors === "string") {
    const trimmed = colors.trim();
    if (trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
          const sanitized = sanitizeDesignTokensColors(parsed);
          return Object.keys(sanitized).length > 0 ? sanitized : buildColorPalette();
        }
      } catch {
        // fall through
      }
    }

    const hex = sanitizeColorValue(trimmed);
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      return buildColorPalette(hex);
    }

    return buildColorPalette();
  }

  if (typeof colors === "object" && !Array.isArray(colors)) {
    const sanitized = sanitizeDesignTokensColors(colors);
    return Object.keys(sanitized).length > 0 ? sanitized : buildColorPalette();
  }

  return buildColorPalette();
}


const CSS_VALUE_PATTERN = /^[0-9.]*(rem|px|em|%)?$/;
const FONT_WEIGHT_PATTERN = /^[0-9]+$/;

/**
 * Sanitizes a spacing/typography CSS-like value. Strips instruction text (INVALID, FIX, REQUIRED, etc.) and returns only the value.
 */
function sanitizeCssLikeValue(value: string | undefined): string | undefined {
  if (value == null || typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (CSS_VALUE_PATTERN.test(trimmed)) return trimmed;
  const match = trimmed.match(/^([0-9.]*(?:rem|px|em|%)?)/);
  if (match?.[1]) return match[1];
  if (/INVALID|FIX|REQUIRED|FIXED_BELOW/i.test(trimmed)) return undefined;
  return trimmed.length <= 15 ? trimmed : undefined;
}

/**
 * Sanitizes a font weight value (digits only).
 */
function sanitizeFontWeightValue(value: string | undefined): string | undefined {
  if (value == null || typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (FONT_WEIGHT_PATTERN.test(trimmed)) return trimmed;
  const match = trimmed.match(/^([0-9]+)/);
  return match?.[1] ?? undefined;
}

/**
 * Sanitizes design_tokens.spacing, typography.fontSize, typography.fontWeight, and borderRadius so values contain only raw CSS (no INVALID/FIX/REQUIRED text).
 */
function sanitizeDesignTokensSpacingAndTypography(designTokens: any): void {
  if (!designTokens || typeof designTokens !== "object") return;

  if (designTokens.spacing && typeof designTokens.spacing === "object") {
    for (const [key, value] of Object.entries(designTokens.spacing)) {
      if (typeof value === "string") {
        const sanitized = sanitizeCssLikeValue(value);
        if (sanitized) designTokens.spacing[key] = sanitized;
        else delete designTokens.spacing[key];
      }
    }
  }

  if (designTokens.typography?.fontSize && typeof designTokens.typography.fontSize === "object") {
    for (const [key, value] of Object.entries(designTokens.typography.fontSize)) {
      if (typeof value === "string") {
        const sanitized = sanitizeCssLikeValue(value);
        if (sanitized) designTokens.typography.fontSize[key] = sanitized;
        else delete designTokens.typography.fontSize[key];
      }
    }
  }

  if (designTokens.typography?.fontWeight && typeof designTokens.typography.fontWeight === "object") {
    for (const [key, value] of Object.entries(designTokens.typography.fontWeight)) {
      if (typeof value === "string") {
        const sanitized = sanitizeFontWeightValue(value);
        if (sanitized) designTokens.typography.fontWeight[key] = sanitized;
        else delete designTokens.typography.fontWeight[key];
      }
    }
  }

  if (designTokens.borderRadius && typeof designTokens.borderRadius === "object") {
    for (const [key, value] of Object.entries(designTokens.borderRadius)) {
      if (typeof value === "string") {
        const sanitized = sanitizeCssLikeValue(value);
        if (sanitized) designTokens.borderRadius[key] = sanitized;
        else delete designTokens.borderRadius[key];
      }
    }
  }
}

/**
 * UI Designer Agent
 * Generates UI component hierarchy and design tokens
 */
export async function uiDesignerAgent(
  context: AgentContext,
  onProgress?: (event: Partial<MetaSOPEvent>) => void
): Promise<MetaSOPArtifact> {
  const { user_request } = context;

  logger.info("UI Designer agent starting", { user_request: user_request.substring(0, 100) });

  try {
    let content: UIDesignerBackendArtifact;

    const pmArtifact = context.previous_artifacts?.pm_spec?.content as any;
    const archArtifact = context.previous_artifacts?.arch_design?.content as any;
    const projectTitle = pmArtifact?.summary?.substring(0, 50);

    const domainContext = getDomainContext(user_request);
    const qualityCheck = getQualityCheckPrompt("ui");

    const projectContext = pmArtifact
      ? `
Project Context:
- Summary: ${pmArtifact.summary}
- Key User Stories: ${pmArtifact.user_stories?.slice(0, 4).map((s: any) => s.title).join(", ") || ""}
- Target Users: ${pmArtifact.stakeholders?.find((s: any) => s.role?.toLowerCase().includes("user"))?.interest || ""}`
      : `User Request: ${user_request}`;

    const techContext = archArtifact
      ? `
Technical Context:
- Frontend Stack: ${archArtifact.technology_stack?.frontend?.join(", ") || ""}
- Key APIs: ${archArtifact.apis?.slice(0, 4).map((a: any) => a.path).join(", ") || ""}
- Database Entities: ${archArtifact.database_schema?.tables?.slice(0, 5).map((t: any) => t.name).join(", ") || ""}`
      : "";

    const uiPrompt = `You are a Principal UI/UX Designer with 12+ years of experience in design systems, accessibility, and modern web interfaces. Create a design system and UI architecture for:

"${projectTitle}"

${projectContext}
${techContext}
${domainContext ? `\n${domainContext}\n` : ""}

=== OUTPUT RULES (follow exactly) ===
- **Output order** (so required fields survive truncation): Put summary, description, design_tokens, then component_hierarchy, then the rest. Within design_tokens always include colors, spacing, and typography (typography is required).
- **design_tokens.colors**: MANDATORY OBJECT. Do not send a string. Required keys: primary, primary_foreground, secondary, secondary_foreground, background, foreground, muted, muted_foreground, border, input, ring, accent, destructive. Values exactly 7 chars: # plus 6 hex digits (e.g. "#4F46E5").
- **design_tokens.spacing**: Required. Use CSS values only, e.g. "xs": "0.25rem", "sm": "0.5rem", "md": "0.75rem", "lg": "1rem", "xl": "1.25rem", "2xl": "1.5rem".
- **design_tokens.typography**: Required. Include fontFamily (e.g. "Inter") and fontSize (e.g. "xs": "0.75rem", "sm": "0.875rem", "base": "1rem", "lg": "1.125rem"). Optionally fontWeight ("light": "300", "normal": "400", "medium": "500", "semibold": "600", "bold": "700"). CSS values only.
- **Specific requirements**: accessibility removed from top-level (now in QA). Ensure component_hierarchy nodes each have a description.
- **Response**: Output only the JSON object. No markdown, no explanations.

=== MISSION ===
1. **Design tokens**: Colors (primary, secondary, background, text + semantic/surface as needed), typography (fontSize, fontWeight), spacing, borderRadius. Keep values to the format above.
2. **Atomic hierarchy**: Atoms (Button, Input, Label, Icon, etc.), molecules (Form Field, Search Bar, etc.), organisms (Navigation, Card, Modal, Table, etc.).
3. **Component specs**: For key components include variants, sizes, states, accessibility (ARIA, keyboard).
4. **Accessibility**: WCAG 2.1 AA—contrast 4.5:1, focus rings, keyboard access, ARIA roles/labels, prefers-reduced-motion.
5. **Responsive**: Breakpoints sm/md/lg/xl/2xl (640–1536px), mobile-first, touch targets ≥44px.

=== EXAMPLE COMPONENT SPEC ===
${FEW_SHOT_EXAMPLES.component}

${qualityCheck}

Respond with ONLY the structured JSON object matching the schema. No explanations or markdown.`;

    let llmUIDesign: any = null;

    try {
      llmUIDesign = await generateStreamingStructuredWithLLM<any>(
        uiPrompt,
        uiSchema,
        (partialEvent) => {
          if (onProgress) {
            onProgress(partialEvent);
          }
        },
        {
          reasoning: context.options?.reasoning ?? false,
          temperature: getAgentTemperature("ui_design"),
          maxTokens: getAgentMaxTokens("ui_design"),
          cacheId: context.cacheId,
          role: "UI Designer",
          model: context.options?.model,
        }
      );
    } catch (error: any) {
      logger.error("UI Designer agent LLM call failed", { error: error.message });
      throw error;
    }

    if (!llmUIDesign) {
      throw new Error("UI Designer agent failed: No structured data received from LLM");
    }

    // Coerce + sanitize design tokens (model may return colors as a string)
    if (llmUIDesign.design_tokens) {
      const coercedColors = coerceDesignTokensColors(llmUIDesign.design_tokens.colors);
      if (coercedColors) {
        llmUIDesign.design_tokens.colors = coercedColors;
      }
      sanitizeDesignTokensSpacingAndTypography(llmUIDesign.design_tokens);
    }

    // Fallback logic removed as per user request for no defaults.
    // The schema validation will catch missing required fields.

    // Map LLM output into the strict UIDesignerBackendArtifact shape.
    content = {
      summary: llmUIDesign.summary,
      description: llmUIDesign.description,
      design_tokens: llmUIDesign.design_tokens,
      component_hierarchy: llmUIDesign.component_hierarchy,
      ui_patterns: llmUIDesign.ui_patterns,
      component_specs: llmUIDesign.component_specs,
      layout_breakpoints: llmUIDesign.layout_breakpoints,
      atomic_structure: llmUIDesign.atomic_structure,
      website_layout: llmUIDesign.website_layout,
    } as any;

    logger.info("UI Designer agent completed");

    return {
      step_id: "ui_design",
      role: "UI Designer",
      content,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    logger.error("UI Designer agent failed", { error: error.message });
    throw error;
  }
}
