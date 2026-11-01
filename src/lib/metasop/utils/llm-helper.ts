/**
 * LLM Helper - Provides easy access to LLM provider
 */

import { createLLMProvider, LLMProvider, LLMProgressEvent } from "../adapters/llm-adapter";
import { getConfig } from "../config";
import { logger } from "./logger";

const providers = new Map<string, LLMProvider>();

/** Select per request so simultaneous jobs can use different providers safely. */
export function providerForModel(model: string | undefined, fallback: string): string {
  if (fallback === "mock") return "mock";
  if (model?.startsWith("gemini-")) return "gemini";
  if (model) return "chatgpt";
  return fallback;
}

export function getLLMProvider(model?: string): LLMProvider {
  const config = getConfig();
  const providerType = providerForModel(model, config.llm.provider || "mock");
  let provider = providers.get(providerType);
  if (!provider) {
    provider = createLLMProvider(providerType);
    providers.set(providerType, provider);
    logger.info("LLM provider initialized", { provider: providerType });
  }
  return provider;
}

/**
 * Generate text using LLM
 */
export async function generateWithLLM(
  prompt: string,
  options?: {
    temperature?: number;
    maxTokens?: number;
    reasoning?: boolean;
    cacheId?: string;
    role?: string;
    systemInstruction?: string;
    model?: string; // Per-call model override
  }
): Promise<string> {
  const provider = getLLMProvider(options?.model);
  const config = getConfig();

  return provider.generate(prompt, {
    temperature: options?.temperature ?? config.llm.temperature,
    maxTokens: options?.maxTokens ?? config.llm.maxTokens,
    model: options?.model ?? config.llm.model,
    reasoning: options?.reasoning,
    cacheId: options?.cacheId,
    role: options?.role,
    systemInstruction: options?.systemInstruction,
  });
}


/**
 * Generate structured output using LLM
 */
export async function generateStructuredWithLLM<T>(
  prompt: string,
  schema: unknown,
  options?: {
    temperature?: number;
    maxTokens?: number;
    reasoning?: boolean;
    cacheId?: string;
    role?: string;
    systemInstruction?: string;
    model?: string;
  }
): Promise<T> {
  const provider = getLLMProvider(options?.model);
  const config = getConfig();

  return provider.generateStructured<T>(prompt, schema, {
    temperature: options?.temperature ?? config.llm.temperature,
    maxTokens: options?.maxTokens ?? config.llm.maxTokens,
    model: options?.model ?? config.llm.model,
    reasoning: options?.reasoning,
    cacheId: options?.cacheId,
    role: options?.role,
    systemInstruction: options?.systemInstruction,
  });
}

/**
 * Generate structured output using LLM with real-time streaming
 */
export async function generateStreamingStructuredWithLLM<T>(
  prompt: string,
  schema: unknown,
  onProgress: (event: LLMProgressEvent) => void,
  options?: {
    temperature?: number;
    maxTokens?: number;
    reasoning?: boolean;
    cacheId?: string;
    role?: string;
    systemInstruction?: string;
    model?: string; // Per-agent model override
  }
): Promise<T> {
  const provider = getLLMProvider(options?.model);
  const config = getConfig();

  // Use per-agent model override if provided, otherwise use global config
  const modelToUse = options?.model || config.llm.model;

  if (provider.generateStreamingStructured) {
    return provider.generateStreamingStructured<T>(prompt, schema, onProgress, {
      temperature: options?.temperature ?? config.llm.temperature,
      maxTokens: options?.maxTokens ?? config.llm.maxTokens,
      model: modelToUse,
      reasoning: options?.reasoning,
      cacheId: options?.cacheId,
      role: options?.role,
      systemInstruction: options?.systemInstruction,
    });
  }

  // Fallback to non-streaming
  return generateStructuredWithLLM<T>(prompt, schema, options);
}

/**
 * Create a context cache using Gemini LLM
 */
export async function createCacheWithLLM(content: string, systemInstruction?: string, ttlSeconds: number = 3600, model?: string): Promise<string> {
  const provider = getLLMProvider(model);
  const config = getConfig();

  if (!provider.createCache) {
    throw new Error("Context caching is not supported by the current LLM provider");
  }

  return provider.createCache(content, systemInstruction, ttlSeconds, model || config.llm.model);
}

/**
 * Generate text with streaming using LLM
 */
export async function generateStreamWithLLM(
  prompt: string,
  onChunk: (chunk: string) => void,
  options?: {
    temperature?: number;
    maxTokens?: number;
    reasoning?: boolean;
    cacheId?: string;
    role?: string;
    systemInstruction?: string;
    model?: string;
  }
): Promise<string> {
  const provider = getLLMProvider(options?.model);

  if (!provider.generateStream) {
    // Fallback to non-streaming if provider doesn't support streaming
    const result = await generateWithLLM(prompt, options);
    // Simulate streaming by chunking the result
    const chunkSize = 10;
    for (let i = 0; i < result.length; i += chunkSize) {
      onChunk(result.slice(i, i + chunkSize));
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    return result;
  }

  const config = getConfig();
  return provider.generateStream(prompt, onChunk, {
    temperature: options?.temperature ?? config.llm.temperature,
    maxTokens: options?.maxTokens ?? config.llm.maxTokens,
    model: options?.model ?? config.llm.model,
    reasoning: options?.reasoning,
    cacheId: options?.cacheId,
    role: options?.role,
    systemInstruction: options?.systemInstruction,
  });
}

/**
 * Reset LLM provider instance (useful for testing)
 */
export function resetLLMProvider(): void {
  providers.clear();
}
