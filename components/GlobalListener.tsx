"use client"

import React, { useEffect, useState } from "react";
import { useWord } from "@/app/context/WordContext";

const GlobalListener = () => {
  const { setSelectedWord } = useWord(); // or useUser()

  useEffect(() => {
    const handleDoubleClick = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString().trim();

      if (selectedText && /^[a-zA-Z]+$/.test(selectedText)) {
        setSelectedWord(selectedText);
        console.log("Selected word:", selectedText);
      }
    };

    document.addEventListener("dblclick", handleDoubleClick);

    return () => {
      document.removeEventListener("dblclick", handleDoubleClick);
    };
  }, [setSelectedWord]);

  return null; 
};

export default GlobalListener;
