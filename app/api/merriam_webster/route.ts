import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const word = searchParams.get("word");

  if (!word) {
    return NextResponse.json({ error: "No word provided" }, { status: 400 });
  }

  const apiKey = process.env.MW_DICTIONARY_API_KEY!;
  const url = `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!data.length || typeof data[0] === "string") {
      return NextResponse.json({ error: `No exact match for "${word}"` });
    }

    const basicForm = data[0].hwi?.hw || word;
    const transcription = data[0].hwi?.prs?.[0]?.mw;
    const definition = Array.isArray(data[0].shortdef)
      ? data[0].shortdef
      : ["Definition not found."];

    let audioUrl: string | null = null;
    const sound = data[0].hwi?.prs?.[0]?.sound?.audio;
    if (sound) {
      const subdirectory = /^[0-9]/.test(sound[0]) ? "number" : sound[0];
      audioUrl = `https://media.merriam-webster.com/audio/prons/en/us/mp3/${subdirectory}/${sound}.mp3`;
    }

    return NextResponse.json({
      word,
      basicForm,
      transcription,
      definition,
      audioUrl,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
