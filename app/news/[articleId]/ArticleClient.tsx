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


const scrapeArticle = async () => {
    if (!articleMeta?.link) return;
    setLoading(true);

    try {
      const res = await fetch("/api/extractorapi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: articleMeta.link }),
      });

      const data = await res.json();

      if (data.html) {
        setHtml(data.html);
      } else if (data.error) {
        console.error("API error:", data.error);
        setHtml(`Error: ${data.error}`);
      }
    } catch (err: any) {
      console.error("Scrape error:", err);
      setHtml(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{
    console.log("html")
    console.log(html)
  }, [html])
//   if (loading) return <p>Loading article content...</p>;


  return (
    <div className="mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4">{articleMeta?.title}</h1>

      <button onClick={scrapeArticle} disabled={loading}>
        {loading ? "Scraping..." : "Scrape Article"}
      </button>
      <div className="overflow-y-auto p-6">
        <article className="prose prose-lg max-w-none">
          {html ? (
            <div dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            "No article loaded yet."
          )}
        </article>
      </div>
    </div>
  );
}
