"use client";

import React, { useState, useEffect } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "react-bootstrap";
import { useWord } from "@/app/context/WordContext";
import {  X , ChevronDown } from 'lucide-react';


const WordPopup = ( )  => {
  const { selectedWord, dictionaryData } = useWord();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (selectedWord && dictionaryData) {
      setIsOpen(true);
    }
  }, [selectedWord, dictionaryData]);

  if (!dictionaryData) return null;

  return (
    <div
      className={`
        w-full z-100 lg:z-1 overflow-y-scroll
        h-1/2 rounded-t-xl lg:rounded-xl bg-gray-700
        fixed lg:relative bottom-0 left-0  transform transition-transform duration-300 text-gray-100  ${
        isOpen ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <div className="w-full p-4 ">
        <div className="lg:hidden w-fit gap-x-7 ml-auto flex cursor-pointer rounded-md"
             onClick={() => setIsOpen(false)}>
          <X size={28} />
        </div>

        <h4 className="text-lg font-bold mb-2">
          {dictionaryData.word.toLocaleLowerCase()}
        </h4>

        {dictionaryData.basicForm && (
          <p className="text-sm mb-2">
            <strong>Basic form:</strong> {dictionaryData.basicForm}
          </p>
        )}

        {dictionaryData.transcription && (
          <div className="flex flex-row items-center mb-2">
            <p className="text-sm mb-0 mr-2">
              <strong>Transcription:</strong> {dictionaryData.transcription}
            </p>
            <Button
              variant="light"
              size="sm"
              className="p-1"
              onClick={() => {
                const audio = new Audio(dictionaryData.audioUrl);
                audio.play();
              }}
            >
              <Volume2 size={16} />
            </Button>
          </div>
        )}

        <p className="text-sm mb-2">
          <strong>Definition:</strong>
        </p>

        {dictionaryData.definition.map((def, ind) => (
          <p key={ind} className="text-sm">
            <strong>{ind + 1}</strong> {def}
          </p>
        ))}
      </div>
    </div>
  );
};

export default WordPopup;
