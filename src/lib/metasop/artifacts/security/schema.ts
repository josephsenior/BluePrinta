
export const securitySchema = {
    type: "object",
    required: [
        "security_architecture",
        "threat_model",
        "encryption",
        "security_controls",
        "summary",
        "description",
        "compliance",
        "vulnerability_management",
        "security_monitoring"
    ],
    propertyOrdering: ["summary", "description", "security_architecture", "encryption", "security_controls", "compliance", "threat_model", "vulnerability_management", "security_monitoring"],
    properties: {
        summary: { type: "string", maxLength: 300, description: "A technical, 1-2 sentence summary of the security architecture. No conversational filler." },
        description: { type: "string", maxLength: 800, description: "Detailed security specifications, threat landscape, and mitigation strategy overview." },
        security_architecture: {
            type: "object",
            required: ["authentication", "authorization", "audit_logging", "session_management"],
            properties: {
                network_boundaries: {
                    type: "array",
                    items: {
                        type: "object",
                        required: ["zone", "description"],
                        properties: {
                            zone: { type: "string", maxLength: 50, description: "Zone name (e.g., 'Public DMZ')." },
                            description: { type: "string", maxLength: 200, description: "Zone purpose and access rules." },
                            level: { type: "string", enum: ["Public", "DMZ", "Private"], description: "Trust level." },
                        }
                    },
                    description: "Network segmentation and trust zones."
                },
                authentication: {
                    type: "object",
                    required: ["method"],
                    properties: {
                        method: {
                            type: "string",
                            enum: [
                                "OAuth2",
                                "JWT",
                                "SAML",
                                "OpenID Connect",
                                "custom",
                                "session-based",
                            ],
                            description: "Primary authentication method.",
                        },
                        providers: {
                            type: "array",
                            items: { type: "string", maxLength: 20 },
                            description:
                                "Auth providers (e.g., 'Google').",
                        },
                        token_expiry: {
                            type: "string",
                            maxLength: 10,
                            description: "Token TTL (e.g., '1h').",
                        },
                        refresh_tokens: {
                            type: "boolean",
                            description: "Use of refresh tokens.",
                        },
                        mfa_enabled: {
                            type: "boolean",
                            description: "MFA status flag.",
                        },
                        description: {
                            type: "string",
                            maxLength: 100,
                            description: "Auth flow description.",
                        },
                    },
                },
                audit_logging: {
                    type: "object",
                    properties: {
                        enabled: { type: "boolean", description: "Whether security audit logging is active." },
                        retention: { type: "string", maxLength: 20, description: "Log retention period (e.g., '1 year')." },
                        storage_location: { type: "string", maxLength: 100, description: "Where audit logs are stored (e.g., 'S3 bucket', 'CloudWatch')." },
                        events: { type: "array", items: { type: "string", maxLength: 30 }, description: "Types of events being logged (e.g., 'login', 'read', 'delete')." }
                    },
                    description: "Traceability of security-relevant events and user actions."
                },
                session_management: {
                    type: "object",
                    properties: {
                        strategy: { type: "string", enum: ["stateless", "stateful", "hybrid"], description: "Technical approach to session handling." },
                        session_timeout: { type: "string", maxLength: 10, description: "Idle timeout duration (e.g., '30m')." },
                        secure_cookies: { type: "boolean", description: "Enforces cookie transmission over HTTPS only." },
                        http_only_cookies: { type: "boolean", description: "Prevents client-side script access to cookies." },
                        same_site_policy: { type: "string", enum: ["Strict", "Lax", "None"], description: "Controls cookie sending on cross-site requests." },
                    },
                    description: "Lifecycle and security parameters for user sessions."
                },
                authorization: {
                    type: "object",
                    required: ["model"],
                    properties: {
                        model: {
                            type: "string",
                            enum: ["RBAC", "ABAC", "PBAC", "ACL", "none"],
                            description: "Authorization model.",
                        },
                        roles: {
                            type: "array",
                            items: { type: "string", maxLength: 20 },
                            description: "System roles.",
                        },
                        policies: {
                            type: "array",
                            items: {
                                type: "object",
                                required: ["resource", "permissions"],
                                properties: {
                                    resource: {
                                        type: "string",
                                        maxLength: 30,
                                        description: "Resource name.",
                                    },
                                    permissions: {
                                        type: "array",
                                        items: { type: "string", maxLength: 20 },
                                        description:
                                            "Permissions (e.g., 'read').",
                                    },
                                    roles: {
                                        type: "array",
                                        items: { type: "string", maxLength: 20 },
                                        description: "Roles allowed.",
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        threat_model: {
            type: "array",
            description: "STRIDE-based threat model. Scale depth to project complexity.",
            items: {
                type: "object",
                required: ["threat", "mitigation", "severity"],
                properties: {
                    threat: { type: "string", maxLength: 80, description: "STRIDE threat category and specific threat." },
                    category: { type: "string", enum: ["Spoofing", "Tampering", "Repudiation", "Information Disclosure", "Denial of Service", "Elevation of Privilege"], description: "STRIDE category." },
                    severity: { type: "string", enum: ["critical", "high", "medium", "low"] },
                    likelihood: { type: "string", enum: ["high", "medium", "low"] },
                    impact: { type: "string", maxLength: 200, description: "Technical and business impact description." },
                    description: { type: "string", maxLength: 300, description: "Detailed threat scenario and attack vector." },
                    mitigation: { type: "string", maxLength: 300, description: "Specific, implementable mitigation strategy." },
                    affected_components: {
                        type: "array",
                        items: { type: "string", maxLength: 50 },
                        description: "Systems or components impacted."
                    },
                    owasp_ref: { type: "string", maxLength: 50, description: "OWASP Top 10 reference (e.g., 'A03:2021 - Injection')." },
                    cwe_ref: { type: "string", maxLength: 20, description: "CWE reference (e.g., 'CWE-89')." },
                }
            }
        },
        encryption: {
            type: "object",
            required: ["data_at_rest", "data_in_transit", "key_management", "envelope_encryption", "secrets_management"],
            properties: {
                data_at_rest: {
                    type: "object",
                    required: ["method", "key_management"],
                    properties: {
                        method: {
                            type: "string",
                            maxLength: 50,
                            description: "Encryption method (e.g., AES-256).",
                        },
                        key_management: {
                            type: "string",
                            maxLength: 100,
                            description: "Key management solution.",
                        },
                        description: {
                            type: "string",
                            maxLength: 150,
                            description: "Data at rest encryption description.",
                        },
                    },
                },
                data_in_transit: {
                    type: "object",
                    required: ["method"],
                    properties: {
                        method: {
                            type: "string",
                            maxLength: 50,
                            description: "Encryption method (e.g., TLS 1.3).",
                        },
                        certificate_management: {
                            type: "string",
                            maxLength: 100,
                            description: "Certificate management approach.",
                        },
                        description: {
                            type: "string",
                            maxLength: 150,
                            description: "Data in transit encryption description.",
                        },
                    },
                },
                key_management: {
                    type: "object",
                    required: ["strategy"],
                    properties: {
                        strategy: {
                            type: "string",
                            maxLength: 100,
                            description: "Key management strategy.",
                        },
                        rotation_policy: {
                            type: "string",
                            maxLength: 100,
                            description: "Key rotation policy.",
                        },
                        description: {
                            type: "string",
                            maxLength: 150,
                            description: "Key management description.",
                        },
                    },
                },
                envelope_encryption: {
                    type: "boolean",
                    description: "Whether envelope encryption is used for data at rest",
                },
                secrets_management: {
                    type: "string",
                    maxLength: 100,
                    description: "Secret management solution (e.g., HashiCorp Vault, AWS Secrets Manager).",
                },
            },
        },
        vulnerability_management: {
            type: "object",
            properties: {
                scanning_frequency: { type: "string", maxLength: 50, description: "How often vulnerabilities are scanned for (e.g., 'Daily', 'Per commit')." },
                tools: { type: "array", items: { type: "string", maxLength: 30 }, description: "Security scanning tools (e.g., Snyk, Dependabot, SonarQube)." },
                remediation_sla: { type: "string", maxLength: 50, description: "SLA for patching discovered vulnerabilities (e.g., 'Critical: 24h')." }
            },
            description: "Process for identifying and remediating security weaknesses."
        },
        security_monitoring: {
            type: "object",
            properties: {
                logging_strategy: { type: "string", maxLength: 200, description: "Overall plan for gathering security logs." },
                siem_solution: { type: "string", maxLength: 50, description: "SIEM tool for log analysis (e.g., 'Splunk', 'Azure Sentinel')." },
                alerting_thresholds: { type: "string", maxLength: 200, description: "Conditions that trigger security alerts." }
            },
            description: "Real-time visibility and alerting for security incidents."
        },
        compliance: {
            type: "array",
            items: {
                type: "object",
                required: ["standard", "requirements", "implementation_status"],
                properties: {
                    standard: {
                        type: "string",
                        enum: ["GDPR", "HIPAA", "SOC2", "PCI-DSS", "ISO27001", "CCPA", "other"],
                        description: "The specific compliance framework or regulatory standard."
                    },
                    requirements: {
                        type: "array",
                        items: { type: "string", maxLength: 100 },
                        description: "Individual technical or procedural requirements of the standard."
                    },
                    implementation_status: {
                        type: "string",
                        enum: ["planned", "in-progress", "compliant"],
                        description: "Current compliance level for this standard."
                    },
                    description: { type: "string", maxLength: 200, description: "Detailed summary of how the standard is being met." }
                }
            }
        },
        security_controls: {
            type: "array",
            description: "security controls.",
            items: {
                type: "object",
                required: ["control", "implementation"],
                properties: {
                    id: { type: "string", maxLength: 10, description: "Unique control identifier (e.g., 'SEC-01')." },
                    control: { type: "string", minLength: 10, maxLength: 100, description: "Name/Title of the security control." },
                    type: { type: "string", maxLength: 30, description: "Security control type (e.g., 'Technical', 'Administrative')." },
                    category: { type: "string", enum: ["preventive", "detective", "corrective", "compensating"], description: "Functional category of the control." },
                    implementation: { type: "string", minLength: 10, maxLength: 200, description: "How the control is technically implemented." },
                    priority: { type: "string", enum: ["critical", "high", "medium", "low"], description: "Relative importance of this control." },
                    description: { type: "string", maxLength: 200, description: "Purpose and desired outcome of the control." }
                }
            }
        }
    }
};
