"use client"
import { useUser } from '@/app/context/UserContext';

export default function Home() {
  const { user, loading } = useUser();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      {/* <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="font-[family-name:var(--font-geist-mono)] text-4xl">Welcome to Lexio</h1>
        <p className="text-lg">Your go-to platform for all things related to language learning.</p>
      </main> */}
      <p>Hi {user?.name || 'Guest'}</p>
      {/* <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
      </footer> */}
    </div>
  );
}
