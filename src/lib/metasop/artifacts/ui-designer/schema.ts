
export const uiDesignerSchema = {
    type: "object",
    required: ["component_hierarchy", "design_tokens", "summary", "description", "ui_patterns", "component_specs", "layout_breakpoints", "atomic_structure", "website_layout"],
    propertyOrdering: ["summary", "description", "website_layout", "ui_patterns", "layout_breakpoints", "component_specs", "atomic_structure", "design_tokens", "component_hierarchy"],
    properties: {
        summary: { type: "string", maxLength: 300, description: "A technical, 1-2 sentence summary of the UI strategy and design system approach. No conversational filler." },
        description: { type: "string", maxLength: 600, description: "Detailed visual design philosophy, brand alignment, and design principles." },
        component_hierarchy: {
            type: "object",
            required: ["root"],
            properties: {
                root: { type: "string", maxLength: 100, description: "Root component name (e.g., 'App')." },
                children: {
                    type: "array",
                    items: {
                        required: ["name", "description"],
                        properties: {
                            name: { type: "string", maxLength: 100, description: "Component name (e.g., 'Button')." },
                            description: { type: "string", maxLength: 100, description: "Purpose of this component." },
                            // Removed props as requested
                            children: {
                                type: "array",
                                description: "Child components (recursive).",
                                items: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string", maxLength: 80 },
                                        description: { type: "string", maxLength: 50 },
                                        // Removed props as requested
                                        children: {
                                            type: "array",
                                            description: "Child components (recursive)",
                                            items: {
                                                type: "object",
                                                properties: {
                                                    name: { type: "string", maxLength: 80, description: "Nested child component name." },
                                                }
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                    description: "Child components in the hierarchy",
                },
            },
            description: "Legacy structural component hierarchy (used by internal engine)",
        },
        design_tokens: {
            type: "object",
            required: ["colors", "spacing", "typography", "borderRadius", "shadows", "animations"],
            properties: {
                colors: {
                    type: "object",
                    required: ["primary", "primary_foreground", "secondary", "secondary_foreground", "background", "foreground", "muted", "muted_foreground", "card", "card_foreground", "popover", "popover_foreground", "border", "input", "ring", "accent", "accent_foreground", "destructive", "destructive_foreground"],
                    anyOf: [
                        { required: ["text"] },
                        { required: ["foreground"] }
                    ],
                    description: "Comprehensive color palette using hex codes (e.g., #FFFFFF). Follows Shadcn/Tailwind conventions. Either 'text' or 'foreground' must be present.",
                    properties: {
                        primary: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$", description: "Primary brand color." },
                        primary_foreground: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$", description: "Foreground color for primary elements." },
                        secondary: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$", description: "Secondary brand color." },
                        secondary_foreground: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$", description: "Foreground color for secondary elements." },
                        background: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$", description: "Main page background." },
                        foreground: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$", description: "Main page text color." },
                        muted: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$", description: "Muted background color." },
                        muted_foreground: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$", description: "Muted text color." },
                        card: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$", description: "Card background." },
                        card_foreground: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$", description: "Card text color." },
                        popover: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$", description: "Popover background." },
                        popover_foreground: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$", description: "Popover text color." },
                        border: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$", description: "Default border color." },
                        input: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$", description: "Input field border color." },
                        ring: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$", description: "Focus ring color." },
                        accent: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$", description: "Accent background." },
                        accent_foreground: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$", description: "Accent text color." },
                        destructive: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$", description: "Destructive/Error background." },
                        destructive_foreground: { type: "string", pattern: "^#[0-9A-Fa-f]{6}$", description: "Destructive/Error text color." },
                    },
                },
                spacing: {
                    type: "object",
                    description: "Spacing scale using REM units.",
                    required: ["xs", "sm", "md", "lg", "xl", "2xl", "3xl"],
                    properties: {
                        xs: { type: "string", pattern: "^[0-9.]+(rem|px)$", description: "Extra small spacing." },
                        sm: { type: "string", pattern: "^[0-9.]+(rem|px)$", description: "Small spacing." },
                        md: { type: "string", pattern: "^[0-9.]+(rem|px)$", description: "Medium spacing." },
                        lg: { type: "string", pattern: "^[0-9.]+(rem|px)$", description: "Large spacing." },
                        xl: { type: "string", pattern: "^[0-9.]+(rem|px)$", description: "Extra large spacing." },
                        "2xl": { type: "string", pattern: "^[0-9.]+(rem|px)$", description: "2X large spacing." },
                        "3xl": { type: "string", pattern: "^[0-9.]+(rem|px)$", description: "3X large spacing." },
                    },
                },
                typography: {
                    type: "object",
                    required: ["fontFamily", "headingFont", "monoFont", "fontSize", "fontWeight", "lineHeight"],
                    properties: {
                        fontFamily: { type: "string", description: "Primary sans-serif font stack." },
                        headingFont: { type: "string", description: "Font stack for headings." },
                        monoFont: { type: "string", description: "Monospace font stack." },
                        fontSize: {
                            type: "object",
                            required: ["xs", "sm", "base", "lg", "xl", "2xl", "3xl"],
                            properties: {
                                xs: { type: "string", description: "Extra small font size." },
                                sm: { type: "string", description: "Small font size." },
                                base: { type: "string", description: "Base font size." },
                                lg: { type: "string", description: "Large font size." },
                                xl: { type: "string", description: "Extra large font size." },
                                "2xl": { type: "string", description: "2X large font size." },
                                "3xl": { type: "string", description: "3X large font size." },
                            },
                            description: "Font size scale using REM units."
                        },
                        fontWeight: {
                            type: "object",
                            required: ["light", "normal", "medium", "semibold", "bold"],
                            properties: {
                                light: { type: "string", description: "Light weight (e.g., '300')." },
                                normal: { type: "string", description: "Normal/Regular weight (e.g., '400')." },
                                medium: { type: "string", description: "Medium weight (e.g., '500')." },
                                semibold: { type: "string", description: "Semi-bold weight (e.g., '600')." },
                                bold: { type: "string", description: "Bold weight (e.g., '700')." },
                            },
                            description: "Standard numeric font weights."
                        },
                        lineHeight: {
                            type: "object",
                            required: ["tight", "normal", "relaxed", "loose"],
                            properties: {
                                tight: { type: "string", description: "Tight line height (e.g., '1.25')." },
                                normal: { type: "string", description: "Normal line height (e.g., '1.5')." },
                                relaxed: { type: "string", description: "Relaxed line height (e.g., '1.625')." },
                                loose: { type: "string", description: "Loose line height (e.g., '2')." },
                            },
                            description: "Line height/leading ratios."
                        },
                    },
                },
                borderRadius: {
                    type: "object",
                    required: ["none", "sm", "md", "lg", "xl", "full"],
                    properties: {
                        none: { type: "string", description: "0px" },
                        sm: { type: "string", description: "e.g., '0.125rem'" },
                        md: { type: "string", description: "e.g., '0.375rem'" },
                        lg: { type: "string", description: "e.g., '0.5rem'" },
                        xl: { type: "string", description: "e.g., '0.75rem'" },
                        full: { type: "string", description: "9999px" },
                    },
                },
                shadows: {
                    type: "object",
                    required: ["sm", "md", "lg", "xl", "inner", "none"],
                    properties: {
                        sm: { type: "string", description: "Small shadow." },
                        md: { type: "string", description: "Medium shadow." },
                        lg: { type: "string", description: "Large shadow." },
                        xl: { type: "string", description: "Extra large shadow." },
                        inner: { type: "string", description: "Inner shadow." },
                        none: { type: "string", description: "No shadow." },
                    },
                },
                animations: {
                    type: "object",
                    required: ["fast", "normal", "slow"],
                    properties: {
                        fast: { type: "string", description: "e.g., '150ms ease'" },
                        normal: { type: "string", description: "e.g., '300ms ease'" },
                        slow: { type: "string", description: "e.g., '500ms ease'" },
                    },
                },
            },
        },
        ui_patterns: {
            type: "array",
            items: { type: "string", maxLength: 100, description: "UI design pattern name." },
        },
        component_specs: {
            type: "array",
            items: {
                type: "object",
                required: ["name", "description", "category", "variants", "sizes", "states", "accessibility"],
                properties: {
                    name: { type: "string", maxLength: 100, description: "Component name (e.g., 'Button', 'Modal')." },
                    category: { type: "string", enum: ["atom", "molecule", "organism", "template"], description: "Atomic design category." },
                    description: { type: "string", maxLength: 200, description: "Component purpose and usage guidelines." },
                    // Removed props as requested
                    variants: { type: "array", items: { type: "string", maxLength: 30 }, description: "Visual variants (primary, secondary, ghost)." },
                    sizes: { type: "array", items: { type: "string", maxLength: 10 }, description: "Size variants (sm, md, lg)." },
                    states: { type: "array", items: { type: "string", maxLength: 20 }, description: "Interactive states (hover, active, disabled, loading)." },
                    accessibility: {
                        type: "object",
                        required: ["role", "aria_label", "keyboard"],
                        properties: {
                            role: { type: "string", maxLength: 30, description: "WAI-ARIA role (e.g., 'button', 'alert')." },
                            aria_label: { type: "string", maxLength: 100, description: "Descriptive label for screen readers." },
                            keyboard: { type: "string", maxLength: 100, description: "Expected keyboard interactions (e.g., 'Enter to activate')." }
                        },
                        description: "Accessibility requirements for this component."
                    }
                },
            },
            description: "Key component specifications with props, variants, states, and accessibility. Scale to project needs."
        },
        layout_breakpoints: {
            type: "object",
            required: ["sm", "md", "lg", "xl", "2xl"],
            properties: {
                sm: { type: "string", maxLength: 15, description: "Small breakpoint (e.g., '640px')" },
                md: { type: "string", maxLength: 15, description: "Medium breakpoint (e.g., '768px')" },
                lg: { type: "string", maxLength: 15, description: "Large breakpoint (e.g., '1024px')" },
                xl: { type: "string", maxLength: 15, description: "Extra large breakpoint (e.g., '1280px')" },
                "2xl": { type: "string", maxLength: 15, description: "2X large breakpoint (e.g., '1536px')" },
            },
            description: "Responsive breakpoints",
        },
        atomic_structure: {
            type: "object",
            required: ["atoms", "molecules", "organisms"],
            properties: {
                atoms: { type: "array", items: { type: "string", maxLength: 50 }, description: "Basic building blocks (e.g. Buttons, Inputs)." },
                molecules: { type: "array", items: { type: "string", maxLength: 50 }, description: "Groups of atoms (e.g. SearchBar)." },
                organisms: { type: "array", items: { type: "string", maxLength: 50 }, description: "Complex UI components (e.g. Header)." },
            }
        },
        website_layout: {
            type: "object",
            required: ["pages"],
            properties: {
                pages: {
                    type: "array",
                    items: {
                        type: "object",
                        required: ["name", "route", "sections"],
                        properties: {
                            name: { type: "string", maxLength: 50, description: "Page title or name (e.g., 'Home')." },
                            route: { type: "string", maxLength: 100, description: "Application route path (e.g., '/')." },
                            sections: {
                                type: "array",
                                items: {
                                    type: "object",
                                    required: ["name", "components"],
                                    properties: {
                                        name: { type: "string", maxLength: 50, description: "Logical section name (e.g., 'Features')." },
                                        components: { type: "array", items: { type: "string", maxLength: 50 }, description: "Specific components rendered in this section." },
                                    }
                                },
                                description: "Sequential sections that make up the page content."
                            }
                        }
                    }
                }
            },
            description: "Information architecture/Sitemap for the application."
        }
    },
};
