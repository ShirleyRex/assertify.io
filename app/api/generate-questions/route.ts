import { NextRequest, NextResponse } from "next/server";
import { createProvider, isValidProviderKey, normalizeProviderError } from "@/lib/llm";

export async function POST(req: NextRequest) {
  try {
    const { projectDescription, category, apiKey, provider = "openai", model } = await req.json();

    console.log("Received:", {
      projectDescription: !!projectDescription,
      category,
      provider,
      apiKey: !!apiKey,
    });

    if (!projectDescription || !category) {
      return NextResponse.json(
        { error: "Missing projectDescription or category" },
        { status: 400 }
      );
    }

    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 400 });
    }

    if (!isValidProviderKey(provider)) {
      return NextResponse.json({ error: `Unsupported provider: "${provider}"` }, { status: 400 });
    }

    const llm = createProvider(provider, apiKey, model);

    const prompt = `You are a QA expert. Based on the following project description and category, generate exactly 10 specific, actionable questions that a developer should answer to help write comprehensive tests for this project.

Project Category: ${category}
Project Description: ${projectDescription}

Generate 10 questions that are:
- Specific to this project type
- Actionable and clear
- Focused on testing requirements
- Cover different aspects (inputs, outputs, errors, edge cases, performance, security, etc.)

Format your response as a JSON array of strings, like this:
["Question 1?", "Question 2?", "Question 3?", ...]

Respond ONLY with the JSON array, no additional text or markdown.`;

    const content = await llm.chatCompletion(
      [
        {
          role: "system",
          content:
            "You are a QA expert. Generate exactly 10 testing-focused questions. Respond ONLY with a JSON array of strings.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      { temperature: 0.7 }
    );

    let questions;
    try {
      questions = JSON.parse(content);
      if (!Array.isArray(questions)) {
        throw new Error("Response is not an array");
      }
      questions = questions.slice(0, 10);
    } catch (parseError) {
      console.error("Failed to parse questions:", content, parseError);
      questions = [
        "What is the main purpose of this code?",
        "What are the primary inputs?",
        "What are the expected outputs?",
        "What error cases should be tested?",
        "What are the edge cases?",
        "What performance requirements exist?",
        "What security considerations matter?",
        "What dependencies are involved?",
        "What validation rules apply?",
        "What should not be tested?",
      ];
    }

    return NextResponse.json({ questions });
  } catch (error: unknown) {
    console.error("Generate questions error:", error);

    const normalized = normalizeProviderError(error);

    if (normalized.isAuthError) {
      return NextResponse.json({ error: "Unauthorized: Invalid API key" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to generate questions", details: normalized.message },
      { status: normalized.status }
    );
  }
}
