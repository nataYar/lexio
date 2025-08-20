import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // use server-side key
});

export async function POST(req: Request) {
  try {
    const { articleText } = await req.json();

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: `
        Read the following article and create an object named "exercises".
        The object should contain:
        - 10 multiple-choice questions (mix of comprehension and advanced vocabulary).
        - If the article contains phrasal verbs, add extra questions about them.
        - Each question must have 4 options.
        - Clearly mark which one is correct with "isCorrect": true, and the others false.
        - Return valid JSON only.

        Article:
        """${articleText}"""
      `,
      response_format: { type: "json" },
    });

    // Use output_text instead of diving into nested arrays
    const exercises = JSON.parse(response.output_text);

    return NextResponse.json(exercises);
  } catch (err: any) {
    console.error("Error creating exercises:", err);
    return NextResponse.json(
      { error: "Failed to generate exercises" },
      { status: 500 }
    );
  }
}
