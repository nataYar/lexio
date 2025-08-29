"use client";

import { useState } from "react";
import { Card, ListGroup } from "react-bootstrap";

type Option = {
  option: string;
  isCorrect: boolean;
};

type Exercise = {
  question: string;
  options: Option[];
};

type Props = {
  exercises: Exercise[];
  articleId: string
};

const Exercises = ({ exercises }: Props) => {
  const [selected, setSelected] = useState<{ [key: number]: number }>({});
  

  const handleSelect = (exerciseIndex: number, optionIndex: number) => {
    setSelected((prev) => ({ ...prev, [exerciseIndex]: optionIndex }));
  };

  const isCorrect = (exerciseIndex: number) => {
    const optionIndex = selected[exerciseIndex];
    return (
      optionIndex !== undefined &&
      exercises[exerciseIndex].options[optionIndex].isCorrect
    );
  };

  const allAnswered =
  exercises && exercises.length > 0
    ? Object.keys(selected).length === exercises.length
    : false;

  const correctCount =
  exercises && exercises.length > 0
    ? Object.keys(selected).reduce((count, key) => {
        return isCorrect(Number(key)) ? count + 1 : count;
      }, 0)
    : 0;

  const percentage = exercises?.length
    ? Math.round((correctCount / exercises.length) * 100)
    : 0;


  if (!exercises || exercises.length === 0) {
    return <p>No exercises for now...</p>;
  }


  return (
    <div className="exercises">
       { exercises && exercises.length > 0 ? 
       exercises.map((ex, exIdx) => (
        <Card key={exIdx} className="mb-3">
          <Card.Body>
            <Card.Title>{exIdx+1 +". " }{ex.question}</Card.Title>
            <ListGroup>
              {ex.options.map((opt, optIdx) => (
                <ListGroup.Item
                  key={optIdx}
                  action
                  active={selected[exIdx] === optIdx}
                  onClick={() => handleSelect(exIdx, optIdx)}
                  className={
                    selected[exIdx] === optIdx
                      ? opt.isCorrect
                        ? "bg-success text-white"
                        : "bg-danger text-white"
                      : ""
                  }
                >
                  {opt.option}
                </ListGroup.Item>
              ))}
            </ListGroup>
            {selected[exIdx] !== undefined && (
              <div className="mt-2">
                {isCorrect(exIdx) ? (
                  <span className="text-success">Correct!</span>
                ) : (
                  <span className="text-danger">Incorrect.</span>
                )}
              </div>
            )}
          </Card.Body>
        </Card>
      )) : ""} 
      {allAnswered && (
            <div className="mb-4">
              <p>
                Correct answers: {correctCount} / {exercises.length}
              </p>
              <p>Percentage: {percentage}%</p>
            </div>
          )}

    </div>
  );
};

export default Exercises;
