"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useUser } from "@/app/context/UserContext";
import { Button, Badge } from "react-bootstrap";
import { format, parseISO } from "date-fns";
import { createClient } from "@/utils/supabase/client";
import { NewsArticle } from "@/types/news";
import Loading from "@/components/Loading";
import Exercises from "./Exercises";
import { FileQuestion } from "lucide-react";



export default function ArticleClient({ articleId }: { articleId: string }) {
  const [html, setHtml] = useState("");
  const { user, tabMap, setLoading, loading } = useUser();
  const [articleMeta, setArticleMeta] = useState(null);
  const [exercises, setExercises] = useState(null);
  const supabase = useMemo(() => createClient(), []);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [fromAI, setFromAI] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const saveToDB = async (formattedHtml: string, meta: Article) => {
      //        console.log("user from context:", user);
      // const { data: sessionUser, error } = await supabase.auth.getUser();
      // console.log("supabase session user:", sessionUser);

      if (!user) return;
      // Save/merge article (global by article_id)
      const { error: articleError } = await supabase.from("articles").upsert(
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
      await supabase.from("viewed_articles").upsert(
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
            cache: "force-cache",
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
          cache: "force-cache",
        });
        const data = await res.json();
        console.log(data);
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


useEffect(() => {
  const fetchExercises = async () => {
    if (!user?.id) return;
    setLoadingExercises(true);

    const { data, error } = await supabase
      .from("exercises")
      .select("question, options")
      .eq("user_id", user.id)
      .eq("article_id", articleId);

    if (error) {
      console.error("Error fetching exercises:", error);
    } else if (data && data.length > 0) {
      console.log("Found exercises in DB:", data.length);
       const exercisesShuffled = data.map((ex) => ({
      ...ex,
      options: shuffleArray(ex.options),
    }));

      setExercises(exercisesShuffled); // already an array
    } else {
      console.log("No exercises found in DB for this article, generating via AI...");
      await generateExercises(); // call your OpenAI function
    }

    setLoadingExercises(false);
  };

  fetchExercises();
}, [articleId, user]);

const shuffleArray = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}; 

const generateExercises = async () => {
  if (!html) return;
  try {
    setLoadingExercises(true);

    const res = await fetch("/api/openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ articleText: html }),
    });

    if (!res.ok) throw new Error(`Failed with status ${res.status}`);
    const data = await res.json();
    console.log(data.exercises)
    const exercisesArray = Array.isArray(data.exercises) ? data.exercises : data;

    // shuffle options for each exercise
    const exercisesShuffled = exercisesArray.map((ex) => ({
      ...ex,
      options: shuffleArray(ex.options),
    }));
  
    console.log(exercisesShuffled )
    setExercises(exercisesShuffled);
    setFromAI(true);
  } catch (err) {
    console.error("Error generating exercises:", err);
  } finally {
    setLoadingExercises(false);
  }
};

// Save only if exercises were generated by AI
useEffect(() => {
  if (!user?.id || !exercises || !fromAI || !Array.isArray(exercises)) return;

  const save = async () => {
    const rows = exercises.map((ex) => ({
      user_id: user.id,
      article_id: articleId,
      question: ex.question,
      options: ex.options,
    }));

    const { data, error } = await supabase
      .from("exercises")
      .insert(rows)
      .select("*");

    if (error) {
      console.error("Error saving exercises:", error);
    } else {
      console.log("Saved exercises:", data.length);
    }
  };

  save();
  setFromAI(false); // reset
}, [exercises, fromAI, user, articleId]);


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
          {/* {html ? (
            <div dangerouslySetInnerHTML={{ __html: html }} />
          ) : loading ? (
            <Loading />
          ) : (
            <p>No article found.</p>
          )} */}
           {html ? (
            <div dangerouslySetInnerHTML={{ __html: html }} />
          ) : 
            <Loading />
         
          }
        </article>
      </div>

      {!loading && !exercises && (
        <Button
          variant="outline-primary"
          onClick={generateExercises} // your existing function to call OpenAI
        >
          Generate exercises
        </Button>
      )}

      {
        loadingExercises ? <Loading /> : <Exercises articleId={articleId} exercises={exercises} />
      }
      
    

      {/* {html ? (
        <div>
          <h5>exercises</h5>
          <Button
            onClick={generateExercises}
            variant="outline-primary"
            className="mb-4 w-fit"
          >
            Generate exercises
          </Button>
        </div>
      ) : null}
      <div className="exercises">
        <Exercises articleId={articleId} exercises={exercises}/>
      </div> */}
    </div>
  );
}
