import type { LLMProvider, ProviderKey } from "./types";
import { OpenAIProvider } from "./openai";
import { AnthropicProvider } from "./anthropic";
import { GeminiProvider } from "./gemini";

export type {
  LLMProvider,
  ChatMessage,
  CompletionOptions,
  ProviderKey,
  ProviderMeta,
} from "./types";
import { PROVIDER_META, PROVIDER_KEYS, isValidProviderKey } from "./types";
export { PROVIDER_META, PROVIDER_KEYS, isValidProviderKey };
export { normalizeProviderError } from "./errors";
export type { NormalizedLLMError } from "./errors";

export function createProvider(
  providerKey: ProviderKey,
  apiKey: string,
  model?: string
): LLMProvider {
  const meta = PROVIDER_META[providerKey];
  if (!meta) {
    throw new Error(`Unsupported LLM provider: ${providerKey}`);
  }

  const resolvedModel = model || meta.defaultModel;
  if (!meta.models.includes(resolvedModel)) {
    throw new Error(`Unsupported model '${resolvedModel}' for provider '${providerKey}'`);
  }

  switch (providerKey) {
    case "openai":
      return new OpenAIProvider(apiKey, resolvedModel);
    case "anthropic":
      return new AnthropicProvider(apiKey, resolvedModel);
    case "gemini":
      return new GeminiProvider(apiKey, resolvedModel);
  }
}
