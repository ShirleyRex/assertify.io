import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

export async function POST(req: NextRequest) {
  try {
    const { projectDescription, apiKey } = await req.json();

    if (!projectDescription) {
      return NextResponse.json({ error: "Project description required" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const categories = [
      "backend-api",
      "frontend-component",
      "database",
      "library-function",
      "integration",
      "data-pipeline",
    ];

    const message = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a project classifier. Classify the given project description into one of these categories: ${categories.join(
            ", "
          )}. Respond with ONLY the category name, nothing else.`,
        },
        {
          role: "user",
          content: projectDescription,
        },
      ],
    });

    let category = (message.choices[0].message.content || "other").trim().toLowerCase();

    if (!categories.includes(category)) {
      category = "other";
    }

    return NextResponse.json({ category });
  } catch (error: any) {
    console.error("Classification error:", error);

    if (error.status === 401) {
      return NextResponse.json({ error: "Unauthorized: Invalid API key" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Classification failed", details: String(error.message) },
      { status: 500 }
    );
  }
}
