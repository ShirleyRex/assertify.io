import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage, CompletionOptions, LLMProvider } from "./types";

export class AnthropicProvider implements LLMProvider {
  private client: Anthropic;
  private defaultModel: string;

  constructor(apiKey: string, defaultModel = "claude-3-5-sonnet-latest") {
    this.client = new Anthropic({ apiKey });
    this.defaultModel = defaultModel;
  }

  async chatCompletion(messages: ChatMessage[], options?: CompletionOptions): Promise<string> {
    // Anthropic requires the system message to be passed separately
    const systemMessage = messages.find((m) => m.role === "system");
    const nonSystemMessages = messages.filter((m) => m.role !== "system");

    const response = await this.client.messages.create({
      model: options?.model ?? this.defaultModel,
      max_tokens: 4096,
      system: systemMessage?.content,
      messages: nonSystemMessages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    });

    const textBlock = response.content.find((block) => block.type === "text");
    return textBlock && textBlock.type === "text" ? textBlock.text : "";
  }
}
