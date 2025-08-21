"use client";
import React, { useEffect, useState, useMemo } from "react";
import { useUser } from "@/app/context/UserContext";
import { createClient } from "@/utils/supabase/client";
import { Button, ListGroup , Collapse } from "react-bootstrap";
import { ChevronRight, ChevronDown } from 'lucide-react';

const ViewedArticles = () => {
  const { user, tabMap } = useUser();
  const [viewedArticles, setViewedArticles] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
 const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    if (!user) return;

    // 1. Fetch initial viewed articles
    const fetchArticles = async () => {
      const { data, error } = await supabase
        .from("viewed_articles")
        .select("*")
        .eq("user_id", user.id)
        .order("viewed_at", { ascending: false }); // assuming you have a timestamp
      if (!error && data) {
        setViewedArticles(data);
      }
    };

    fetchArticles();

    // 2. Subscribe to new inserts for this user
    const channel = supabase
      .channel("viewed-articles-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "viewed_articles",
          filter: `user_id=eq.${user.id}`, // filter only current user’s rows
        },
        (payload) => {
          console.log("New view recorded:", payload.new);
          setViewedArticles((prev) => [payload.new, ...prev]); // prepend newest
        }
      )
      .subscribe();

    // 3. Cleanup subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, supabase]);


//   useEffect(() => {
//       console.log(articles)
//     }, [articles]);


  return (
    <div>
      {/* <h4 className="text-lg font-bold mb-2">Viewed articles:</h4> */}
      <Button
      type="button" 
        variant="light"
        className="d-flex align-items-center"
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
        <div className="mt-2">
          {/* <ListGroup>
            {articles.length === 0 ? (
              <ListGroup.Item>No viewed articles yet</ListGroup.Item>
            ) : (
              articles.map((article) => (
                <ListGroup.Item key={article.id}>
                  {article.article_title ?? `Article #${article.title}`}
                </ListGroup.Item>
              ))
            )}
          </ListGroup> */}
        </div>
      )}
    </div>
  );
};

export default ViewedArticles;
