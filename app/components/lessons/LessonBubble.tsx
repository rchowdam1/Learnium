"use client";

import { Check, Lock, Play } from "lucide-react";

const RING_SIZE = 64;
const RING_RADIUS = 28;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
/** Partial arc on the active node — reads as “in progress”, not 100%. */
const ACTIVE_RING_PROGRESS = 0.38;

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
  const locked = !active && !complete;
  const dashOffset = RING_CIRCUMFERENCE * (1 - ACTIVE_RING_PROGRESS);

  const label = complete
    ? `Lesson ${number}, completed`
    : active
      ? `Lesson ${number}, current`
      : `Lesson ${number}, locked`;

  return (
    <div className="relative flex flex-row items-center lg:flex-col">
      <div
        className={`relative flex shrink-0 items-center justify-center ${
          active ? "h-16 w-16" : "h-12 w-12"
        }`}
      >
        {/* Progress ring — active lesson only (DESIGN: lesson-node.active-ring) */}
        {active && (
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full -rotate-90"
            viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
            aria-hidden="true"
          >
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              fill="none"
              stroke="var(--accent-progress-track)"
              strokeWidth="3"
            />
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RING_RADIUS}
              fill="none"
              stroke="var(--accent-progress)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={RING_CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              className="lesson-node-ring-glow"
            />
          </svg>
        )}

        <button
          type="button"
          onClick={clickedLesson}
          aria-label={label}
          aria-current={active ? "step" : undefined}
          aria-disabled={locked || undefined}
          className={[
            "focus-ring relative z-[1] flex items-center justify-center rounded-full transition-transform duration-200",
            active
              ? "h-12 w-12 bg-brand text-cta-text shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent-glow)_35%,transparent)] hover:scale-105"
              : complete
                ? "h-11 w-11 bg-accent text-on-accent hover:scale-105"
                : "h-11 w-11 cursor-not-allowed border border-border-strong bg-surface text-disabled",
          ].join(" ")}
        >
          {complete && !active ? (
            <Check className="h-5 w-5" strokeWidth={2.75} aria-hidden="true" />
          ) : active ? (
            <Play
              className="h-5 w-5 translate-x-px fill-current"
              strokeWidth={0}
              aria-hidden="true"
            />
          ) : (
            <Lock className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
          )}
        </button>
      </div>

      {!last && (
        <span
          className={[
            "rounded-full",
            complete ? "bg-accent-progress" : "bg-accent-progress-track",
            // Horizontal rail (mobile) / vertical rail (desktop)
            "h-1 w-7 lg:h-7 lg:w-1",
          ].join(" ")}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
