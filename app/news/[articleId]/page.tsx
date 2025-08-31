
import { notFound } from "next/navigation";
import ArticleClient from "./ArticleClient"; // client component
import Link from "next/link";



export default async function ArticlePage({ params }) {
  const  articleId  = params.articleId;
if (!articleId) {
    notFound();
  }
  return (
    <div className="max-w-3xl mx-auto mt-5 py-8 px-4">
      <Link 
        href="/" 
        className="text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to Home
      </Link>
      
      {/* Pass article metadata to client component */}
      <ArticleClient articleId={articleId} />
    </div>
  )
}
