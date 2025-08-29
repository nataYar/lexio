import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  try {
    const { articleText } = await req.json();

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: `
      Read the following article and generate exercises.

    Output format (MUST be valid JSON, nothing else):
    {
      "exercises": [
        {
          "question": "string",
          "options": [
            { "option": "string", "isCorrect": true|false },
            { "option": "string", "isCorrect": true|false },
            { "option": "string", "isCorrect": true|false },
            { "option": "string", "isCorrect": true|false }
          ]
        }
      ]
    }

         Rules:
    - Always return exactly this JSON object with an "exercises" array.
    - Include exactly 10 questions.
    - If the article contains phrasal verbs, add extra questions about them (beyond the 10).
    - Each question must have exactly 4 options.
    - Only one option should have "isCorrect": true.
    - Do not include any explanations, comments, or text outside the JSON.


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
