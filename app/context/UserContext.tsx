"use client";

import React, { createContext,  useMemo, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { UserContextType, User, NewsArticle, SearchTab } from "@/types/news";
import { Prev } from "react-bootstrap/esm/PageItem";

const UserContext = createContext<UserContextType>({
  user: null,
  tabMap: {},
  loading: true,
  setLoading: () => {}, 
  setTabMap: () => {}, 
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tabMap, setTabMap] = useState<Record<string, SearchTab>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const supabase = useMemo(() => createClient(), []); 


  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);

      const { data: auth } = await supabase.auth.getUser();
      const sessionUser = auth?.user;

      if (!sessionUser) {
        setLoading(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", sessionUser.id)
        .single(); //returns one object, not an array

      if (profileError || !profile) {
        console.error("Profile fetch error:", profileError);
        setLoading(false);
        return;
      }

      const { data: savedArticles } = await supabase
        .from("saved_articles")
        .select("article_id, saved_at, articles(*)")
        .eq("user_id", sessionUser.id)
        .order("saved_at", { ascending: false }); // newest saved first

      const { data: viewedArticles } = await supabase
        .from("viewed_articles")
        .select("article_id, viewed_at, articles(*)")
        .eq("user_id", sessionUser.id)
        .order("viewed_at", { ascending: false }); // newest viewed first

      const { data: searchedArticles } = await supabase
        .from("searched_articles")
        .select("article_id, searched_at, articles(*)")
        .eq("user_id", sessionUser.id)
        .order("searched_at", { ascending: false }); // newest searched first


      setUser({
        id: sessionUser.id,
        name: sessionUser.user_metadata?.name ?? null,
        email: sessionUser.email ?? null,
        ai_credits: profile.ai_credits ?? 0,
        news_api_calls: profile.news_api_calls ?? 0,
        news_api_start: profile.news_api_start ?? null,
        last_news_call: profile.last_news_call ?? null,
        last_credit_use: profile.last_credit_use ?? null,
        credit_start_date: profile.credit_start_date ?? null,
        saved_articles: savedArticles?.map((sa) => sa.articles) ?? [],
        viewed_articles: viewedArticles?.map((va) => va.articles) ?? [],
        searched_articles: searchedArticles?.map((va) => va.articles) ?? [],
      });

      setLoading(false);
    };

    fetchUser();

    // Listen for auth changes (login/logout/signup)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) {
          setUser(null);
        } else {
          fetchUser(); // Refresh on login/signup
        }
      }
    );

    return () => {
      listener?.subscription.unsubscribe(); // ✅ clean up listener
    };
  }, []);

  
  // Subscribe to new inserts in VIEWED ARTICLES for this user
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("viewed-articles-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "viewed_articles",
          filter: `user_id=eq.${user.id}`, // filter only current user’s rows
        },
        (payload) => {
          console.log("New view recorded:", payload.new);
          // seUser((prev) => [payload.new, ...prev]); 
          setUser((prev) => {
            if (!prev) return prev; // if somehow null
            return {
              ...prev,
              viewed_articles: [
                payload.new.articles, // the new article
                ...prev.viewed_articles, // existing ones
              ],
            };
          });
        }
      )
      .subscribe();

    // Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);

  return (
    <UserContext.Provider value={{ user, loading, setLoading, tabMap, setTabMap }}>
      {children}
    </UserContext.Provider>
  );
};
