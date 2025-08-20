import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { countries, categories, keyword, searchInTitleOnly, page } = body;

    const urlParams = new URLSearchParams();
    urlParams.append("language", "en");

    if (countries?.length > 0) {
      urlParams.append("country", countries.join(","));
    }
    if (categories?.length > 0) {
      urlParams.append("category", categories.join(","));
    }
    if (keyword?.trim()) {
      if (searchInTitleOnly) {
        urlParams.append("qInTitle", keyword.trim());
      } else {
        urlParams.append("qInMeta", keyword.trim());
      }
    }
    if (page) urlParams.append("page", page);

    const url = `https://newsdata.io/api/1/latest?apikey=${process.env.NEWSDATA_API_KEY}&${urlParams.toString()}`;

    const response = await fetch(url);
    const data = await response.json();

    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}
