"use client";
import React, { useEffect, useState } from "react";
// import useNewsDataApiClient from "newsdataapi";
import { countryOptions, categoryOptions } from "./search-options";
import SearchForm from "@/components/news/SearchForm";
import ArticleCard from "@/components/news/ArticleCard";
import {
  Form,
  Button,
  Stack,
  Alert,
  Card,
  Badge,
  Image,
} from "react-bootstrap";
import Select from "react-select";
import { useUser } from "@/app/context/UserContext";
import { format, isToday, parseISO } from "date-fns";
import { createClient } from "@/utils/supabase/client";

type Article = {
  article_id: string;
  title: string;
  description?: string;
  snippet?: string;
  image_url?: string;
  link?: string;
  category?: string[];
  country?: string[];
  keywords?: string[];
  pubDate?: string;
  pubDateTZ?: string;
};

type SearchParams = {
  countries: string[];
  categories: string[];
  keyword: string;
  searchInTitleOnly: boolean;
};

type SearchTab = {
  id: string;
  name: string;
  params: SearchParams;
  articles: Article[];
  nextPage: string | null;
  loading: boolean;
  error: string | null;
};

const generateTabId = (params: SearchParams): string => {
  return btoa(
    JSON.stringify({
      countries: [...params.countries].sort(),
      categories: [...params.categories].sort(),
      keyword: params.keyword.trim().toLowerCase(),
      searchInTitleOnly: params.searchInTitleOnly,
    })
  );
};

const NewsSearch = () => {
  const { user } = useUser();
  const [tabMap, setTabMap] = useState<Record<string, SearchTab>>({});

  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["us"]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "top",
  ]);
  const [qInMeta, setQInMeta] = useState<string>("");
  const [searchInTitleOnly, setSearchInTitleOnly] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("tabMap");
    console.log(tabMap);
  }, [tabMap]);

  const fetchNews = async (
    params: SearchParams,
    page: string | null = null
  ) => {
    if (!user) return;

    const today = new Date();
    const lastCallDate = user.last_news_call
      ? parseISO(user.last_news_call)
      : null;
    const isSameDay = lastCallDate && isToday(lastCallDate);
    const dailyCallCount = isSameDay ? user.news_api_calls : 0;

    if (dailyCallCount >= 10) {
      alert("You've reached your daily news limit. Try again tomorrow.");
      return;
    }

    const urlParams = new URLSearchParams();
    urlParams.append("language", "en");
    if (params.countries.length > 0)
      urlParams.append("country", params.countries.join(","));
    if (params.categories.length > 0)
      urlParams.append("category", params.categories.join(","));
    if (params.keyword.trim()) {
      if (params.searchInTitleOnly) {
        urlParams.append("qInTitle", params.keyword.trim());
      } else {
        urlParams.append("qInMeta", params.keyword.trim());
      }
    }
    if (page) urlParams.append("page", page);

    const url = `https://newsdata.io/api/1/latest?${urlParams.toString()}&apikey=${
      process.env.NEXT_PUBLIC_NEWSDATA_API_KEY
    }`;

    try {
      const response = await fetch(url);
      const data = await response.json();
      
      

      setTabMap((prev) => {
        const nameParts = [];
      if (params.keyword) {
        nameParts.push(params.keyword);
      }
      if (params.countries.length > 0) {
        nameParts.push(params.countries.join(', '));
      }
      if (params.categories.length > 0) {
        nameParts.push(params.categories.join(', '));
      }
      let tabName = nameParts.join(' – ');
      
      if (!tabName) {
        // Count how many tabs already use numeric names
        const numberedNames = Object.values(prev)
          .map((tab) => tab.name)
          .filter((name) => /^\d+$/.test(name))
          .map(Number);
        const nextNumber = numberedNames.length > 0 ? Math.max(...numberedNames) + 1 : 1;
        tabName = String(nextNumber);
      }

        const tabId = generateTabId(params);
        const existing = prev[tabId] || {
          id: tabId,
          name: tabName,
          params,
          articles: [],
          nextPage: null,
          loading: false,
          error: null,
        };

        const existingIds = new Set(existing.articles.map((a) => a.article_id));
        const newArticles = (data.results || []).filter(
          (a) => !existingIds.has(a.article_id)
        );

        return {
          ...prev,
          [tabId]: {
            ...existing,
            articles: [...existing.articles, ...newArticles],
            nextPage: data.nextPage ?? null,
            loading: false,
            error: null,
          },
        };
      });

      const supabase = createClient();
      await supabase
        .from("profiles")
        .update({
          news_api_calls: dailyCallCount + 1,
          last_news_call: format(today, "yyyy-MM-dd"),
        })
        .eq("id", user.id);
    } catch (err) {
      console.error("Fetch failed:", err);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const searchParams: SearchParams = {
      countries: selectedCountries,
      categories: selectedCategories,
      keyword: qInMeta,
      searchInTitleOnly,
    };
    const tabId = generateTabId(searchParams);
    setActiveTabId(tabId);
    fetchNews(searchParams);
  };

  const handleLoadMore = () => {
    const activeTab = activeTabId ? tabMap[activeTabId] : null;
    if (activeTab && activeTab.nextPage) {
      fetchNews(activeTab.params, activeTab.nextPage);
    }
  };


  return (
    <div className="p-4 w-full">
      <div className="flex">
        <h4 className="my-3">Search News</h4>
        <Image
          className="h-6 my-auto"
          src="/icons/purple-glitter.png"
          rounded
        />
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      <Stack>
        <SearchForm
          selectedCountries={selectedCountries}
          selectedCategories={selectedCategories}
          keyword={qInMeta}
          searchInTitleOnly={searchInTitleOnly}
          setSelectedCountries={setSelectedCountries}
          setSelectedCategories={setSelectedCategories}
          setKeyword={setQInMeta}
          setSearchInTitleOnly={setSearchInTitleOnly}
          onSubmit={handleSubmit}
        />
      </Stack>
      <hr />

      {/* Tabs */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {Object.entries(tabMap).map(([id, tab]) => (
          <Button
            key={id}
            size="sm"
            variant={id === activeTabId ? "secondary" : "outline-secondary"}
            onClick={() => setActiveTabId(id)}
          >
            {tab.name}
          </Button>
        ))}
      </div>

      {/* Active Tab Content */}
      {activeTabId !== null && tabMap[activeTabId] && (
        <div>
          {tabMap[activeTabId].error && (
            <Alert variant="danger">{tabMap[activeTabId].error}</Alert>
          )}

          <h6 className="mb-2">Latest news from the past 48 hours</h6>

          {tabMap[activeTabId].articles.length === 0 ? (
            <p className="text-muted">No results yet.</p>
          ) : (
            <p>Showing top {tabMap[activeTabId].articles.length} articles.</p>
          )}

          {tabMap[activeTabId].articles.map((article) => (
            <ArticleCard key={article.article_id} article={article} />
          ))}

          {tabMap[activeTabId].nextPage && (
            <Button
              onClick={() => handleLoadMore}
              variant="outline-primary"
              className="mt-3"
            >
              Load More
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
export default NewsSearch;
