
import { notFound } from "next/navigation";
import ArticleClient from "./ArticleClient"; // client component

type Props = {
  params: {
    articleId: string;
  };
};

export default async function ArticlePage({ params }: Props) {
  const  articleId  = (await params).articleId;

  return (
    <div className="max-w-3xl mx-auto mt-5 py-8 px-4">
      {/* Pass article metadata to client component */}
      <ArticleClient articleId={articleId} />
    </div>
  )
}
