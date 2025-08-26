export type User = {
  id: string;
  name: string | null;
  email: string | null;
  ai_credits: number;
  news_api_calls: number;
  news_api_start: string | null;
  last_news_call: string | null;

  last_credit_use: string | null;
  credit_start_date: string | null;
  saved_articles: NewsArticle[];
  viewed_articles: NewsArticle[];
  searched_articles: NewsArticle[];
};

export type UserContextType = {
  user: User | null;
  tabMap: Record<string, SearchTab>;
  setTabMap: React.Dispatch<React.SetStateAction<Record<string, SearchTab>>>; //function that receives the current state and returns the new state
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export type NewsArticle = {
  article_id: string;
  title: string;
  description?: string;
  full_text?: string | null;
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