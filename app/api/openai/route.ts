import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
    });

     const output = response.output_text || "";

      // Use regex to extract the first JSON object in the text
      const match = output.match(/\{[\s\S]*\}/);
      if (!match) {
        console.error("No JSON found in model output:", output);
        return NextResponse.json({ error: "No valid JSON in model output" }, { status: 500 });
      }

      let exercises = {};
      try {
        exercises = JSON.parse(match[0]);
      } catch (e) {
        console.error("Failed to parse JSON:", e, match[0]);
        return NextResponse.json({ error: "Invalid JSON from OpenAI" }, { status: 500 });
      }

      return NextResponse.json(exercises);

  } catch (err: any) {
    console.error("Error creating exercises:", err);
    return NextResponse.json(
      { error: err.message || "Failed to generate exercises" },
      { status: 500 }
    );
  }
}
