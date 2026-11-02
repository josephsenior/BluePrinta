/** Keep the local app and its local API on the same browser origin. */
export function resolveApiBaseUrl(configured?: string, browserUrl?: string): string {
  if (!configured) return "/api";
  if (!browserUrl) return configured;
  try {
    const api = new URL(configured);
    const page = new URL(browserUrl);
    const loopback = new Set(["localhost", "127.0.0.1", "[::1]"]);
    if (loopback.has(api.hostname) && loopback.has(page.hostname) && api.port === page.port && api.protocol === page.protocol) {
      return `${api.pathname}${api.search}`;
    }
  } catch {
    // Relative or malformed configured URLs retain their existing behavior.
  }
  return configured;
}
