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
      className="flex flex-row items-center justify-center gap-0 py-1 lg:flex-col"
    >
      <ol className="m-0 flex list-none flex-row items-center p-0 lg:flex-col">
        {Array(lessons)
          .fill(0)
          .map((_, index) => {
            const isComplete = index < completed;
            const isActive = index === active;
            const isUnlocked = index <= completed;

            return (
              <li key={index} className="flex flex-row items-center lg:flex-col">
                <LessonBubble
                  number={index + 1}
                  active={isActive}
                  complete={isComplete}
                  last={index === lessons - 1}
                  clickedLesson={() => {
                    if (isUnlocked) {
                      onLessonClick(index);
                    } else {
                      toast.error(`Complete lesson ${completed + 1} first!`);
                    }
                  }}
                />
              </li>
            );
          })}
      </ol>
    </nav>
  );
}
