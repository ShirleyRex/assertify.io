export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface CompletionOptions {
  model?: string;
  temperature?: number;
}

export interface LLMProvider {
  chatCompletion(messages: ChatMessage[], options?: CompletionOptions): Promise<string>;
}

export type ProviderKey = "openai" | "anthropic" | "gemini";

export interface ProviderMeta {
  key: ProviderKey;
  name: string;
  icon: string;
  keyPlaceholder: string;
  keyHelpUrl: string;
  keyHelpLabel: string;
  defaultModel: string;
  models: string[];
  validateKey: (key: string) => boolean;
}

export const PROVIDER_META: Record<ProviderKey, ProviderMeta> = {
  openai: {
    key: "openai",
    name: "OpenAI",
    icon: "fa-robot",
    keyPlaceholder: "sk-proj-...",
    keyHelpUrl: "https://platform.openai.com/account/api-keys",
    keyHelpLabel: "platform.openai.com/account/api-keys",
    defaultModel: "gpt-4o-mini",
    models: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-4", "gpt-3.5-turbo"],
    validateKey: (key: string) => key.startsWith("sk-"),
  },
  anthropic: {
    key: "anthropic",
    name: "Anthropic",
    icon: "fa-brain",
    keyPlaceholder: "sk-ant-...",
    keyHelpUrl: "https://console.anthropic.com/settings/keys",
    keyHelpLabel: "console.anthropic.com/settings/keys",
    defaultModel: "claude-3-5-sonnet-latest",
    models: [
      "claude-3-5-sonnet-latest",
      "claude-3-5-haiku-latest",
      "claude-3-opus-latest",
      "claude-3-sonnet-20240229",
      "claude-3-haiku-20240307",
    ],
    validateKey: (key: string) => key.startsWith("sk-ant-"),
  },
  gemini: {
    key: "gemini",
    name: "Google Gemini",
    icon: "fa-gem",
    keyPlaceholder: "AIza...",
    keyHelpUrl: "https://aistudio.google.com/apikey",
    keyHelpLabel: "aistudio.google.com/apikey",
    defaultModel: "gemini-2.5-flash",
    models: ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash", "gemini-flash-latest"],
    validateKey: (key: string) => key.length > 10,
  },
};

export const PROVIDER_KEYS = Object.keys(PROVIDER_META) as ProviderKey[];

export function isValidProviderKey(value: unknown): value is ProviderKey {
  return typeof value === "string" && PROVIDER_KEYS.includes(value as ProviderKey);
}
