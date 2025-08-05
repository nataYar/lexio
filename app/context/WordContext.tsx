"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type WordContextType = {
  selectedWord: string | null;
  setSelectedWord: (word: string | null) => void;
};

const WordContext = createContext<WordContextType>({
  selectedWord: null,
  setSelectedWord: () => {},
});

export const useWord = () => useContext(WordContext);

export const WordProvider = ({ children }: { children: ReactNode }) => {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);

  return (
    <WordContext.Provider value={{ selectedWord, setSelectedWord }}>
      {children}
    </WordContext.Provider>
  );
};
