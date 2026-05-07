
export const architectSchema = {
    type: "object",
    required: ["design_doc", "apis", "decisions", "technology_stack", "database_schema", "integration_points", "security_considerations", "scalability_approach", "summary", "description"],
    propertyOrdering: ["summary", "description", "technology_stack", "decisions", "apis", "security_considerations", "scalability_approach", "integration_points", "database_schema", "design_doc"],
    properties: {
        design_doc: {
            type: "string",
            maxLength: 5000,
            description: "Comprehensive architecture design document in markdown format. Aim for ~2500-4000 characters for complex systems.",
        },
        summary: { type: "string", maxLength: 250, description: "Technical executive summary of the architecture." },
        description: { type: "string", maxLength: 500, description: "Brief overview of the system architecture." },
        apis: {
            type: "array",
            description: "CRUD-focused API specification. Technical and concise.",
            items: {
                type: "object",
                required: ["path", "method", "description", "request_schema", "response_schema", "auth_required"],
                properties: {
                    path: { type: "string", pattern: "^/.*", maxLength: 50, description: "API path (e.g., '/api/users')" },
                    method: { type: "string", enum: ["GET", "POST", "PUT", "DELETE", "PATCH"], description: "HTTP method for the endpoint." },
                    description: { type: "string", maxLength: 100, description: "Concise description of the endpoint's purpose." },
                    request_schema: {
                        type: "object",
                        description: "Request body/param mapping (field: type). Keep concise.",
                        additionalProperties: { type: "string", maxLength: 50 }
                    },
                    response_schema: {
                        type: "object",
                        description: "Successful response body mapping (field: type). Keep concise.",
                        additionalProperties: { type: "string", maxLength: 50 }
                    },
                    auth_required: { type: "boolean", description: "Whether authentication is required to access this endpoint." },
                    rate_limit: { type: "string", maxLength: 20, description: "Rate limiting policy (e.g., '100 req/min')." },
                },
            },
        },
        decisions: {
            type: "array",
            description: "Core architectural decisions (ADRs).",
            items: {
                type: "object",
                required: ["decision", "status", "reason", "tradeoffs", "consequences"],
                properties: {
                    decision: { type: "string", maxLength: 100, description: "Clear decision statement (e.g., 'Use PostgreSQL as primary database')." },
                    status: { type: "string", enum: ["accepted", "proposed", "superseded"], description: "Current status of the architectural decision." },
                    reason: { type: "string", maxLength: 300, description: "Detailed technical reasoning with specific justification." },
                    tradeoffs: { type: "string", maxLength: 250, description: "What we gain and what we sacrifice with this decision." },
                    consequences: { type: "string", maxLength: 250, description: "What needs to change or be implemented as a result." },
                    alternatives: {
                        type: "array",
                        items: { type: "string", maxLength: 100 },
                        description: "Alternatives considered with brief rejection reason (e.g., 'MongoDB - rejected due to eventual consistency')."
                    },
                },
            },
        },
        database_schema: {
            type: "object",
            description: "Relational database schema. Snake_case only.",
            properties: {
                tables: {
                    type: "array",
                    items: {
                        type: "object",
                        required: ["name", "columns"],
                        properties: {
                            name: { type: "string", maxLength: 30, description: "Table name in snake_case." },
                            description: { type: "string", maxLength: 100, description: "Brief description of the entity represented by the table." },
                            columns: {
                                type: "array",
                                items: {
                                    type: "object",
                                    required: ["name", "type", "constraints"],
                                    properties: {
                                        name: { type: "string", maxLength: 30, description: "Column name in snake_case." },
                                        type: { type: "string", maxLength: 20, description: "SQL data type (e.g., 'UUID', 'VARCHAR(255)')." },
                                        constraints: { type: "array", items: { type: "string", maxLength: 20 }, description: "Column constraints (e.g., 'PRIMARY KEY', 'NOT NULL')." },
                                        description: { type: "string", maxLength: 80, description: "Purpose of the column." },
                                    },
                                },
                                description: "List of columns in the table."
                            },
                            indexes: {
                                type: "array",
                                items: {
                                    type: "object",
                                    required: ["columns"],
                                    properties: {
                                        columns: { type: "array", items: { type: "string", maxLength: 30 }, description: "Columns included in the index." },
                                        type: { type: "string", enum: ["btree", "hash", "gin", "gist"], description: "Type of database index." },
                                        reason: { type: "string", maxLength: 100, description: "Justification for creating this index." },
                                    },
                                },
                                description: "Database indexes for query optimization."
                            },
                            relationships: {
                                type: "array",
                                items: {
                                    type: "object",
                                    required: ["type", "from", "to"],
                                    properties: {
                                        type: { type: "string", enum: ["one-to-one", "one-to-many", "many-to-one", "many-to-many"], description: "Cardinality of the relationship." },
                                        from: { type: "string", maxLength: 30, description: "Source table and column (e.g., 'users.id')." },
                                        to: { type: "string", maxLength: 50, description: "Target table and column (e.g., 'posts.user_id')." },
                                        through: { type: "string", maxLength: 30, description: "Junction table name for many-to-many relationships." },
                                        description: { type: "string", maxLength: 100, description: "Explanation of the relationship logic." },
                                    },
                                },
                                description: "Foreign key relationships and associations."
                            },
                        },
                    },
                    description: "List of tables in the database schema."
                },
                migrations_strategy: { type: "string", maxLength: 200, description: "Strategy for handling schema migrations (e.g., 'Prisma Migrate', 'Flyway')." },
            },
        },
        technology_stack: {
            type: "object",
            description: "Specific technology choices with justification.",
            required: ["frontend", "backend", "database", "authentication", "hosting"],
            properties: {
                frontend: { type: "array", items: { type: "string", maxLength: 30 }, description: "Frontend libraries and frameworks (e.g., 'Next.js', 'TailwindCSS')." },
                backend: { type: "array", items: { type: "string", maxLength: 30 }, description: "Backend technologies (e.g., 'Node.js', 'PySide6')." },
                database: { type: "array", items: { type: "string", maxLength: 30 }, description: "Primary and secondary database choices." },
                authentication: { type: "array", items: { type: "string", maxLength: 30 }, description: "Security and auth providers (e.g., 'Clerk', 'NextAuth')." },
                hosting: { type: "array", items: { type: "string", maxLength: 30 }, description: "Infrastructure and cloud providers (e.g., 'Vercel', 'AWS')." },
                other: { type: "array", items: { type: "string", maxLength: 30 }, description: "Supporting tools like caching, queues, or monitoring." },
            },
        },
        integration_points: {
            type: "array",
            items: {
                type: "object",
                required: ["service", "purpose"],
                properties: {
                    service: { type: "string", maxLength: 30, description: "External service or API name." },
                    purpose: { type: "string", maxLength: 100, description: "Reason for integrating with this service." },
                    api_docs: { type: "string", format: "uri", maxLength: 100, description: "Link to external service documentation." },
                },
            },
            description: "External system integrations and dependencies.",
        },
        security_considerations: {
            type: "array",
            items: { type: "string", maxLength: 100 },
            description: "Technical security risks and mitigation strategies for the architecture.",
        },
        scalability_approach: {
            type: "object",
            properties: {
                horizontal_scaling: { type: "string", maxLength: 150, description: "Plan for scaling compute resources horizontally." },
                database_scaling: { type: "string", maxLength: 150, description: "Strategy for scaling the database (e.g., read replicas, sharding)." },
                caching_strategy: { type: "string", maxLength: 150, description: "Layers of caching to improve performance." },
                performance_targets: { type: "string", maxLength: 150, description: "Specific latency or throughput goals." },
            },
            description: "Methodology for handling increased load and growth.",
        },

    },
};
