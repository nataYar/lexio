'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { logout } from '@/app/logout/actions'
import ListOfArticles from './sidePanel/ListOfArticles'
import { useUser } from "@/app/context/UserContext";

export default function NavComponent() {
  const { user } = useUser();
  const [articles, setArticles] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      setArticles(user.viewed_articles)
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [containerRef]);

  return (
    <nav ref={containerRef} className="absolute z-50 w-full bg-gray-50 shadow-md top-0">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-1">
        {/* Brand */}
        <Link href="/" className="text-xl font-bold">
          Lexio
        </Link>

        {/* Burger button (mobile only) */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-700 hover:text-black focus:outline-none lg:hidden"
        >
          {isOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none"
              viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>

        {/* Desktop menu */}
        <div className="hidden lg:flex lg:items-center lg:space-x-4">
          <button
            onClick={logout}
            className="rounded bg-blue-600 px-4 py-1 text-white hover:bg-blue-700"
          >
            Log out
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out lg:hidden ${
          isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
      
        <div className="space-y-2 px-4 py-3">
          <button
            onClick={() => { logout(); setIsOpen(false) }}
            className="w-full rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Log out
          </button>
        </div>

<div  className='px-4' >
  <p className=' text-blue-600 text-xl '>Viewed articles:</p>
        {/* Pass callback to ListOfArticles */}
        <div className='h-full  overflow-y-auto'>
           <ListOfArticles 
          articles={articles} 
          onItemClick={() => setIsOpen(false)} 
        />
        </div>
       
        </div>
        
      </div>
    </nav>
  )
}
