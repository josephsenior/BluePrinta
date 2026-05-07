import { z } from "zod";

const CoverageSchema = z
    .object({
        percentage: z.number().min(0).max(100).describe("Overall code coverage percentage (0-100)."),
        threshold: z.number().min(0).max(100).describe("Target coverage threshold percentage."),
        lines: z.number().min(0).max(100).describe("Percentage of lines covered."),
        statements: z.number().min(0).max(100).describe("Percentage of statements covered."),
        functions: z.number().min(0).max(100).describe("Percentage of functions covered."),
        branches: z.number().min(0).max(100).describe("Percentage of branches covered."),
    })
    .strict();

const PerformanceMetricsSchema = z
    .object({
        api_response_time_p95: z.string().describe("P95 API response time target (e.g., '200ms')."),
        page_load_time: z.string().describe("Target total page load time (e.g., '1.5s')."),
        database_query_time: z.string().describe("Maximum acceptable database query latency."),
        first_contentful_paint: z.string().describe("FCP target for web performance."),
        time_to_interactive: z.string().describe("TTI target for web performance."),
        largest_contentful_paint: z.string().describe("LCP target for core web vitals."),
    })
    .strict();

export const QAArtifactSchema = z.object({
    ok: z.boolean(), // REQUIRED
    test_strategy: z.object({
        unit: z.string().min(10, "Unit test strategy must be descriptive").describe("Strategy for component-level testing."),
        integration: z.string().min(10, "Integration test strategy must be descriptive").describe("Strategy for testing module interactions."),
        e2e: z.string().min(10, "E2E test strategy must be descriptive").describe("Strategy for full user-flow validation."),
        approach: z.string().optional().describe("General philosophical approach to testing (e.g., TDD)."),
        types: z.array(z.string()).optional().describe("Categories of tests being applied."),
        tools: z.array(z.string()).optional().describe("Testing frameworks and libraries (e.g., Vitest, Playwright)."),
    }), // REQUIRED
    test_cases: z.array(
        z.object({
            id: z.string().max(10), // REQUIRED
            title: z.string().min(5).max(60), // REQUIRED
            description: z.string().optional(),
            type: z.enum(["unit", "integration", "e2e", "manual"]).optional(),
            priority: z.enum(["high", "medium", "low"]), // REQUIRED
            expected_result: z.string().min(5).max(100), // REQUIRED
        }).transform((tc) => ({
            ...tc,
            type: tc.type ?? "manual",
        }))
    ).min(1, "At least one test case is required"), // REQUIRED
    security_plan: z.object({
        auth_verification_steps: z.array(z.string()).optional(),
        vulnerability_scan_strategy: z.string().optional(),
    }), // REQUIRED (object must exist, but fields inside are optional)
    manual_verification_steps: z.array(z.string()), // REQUIRED
    risk_analysis: z.array(
        z.object({
            risk: z.string(), // REQUIRED
            impact: z.enum(["high", "medium", "low"]), // REQUIRED
            mitigation: z.string(), // REQUIRED
        })
    ), // REQUIRED
    summary: z.string(), // REQUIRED
    description: z.string(), // REQUIRED
    coverage: CoverageSchema, // REQUIRED
    performance_metrics: PerformanceMetricsSchema, // REQUIRED
    accessibility_plan: z.object({
        standard: z.enum(["WCAG 2.0 A", "WCAG 2.0 AA", "WCAG 2.0 AAA", "WCAG 2.1 A", "WCAG 2.1 AA", "WCAG 2.1 AAA", "WCAG 2.2 A", "WCAG 2.2 AA", "WCAG 2.2 AAA"]),
        automated_tools: z.array(z.string().max(30)),
        manual_checks: z.array(z.string().max(100)),
        screen_readers: z.array(z.string().max(20)),
    }).strict(),
    manual_uat_plan: z.object({
        scenarios: z.array(z.string().max(150)),
        acceptance_criteria: z.array(z.string().max(150)),
        stakeholders: z.array(z.string().max(50)),
    }).strict(),
}).strict();

export function validateQAArtifact(data: unknown) {
    return QAArtifactSchema.parse(data);
}

export function safeValidateQAArtifact(data: unknown) {
    return QAArtifactSchema.safeParse(data);
}
