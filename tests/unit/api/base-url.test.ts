import { describe, expect, it } from "vitest";
import { resolveApiBaseUrl } from "@/lib/api/base-url";

describe("API base URL", () => {
  it("uses the current origin for equivalent localhost addresses", () => {
    expect(resolveApiBaseUrl("http://localhost:3000/api", "http://127.0.0.1:3000/dashboard/diagrams")).toBe("/api");
    expect(resolveApiBaseUrl("http://127.0.0.1:3000/api", "http://localhost:3000/")).toBe("/api");
  });
  it("preserves explicitly configured remote APIs and other ports", () => {
    expect(resolveApiBaseUrl("https://api.example.com/v1", "http://localhost:3000/")).toBe("https://api.example.com/v1");
    expect(resolveApiBaseUrl("http://localhost:4000/api", "http://localhost:3000/")).toBe("http://localhost:4000/api");
    expect(resolveApiBaseUrl(undefined, "http://localhost:3000/")).toBe("/api");
  });
});
