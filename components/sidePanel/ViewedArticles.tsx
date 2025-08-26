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
  const[articles, setArticles] = useState();
const pathname = usePathname();
  
  useEffect(() => {
      if(user){
       setArticles(user.viewed_articles)
      } 
    }, [user]);

  return (
    <div className="relative">
      <Button
        type="button" 
        variant="light"
        className="d-flex align-items-center !bg-transparent !border-transparent text-white"
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
         {open && (
         <div className="mt-2 ">
            <ListGroup className="!border-transparent !bg-transparent">
                {articles && articles.length === 0 ? (
                <ListGroup.Item>No viewed articles yet</ListGroup.Item>
                ) : (
                articles.map((article, ind) => {
                    const isActive = pathname === `/news/${article.article_id}`;
                return (
                    <Link
                        key={ind}
                        href={`/news/${article.article_id}`}
                        className="text-inherit !no-underline"
                        >
                        <ListGroup.Item 
                        className={` ${
                        isActive ? "!bg-primary !text-blue-700 font-bold" : ""
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
        )}
    </div>
  );
};

export default ViewedArticles;
