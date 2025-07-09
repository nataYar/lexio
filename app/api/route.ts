
// import type { NextApiRequest, NextApiResponse } from "next";

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   const { country, category, q } = req.query;

//   const params = new URLSearchParams({
//     apikey: process.env.NEWSDATA_API_KEY!,
//     language: "en",
//   });

//   if (country) params.append("country", String(country));
//   if (category) params.append("category", String(category));
//   if (q) params.append("q", String(q));

// const apiUrl  = `https://newsdata.io/api/1/latest?${params.toString()}&apikey=${process.env.NEXT_PUBLIC_NEWSDATA_API_KEY}`

//   try {
//     const response = await fetch(apiUrl);
//     const data = await response.json();
//     res.status(200).json(data);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Failed to fetch news" });
//   }
// }
