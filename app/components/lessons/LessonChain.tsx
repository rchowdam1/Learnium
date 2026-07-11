"use client";

import toast from "react-hot-toast";
import LessonBubble from "./LessonBubble";

type LessonChainProps = {
  lessons: number;
  active: number;
  completed: number;
  onLessonClick: (index: number) => void;
};

export default function LessonChain({
  lessons,
  active,
  completed,
  onLessonClick,
}: LessonChainProps) {
  return (
    <nav
      aria-label="Lesson path"
      className="flex flex-row items-center justify-center lg:flex-col"
    >
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
    </nav>
  );
}
