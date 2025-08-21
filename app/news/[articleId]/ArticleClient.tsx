"use client";

import React, { useEffect, useState } from "react";
import { useUser } from "@/app/context/UserContext";
import { Button, Badge } from "react-bootstrap";
import { format, parseISO } from "date-fns";
import { createClient } from "@/utils/supabase/client";

export default function ArticleClient({ articleId }) {
  const [html, setHtml] = useState("");
  const { user, tabMap, setLoading, loading } = useUser();
  const [articleMeta, setArticleMeta] = useState(null);
  const [exersices, setExersices] = useState(null);
  const supabase = createClient();


  useEffect(() => {
    const foundArticle = Object.values(tabMap)
      .flatMap((tab) => tab.articles || null)
      .find((a) => a.article_id === articleId);
    setArticleMeta(foundArticle || null);
  }, [articleId, tabMap]);

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
        return data.html;
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

  useEffect(() => {
    if (articleMeta ) {
      console.log(articleMeta.article_id);

      console.log(articleMeta.title);
      console.log(articleMeta.link);

      console.log(articleMeta.description);

      // console.log(formattedHtml);

      console.log(articleMeta.image_url);

      console.log(articleMeta.snippet);

      console.log(articleMeta.category);

      console.log(articleMeta.country);

      console.log(articleMeta.keywords);

      console.log(articleMeta.pubDate);

      console.log(articleMeta.pubDateTZ);
    }
  }, [articleMeta]);

  const saveToDB = async (formattedHtml: string) => {
    if (!articleMeta || !user) return;

    try {
      // Save article metadata + full_text
      const { error: articleError } = await supabase
        .from("articles")
        .upsert(
          {
            article_id: articleMeta.article_id,
            title: articleMeta.title,
            link: articleMeta.link,
            description: articleMeta.description,
            full_text: formattedHtml,
            image_url: articleMeta.image_url,
            snippet: articleMeta.snippet,
            category: articleMeta.category,
            country: articleMeta.country,
            keywords: articleMeta.keywords,
            pubDate: articleMeta.pubDate,
            pubDateTZ: articleMeta.pubDateTZ,
            user_id: user.id
          },
          { onConflict: "article_id" }
        );

      if (articleError) throw articleError;

      // Save relation to viewed_articles
      const { error: viewedError } = await supabase
        .from("viewed_articles")
        .insert({
          article_id: articleMeta.article_id,
          user_id: user.id,
          viewed_at: new Date().toISOString(),
        });

      if (viewedError) throw viewedError;

      console.log("✅ Article + viewed_article saved");
    } catch (err) {
      console.error("Error saving article:", err);
    }
  };

  useEffect(() => {
    async function fetchAndSave() {
      if (!articleMeta) return;
      const formattedHtml = await scrapeArticle();
      if (formattedHtml) {
        await saveToDB(formattedHtml);
      }
    }
    // console.log(user.id);

    fetchAndSave();
  }, [articleMeta]);

  const generateExercises = async () => {
    // try {
    //   const exercises = await generateExercises(html);
    //   // setExersices(exercises)
    //   console.log(exercises)
    //   console.log(JSON.stringify(exercises, null, 2));
    // } catch (err: any) {
    //   console.error("Scrape error:", err);
    // }
  };

  if (loading) return <p>Loading article content...</p>;

  return (
    <div className="mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4">{articleMeta?.title}</h1>

      {/* <button onClick={scrapeArticle} disabled={loading}>
        {loading ? "Scraping..." : ""}
      </button> */}

      {articleMeta?.image_url && (
        <img
          src={articleMeta?.image_url}
          alt="news"
          className="mb-3 max-w-full max-h-60 w-auto object-contain"
        />
      )}

      {articleMeta?.link && (
        <a href={articleMeta?.link} target="_blank" rel="noreferrer">
          Go to source
        </a>
      )}

      <div className="my-2">
        {articleMeta?.category?.map((cat) => (
          <Badge className="me-1" key={cat}>
            {cat}
          </Badge>
        ))}
        {articleMeta?.country?.map((cty) => (
          <Badge className="me-1" key={cty}>
            {cty}
          </Badge>
        ))}
      </div>

      {articleMeta?.pubDate && (
        <p className="text-muted">
          {format(parseISO(articleMeta?.pubDate), "PPpp")}
        </p>
      )}

      <div className="overflow-y-auto p-6">
        <article className="prose prose-lg max-w-none">
          {html ? (
            <div dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            "No article loaded yet."
          )}
        </article>
      </div>

      {html ? (
        <div>
          <h5>Exersices</h5>
          <Button
            onClick={generateExercises}
            variant="outline-primary"
            className="mb-4 w-fit"
          >
            Generate exersices
          </Button>
        </div>
      ) : null}
    </div>
  );
}
