import { NextRequest, NextResponse } from "next/server";
import { createProvider, isValidProviderKey, normalizeProviderError } from "@/lib/llm";

export async function POST(req: NextRequest) {
  try {
    const { projectDescription, apiKey, provider = "openai", model } = await req.json();

    if (!projectDescription) {
      return NextResponse.json({ error: "Project description required" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 400 });
    }

    if (!isValidProviderKey(provider)) {
      return NextResponse.json({ error: `Unsupported provider: "${provider}"` }, { status: 400 });
    }

    const llm = createProvider(provider, apiKey, model);

    const categories = [
      "backend-api",
      "frontend-component",
      "database",
      "library-function",
      "integration",
      "data-pipeline",
    ];

    const content = await llm.chatCompletion([
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
    ]);

    let category = (content || "other").trim().toLowerCase();

    if (!categories.includes(category)) {
      category = "other";
    }

    return NextResponse.json({ category });
  } catch (error: unknown) {
    console.error("Classification error:", error);

    const normalized = normalizeProviderError(error);

    if (normalized.isAuthError) {
      return NextResponse.json({ error: "Unauthorized: Invalid API key" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Classification failed", details: normalized.message },
      { status: normalized.status }
    );
  }
}
