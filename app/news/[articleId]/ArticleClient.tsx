"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useUser } from "@/app/context/UserContext";
import { Button, Badge } from "react-bootstrap";
import { format, parseISO } from "date-fns";
import { createClient } from "@/utils/supabase/client";
import { NewsArticle } from "@/types/news";
import Loading from "@/components/Loading";

export default function ArticleClient({ articleId }: { articleId: string }) {
  const [html, setHtml] = useState("");
  const { user, tabMap, setLoading, loading } = useUser();
  const [articleMeta, setArticleMeta] = useState(null);
  const [exersices, setExersices] = useState(null);
  const supabase = useMemo(() => createClient(), []); 

  useEffect(() => {
    let cancelled = false;

    const saveToDB = async (formattedHtml: string, meta: Article) => {
      
//        console.log("user from context:", user);
// const { data: sessionUser, error } = await supabase.auth.getUser();
// console.log("supabase session user:", sessionUser);


      if (!user) return;
      // Save/merge article (global by article_id)
      const { error: articleError } = await supabase
        .from("articles")
        .upsert(
          {
            article_id: meta.article_id,
            title: meta.title,
            link: meta.link,
            description: meta.description,
            full_text: formattedHtml,
            image_url: meta.image_url,
            snippet: meta.snippet,
            category: meta.category,
            country: meta.country,
            keywords: meta.keywords,
            pubDate: meta.pubDate,
            pubDateTZ: meta.pubDateTZ,
          },
          { onConflict: "article_id" }
        );
      if (articleError) throw articleError;

      // Track view (avoid duplicates by making a unique constraint on (user_id, article_id) and using upsert)
      await supabase
        .from("viewed_articles")
        .upsert(
          {
            article_id: meta.article_id,
            user_id: user.id,
            viewed_at: new Date().toISOString(),
          },
          { onConflict: "user_id,article_id" }
        );
    };

    const load = async () => {
      if (!articleId) return;
      setLoading(true);

      // 1) Try DB first
      const { data: dbArticle, error } = await supabase
        .from("articles")
        .select("*")
        .eq("article_id", articleId)
        .maybeSingle();

      if (error) console.error(error);

      if (!cancelled && dbArticle) {
        setArticleMeta(dbArticle);
        if (dbArticle.full_text) {
          setHtml(dbArticle.full_text);
          setLoading(false);
          return;
        }
        // If DB has meta but not full_text, we can extract using DB meta.link
        if (dbArticle.link) {
          const res = await fetch("/api/extractorapi", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: dbArticle.link }),
          });
          const data = await res.json();
          const fullText = data.html || "";
          if (!cancelled) setHtml(fullText);
          
          await saveToDB(fullText, dbArticle);
          setLoading(false);
          return;
        }
      }

      // 2) Fall back to tabMap: get meta from the search results cache
      const fromTab =
        Object.values(tabMap)
          .flatMap((t: any) => t.articles ?? [])
          .find((a: any) => a.article_id === articleId) ?? null;

      if (!fromTab) {
        // Nothing to show (bad URL or cache cleared)
        setLoading(false);
        return;
      }

      if (!cancelled) setArticleMeta(fromTab);

      // 3) Extract + save since not in DB
      if (fromTab.link) {
        const res = await fetch("/api/extractorapi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: fromTab.link }),
        });
        const data = await res.json();
        console.log(data)
        const fullText = data.html || "";
        if (!cancelled) setHtml(fullText);
        await saveToDB(fullText, fromTab);
      }

      setLoading(false);
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [articleId, tabMap, supabase, user, setLoading]);


  const generateExercises = async () => {
  if (!html) {
    console.warn("No article text available to generate exercises.");
    return;
  }

  try {
    // setLoading(true);

    const res = await fetch("/api/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleText: html }),
    });

    if (!res.ok) {
      throw new Error(`Failed with status ${res.status}`);
    }

    const data = await res.json();
    console.log(data)
    setExersices(data); // store exercises JSON in state
  } catch (err) {
    console.error("Error generating exercises:", err);
  } finally {
    console.log("done")
    // setLoading(false);
  }
};


  if (loading) return <p>Loading article content...</p>;

  return (
    <div className="mx-auto py-8 ">
      
      <h1 className="text-3xl font-bold mb-4">{articleMeta?.title}</h1>

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

      <div className="overflow-y-auto py-8">
        <article className="prose prose-lg max-w-none">
          {html ? (
              <div dangerouslySetInnerHTML={{ __html: html }} />
            ) : loading ? (
              <Loading />
            ) : (
              <p>No article found.</p>
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
      <div className="exercises">

      </div>
    </div>
  );
}
