import { z } from "zod";

const WebsiteLayoutSchema = z.object({
    pages: z.array(z.object({
        name: z.string(),
        route: z.string(),
        sections: z.array(z.union([
            z.string(), // Simple string section name
            z.object({
                name: z.string(),
                components: z.array(z.string()),
            })
        ])).optional(),
    })).min(1, "At least one page is required"),
});

const ComponentHierarchySchema = z.object({
    root: z.string(),
    children: z.array(z.object({
        name: z.string(),
        children: z.array(z.any()),
        description: z.string(),
    })),
});

const DesignTokensSchema = z.object({
    colors: z.record(z.string(), z.string()),
    spacing: z.record(z.string(), z.string()),
    typography: z.object({
        fontFamily: z.string(),
        headingFont: z.string(),
        monoFont: z.string(),
        fontSize: z.record(z.string(), z.string()),
        fontWeight: z.record(z.string(), z.string()),
        lineHeight: z.record(z.string(), z.string()),
    }),
    borderRadius: z.record(z.string(), z.string()),
    shadows: z.record(z.string(), z.string()),
    animations: z.record(z.string(), z.string()),
});

const ComponentSpecSchema = z.object({
    name: z.string(),
    description: z.string(),
    category: z.enum(["atom", "molecule", "organism", "template"]).optional(),
    variants: z.array(z.string()),
    states: z.array(z.string()),
});

export const UIDesignerArtifactSchema = z.object({
    schema_version: z.string().optional(),
    component_hierarchy: ComponentHierarchySchema,
    design_tokens: DesignTokensSchema,
    ui_patterns: z.array(z.string()),
    component_specs: z.array(ComponentSpecSchema),
    layout_breakpoints: z.record(z.string(), z.string()),
    atomic_structure: z.object({
        atoms: z.array(z.string()),
        molecules: z.array(z.string()),
        organisms: z.array(z.string()),
    }),
    website_layout: WebsiteLayoutSchema,
    summary: z.string(),
    description: z.string(),
}).transform(({ schema_version: _schemaVersion, ...rest }) => rest);

export function validateUIDesignerArtifact(data: unknown) {
    return UIDesignerArtifactSchema.parse(data);
}

export function safeValidateUIDesignerArtifact(data: unknown) {
    return UIDesignerArtifactSchema.safeParse(data);
}
