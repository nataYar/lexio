// route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_EXTRACTOR_API_KEY;
    if (!apiKey) {
      console.error("Missing EXTRACTOR_API_KEY environment variable");
      return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
    }

    // Use fields=raw_text to get plain article text
    const apiUrl = `https://extractorapi.com/api/v1/extractor/?apikey=${apiKey}&fields=raw_text&url=${encodeURIComponent(url)}`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ExtractorAPI failed with status ${response.status}: ${errorText}`);
      return NextResponse.json({ error: `Failed to fetch from ExtractorAPI with status ${response.status}` }, { status: 502 });
    }

    const data = await response.json();

    // The raw article text should be in data.raw_text
    let rawText = data.raw_text || "";

    // Remove extra whitespace, repeated newlines, and some common noise markers
    rawText = rawText
      .replace(/\s+/g, " ")            // collapse multiple spaces
      .replace(/(WHYY|listen|play fast-forward|Radio Schedule|Primary Menu)/gi, "") // remove UI noise
      .replace(/\(\d{1,2}:\d{2}\)/g, "")
      .trim();

        const openai = new OpenAI({
          apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        });

 if (!rawText) {
      console.log("Falling back to OpenAI for cleanup/extraction...");
 }

const cleaned = await openai.responses.create({
      model: "gpt-4.1-mini",
      temperature: 0,
      input: `
        You are given raw extracted text from a news article.

        1. Remove anything that is not part of the main article (ads, subscription prompts, copyright notices, repeated boilerplate text, etc.).
        2. Keep only the meaningful article content.
        3. Format the output as valid HTML, wrapping each paragraph in <p>...</p> with spacing between them.
        4. Do not add extra commentary, metadata, or alterations — output only the cleaned article text in HTML format.

        Here is the raw text:

        ${rawText}`
    });

    // The cleaned article text
    const articleText = cleaned.output_text || "No content extracted.";

    return NextResponse.json({ html: articleText });

  } catch (error) {
    console.error("ExtractorAPI operation failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}





