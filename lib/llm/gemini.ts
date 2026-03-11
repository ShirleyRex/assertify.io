import { GoogleGenerativeAI } from "@google/generative-ai";
import type { ChatMessage, CompletionOptions, LLMProvider } from "./types";

export class GeminiProvider implements LLMProvider {
  private genAI: GoogleGenerativeAI;
  private defaultModel: string;

  constructor(apiKey: string, defaultModel = "gemini-2.0-flash") {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.defaultModel = defaultModel;
  }

  async chatCompletion(messages: ChatMessage[], options?: CompletionOptions): Promise<string> {
    const modelName = options?.model ?? this.defaultModel;
    const systemMessage = messages.find((m) => m.role === "system");
    const nonSystemMessages = messages.filter((m) => m.role !== "system");

    const model = this.genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: systemMessage?.content,
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
      },
    });

    if (nonSystemMessages.length === 0) {
      throw new Error("At least one non-system message is required");
    }

    const chat = model.startChat({
      history: nonSystemMessages.slice(0, -1).map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      })),
    });

    const lastMessage = nonSystemMessages[nonSystemMessages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    return result.response.text();
  }
}
