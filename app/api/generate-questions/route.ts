import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

export async function POST(req: NextRequest) {
  try {
    const { projectDescription, category, apiKey } = await req.json();

    console.log("Received:", {
      projectDescription: !!projectDescription,
      category,
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

    const openai = new OpenAI({
      apiKey: apiKey,
    });

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

    const message = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
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
      temperature: 0.7,
    });

    const content = message.choices[0].message.content || "[]";

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
  } catch (error: any) {
    console.error("Generate questions error:", error);

    if (error.status === 401) {
      return NextResponse.json({ error: "Unauthorized: Invalid API key" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to generate questions", details: String(error.message) },
      { status: 500 }
    );
  }
}
