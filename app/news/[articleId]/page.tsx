import { notFound } from "next/navigation";

type Props = {
  params: {
    articleId: string;
  };
};

export default async function ArticlePage({ params }: Props) {
  const { articleId } = params;

  // Replace with your actual data source
  // const res = await fetch(`https://your-api.com/article/${articleId}`, {
  //   next: { revalidate: 60 }, // Optional caching
  // });

  // if (!res.ok) return notFound();

  // const article = await res.json();

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-4">Article {articleId ? articleId : null}</h1>
      {/* {article.image_url && (
        <img src={article.image_url} alt="news" className="mb-4 rounded w-full" />
      )} */}
      {/* <p className="text-lg text-gray-800 whitespace-pre-line">
        {article.content || article.description || article.snippet}
      </p> */}
    </div>
  );
}
