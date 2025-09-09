"use client";
import React from "react";
import Link from "next/link";
import "@/app/globals.css"
import { ListGroup } from "react-bootstrap";
import { usePathname } from "next/navigation";

const ListOfArticles = ({ articles, onItemClick  }) => {
  const pathname = usePathname();

    return (
        <ListGroup className="!border-transparent !bg-transparent ">
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
                    onClick={() => onItemClick()} 
                    >
                    <ListGroup.Item 
                    className={`!border-none !bg-transparent ${
                    isActive ? "!bg-primary !text-blue-400 font-bold " : ""
                    }`}
                    >
                        {article.title ?? `Article #${article.id}`}
                    </ListGroup.Item>
                </Link>
            )
            })
            )}
        </ListGroup>
    )
}

export default ListOfArticles;
