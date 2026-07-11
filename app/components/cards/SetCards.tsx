"use client";

import { BookOpen, Play } from "lucide-react";
import Progress from "../misc/Progress";
import SetDropdown from "../modals/SetDropdown";
import Link from "next/link";

type SetCardProps = {
  id: number;
  title: string;
  category: string;
  description: string;
  totalLessons: number;
  completedLessons: number;
  date: string; // new Date.toISOString()
  onDeleteSet: (id: number) => void;
};

export default function SetCard({
  id,
  title,
  category,
  description,
  totalLessons,
  completedLessons,
  date,
  onDeleteSet,
}: SetCardProps) {
  // convert date to readable format
  const readDate: Date = new Date(date);

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const dateString = readDate.toLocaleDateString("en-us", options);

  // function to delete the set
  const onSetDelete = () => {
    console.log("deleting");
    onDeleteSet(id);
  };

  return (
    <div className="flex min-h-70 w-full flex-col justify-between rounded-xl border border-border bg-surface-raised px-5 py-5 text-primary">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="min-w-0 text-heading text-lg break-words">{title}</span>

          <div className="shrink-0 rounded-full bg-surface px-2">
            <span className="text-label text-xs text-muted">{category}</span>
          </div>
        </div>

        <SetDropdown onDelete={onSetDelete} title={title} />
      </div>

      <div className="mt-3 h-12 overflow-y-auto no-scrollbar">
        <span className="text-body text-muted">{description}</span>
      </div>

      <div className="mt-8">
        <div className="flex justify-between text-sm">
          <span className="text-label text-muted">Progress</span>
          <span className="text-numeral text-label">
            {completedLessons}/{totalLessons} lessons
          </span>
        </div>
        <div className="mt-1">
          <Progress
            width={320}
            percentage={
              totalLessons > 0
                ? Math.min(100, Math.max(0, (completedLessons / totalLessons) * 100))
                : 0
            }
          />
        </div>
      </div>

      <div className="mt-12 flex items-center justify-between">
        <div className="flex items-center text-sm text-muted">
          <BookOpen className="mr-1 h-4 w-4" />
          <span className="text-body">Created at {dateString}</span>
        </div>

        <Link
          href={`/sets/${id}`}
          className={`focus-ring flex h-11 cursor-pointer items-center rounded-xl px-3 text-label ${
              completedLessons === 0
                ? "bg-cta text-cta-text hover:bg-cta-hover"
                : "bg-accent text-on-accent"
            }`}
        >
          <Play className="mr-2 h-4 w-4" />
          <span>{completedLessons === 0 ? "Start" : "Continue"}</span>
        </Link>
      </div>
    </div>
  );
}
