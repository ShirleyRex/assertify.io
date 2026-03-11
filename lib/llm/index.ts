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
export { PROVIDER_META, PROVIDER_KEYS, isValidProviderKey } from "./types";
export { normalizeProviderError } from "./errors";
export type { NormalizedLLMError } from "./errors";

export function createProvider(
  providerKey: ProviderKey,
  apiKey: string,
  model?: string
): LLMProvider {
  switch (providerKey) {
    case "openai":
      return new OpenAIProvider(apiKey, model);
    case "anthropic":
      return new AnthropicProvider(apiKey, model);
    case "gemini":
      return new GeminiProvider(apiKey, model);
    default:
      throw new Error(`Unsupported LLM provider: ${providerKey}`);
  }
}
