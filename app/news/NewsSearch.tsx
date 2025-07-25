"use client";
import React, { useEffect, useState } from "react";
import SearchForm from "@/components/news/SearchForm";
import ArticleCard from "@/components/news/ArticleCard";
import Loading from "@/components/Loading";
import { Button, Stack, Alert, Image } from "react-bootstrap";
import { useUser } from "@/app/context/UserContext";
import { format, isToday, parseISO } from "date-fns";
import { createClient } from "@/utils/supabase/client";
import FloatingActions from "@/components/news/FloatingActions";
import NewsLayout from "@/components/news/NewsLayout";

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
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["us"]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "top",
  ]);
  const [qInMeta, setQInMeta] = useState<string>("");
  const [searchInTitleOnly, setSearchInTitleOnly] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [widthIndex, setWidthIndex] = useState<number>(0);
  const [availableWidths, setAvailableWidths] = useState<string[]>(["w-full"]);

  useEffect(() => {
    const handleResize = () => {
      const screenWidth = window.innerWidth;

      if (screenWidth < 640) {
        // Mobile (Tailwind sm)
        setAvailableWidths(["w-full"]);
        setWidthIndex(0);
      } else if (screenWidth < 1024) {
        // Tablet (Tailwind md to lg)
        setAvailableWidths(["w-full", "w-[45%]"]);
        setWidthIndex(1); // default to w-1/2
      } else {
        // Desktop (Tailwind lg and up)
        setAvailableWidths(["w-full", "w-[45%]", "w-[30%]"]);
        setWidthIndex(1); // default to w-1/2
      }
    };

    handleResize(); // Run once on mount
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    console.log("tabMap");
    console.log(tabMap);
  }, [tabMap]);

  const fetchNews = async (
    params: SearchParams,
    page: string | null = null
  ) => {
    if (!user) return;
    setLoading(true);
    // should check within 24 h, not just today
    const now = new Date();
    const lastCallDate = user.last_news_call
      ? parseISO(user.last_news_call)
      : null;

    //  "24 hours" in milliseconds:
    const within24Hours =
      lastCallDate &&
      now.getTime() - lastCallDate.getTime() < 24 * 60 * 60 * 1000;

    const dailyCallCount = within24Hours ? user.news_api_calls : 0;

    // if (dailyCallCount >= 10) {
    //   alert("You've reached your daily news limit. Try again tomorrow.");
    //   return;
    // }

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

    const url = `https://newsdata.io/api/1/latest?apikey=${
      process.env.NEXT_PUBLIC_NEWSDATA_API_KEY
    }&${urlParams.toString()}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      setTabMap((prev) => {
        const nameParts = [];
        if (params.keyword) {
          nameParts.push(params.keyword);
        }
        if (params.countries.length > 0) {
          nameParts.push(params.countries.join(", "));
        }
        if (params.categories.length > 0) {
          nameParts.push(params.categories.join(", "));
        }
        let tabName = nameParts.join(" - ");

        if (!tabName) {
          // Count how many tabs already use numeric names
          const numberedNames = Object.values(prev)
            .map((tab) => tab.name)
            .filter((name) => /^\d+$/.test(name))
            .map(Number);
          const nextNumber =
            numberedNames.length > 0 ? Math.max(...numberedNames) + 1 : 1;
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
          last_news_call: today.toISOString(),
        })
        .eq("id", user.id);
      setLoading(false);
    } catch (err) {
      setLoading(false);
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
    console.log(activeTabId);
    const activeTab = activeTabId ? tabMap[activeTabId] : null;
    if (activeTab && activeTab.nextPage) {
      fetchNews(activeTab.params, activeTab.nextPage);
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div>
        <div className="flex">
          <h4 className="mt-3">Search news</h4>

          <Image
            className="h-6 my-auto"
            src="/icons/purple-glitter.png"
            rounded
          />
        </div>

        <p className="text-muted ">from the past 48 hours</p>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}
      <Stack className="mt-8">
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

      {/* Layout */}
      <NewsLayout
        widthIndex={widthIndex}
        setWidthIndex={setWidthIndex}
        availableWidths={availableWidths}
      />

      {/* Loading  */}
      {loading && <Loading />}

      {/* Tabs */}
      <div className="flex gap-2 my-3 flex-wrap w-full">
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
        <div className="flex flex-col mb-3 flex-wrap ">
          {tabMap[activeTabId].error && (
            <Alert variant="danger">{tabMap[activeTabId].error}</Alert>
          )}

          <FloatingActions
          // toggleCardWidth={() => setIsWide(prev => !prev)}
          />

          <div className="flex flex-row items-baseline gap-6">
            {tabMap[activeTabId].articles.length === 0 ? (
              <p className="text-muted">No results yet.</p>
            ) : (
              <p>Showing top {tabMap[activeTabId].articles.length} articles.</p>
            )}

            {/* Load More button  */}
            {tabMap[activeTabId].nextPage && (
              <Button
                onClick={handleLoadMore}
                variant="outline-primary"
                className="mb-4 w-fit"
              >
                Load More
              </Button>
            )}
          </div>

          {/* Articles */}
          <div className="flex flex-row flex-wrap gap-1 justify-evenly ">
            {tabMap[activeTabId].articles.map((article, ind) => (
              <ArticleCard
                ind={ind}
                key={article.article_id}
                article={article}
                availableWidths={availableWidths}
                widthIndex={widthIndex}
              />
            ))}
          </div>

          {/* Load More button */}
          {tabMap[activeTabId].nextPage && (
            <Button
              onClick={handleLoadMore}
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
