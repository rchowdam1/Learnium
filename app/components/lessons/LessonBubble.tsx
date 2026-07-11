"use client";

import { Check, Lock, Play } from "lucide-react";

export default function LessonBubble({
  number,
  active,
  complete,
  last,
  clickedLesson,
}: {
  number: number;
  active: boolean;
  complete: boolean;
  last: boolean;
  clickedLesson: () => void;
}) {
  const nodeFill = active
    ? "bg-brand"
    : complete
      ? "bg-accent"
      : "bg-surface border border-border";

  const nodeText = active
    ? "text-cta-text"
    : complete
      ? "text-on-accent"
      : "text-disabled";

  const connectorFill = complete
    ? "bg-accent-progress"
    : "bg-accent-progress-track";

  return (
    <div className="flex flex-row items-center lg:flex-col">
      <button
        type="button"
        className={`focus-ring flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center rounded-full transition-transform duration-200 hover:scale-105 ${nodeFill} ${
          active
            ? "ring-2 ring-accent-glow ring-offset-2 ring-offset-background"
            : ""
        }`}
        onClick={clickedLesson}
        aria-label={
          complete
            ? `Lesson ${number}, completed`
            : active
              ? `Lesson ${number}, current`
              : `Lesson ${number}, locked`
        }
        aria-current={active ? "step" : undefined}
      >
        {complete ? (
          <Check className={`h-6 w-6 ${nodeText}`} aria-hidden="true" />
        ) : active ? (
          <span className={`flex flex-col items-center leading-none ${nodeText}`}>
            <Play className="h-4 w-4 fill-current" aria-hidden="true" />
            <span className="text-numeral text-xs">{number}</span>
          </span>
        ) : (
          <span className={`flex flex-col items-center leading-none ${nodeText}`}>
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="text-numeral text-xs">{number}</span>
          </span>
        )}
      </button>
      {!last && (
        <span
          className={`rounded-full ${connectorFill} h-1 w-6 lg:h-8 lg:w-1`}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
