import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, Badge, Button } from "react-bootstrap";
import { format, parseISO } from "date-fns";
import { NewsArticle } from "@/types/news";

type Props = {
  article: NewsArticle;
  ind: number;
  widthIndex: number;
  availableWidths: string[];
};

export default function ArticleCard({
  article,
  ind,
  widthIndex,
  availableWidths,
}: Props) {
  const [description, setDescription] = useState<string | null>(null);

  useEffect(() => {
    const raw = article.description || article.snippet || "";
    const limit = 300;

    if (raw.length <= limit) {
      setDescription(raw);
      return;
    }

    let slice = raw.slice(0, limit);

    const lastSpace = slice.lastIndexOf(" ");
    if (lastSpace > 0) {
      slice = slice.slice(0, lastSpace);
    }

    setDescription(slice + "…");
  }, [article]);

  // useEffect(() => {
  //   const handleDoubleClick = (e: MouseEvent | TouchEvent) => {
  //     const selection = window.getSelection()?.toString().trim();
  //     if (selection) {
  //       console.log(selection)
  //       fetchDefinition(selection.toLowerCase());
  //     }
  //   };

  //   document.addEventListener("dblclick", handleDoubleClick); // desktop
  //   document.addEventListener("touchend", handleDoubleClick); // mobile

  //   return () => {
  //     document.removeEventListener("dblclick", handleDoubleClick);
  //     document.removeEventListener("touchend", handleDoubleClick);
  //   };
  // }, []);


  return (
    <Card className={`p-2.5 mb-5 ${availableWidths[widthIndex]}`}>
      <Card.Body>
        <Card.Title>{article.title}</Card.Title>
        <div>{ind + 1}</div>
        {article.image_url && (
          <Card.Img src={article.image_url} alt="news" className="mb-3" />
        )}

        <Card.Text>{description}</Card.Text>

        {article.link && (
          <a href={article.link} target="_blank" rel="noreferrer">
            Go to source
          </a>
        )}

        <div className="my-2">
          {article.category?.map((cat) => (
            <Badge className="me-1" key={cat}>
              {cat}
            </Badge>
          ))}
          {article.country?.map((cty) => (
            <Badge className="me-1" key={cty}>
              {cty}
            </Badge>
          ))}
        </div>

        {article.pubDate && (
          <p className="text-muted">
            {format(parseISO(article.pubDate), "PPpp")}
          </p>
        )}

        <Link
          key={article.article_id}
          href={`/news/${article.article_id}`}
          className="no-underline text-inherit"
        >
          <Button variant="success" size="sm">
            Start a class
          </Button>
        </Link>
      </Card.Body>
    </Card>
  );
}
