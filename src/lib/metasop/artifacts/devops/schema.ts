
export const devopsSchema = {
    type: "object",
    required: ["infrastructure", "cicd", "deployment", "monitoring", "containerization", "scaling", "disaster_recovery", "summary", "description"],
    propertyOrdering: ["summary", "description", "infrastructure", "cicd", "deployment", "containerization", "scaling", "monitoring", "disaster_recovery"],
    properties: {
        summary: { type: "string", maxLength: 250, description: "A technical, 1-2 sentence summary of the DevOps strategy and infrastructure approach." },
        description: { type: "string", maxLength: 600, description: "Detailed infrastructure philosophy, SRE approach, and operational excellence strategy." },
        infrastructure: {
            type: "object",
            required: ["cloud_provider", "services", "regions"],
            properties: {
                cloud_provider: {
                    type: "string",
                    enum: ["AWS", "GCP", "Azure", "self-hosted", "hybrid"],
                    description: "Primary cloud provider. Must match project scale.",
                },
                iac: {
                    type: "string",
                    enum: ["Terraform", "CloudFormation", "Crossplane", "Ansible", "Pulumi"],
                    description: "Infrastructure as Code tool for automation.",
                },
                services: {
                    type: "array",
                    description: "Infrastructure services including compute, database, and storage components.",
                    items: {
                        type: "object",
                        required: ["name", "type"],
                        properties: {
                            name: {
                                type: "string",
                                maxLength: 30,
                                description: "Unique name for the service (e.g., 'primary-db-cluster').",
                            },
                            type: {
                                type: "string",
                                enum: [
                                    "compute",
                                    "database",
                                    "storage",
                                    "networking",
                                    "monitoring",
                                    "security",
                                    "cdn",
                                    "load-balancer",
                                ],
                                description: "Category of the infrastructure service.",
                            },
                            configuration: {
                                type: "object",
                                description: "Technical config (e.g., 'instance_type: t3.medium').",
                                additionalProperties: { type: "string", maxLength: 100 }
                            },
                            description: {
                                type: "string",
                                maxLength: 100,
                                description: "Technical role of this service.",
                            },
                        },
                    },
                },
                regions: {
                    type: "array",
                    items: { type: "string", maxLength: 20 },
                    description: "Cloud regions for deployment (e.g., ['us-east-1', 'eu-west-1']).",
                },
            },
            description: "Definition of the cloud infrastructure and automated provisioning details.",
        },
        cicd: {
            type: "object",
            required: ["pipeline_stages", "tools", "triggers"],
            properties: {
                pipeline_stages: {
                    type: "array",
                    description: "Sequential stages in the CI/CD pipeline.",
                    items: {
                        type: "object",
                        required: ["name", "steps"],
                        properties: {
                            name: {
                                type: "string",
                                maxLength: 20,
                                description: "Name of the pipeline stage (e.g., 'Build', 'Scan', 'Deploy').",
                            },
                            steps: {
                                type: "array",
                                items: { type: "string", maxLength: 50 },
                                description: "Individual commands or actions performed in this stage.",
                            },
                            goal: {
                                type: "string",
                                maxLength: 100,
                                description: "Technical goal of this stage.",
                            },
                            status: { type: "string", maxLength: 20, description: "Current stage status policy (e.g., 'required', 'manual')." },
                        },
                    },
                },
                tools: {
                    type: "array",
                    items: { type: "string", maxLength: 30 },
                    description: "Tools used for CI/CD (e.g., GitHub Actions, Jenkins, ArgoCD).",
                },
                triggers: {
                    type: "array",
                    description: "Events that trigger pipeline execution.",
                    items: {
                        type: "object",
                        required: ["type"],
                        properties: {
                            type: {
                                type: "string",
                                enum: ["push", "pull_request", "schedule", "manual"],
                                description: "The event type that initiates this trigger.",
                            },
                            branch: { type: "string", maxLength: 20, description: "Target branch name pattern." },
                            description: {
                                type: "string",
                                maxLength: 50,
                                description: "Brief description of the trigger event.",
                            },
                        },
                    },
                },
            },
            description: "Continuous Integration and Continuous Deployment configuration.",
        },
        containerization: {
            type: "object",
            properties: {
                dockerfile: {
                    type: "string",
                    maxLength: 200,
                    description: "Dockerfile content or path to the build specification.",
                },
                docker_compose: {
                    type: "string",
                    maxLength: 200,
                    description: "Docker Compose configuration or path.",
                },
                kubernetes: {
                    type: "object",
                    properties: {
                        namespace: { type: "string", maxLength: 30, description: "K8s namespace for standard resource isolation." },
                        deployments: {
                            type: "array",
                            items: {
                                type: "object",
                                required: ["name"],
                                properties: {
                                    name: { type: "string", maxLength: 50, description: "Deployment name (e.g., 'auth-service')." },
                                    replicas: {
                                        type: "number",
                                        minimum: 1,
                                        description: "Number of desired pod replicas.",
                                    },
                                    resources: {
                                        type: "object",
                                        properties: {
                                            cpu: {
                                                type: "string",
                                                maxLength: 20,
                                                description: "CPU resource request/limit (e.g., '500m').",
                                            },
                                            memory: {
                                                type: "string",
                                                maxLength: 20,
                                                description: "Memory resource request/limit (e.g., '1Gi').",
                                            },
                                        },
                                        description: "Resource quotas for pods in this deployment.",
                                    },
                                },
                            },
                            description: "Kubernetes deployment specifications.",
                        },
                        services: {
                            type: "array",
                            items: {
                                type: "object",
                                required: ["name"],
                                properties: {
                                    name: { type: "string", maxLength: 50, description: "Service entity name." },
                                    type: {
                                        type: "string",
                                        enum: ["ClusterIP", "NodePort", "LoadBalancer"],
                                        description: "Kubernetes service type for networking.",
                                    },
                                    ports: {
                                        type: "array",
                                        items: {
                                            type: "object",
                                            required: ["port", "targetPort"],
                                            properties: {
                                                port: { type: "number", description: "Exposure port." },
                                                targetPort: {
                                                    type: "number",
                                                    description: "Destination port on the container.",
                                                },
                                            },
                                        },
                                        description: "Mapping of service ports to container ports.",
                                    },
                                },
                            },
                            description: "Kubernetes service definitions for internal/external access.",
                        },
                    },
                    description: "Kubernetes orchestration details including namespaces, deployments, and services.",
                },
            },
            description: "Standardized container packaging and orchestration logic.",
        },
        deployment: {
            type: "object",
            required: ["strategy", "environments"],
            properties: {
                strategy: {
                    type: "string",
                    enum: ["blue-green", "canary", "rolling", "recreate", "none"],
                    description: "High-level deployment strategy for releasing updates.",
                },
                environments: {
                    type: "array",
                    description: "Target deployment environments (dev, staging, production).",
                    items: {
                        type: "object",
                        required: ["name", "configuration"],
                        properties: {
                            name: {
                                type: "string",
                                minLength: 1,
                                maxLength: 30,
                                description: "Environment name (e.g., 'production').",
                            },
                            configuration: {
                                type: "object",
                                additionalProperties: { type: "string", maxLength: 200 },
                                description: "Environment-specific variables and settings.",
                            },
                            description: {
                                type: "string",
                                maxLength: 150,
                                description: "Purpose and scope of this environment.",
                            },
                        },
                    },
                },
                rollback_strategy: { type: "string", maxLength: 200, description: "Automated or manual procedure for reverting failed deployments." },
            },
            description: "Release management and environment-specific configuration.",
        },
        monitoring: {
            type: "object",
            required: ["tools", "metrics", "alerts"],
            properties: {
                tools: {
                    type: "array",
                    items: { type: "string", maxLength: 30 },
                    description: "Monitoring tools used for observability (e.g., Prometheus, Grafana, Datadog).",
                },
                metrics: {
                    type: "array",
                    items: {
                        type: "object",
                        required: ["name", "threshold"],
                        properties: {
                            name: { type: "string", maxLength: 30, description: "Normalized name of the metric." },
                            threshold: { type: "string", maxLength: 30, description: "Target threshold or value for this metric (e.g., '> 99.9%')." },
                            action: { type: "string", maxLength: 50, description: "Automated action to take if threshold is breached." },
                        }
                    },
                    description: "Key performance metrics and SLOs.",
                },
                alerts: {
                    type: "array",
                    items: {
                        type: "object",
                        required: ["name", "condition"],
                        properties: {
                            name: { type: "string", maxLength: 30, description: "Name of the alert rule." },
                            condition: { type: "string", maxLength: 100, description: "Logical condition that triggers the alert." },
                            severity: { type: "string", enum: ["critical", "warning", "info"], description: "Urgency level of the alert." },
                        },
                    },
                    description: "Infrastructure and application health alerts.",
                },
                logging: {
                    type: "object",
                    properties: {
                        tools: {
                            type: "array",
                            items: { type: "string", maxLength: 30 },
                            description: "Logging tools (e.g., ELK, Splunk, CloudWatch).",
                        },
                        retention: { type: "string", maxLength: 10, description: "Log retention period (e.g., '30d')." },
                    },
                    description: "Centralized logging strategy and storage policies.",
                },
            },
            description: "Application health monitoring and observability strategy.",
        },
        scaling: {
            type: "object",
            properties: {
                auto_scaling: {
                    type: "object",
                    properties: {
                        enabled: {
                            type: "boolean",
                            description: "Whether auto-scaling is enabled for the service.",
                        },
                        min_replicas: {
                            type: "number",
                            minimum: 1,
                            description: "Minimum number of replicas to maintain.",
                        },
                        max_replicas: {
                            type: "number",
                            minimum: 1,
                            description: "Maximum number of replicas under heavy load.",
                        },
                        target_cpu: {
                            type: "number",
                            minimum: 0,
                            maximum: 100,
                            description: "Target CPU utilization percentage for scaling events.",
                        },
                        target_memory: {
                            type: "number",
                            minimum: 0,
                            maximum: 100,
                            description: "Target memory utilization percentage for scaling events.",
                        },
                        metrics: {
                            type: "object",
                            description: "Custom scaling metrics (e.g., requests_per_second: 1000).",
                            additionalProperties: { type: ["string", "number"] }
                        },
                        triggers: {
                            type: "array",
                            items: {
                                type: "object",
                                required: ["type", "threshold"],
                                properties: {
                                    type: { type: "string", maxLength: 20, description: "Type of scaling trigger (e.g., 'CPU')." },
                                    threshold: { type: "string", maxLength: 20, description: "Value that initiates scaling." },
                                    metric: { type: "string", maxLength: 20, description: "The specific metric being monitored." },
                                }
                            },
                            description: "Conditions that trigger scaling actions.",
                        }
                    },
                },
                manual_scaling: {
                    type: "object",
                    properties: {
                        replicas: {
                            type: "number",
                            minimum: 1,
                            description: "Manual override for replica count.",
                        },
                    },
                    description: "Fixed scaling parameters for non-dynamic workloads.",
                },
            },
            description: "Scaling strategy for handling variable traffic loads.",
        },
        disaster_recovery: {
            type: "object",
            required: ["rpo", "rto", "backup_strategy", "failover_plan"],
            properties: {
                rpo: { type: "string", maxLength: 50, description: "Recovery Point Objective - maximum acceptable data loss." },
                rto: { type: "string", maxLength: 50, description: "Recovery Time Objective - target time to restore service." },
                backup_strategy: { type: "string", maxLength: 300, description: "Detailed strategy for database and storage backups." },
                failover_plan: { type: "string", maxLength: 300, description: "Automated or manual steps to switch to secondary environment." },
            },
            description: "Disaster recovery and business continuity plan.",
        },
    },
};
