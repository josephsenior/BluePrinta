export const qaSchema = {
    type: "object",
    required: ["ok", "test_strategy", "test_cases", "security_plan", "manual_verification_steps", "risk_analysis", "summary", "description", "coverage", "performance_metrics", "accessibility_plan"],
    propertyOrdering: ["ok", "summary", "description", "test_strategy", "test_cases", "coverage", "risk_analysis", "security_plan", "manual_verification_steps", "performance_metrics", "accessibility_plan"],
    properties: {
        ok: {
            type: "boolean",
            description: "Indicates if the architectural/engineering design is robust enough to proceed with a test plan.",
        },
        test_strategy: {
            type: "object",
            required: ["unit", "integration", "e2e"],
            properties: {
                unit: { type: "string", maxLength: 300, description: "Unit testing approach with framework, coverage targets, and mocking strategy." },
                integration: { type: "string", maxLength: 300, description: "Integration testing approach with scope, data management, and tools." },
                e2e: { type: "string", maxLength: 300, description: "E2E testing approach with framework, critical paths, and environment strategy." },
                approach: { type: "string", maxLength: 300, description: "General QA philosophy and testing pyramid rationale." },
                types: { type: "array", items: { type: "string", maxLength: 30 }, description: "Test types (unit, integration, e2e, performance, security, accessibility)." },
                tools: { type: "array", items: { type: "string", maxLength: 30 }, description: "Testing frameworks and tools (Vitest, Playwright, etc.)." }
            },
            description: "Layered QA strategy following the testing pyramid."
        },
        test_cases: {
            type: "array",
            description: "Core test cases. Keep it focused and minimal.",
            items: {
                type: "object",
                required: ["id", "title", "expected_result", "type", "priority"],
                properties: {
                    id: { type: "string", maxLength: 10, pattern: "^TC-[0-9]+$", description: "Short ID (e.g., TC-1)." },
                    title: { type: "string", maxLength: 60, description: "Test case title." },
                    description: { type: "string", maxLength: 200, description: "Detailed test scenario." },
                    type: { type: "string", enum: ["unit", "integration", "e2e", "manual"], description: "Test category." },
                    priority: { type: "string", enum: ["high", "medium", "low"], description: "Importance of this test case." },
                    expected_result: { type: "string", maxLength: 100, description: "Success criteria." }
                }
            }
        },
        security_plan: {
            type: "object",
            properties: {
                auth_verification_steps: {
                    type: "array",
                    items: { type: "string", maxLength: 100 },
                    description: "Steps to verify authentication and authorization mechanisms."
                },
                vulnerability_scan_strategy: {
                    type: "string",
                    maxLength: 150,
                    description: "Tools and frequency for security scanning (e.g. OWASP ZAP)."
                }
            }
        },
        manual_verification_steps: {
            type: "array",
            items: { type: "string", maxLength: 100 },
            description: "Checklist for manual UAT or visual inspection."
        },
        risk_analysis: {
            type: "array",
            items: {
                type: "object",
                required: ["risk", "impact", "mitigation"],
                properties: {
                    risk: { type: "string", maxLength: 50, description: "Potential failure mode or quality risk." },
                    impact: { type: "string", enum: ["high", "medium", "low"], description: "Severity of the risk." },
                    mitigation: { type: "string", maxLength: 150, description: "Strategy to prevent or handle the risk." }
                }
            },
            description: "Quality risks and mitigations."
        },
        summary: { type: "string", maxLength: 250, description: "A technical, 1-2 sentence summary of the QA strategy and verification approach." },
        description: { type: "string", maxLength: 600, description: "Detailed verification philosophy, test plan overview, and quality objectives." },
        coverage: {
            type: "object",
            required: ["percentage", "threshold", "lines", "statements", "functions", "branches"],
            properties: {
                percentage: { type: "number", description: "Estimated overall code coverage percentage (0-100)." },
                threshold: { type: "number", description: "Target code coverage percentage threshold (0-100)." },
                lines: { type: "number", description: "Estimated percentage of lines covered (0-100)." },
                statements: { type: "number", description: "Estimated percentage of statements covered (0-100)." },
                functions: { type: "number", description: "Estimated percentage of functions covered (0-100)." },
                branches: { type: "number", description: "Estimated percentage of branches covered (0-100)." }
            },
            description: "Code coverage targets and estimates in percentages."
        },
        performance_metrics: {
            required: ["api_response_time_p95", "page_load_time", "database_query_time", "first_contentful_paint", "time_to_interactive", "largest_contentful_paint"],
            type: "object",
            properties: {
                api_response_time_p95: { type: "string", maxLength: 15, description: "Target P95 API response time (e.g., '200ms')." },
                page_load_time: { type: "string", maxLength: 15, description: "Target full page load time (e.g., '2s')." },
                database_query_time: { type: "string", maxLength: 15, description: "Target slow query threshold (e.g., '100ms')." },
                first_contentful_paint: { type: "string", maxLength: 15, description: "Target First Contentful Paint (e.g., '1.5s')." },
                time_to_interactive: { type: "string", maxLength: 15, description: "Target Time to Interactive (e.g., '3.5s')." },
                largest_contentful_paint: { type: "string", maxLength: 15, description: "Target Largest Contentful Paint (e.g., '2.5s')." }
            },
            description: "Performance budgets and targets for the application."
        },
        accessibility_plan: {
            type: "object",
            required: ["standard", "automated_tools", "manual_checks", "screen_readers"],
            properties: {
                standard: {
                    type: "string",
                    enum: ["WCAG 2.0 A", "WCAG 2.0 AA", "WCAG 2.0 AAA", "WCAG 2.1 A", "WCAG 2.1 AA", "WCAG 2.1 AAA", "WCAG 2.2 A", "WCAG 2.2 AA", "WCAG 2.2 AAA"],
                    description: "Target WCAG accessibility compliance level."
                },
                automated_tools: { type: "array", items: { type: "string", maxLength: 30 }, description: "List of automated accessibility testing tools (e.g., axe-core, Lighthouse)." },
                manual_checks: { type: "array", items: { type: "string", maxLength: 100 }, description: "Checklist for manual accessibility verification." },
                screen_readers: { type: "array", items: { type: "string", maxLength: 20 }, description: "Screen readers to be used for testing (e.g., NVDA, VoiceOver)." }
            },
            description: "Comprehensive accessibility testing plan for WCAG compliance."
        },
        manual_uat_plan: {
            type: "object",
            required: ["scenarios", "acceptance_criteria", "stakeholders"],
            properties: {
                scenarios: { type: "array", items: { type: "string", maxLength: 150 }, description: "UAT scenarios for stakeholder sign-off." },
                acceptance_criteria: { type: "array", items: { type: "string", maxLength: 150 }, description: "Business acceptance criteria." },
                stakeholders: { type: "array", items: { type: "string", maxLength: 50 }, description: "Stakeholders involved in UAT." }
            },
            description: "Manual user acceptance testing plan with stakeholder scenarios."
        }
    }
};
