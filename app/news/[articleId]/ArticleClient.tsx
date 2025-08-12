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


console.log(articleMeta)
const scrapeArticle = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/abstractapi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: articleMeta.link }),
      });

      const data = await res.json();
      if (data.html) setHtml(data.html);
    } catch (err) {
      console.error("Scrape error:", err);
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
      <pre className="min-h-full bg-amber-200">{html}</pre>

    </div>
  );
}
