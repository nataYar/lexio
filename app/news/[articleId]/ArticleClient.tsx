"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/app/context/UserContext";

export default function ArticleClient({ articleId }) {
  const [html, setHtml] = useState("");
  const { tabMap, setLoading, loading } = useUser();
  const [articleMeta, setArticleMeta] = useState(null);

  
  
  useEffect(() => {
    const foundArticle = Object.values(tabMap)
    .flatMap((tab) => tab.articles || null)
    .find((a) => a.article_id === articleId);
    setArticleMeta(foundArticle || null)
  }, [articleId, tabMap]);

  // useEffect(()=>{console.log(articleMeta.link)}, [articleMeta])


// console.log(articleMeta)
const scrapeArticle = async () => {
    setLoading(true);
    console.log(articleMeta.link)
    try {
      const res = await fetch("/api/abstractapi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: articleMeta?.link }),
      });

      // console.log(res)
      const data = await res.json();
      console.log(data)
      // let data;
      // const contentType = res.headers.get("content-type") || "";

      // if (contentType.includes("application/json")) {
      //   data = await res.json();
      // } else {
      //   const text = await res.text();
      //   console.error("Non-JSON response from API:", text);
      //   throw new Error(`Unexpected response type: ${contentType}`);
      // }

      // if (data.content) {
      //   setHtml(data.content);
      // } else if (data.error) {
      //   console.error("API error:", data.error);
      // }
    } catch (err) {
    console.error("Scrape error:", err);
    setHtml(`Error: ${err.message}`);
  } finally {
    setLoading(false);
  }
  };

//   if (loading) return <p>Loading article content...</p>;


  return (
    <div className="mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4">{articleMeta?.title}</h1>

      <button onClick={scrapeArticle} disabled={loading}>
        {loading ? "Scraping..." : "Scrape Article"}
      </button>
      <pre className="h-screen overflow-scroll bg-amber-200"> Article: {html}</pre>

    </div>
  );
}
