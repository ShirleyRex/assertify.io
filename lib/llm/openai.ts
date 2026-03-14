import { OpenAI } from "openai";
import type { ChatMessage, CompletionOptions, LLMProvider } from "./types";

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI;
  private defaultModel: string;

  constructor(apiKey: string, defaultModel = "gpt-4o-mini") {
    this.client = new OpenAI({ apiKey });
    this.defaultModel = defaultModel;
  }

  async chatCompletion(messages: ChatMessage[], options?: CompletionOptions): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: options?.model ?? this.defaultModel,
      messages,
      temperature: options?.temperature ?? 0.7,
    });

    return response.choices[0].message.content || "";
  }
}
