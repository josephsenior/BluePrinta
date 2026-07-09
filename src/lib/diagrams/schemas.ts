import { z } from "zod";
import { CreateDiagramRequest, UpdateDiagramRequest } from "@/types/diagram";

const MAX_PROMPT_LENGTH = 50_000;
const MAX_DOCUMENTS = 10;
const MAX_DOCUMENT_CONTENT_LENGTH = 1_000_000;

const PromptSchema = z.string()
    .trim()
    .min(1, "Prompt is required")
    .max(MAX_PROMPT_LENGTH, "Prompt must be 50,000 characters or fewer");

const UploadedDocumentSchema = z.object({
    name: z.string().trim().min(1).max(255),
    type: z.string().trim().min(1).max(100),
    content: z.string().max(
        MAX_DOCUMENT_CONTENT_LENGTH,
        "Each document must be 1,000,000 characters or fewer"
    ),
});

export const CreateDiagramSchema = z.object({
    prompt: PromptSchema,
    options: z.object({
        includeStateManagement: z.boolean().optional(),
        includeAPIs: z.boolean().optional(),
        includeDatabase: z.boolean().optional(),
        model: z.string().max(100).optional(),
        reasoning: z.boolean().optional(),
    }).optional(),
    documents: z.array(UploadedDocumentSchema).max(MAX_DOCUMENTS, "Attach at most 10 documents").optional(),
    clarificationAnswers: z.record(z.string().max(5_000)).optional(),
});

export const ScopeRequestSchema = z.object({
    prompt: PromptSchema,
    model: z.string().max(100).optional(),
});

export function validateScopeRequest(data: unknown) {
    return ScopeRequestSchema.parse(data);
}

export const UpdateDiagramSchema = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    metadata: z.any().optional(),
});

export function validateCreateDiagramRequest(data: unknown): CreateDiagramRequest {
    return CreateDiagramSchema.parse(data) as CreateDiagramRequest;
}

export function validateUpdateDiagramRequest(data: unknown): UpdateDiagramRequest {
    return UpdateDiagramSchema.parse(data) as UpdateDiagramRequest;
}

const EditOpSchema = z.discriminatedUnion("tool", [
    z.object({ tool: z.literal("set_at_path"), artifactId: z.string(), path: z.string(), value: z.any() }),
    z.object({ tool: z.literal("delete_at_path"), artifactId: z.string(), path: z.string() }),
    z.object({ tool: z.literal("add_array_item"), artifactId: z.string(), path: z.string(), value: z.any() }),
    z.object({ tool: z.literal("remove_array_item"), artifactId: z.string(), path: z.string(), index: z.number().int().min(0).optional() }),
]);

export const EditArtifactsSchema = z.object({
    diagramId: z.string().optional(),
    previousArtifacts: z.record(z.any()),
    edits: z.array(EditOpSchema).min(1, "At least one edit is required"),
});

export function validateEditArtifactsRequest(data: unknown) {
    return EditArtifactsSchema.parse(data);
}

export const AskQuestionSchema = z.object({
    diagramId: z.string(),
    question: z.string().min(1, "Question is required"),
    contextMarkdown: z.string(),
    activeTab: z.string().optional(),
    cacheId: z.string().optional(),
    conversationHistory: z.string().optional(),
});

export function validateAskQuestionRequest(data: unknown) {
    return AskQuestionSchema.parse(data);
}

export const RefineArtifactsSchema = z.object({
    diagramId: z.string().optional(),
    intent: z.string().min(1, "Intent is required"),
    previousArtifacts: z.record(z.any()),
    chatHistory: z.string().optional(),
    activeTab: z.string().optional(),
});

export function validateRefineArtifactsRequest(data: unknown) {
    return RefineArtifactsSchema.parse(data);
}
