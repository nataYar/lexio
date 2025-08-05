"use client"
import { useUser } from '@/app/context/UserContext';
import NewsSearch from './news/NewsSearch';

export default function Home() {
  const { user, loading } = useUser();

  return (
    <div className="flex flex-col justify-start  min-h-screen font-[family-name:var(--font-geist-sans)] bg-gray-100 w-full">
      {/* <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="font-[family-name:var(--font-geist-mono)] text-4xl">Welcome to Lexio</h1>
        <p className="text-lg">Your go-to platform for all things related to language learning.</p>
      </main> */}
      <div className='pt-15  px-4 md:px-18'>
        {/* <p>Hi {user?.name || 'Guest'}</p> */}
        <NewsSearch />
      </div>
      
      {/* <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
      </footer> */}
    </div>
  );
}
