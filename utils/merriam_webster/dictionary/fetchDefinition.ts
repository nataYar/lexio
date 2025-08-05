export default async function fetchDefinition(word: string) {
  const apiKey = process.env.NEXT_PUBLIC_MW_DICTIONARY_API_KEY;
  const url = `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${word}?key=${apiKey}`;
// https://dictionaryapi.com/api/v3/references/collegiate/json/test?key=665adf0a-508b-48e1-ad8c-ab273b523b81
  try {
    const res = await fetch(url);
    const data = await res.json();
console.log(data)
    // if (!data.length || typeof data[0] === 'string') {
    //   console.log(`No exact match found for "${word}"`);
    //   return;
    // }

    // const definition = data[0].shortdef?.[0] || "Definition not found.";
    // console.log(`Definition of "${word}": ${definition}`);

    // Optional: log audio pronunciation URL
    // const sound = data[0].hwi?.prs?.[0]?.sound?.audio;
    // if (sound) {
    //   const subdirectory = sound[0].match(/[0-9]/) ? 'number' : sound[0];
    //   const audioUrl = `https://media.merriam-webster.com/audio/prons/en/us/mp3/${subdirectory}/${sound}.mp3`;
    //   console.log(`Audio: ${audioUrl}`);
    // }
  } catch (err) {
    console.error("Error fetching definition:", err);
  }
}
