"use client";
import toast from "react-hot-toast";
import LessonBubble from "./LessonBubble";
import { useState } from "react";

type LessonChainProps = {
  lessons: number; // the number of lessons in the chain
  active: number; // the index of the active lesson starting from 0
  completed: number; // the number of completed lessons starting from the first lesson
  onLessonClick: (index: number) => void;
};

export default function LessonChain({
  lessons,
  active,
  completed,
  onLessonClick,
}: LessonChainProps) {
  return (
    <div className="flex flex-col items-center gap-24">
      {Array(lessons)
        .fill(0)
        .map((_, index) => {
          return (
            <LessonBubble
              key={index}
              number={index + 1}
              active={index === active}
              complete={index < completed}
              last={index === lessons - 1}
              clickedLesson={() => {
                if (index <= completed) {
                  onLessonClick(index);
                } else {
                  toast.error(`Complete lesson ${completed + 1} first!`);
                }
              }}
            />
          );
        })}
    </div>
  );
}
