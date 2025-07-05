"use client";
import React, { useState } from 'react';
import useNewsDataApiClient from "newsdataapi";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from 'react-bootstrap/DropdownButton';
import  countryOptions from '/countryOPtions'; // Adjust the import path as needed
import { Form, Button, Row, Col, Alert, Card, Badge} from 'react-bootstrap';

const categoryOptions = [
  'business', 'crime', 'domestic', 'education', 'entertainment', 'environment', 'food', 'health', 'lifestyle', 'politics', 'science', 'sports', 'technology', 'top', 'tourism', 'world', 'other'
];

const InitialNewsLoad = () => {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [keyword, setKeyword] = useState<string>('')
  const [results, setResults] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

   const { latest } = useNewsDataApiClient(process.env.NEXT_PUBLIC_NEWSDATA_API_KEY!)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    // setError(null)

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
        language: 'en',
        // ...(keyword.trim().length > 0 && { q: keyword.trim() })
      }

      const data = await latest(query)
      console.log(data.results)
      setResults(data.results || [])
    } catch (err: any) {
      console.error(err)
      setError('Failed to fetch news.')
    }
  }

  return (
    <div className="p-4">
      <h4 className="mb-3">Search News</h4>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Row>
          {/* <Col md={6}>
            <Form.Group controlId="countries">
            <Form.Label>Countries (max 5)</Form.Label>
              <Form.Select multiple value={selectedCountries} onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, o => o.value)
                setSelectedCountries(selected.slice(0, 5))
              }}>
                {countryOptions.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col> */}
          {/* <Col md={6}>
            <Form.Group controlId="categories">
              <Form.Label>Categories (max 5)</Form.Label>
              <Form.Select multiple value={selectedCategories} onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, o => o.value)
                setSelectedCategories(selected.slice(0, 5))
              }}>
                {categoryOptions.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col> */}
        </Row>
         {/* <Form.Group className="mt-3">
          <Form.Label>Keyword (optional)</Form.Label>
          <Form.Control
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="e.g. movies, AI, elections"
            maxLength={100}
          />
        </Form.Group> */}
        <Button className="mt-3" variant="primary" type="submit">
          Search
        </Button>
      </Form>

      <hr />
      <h5>Results</h5>
      {results.length === 0 && <p>No results yet.</p>}
      {results.map((article, i) => (
        <Card key={i} className="mb-3">
          <Card.Body>
            <Card.Title>{article.title}</Card.Title>
            {article.image_url && (
              <Card.Img src={article.image_url} alt="news" style={{ maxHeight: 300 }} />
            )}
            <Card.Text>{article.description || article.snippet}</Card.Text>
            {article.link && <a href={article.link} target="_blank" rel="noreferrer">Read more</a>}
            {article.category && (
              <div className="mt-2">
                {article.category.map((cat: string) => (
                  <Badge bg="secondary" className="me-1" key={cat}>{cat}</Badge>
                ))}
              </div>
            )}
          </Card.Body>
        </Card>
      ))}
   
    </div>
  );
};
export default InitialNewsLoad;


//   const { latest } = useNewsDataApiClient(process.env.NEXT_PUBLIC_NEWSDATA_API_KEY);

  //   useEffect(() =>{
  //     latest({
  //         country: "us",
  //         language: "en",
  //         category: "tourism",
  //         // full_content: 1,
  //         // image: 1
  //         })
  //     .then(data => console.log(data.results))
  //     .catch(err => console.error("Error fetching latest news:", err));
  //   }, [])

  // NEWSDATAAPI
  // const response = [
  //     0:
  //     {
  //     article_id: "948de5c9b15579ddfb05525130ea7036"
  //     title: "MOUNTAIN MELTDOWN"
  //     link: "https://democratherald.com/article_e72435d9-3f7e-5abb-a804-fd8e3fb3f97e.html"
  //     keywords: null
  //     creator: [
  //     0: "FANNY BRODERSEN, MATTHIAS SCHRADER AND JAMEY KEATEN Associated Press"
  //     ]
  //     description: "CLIMATE CHANGE"
  //     content: "ONLY AVAILABLE IN PAID PLANS"
  //     pubDate: "2025-07-03 04:06:01"
  //     pubDateTZ: "UTC"
  //     image_url: "https://bloximages.chicago2.vip.townnews.com/democratherald.com/content/tncms/assets/v3/editorial/b..."
  //     video_url: null
  //     source_id: "democratherald"
  //     source_name: "Albany Democrat-herald"
  //     source_priority: 88560
  //     source_url: "https://democratherald.com"
  //     source_icon: "https://n.bytvi.com/democratherald.jpg"
  //     language: "english"
  //     country: [
  //     0: "united states of america"
  //     ]
  //     category: [
  //     0: "top"
  //     ]
  //     sentiment: "ONLY AVAILABLE IN PROFESSIONAL AND CORPORATE PLANS"
  //     sentiment_stats: "ONLY AVAILABLE IN PROFESSIONAL AND CORPORATE PLANS"
  //     ai_tag: "ONLY AVAILABLE IN PROFESSIONAL AND CORPORATE PLANS"
  //     ai_region: "ONLY AVAILABLE IN CORPORATE PLANS"
  //     ai_org: "ONLY AVAILABLE IN CORPORATE PLANS"
  //     duplicate: true
  // }
  // ]



const reply_THENEWSAPI = {
  meta: { found: 520269, returned: 3, limit: 3, page: 1 },
  data: [
    {
      uuid: "cc8585c5-b967-4ede-81f2-f29f0bef4b9a",
      title:
        "Apple Increases Apple Music, Apple TV+ and Apple One Prices By Investing.com",
      description:
        "Apple Increases Apple Music, Apple TV+ and Apple One Prices",
      keywords: "",
      snippet:
        "© Reuters Apple (AAPL) Increases Apple Music, Apple TV+ and Apple One Prices\n\nAAPL +0.58% Add to/Remove from Watchlist\n\nBy Sam Boughedda\n\nThe prices of Apple's...",
      url: "https://www.investing.com/news/stock-market-news/apple-increases-apple-music-apple-tv-and-apple-one-prices-432SI-2919988",
      image_url:
        "https://i-invdn-com.investing.com/news/moved_LYNXMPEI8J04C_L.jpg",
      language: "en",
      published_at: "2022-10-24T16:56:26.000000Z",
      source: "investing.com",
      categories: ["business", "general"],
      relevance_score: 18.151228,
    },
    {
      uuid: "b67fa0b3-9962-48d5-891f-4cb6801e22c5",
      title: "Apple подняла цены на Apple Music и Apple TV+",
      description:
        "Американская компания Apple подняла цены ежемесячной подписки на сервисы Apple Music и Apple TV+ н?...",
      keywords: "Apple, подняла, Apple, Music, Apple, ",
      snippet:
        "Американская компания Apple подняла цены ежемесячной подписки на сервисы Apple Music и Apple TV+ н?...",
      url: "https://www.kommersant.ru/doc/5633069",
      image_url: "https://im.kommersant.ru/SocialPics/5633069_26_0_453006820",
      language: "ru",
      published_at: "2022-10-25T08:42:00.000000Z",
      source: "kommersant.ru",
      categories: ["business"],
      relevance_score: 17.850456,
    },
    {
      uuid: "1f435e5f-7571-4080-8fda-12f12ee22250",
      title: "Apple Introduces Apple Music Sing",
      description:
        "CUPERTINO, Calif., December 06, 2022--Apple® today announced Apple Music® Sing, an exciting new feature that allows users to sing along to their favorite song...",
      keywords: "",
      snippet:
        "Apple Music expands its world-class lyrics experience with a new feature for fans to easily sing along to tens of millions of songs\n\nCUPERTINO, Calif., December...",
      url: "https://finance.yahoo.com/news/apple-introduces-apple-music-sing-150000908.html?.tsrc=rss",
      image_url:
        "https://s.yimg.com/cv/apiv2/social/images/yahoo_default_logo-1200x1200.png",
      language: "en",
      published_at: "2022-12-06T15:00:00.000000Z",
      source: "finance.yahoo.com",
      categories: ["business", "tech"],
      relevance_score: 17.842163,
    },
  ],
};

//THENEWSAPI
//   var requestOptions = {
//     method: "GET",
//   };

//   var params = {
//     api_token: process.env.NEXT_PUBLIC_THENEWSAPI_API_KEY,
//     categories: "business,tech",
//     search: "apple",
//     limit: "3",
//   };

//   var esc = encodeURIComponent;
//   var query = Object.keys(params)
//     .map(function (k) {
//       return esc(k) + "=" + esc(params[k]);
//     })
//     .join("&");

//   fetch("https://api.thenewsapi.com/v1/news/all?" + query, requestOptions)
//     .then((response) => response.text())
//     .then((result) => console.log(result))
//     .catch((error) => console.log("error", error));
