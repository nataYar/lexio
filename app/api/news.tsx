"use client";
import React, { useEffect, useState } from "react";
import useNewsDataApiClient from "newsdataapi";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import { countryOptions } from "./selectOptions";
import { categoryOptions } from "./selectOptions";
import { Form, Button, Row, Col, Alert, Card, Badge } from "react-bootstrap";
import Select from "react-select";
import { useUser } from "@/app/context/UserContext";
// import { supabase } from "@/utils/supabase/client";
import { format, isToday, parseISO } from "date-fns";
import { createClient } from "@/utils/supabase/client";

const InitialNewsLoad = () => {
  const [selectedCountries, setSelectedCountries] = useState<string[]>(["us"]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    "top",
  ]);
  const [keyword, setKeyword] = useState<string>("");
  const [results, setResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const { latest } = useNewsDataApiClient(
    process.env.NEXT_PUBLIC_NEWSDATA_API_KEY!
  );

  useEffect(() => {
    console.log('results');
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
      const query = {
        // country: selectedCountries.join(','),
        // category: selectedCategories.join(','),
        language: "en",

        // ...(keyword.trim().length > 0 && { q: keyword.trim() })
      };

      const data = await latest(query);
      console.log(data.results);

      setResults((prev) => {
        const existingIds = new Set(prev.map((article) => article.article_id));
        const newArticles = (data.results || []).filter(
          (article) => !existingIds.has(article.article_id)
        );
        return [...prev, ...newArticles];
      });

      const supabase = createClient(); // or wherever your client lives
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
    <div className="p-4">
      <h4 className="mb-3">Search News</h4>
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
            <Form.Group controlId="categories">
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
        <Form.Group className="mt-3">
          <Form.Label>Keyword (optional)</Form.Label>
          <Form.Control
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g. movies, AI, elections"
            maxLength={100}
          />
        </Form.Group>
        <Button className="mt-3" variant="primary" type="submit">
          Search
        </Button>
      </Form>

      <hr />
      <h5>Results</h5>
      {results.length === 0 ? (
        <p>No results yet.</p>
      ) : (
        <p>Showing top {results.length} articles.</p>
      )}
      {results.map((article, i) => (
        <Card key={i} className="mb-3">
          <Card.Body>
            <Card.Title>{article.title}</Card.Title>
            {article.image_url && (
              <Card.Img
                src={article.image_url}
                alt="news"
                style={{ maxHeight: 300 }}
              />
            )}
            <Card.Text>{article.description || article.snippet}</Card.Text>
            {article.link && (
              <a href={article.link} target="_blank" rel="noreferrer">
                Go to source
              </a>
            )}
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mt-3">
              {/* Left side */}
              <div className="w-4/5 flex-grow-1">
                {/* Display Category */}
                {article.category && article.category.length > 0 && (
                  <div className="mb-2">
                    <strong>Categories:</strong>{" "}
                    {article.category.map((cat: string) => (
                      <Badge bg="secondary" className="me-1" key={cat}>
                        {cat}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Display Country */}
                {article.country && (
                  <div className="mb-2">
                    <strong>Country:</strong>{" "}
                    <Badge bg="info" className="me-1">
                      {article.country.toUpperCase()}
                    </Badge>
                  </div>
                )}

                {/* Display Keywords */}
                {article.keywords && article.keywords.length > 0 && (
                  <div className="mb-2">
                    <strong>Keywords:</strong> <span>{article.keywords}</span>
                  </div>
                )}
              </div>

              {/* Start Reading button */}
              <div className="w-4/5 flex-grow-1 d-flex justify-content-end">
                <Button variant="success" size="sm">
                  Start a class
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};
export default InitialNewsLoad;
