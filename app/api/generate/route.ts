import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";

export async function POST(req: NextRequest) {
  try {
    const { projectDescription, category, answers, apiKey } = await req.json();

    if (!projectDescription || !category || !answers) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: "API key required" }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: apiKey,
    });

    const prompt = `You are a QA expert. Generate comprehensive test cases for the following project:

Category: ${category}
Description: ${projectDescription}

Context from developer:
${answers.map((a: string, i: number) => `${i + 1}. ${a}`).join("\n")}

Generate test cases in JSON format with this structure:
{
  "testCases": [
    {
      "testType": "unit|integration|feature|performance|manual",
      "testName": "test name",
      "description": "what is being tested",
      "givenContext": "preconditions",
      "testSteps": ["step 1", "step 2"],
      "expectedOutcome": "what should happen",
      "priority": "high|medium|low",
      "notes": "additional notes"
    }
  ],
  "testingStrategy": "overall strategy",
  "riskAreas": ["risk 1", "risk 2"]
}

Generate 12-15 diverse test cases covering:
- Unit tests (3-4)
- Integration tests (2-3)
- Feature/acceptance tests (3-4)
- Performance tests (1-2)
- Manual tests (2-3)

Respond ONLY with valid JSON, no markdown or extra text.`;

    const message = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a QA expert that generates test cases. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const content = message.choices[0].message.content || "{}";

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(content);
    } catch {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Invalid JSON response");
      }
    }

    return NextResponse.json(parsedResponse);
  } catch (error: any) {
    console.error("Generation error:", error);

    if (error.status === 401) {
      return NextResponse.json({ error: "Unauthorized: Invalid API key" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Test case generation failed", details: String(error.message) },
      { status: 500 }
    );
  }
}
