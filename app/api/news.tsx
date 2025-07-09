"use client";
import React, { useEffect, useState } from "react";
import useNewsDataApiClient from "newsdataapi";
import { countryOptions } from "./selectOptions";
import { categoryOptions } from "./selectOptions";
import { Form, Button, Row, Col, Alert, Card, Badge, Image } from "react-bootstrap";
import Select from "react-select";
import { useUser } from "@/app/context/UserContext";
import { format, isToday, parseISO } from "date-fns";
import { createClient } from "@/utils/supabase/client";

const InitialNewsLoad = () => {
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["us"]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "top",
  ]);
  const [qInMeta, setQInMeta] = useState<string>("");
  const [searchInTitleOnly, setSearchInTitleOnly] = useState<boolean>(false);
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const { latest } = useNewsDataApiClient(
    process.env.NEXT_PUBLIC_NEWSDATA_API_KEY!
  );

  useEffect(() => {
    console.log("results");
    console.log(results);
  }, [results]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // setError(null)

    if (!user) return;

    const today = new Date();
    const lastCallDate = user.last_news_call
      ? parseISO(user.last_news_call)
      : null;

    const isSameDay = lastCallDate && isToday(lastCallDate);
    const dailyCallCount = isSameDay ? user.news_api_calls : 0;

    if (dailyCallCount >= 10) {
      setError("You've reached your daily news limit. Try again tomorrow.");
      return;
    }

    // if (selectedCountries.length === 0 || selectedCategories.length === 0) {
    //   setError('Please select at least one country and one category.')
    //   return
    // }

    // if (selectedCountries.length > 5 || selectedCategories.length > 5) {
    //   setError('You can only select up to 5 countries and 5 categories.')
    //   return
    // }

    try {
      const params = new URLSearchParams();
      params.append("language", "en");

      if (selectedCountries.length > 0) {
        params.append("country", selectedCountries.join(","));
      }

      if (selectedCategories.length > 0) {
        params.append("category", selectedCategories.join(","));
      }

      if (qInMeta.trim()) {
        if (searchInTitleOnly) {
          params.append("qInTitle", qInMeta.trim());
        } else {
          params.append("qInMeta", qInMeta.trim());
        }
      }

      const url = `https://newsdata.io/api/1/latest?${params.toString()}&apikey=${
        process.env.NEXT_PUBLIC_NEWSDATA_API_KEY
      }`;
      console.log(url);
      const response = await fetch(url);

      const data = await response.json();
      console.log(data);

      setResults((prev) => {
        const existingIds = new Set(prev.map((article) => article.article_id));
        const newArticles = (data.results || []).filter(
          (article) => !existingIds.has(article.article_id)
        );
        return [...newArticles, ...prev];
      });

      const supabase = createClient();
      await supabase
        .from("profiles")
        .update({
          news_api_calls: dailyCallCount + 1,
          last_news_call: format(today, "yyyy-MM-dd"),
        })
        .eq("id", user.id);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch news.");
    }
  };

  return (
    <div className="p-4 w-full">
      <div className="flex">
        <h4 className="my-3">Search News</h4>
        <Image className="h-6 my-auto"src="/icons/purple-glitter.png" rounded />
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
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
          </Col>
          <Col md={6}>
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
                  setSelectedCategories(
                    selected.map((o) => o.value).slice(0, 5)
                  )
                }
                placeholder="Select categories..."
              />
            </Form.Group>
          </Col>
        </Row>
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

      <hr />



      <h5>Latest news from the past 48 hours</h5>

      {results.length === 0 ? (
        <p className="text-muted">No results yet.</p>
      ) : (
        <p>Showing top {results.length} articles.</p>
      )}
      <div className="w-full flex">
        {results.map((article, i) => (
        <Card key={i} className="mb-3 w-4/5">
          <Card.Body>
            <Card.Title>{article.title}</Card.Title>
            {article.image_url && (
              <Card.Img
                src={article.image_url}
                alt="news"
                className="h-1/3"
                // style={{ maxHeight: 300 }}
              />
            )}
            <Card.Text>{article.description || article.snippet}</Card.Text>
           
            {article.link && (
              <a  href={article.link} target="_blank" rel="noreferrer">
                Go to source
              </a>
            )}
            <div className="flex flex-col md:flex-row justify-between items-start">
              {/* Left side */}
              <div className="w-4/5">
                {/* Display Category */}
                {article.category && article.category.length > 0 && (
                  <div className="my-2">
                    <strong>Categories:</strong>{" "}
                    {article.category.map((cat: string) => (
                      <Badge bg="bg-gray-400" className="bg-gray-400 me-1"  key={cat}>
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
                        <Badge bg="bg-gray-400" className="bg-gray-400 me-1" key={cat}>
                          {cat}
                        </Badge>
                      ))}
                  </div>
                )}

                {/* Display Keywords */}
                {article.keywords && article.keywords.length > 0 && (
                  <div className="my-2">
                    <strong>Keywords:</strong> <span className="text-muted">{article.keywords}</span>
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
      </div>
    </div>
  );
};
export default InitialNewsLoad;
