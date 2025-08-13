import { NextResponse } from "next/server";
import * as cheerio from 'cheerio';


export async function POST(req: Request) {
  const { url } = await req.json();
  console.log(url)
  if (!url) {
    return NextResponse.json({ error: "Missing URL" }, { status: 400 });
  }

  try {
    // Replace with your AbstractAPI key or your own scraping logic
    const apiKey = process.env.NEXT_PUBLIC_ABSTRACT_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing API key" }, { status: 500 });
    }

    const apiUrl = `https://scrape.abstractapi.com/v1/?api_key=${apiKey}&url=${encodeURIComponent(url)}`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch from AbstractAPI" }, { status: 500 });
    }
  
    const data = await response.json();

    // const html = await response.text();

    // Load HTML into cheerio
//     const $ = cheerio.load(html);

//     // Try a few common selectors for main article content
//     const articleSelectors = [
//       "article",          // HTML5 article tag
//       ".article-content", // common class name
//       ".post-content",    // common class name
//       "#main-content",    // common ID
//       ".content",         // fallback generic content
//     ];

//     let articleText = "";

//     for (const selector of articleSelectors) {
//       if ($(selector).length > 0) {
//         articleText = $(selector).text().trim();
//         // if (articleText.length > 200) break; // if we got decent content, stop
//       }
//     }

//     // If no good content found, fallback to entire body text (last resort)
//     if (!articleText || articleText.length < 200) {
//       articleText = $("body").text().trim();
//     }

//     // Optional: Clean multiple newlines, excessive spaces
//     articleText = articleText.replace(/\n\s*\n/g, "\n\n").trim();
// console.log("articleText")

// console.log(articleText)
     return NextResponse.json(data); //without cheerio we return raw html

    // return NextResponse.json({ html: articleText });
  } catch (error) {
    console.error("Scraping error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
