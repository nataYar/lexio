"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

type DictionaryData = {
  word: string;
  basicForm?: string;
  transcription?: string;
  definition: string[];
  audioUrl?: string
};

type WordContextType = {
  selectedWord: string | null;
  dictionaryData: DictionaryData | null;
  setSelectedWord: (word: string | null) => void;
  setDictionaryData: (data: DictionaryData | null) => void;
};

const WordContext = createContext<WordContextType>({
  selectedWord: null,
  dictionaryData: null,
  setSelectedWord: () => {},
  setDictionaryData: () => {},
});

export const useWord = () => useContext(WordContext);

export const WordProvider = ({ children }: { children: ReactNode }) => {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [dictionaryData, setDictionaryData] = useState<DictionaryData | null>(
    null
  );

 useEffect(() => {
  if (!selectedWord) return;

  console.log(`Selected word changed to: ${selectedWord}`);

  fetch(`/api/merriam_webster?word=${selectedWord}`)
    .then((res) => res.json())
    .then((result) => {
      if (result && !result.error) {
        setDictionaryData(result);
      } else {
        console.error(result.error);
      }
    });
}, [selectedWord]);


  useEffect(() => {
      console.log(dictionaryData);
    }, [dictionaryData]);

  return (
    <WordContext.Provider
      value={{
        selectedWord,
        dictionaryData,
        setSelectedWord,
        setDictionaryData,
      }}
    >
      {children}
    </WordContext.Provider>
  );
};
