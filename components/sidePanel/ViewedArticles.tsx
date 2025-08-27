"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useUser } from "@/app/context/UserContext";
import { Button, ListGroup } from "react-bootstrap";
import { ChevronRight, ChevronDown } from 'lucide-react';
import Link from "next/link";
import { usePathname } from "next/navigation";

const ViewedArticles = () => {
  const { user, tabMap } = useUser();
  const [open, setOpen] = useState(false);
  const[articles, setArticles] = useState<any[]>([]);
const pathname = usePathname();
  
  useEffect(() => {
      if(user){
       setArticles(user.viewed_articles)
      } 
    }, [user]);

  return (
    <div className="relative ">
      <Button
        type="button" 
        variant="light"
        className="d-flex align-items-center !bg-transparent !border-transparent text-white p-3"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        Viewed Articles
        {open ? (
          <ChevronDown  className="ms-2" />
        ) : (
          <ChevronRight className="ms-2" />
        )}  
      </Button>
         
         {/* Sliding panel */}
       <div
        className={`p-2 bg-gray-700 ${articles.length === 0 ? "h-auto": "h-[500px]"}overflow-y-scroll mt-1 w-full rounded-lg border-none absolute top-full left-0 text-white shadow-lg
          transform transition-all duration-300
          ${open ? "translate-x-0 opacity-100 pointer-events-auto" : "-translate-x-full opacity-0 pointer-events-none"}`}
      >

            <ListGroup className="!border-transparent !bg-transparent">
                { articles.length === 0 ? (
                <ListGroup.Item>No viewed articles yet</ListGroup.Item>
                ) : (
                articles.map((article, ind) => {
                    const isActive = pathname === `/news/${article.article_id}`;
                return (
                    <Link
                        key={ind}
                        href={`/news/${article.article_id}`}
                        className="border-none text-inherit !no-underline "
                        >
                        <ListGroup.Item 
                        className={`!border-none !bg-transparent text-white  ${
                        isActive ? "!bg-primary !text-blue-400 font-bold" : ""
                      }`}
                        >
                            {article.title ?? `Article #${article.id}`}
                        </ListGroup.Item>
                    </Link>
                )
                })
                )}
            </ListGroup>
        </div>
      
    </div>
  );
};

export default ViewedArticles;
