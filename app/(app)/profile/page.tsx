"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Progress from "@/app/components/misc/Progress";

import {
  Settings,
  Undo2,
  Trophy,
  ChartLine,
  Star,
  CheckCircle,
  Lock,
  Eye,
  Crown,
} from "lucide-react";
import toast from "react-hot-toast";

type SetData = {
  id: number;
  title: string;
  description: string;
  category: string;
  completed: boolean;
  completed_at?: string;
};

/**
 * icon values:
 * 1 - Trophy (completed lessons)
 * 2 - Rising Graph (overall progress)
 * 3 - Star (average quiz score)
 */

const SetCard = ({
  title,
  description,
  date,
  isSubscribed,
}: {
  title: string;
  description: string;
  date: string;
  isSubscribed: boolean;
}) => {
  return (
    <div className="flex min-h-40 w-full flex-col rounded-xl border border-border bg-surface-raised px-4 py-3 text-primary">
      {/** Title and Completed Badge */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-heading text-lg">{title}</span>
        <span className="inline-flex items-center justify-center gap-1 rounded-full bg-accent px-2 py-1 text-caption text-on-accent">
          <CheckCircle className="h-3 w-3" /> Complete
        </span>
      </div>

      {/** Description and Date */}
      <div className="mt-2 text-left text-body text-sm text-muted">
        <span className="line-clamp-1">{description}</span> <br />
        <span className="mt-1 text-caption">Completed on {date}</span>
      </div>

      <hr className="mt-3 border-border" />

      {/**View Set Contents */}
      <div className="mt-3 flex items-center">
        <button
          disabled={!isSubscribed}
          className={`focus-ring flex cursor-pointer items-center gap-2 rounded-full border border-border-interactive px-2 py-1 transition-colors duration-200 disabled:cursor-not-allowed disabled:border-border disabled:text-disabled ${
            isSubscribed ? "hover:bg-surface" : ""
          }`}
        >
          {isSubscribed ? (
            <Eye className="h-5 w-5 text-muted" />
          ) : (
            <Lock className="h-5 w-5 text-disabled" />
          )}
          <span className="text-label text-muted">View Set</span>
        </button>
        <div className="ml-2 flex items-center gap-1">
          {!isSubscribed && (
            <>
              <Crown className="h-5 w-5 text-brand" />
              <span className="text-caption text-muted">Pro Only</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  icon,
  title,
  data,
}: {
  icon: number;
  title: string;
  data: string;
}) => {
  return (
    <div className="relative h-27 w-full rounded-xl border border-border bg-surface-raised px-4 py-5 text-primary">
      {icon === 1 ? (
        <Trophy className="absolute top-4 right-4 h-5 w-5 text-muted" />
      ) : icon === 2 ? (
        <ChartLine className="absolute top-4 right-4 h-5 w-5 text-muted" />
      ) : (
        <Star className="absolute top-4 right-4 h-5 w-5 text-muted" />
      )}
      <span className="absolute top-4 left-3 text-label text-lg">{title}</span>
      <span className="absolute bottom-5 left-3 text-numeral text-xl">{data}</span>
    </div>
  );
};

export default function ProfilePage() {
  // state for skeleton loading
  const [loading, setLoading] = useState<boolean>(true);
  // state for profile data
  const [username, setUsername] = useState<string>();
  const [email, setEmail] = useState<string>();
  const [requestsRemaining, setRequestsRemaining] = useState<number>();
  const [setsCreated, setSetsCreated] = useState<number>();
  const [setsCompleted, setSetsCompleted] = useState<number>();
  const [topCategories, setTopCategories] = useState<string[]>();
  const [isSubscribed, setIsSubscribed] = useState<boolean>();
  const [completedLessons, setCompletedLessons] = useState<number>();
  const [overallProgress, setOverallProgress] = useState<number>();
  const [averageQuizScore, setAverageQuizScore] = useState<number>();
  const [setData, setSetData] = useState<SetData[]>();

  // state to display completed sets
  const [displayCompletedSets, setDisplayCompletedSets] =
    useState<boolean>(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch("/api/get-profile-data");

        if (response.ok) {
          const data = await response.json();

          if (data.success) {
            toast.success("Requests remaining: ", data.requestsRemaining);
            setLoading(false);
            setUsername(data.username);
            setEmail(data.email);
            setRequestsRemaining(data.requestsRemaining);
            setSetsCreated(data.setsCreated);
            setSetsCompleted(data.setsCompleted);
            setTopCategories(data.topCategories);
            setIsSubscribed(data.isSubscribed);
            setCompletedLessons(data.completedLessons);
            setOverallProgress(data.overallProgress);
            setAverageQuizScore(data.averageQuizScore);
            setSetData(data.setData || []);
            console.log(data.setData);
          } else {
            setLoading(false);
            toast.error("Could not fetch profile data");
          }
        }
      } catch {
        setLoading(false);
        toast.error("Couln't fetch profile data");
      }
    };

    fetchProfileData();
  }, []);

  function formatDate(dateString: string | undefined): string {
    if (dateString === undefined) {
      return "";
    }
    const [year, month, day] = dateString.split("-");
    return `${parseInt(month, 10)}/${parseInt(day, 10)}/${year}`;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="relative mx-auto max-w-7xl pt-8 text-center">
        <span className="text-display text-5xl text-primary">My Profile</span>

        {/*Back Home Page*/}
        <Link href="/dashboard">
          <div className="absolute top-26 left-10 flex cursor-pointer items-center justify-center gap-2 rounded-xl px-2 py-1 text-body text-primary transition-colors duration-350 hover:bg-surface">
            <Undo2 className="h-5 w-5 text-muted" />
            <span>Return to home</span>
          </div>
        </Link>

        {/* profile content (will include a card for each component) */}
        {loading && (
          <div className="mx-auto mt-6 grid max-w-5xl grid-cols-1 gap-10 p-6 md:grid-cols-2">
            <div className="h-90 w-90 animate-pulse rounded-xl bg-surface" />
            <div className="h-90 w-90 animate-pulse rounded-xl bg-surface" />
            <div className="h-90 w-90 animate-pulse rounded-xl bg-surface" />
            <div className="h-90 w-90 animate-pulse rounded-xl bg-surface" />
            <div className="h-90 w-90 animate-pulse rounded-xl bg-surface" />
            <div className="h-90 w-90 animate-pulse rounded-xl bg-surface" />
          </div>
        )}
        {!loading && (
          <div className="mx-auto mt-6 grid max-w-5xl grid-cols-1 gap-10 p-6 md:grid-cols-2">
            {/**Profile Card */}
            <div className="h-full w-full rounded-xl border border-border bg-surface-raised pb-3 text-primary">
              <div className="flex justify-around pt-10">
                {/*<CircleUser className="w-20 h-20 relative bottom-3" />*/}
                {/*User Circle*/}
                <div className="relative bottom-3 flex h-20 w-20 items-center justify-center rounded-full bg-surface text-display-sm text-2xl text-primary">
                  {username?.charAt(0)}
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-heading text-xl">
                    {username}
                    <button className="focus-ring ml-2 rounded-xl border border-border-interactive bg-surface px-2 py-1 text-caption font-normal text-primary transition-colors duration-200 hover:bg-surface-raised">
                      Change Username
                    </button>
                  </span>
                  <span className="text-body text-md text-muted">{email}</span>
                  {/**User's Current Plan*/}
                  <div className="mt-2 flex items-center">
                    <span
                      className={`rounded-l-full py-2 pr-2 pl-4 text-label ${
                        isSubscribed
                          ? "bg-surface text-muted"
                          : "bg-brand text-cta-text"
                      }`}
                    >
                      Free
                    </span>
                    <span
                      className={`rounded-r-full py-2 pr-4 pl-3 text-label ${
                        isSubscribed
                          ? "bg-brand text-cta-text"
                          : "bg-surface text-muted"
                      }`}
                    >
                      Pro
                    </span>
                    <div className="relative group">
                      {/**Tooltip: "Change Plan"*/}
                      <Link href="/subscriptions">
                        <Settings className="ml-2 h-6 w-6 cursor-pointer text-muted transition-colors duration-200 hover:text-primary" />
                      </Link>
                      {/* Tooltip */}
                      <div className="pointer-events-none absolute top-full left-1/2 z-10 mt-2 -translate-x-1/2 whitespace-nowrap rounded-xl border border-border bg-surface-raised px-2 py-1 text-caption text-primary opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                        Change Plan
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/**Requests Remaining*/}
              <div className="mt-6 flex flex-col items-center">
                <span className="text-body text-primary">
                  Requests Remaining:{" "}
                  <span className="text-numeral">{requestsRemaining}</span>
                </span>
                <Progress
                  width={400}
                  percentage={requestsRemaining ? 100 : 0}
                />
              </div>

              {/**Sets Created and Completed */}
              <div className="mt-6 flex flex-col items-center">
                <span className="text-body text-primary">
                  Sets Completed:{" "}
                  <span className="text-numeral">
                    {setsCompleted}/{setsCreated}
                  </span>
                </span>
                {setsCompleted !== undefined && setsCreated !== undefined && (
                  <Progress
                    width={400}
                    percentage={
                      setsCompleted > 0
                        ? (setsCompleted / setsCreated) * 100
                        : 0
                    }
                  />
                )}
              </div>

              {/**Top Categories */}
              <div className="pt-5">
                <span className="text-heading text-lg">Top Categories</span>
                <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
                  {topCategories && topCategories.length > 0 ? (
                    topCategories.map((category, index) => {
                      return (
                        <div
                          className="inline-block rounded-full border border-border bg-surface px-2"
                          key={index}
                        >
                          <span className="text-label text-sm text-muted">
                            {category}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-body text-md text-muted">
                      No categories found
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/*Stat Cards*/}
            <div className="flex flex-col gap-6">
              {completedLessons && overallProgress && averageQuizScore ? (
                Array(3)
                  .fill(0)
                  .map((_, index) => {
                    return (
                      <StatCard
                        key={index}
                        icon={index + 1}
                        title={
                          index === 0
                            ? "Completed Lessons"
                            : index === 1
                              ? "Overall Progress"
                              : "Average Quiz Score"
                        }
                        data={
                          index === 0
                            ? `${completedLessons}`
                            : index === 1
                              ? `${overallProgress}%`
                              : `${averageQuizScore}%`
                        }
                      />
                    );
                  })
              ) : (
                <span className="text-body text-md text-muted">
                  No Statistics Available
                </span>
              )}
            </div>

            {/**Completed Sets */}
            <div
              className={`relative col-span-full mx-auto rounded-xl border border-border bg-surface-raised px-4 py-5 text-primary transition-all duration-300 ${
                displayCompletedSets ? "w-full" : "w-fit min-w-[400px]"
              }`}
            >
              <div className="relative flex items-center justify-between gap-8">
                <div className="flex items-center">
                  <CheckCircle className="h-7 w-7 text-accent" />
                  <span className="ml-3 text-heading text-2xl">
                    Completed Sets
                  </span>
                </div>

                <button
                  className="focus-ring cursor-pointer whitespace-nowrap rounded-full border border-border-interactive px-2 py-1 text-label transition-colors duration-200 hover:bg-surface"
                  onClick={() => setDisplayCompletedSets(!displayCompletedSets)}
                >
                  {displayCompletedSets ? "Hide" : `View (${setsCompleted})`}
                </button>
              </div>

              {/**The actual sets */}
              {displayCompletedSets && (
                <div className="mt-4 grid w-full grid-cols-1 gap-8 px-5 py-5 md:grid-cols-2">
                  {setData &&
                  setData.filter((set) => set.completed).length > 0 ? (
                    setData
                      .filter((set) => set.completed)
                      .map((set, index) => {
                        return (
                          <SetCard
                            key={index}
                            title={set.title}
                            description={set.description}
                            date={
                              set.completed_at
                                ? formatDate(set.completed_at)
                                : "N/A"
                            }
                            isSubscribed={isSubscribed || false}
                          />
                        );
                      })
                  ) : (
                    <span className="mt-3 text-heading text-xl text-muted">
                      You haven&apos;t completed any sets
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
