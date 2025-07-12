"use client";
import React, { useEffect, useState } from "react";
// import useNewsDataApiClient from "newsdataapi";
import { countryOptions } from "./selectOptions";
import { categoryOptions } from "./selectOptions";
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

const InitialNewsLoad = () => {
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
        const tabId = generateTabId(params);
        const existing = prev[tabId] || {
          id: tabId,
          name: tabId,
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

  const activeTab = activeTabId ? tabMap[activeTabId] : null;

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
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="countries">
            <Form.Label>
              Countries
              {selectedCountries.length > 0 && selectedCountries.length <= 5
                ? ` (selected: ${selectedCountries.length} of 5)`
                : " (max 5)"}
            </Form.Label>
            <Select
              isMulti
              options={countryOptions}
              value={countryOptions.filter((o) =>
                selectedCountries.includes(o.value)
              )}
              onChange={(selected) =>
                setSelectedCountries(selected.map((o) => o.value).slice(0, 5))
              }
              placeholder="Select countries..."
            />
          </Form.Group>

          <Form.Group className="my-3" controlId="categories">
            <Form.Label>
              {" "}
              Category
              {selectedCategories.length > 0 && selectedCategories.length <= 5
                ? ` (selected: ${selectedCategories.length} of 5)`
                : " (max 5)"}
            </Form.Label>
            <Select
              isMulti
              options={categoryOptions}
              value={categoryOptions.filter((o) =>
                selectedCategories.includes(o.value)
              )}
              onChange={(selected) =>
                setSelectedCategories(selected.map((o) => o.value).slice(0, 5))
              }
              placeholder="Select categories..."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Keyword (optional)</Form.Label>
            <Form.Control
              type="text"
              value={qInMeta}
              onChange={(e) => setQInMeta(e.target.value)}
              placeholder="e.g. movies, AI, elections"
              maxLength={100}
            />
          </Form.Group>
          <Form.Group className="my-3 text-muted">
            <Form.Check
              type="switch"
              id="searchInTitleSwitch"
              label="Search in title only (more specific, fewer results)"
              checked={searchInTitleOnly}
              onChange={(e) => setSearchInTitleOnly(e.target.checked)}
            />
          </Form.Group>

          <Button className="mt-3" variant="primary" type="submit">
            Search
          </Button>
        </Form>
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
      {activeTab && tabMap[activeTabId] && (
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

          {tabMap[activeTabId].articles.map((article, i) => (
            <Card key={i} className="mb-3 w-4/5">
              <Card.Body>
                <Card.Title>{article.title}</Card.Title>
                {article.image_url && (
                  <Card.Img
                    src={article.image_url}
                    alt="news"
                    className="w-full h-auto"
                  />
                )}
                <Card.Text>{article.description || article.snippet}</Card.Text>
                {article.link && (
                  <a href={article.link} target="_blank" rel="noreferrer">
                    Go to source
                  </a>
                )}
                <div className="flex flex-col md:flex-row justify-between items-start">
                  <div className="w-4/5">
                    {/* Display Category */}
                    {article.category && article.category.length > 0 && (
                      <div className="my-2">
                        <strong>Categories:</strong>{" "}
                        {article.category.map((cat: string) => (
                          <Badge
                            bg="bg-gray-400"
                            className="bg-gray-400 me-1"
                            key={cat}
                          >
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Display Country */}
                    {article.country && (
                      <div className="my-2">
                        <strong>Country:</strong>{" "}
                        {article.country.map((cat: string) => (
                          <Badge
                            bg="bg-gray-400"
                            className="bg-gray-400 me-1"
                            key={cat}
                          >
                            {cat}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Display Keywords */}
                    {article.keywords && article.keywords.length > 0 && (
                      <div className="my-2">
                        <strong>Keywords:</strong>{" "}
                        <span className="text-muted">{article.keywords}</span>
                      </div>
                    )}

                    {/* Display Date */}
                    {article.pubDate && (
                      <div className="my-2">
                        <strong>Date:</strong>{" "}
                        <span className="text-muted">
                          {format(parseISO(article.pubDate), "PPpp")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Start Reading button */}
                  <div className="self-end mt-3">
                    <Button variant="success" size="sm">
                      Start a class
                    </Button>
                  </div>
                </div>
              </Card.Body>
            </Card>
          ))}
          {tabMap[activeTabId].nextPage && (
            <Button
              onClick={() => handleLoadMore(activeTabId)}
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
export default InitialNewsLoad;
