/** Retired Gemini model IDs → current replacements (Google API shutdowns). */
const DEPRECATED_MODEL_ALIASES: Record<string, string> = {
  "gemini-3-pro-preview": "gemini-3.1-pro-preview",
};

export const GEMINI_PRO_MODEL = "gemini-3.1-pro-preview";
export const GEMINI_FLASH_MODEL = "gemini-3.5-flash";

/** Map retired model strings to supported API model IDs. */
export function resolveGeminiModel(model?: string | null): string | undefined {
  if (!model) return model ?? undefined;
  return DEPRECATED_MODEL_ALIASES[model] ?? model;
}
