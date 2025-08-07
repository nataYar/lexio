"use client";

import React, { createContext, use, useContext, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { NewsArticle } from "@/types/news";


type User = {
  id: string;
  name: string | null;
  email: string | null;
  ai_credits: number;
  news_api_calls: number;
  news_api_start: string | null;
  last_news_call: string | null;

  last_credit_use: string | null;
  credit_start_date: string | null;
  saved_articles: NewsArticle[];
  viewed_articles: NewsArticle[];
  searched_articles: NewsArticle[];
};

type UserContextType = {
  user: User | null;
  loading: boolean;
};

const UserContext = createContext<UserContextType>({
  user: null,
  loading: true,
});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const supabase = createClient();

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
        .select("article_id, articles(*)")
        .eq("user_id", sessionUser.id);

      const { data: viewedArticles } = await supabase
        .from("viewed_articles")
        .select("article_id, articles(*)")
        .eq("user_id", sessionUser.id);

      const { data: searchedArticles } = await supabase
        .from("searched_articles")
        .select("article_id, articles(*)")
        .eq("user_id", sessionUser.id);

      setUser({
        id: sessionUser.id,
        name: sessionUser.user_metadata?.name ?? null,
        email: sessionUser.email,
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

  useEffect(() => {
    console.log(user);
  }, [user]);

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  );
};
