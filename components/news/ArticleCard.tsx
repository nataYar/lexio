// components/news/ArticleCard.tsx
import { Card, Badge, Button } from "react-bootstrap";
import { format, parseISO } from "date-fns";

type Props = {
  article: {
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
  };
};

export default function ArticleCard({ article }: Props) {
  return (
    <Card className="mb-3 w-4/5">
      <Card.Body>
        <Card.Title>{article.title}</Card.Title>

        {article.image_url && (
          <Card.Img src={article.image_url} alt="news" className="mb-3" />
        )}

        <Card.Text>{article.description || article.snippet}</Card.Text>

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

        <Button variant="success" size="sm">
          Start a class
        </Button>
      </Card.Body>
    </Card>
  );
}
