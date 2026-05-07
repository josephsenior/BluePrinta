
export const engineerSchema = {
    type: "object",
    required: ["artifact_path", "file_structure", "implementation_plan_phases", "dependencies", "run_results", "summary", "description", "technical_decisions", "environment_variables", "technical_patterns", "state_management"],
    propertyOrdering: ["summary", "description", "artifact_path", "run_results", "dependencies", "technical_decisions", "technical_patterns", "state_management", "environment_variables", "implementation_plan_phases", "file_structure"],
    properties: {
        summary: { type: "string", maxLength: 250, description: "A technical, 1-2 sentence summary of the implementation strategy and architecture approach." },
        description: { type: "string", maxLength: 600, description: "Detailed implementation philosophy, technical roadmap, and development approach." },
        artifact_path: {
            type: "string",
            maxLength: 30,
            description: "Base directory for the project source code (e.g., 'src/lib/app').",
        },
        run_results: {
            type: "object",
            required: ["setup_commands", "test_commands", "dev_commands", "build_commands"],
            description: "Essential CLI commands for different stages of the project lifecycle.",
            properties: {
                setup_commands: { type: "array", items: { type: "string", maxLength: 50 }, description: "Commands to initialize the environment (e.g., 'npm install')." },
                test_commands: { type: "array", items: { type: "string", maxLength: 50 }, description: "Commands to execute tests (e.g., 'npm test')." },
                dev_commands: { type: "array", items: { type: "string", maxLength: 50 }, description: "Commands to start a development server (e.g., 'npm run dev')." },
                build_commands: { type: "array", items: { type: "string", maxLength: 50 }, description: "Commands to compile or bundle the project (e.g., 'npm run build')." },
                notes: { type: "string", maxLength: 200, description: "Additional context or prerequisites for running the commands." },
            }
        },
        file_structure: {
            type: "object",
            required: ["name", "type", "children"],
            description: "Recursive definition of the project's file and directory hierarchy. Focus on structure, not content.",
            properties: {
                name: { type: "string", maxLength: 30, description: "Root directory or file name." },
                type: { type: "string", enum: ["file", "directory"], description: "Indicator if the root is a folder or a file." },
                children: {
                    type: "array",
                    items: {
                        type: "object",
                        required: ["name", "type"],
                        properties: {
                            name: { type: "string", maxLength: 30, description: "File or subdirectory name." },
                            type: { type: "string", enum: ["file", "directory"], description: "Item type." },
                            children: {
                                type: "array",
                                items: {
                                    type: "object",
                                    required: ["name", "type"],
                                    properties: {
                                        name: { type: "string", maxLength: 30, description: "Nested item name." },
                                        type: { type: "string", enum: ["file", "directory"] },
                                        children: {
                                            type: "array",
                                            items: {
                                                type: "object",
                                                required: ["name", "type"],
                                                properties: {
                                                    name: { type: "string", maxLength: 30 },
                                                    type: { type: "string", enum: ["file", "directory"] },
                                                }
                                            },
                                            description: "Third-level nested contents."
                                        }
                                    }
                                },
                                description: "Second-level nested contents."
                            }
                        }
                    },
                    description: "First-level contents of the root."
                }
            }
        },
        implementation_plan_phases: {
            type: "array",
            items: {
                type: "object",
                required: ["name", "description", "tasks"],
                properties: {
                    name: { type: "string", maxLength: 50, description: "Title of the implementation phase (e.g., 'Auth Implementation')." },
                    description: { type: "string", maxLength: 200, description: "Technical summary of what this phase achieves." },
                    tasks: { type: "array", items: { type: "string", maxLength: 100 }, description: "Specific steps or features to be implemented in this phase." },
                }
            },
            description: "Breakdown of the development roadmap into logical milestones.",
        },
        dependencies: {
            type: "array",
            items: { type: "string", maxLength: 40, description: "Package name and version (e.g., 'zod@3.22.4')." },
            description: "Core libraries and external packages required to build and run the project.",
        },
        technical_decisions: {
            type: "array",
            items: {
                type: "object",
                required: ["decision", "rationale", "alternatives"],
                properties: {
                    decision: { type: "string", maxLength: 100, description: "Specific engineering choice made (e.g., 'Use CSS Modules')." },
                    rationale: { type: "string", maxLength: 300, description: "Technical justification for the chosen approach." },
                    alternatives: { type: "string", maxLength: 200, description: "Discarded options and why they were rejected." },
                },
            },
            description: "Documentation of key engineering trade-offs and decisions.",
        },
        environment_variables: {
            type: "array",
            items: {
                type: "object",
                required: ["name", "description", "example", "required"],
                properties: {
                    name: { type: "string", maxLength: 50, description: "Variable name in SCREAMING_SNAKE_CASE." },
                    description: { type: "string", maxLength: 150, description: "What this variable configures." },
                    example: { type: "string", maxLength: 150, description: "A safe example value." },
                    required: { type: "boolean", description: "Whether the app requires this variable to function." },
                },
            },
            description: "Required runtime configuration variables.",
        },
        technical_patterns: {
            type: "array",
            items: { type: "string", maxLength: 30, description: "Design pattern name (e.g., 'Singleton', 'Strategy')." },
            description: "Software engineering patterns utilized in the implementation.",
        },
        state_management: {
            type: "object",
            required: ["tool", "strategy"],
            properties: {
                tool: { type: "string", maxLength: 30, description: "Library or pattern for managing state (e.g., 'Zustand')." },
                strategy: { type: "string", maxLength: 150, description: "Logical approach for state organization and updates." },
            },
            description: "Plan for handling application-wide and component-local state.",
        },
    },
};
