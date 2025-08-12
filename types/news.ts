export type NewsArticle = {
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

export type SearchParams = {
  countries: string[];
  categories: string[];
  keyword: string;
  searchInTitleOnly: boolean;
};

export type SearchTab = {
  id: string;
  name: string;
  params: SearchParams;
  articles: NewsArticle[];
  nextPage: string | null;
  loading: boolean;
  error: string | null;
};