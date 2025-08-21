"use client";

import React from "react";
import { Volume2 } from "lucide-react";
import { Button } from "react-bootstrap";
import { useWord } from "@/app/context/WordContext";

const WordPopup = ( )  => {
  const { selectedWord, dictionaryData } = useWord();

  if (!dictionaryData) return null;

  return (
    selectedWord && (
      <div className={` w-full p-4 border border-gray-300 rounded-lg`}>
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
    )
  );
};

export default WordPopup;
