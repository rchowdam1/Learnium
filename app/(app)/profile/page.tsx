"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookCheck,
  ChartNoAxesCombined,
  CheckCircle2,
  ChevronDown,
  Crown,
  Eye,
  Lock,
  Settings,
  Sparkles,
  Star,
  Target,
} from "lucide-react";
import toast from "react-hot-toast";
import Progress from "@/app/components/misc/Progress";

type SetData = {
  id: number;
  title: string;
  description: string;
  category: string;
  completed: boolean;
  completed_at?: string;
};

function safeNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function CompletedSetCard({
  id,
  title,
  description,
  date,
  isSubscribed,
}: {
  id: number;
  title: string;
  description: string;
  date: string;
  isSubscribed: boolean;
}) {
  return (
    <article className="flex min-h-44 flex-col rounded-xl border border-border bg-surface-raised p-5 text-left text-primary">
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 text-heading text-lg break-words">{title}</h3>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-caption font-medium text-on-accent">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
          Complete
        </span>
      </div>
      <p className="mt-3 line-clamp-2 text-body text-sm text-muted">{description}</p>
      <p className="mt-2 text-caption text-muted">Completed {date}</p>
      <div className="mt-auto border-t border-border pt-4">
        <Link
          href={isSubscribed ? `/sets/${id}` : "/subscriptions"}
          className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-border-interactive px-3 text-label text-sm text-primary transition-colors hover:bg-surface"
        >
          {isSubscribed ? (
            <Eye className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Lock className="h-4 w-4" aria-hidden="true" />
          )}
          View set
          {!isSubscribed && <span className="text-caption">· Pro</span>}
        </Link>
      </div>
    </article>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookCheck;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-raised p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-label text-sm text-muted">{label}</span>
          <div className="mt-3 text-numeral text-3xl leading-none text-primary">{value}</div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-brand">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [requestsRemaining, setRequestsRemaining] = useState(0);
  const [setsCreated, setSetsCreated] = useState(0);
  const [topCategories, setTopCategories] = useState<string[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [averageQuizScore, setAverageQuizScore] = useState(0);
  const [setData, setSetData] = useState<SetData[]>([]);
  const [displayCompletedSets, setDisplayCompletedSets] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch("/api/get-profile-data");
        const data = await response.json();

        if (!response.ok || !data.success) {
          setLoadError(true);
          toast.error("Could not fetch profile data");
          return;
        }

        setUsername(data.username ?? "Learner");
        setEmail(data.email ?? "");
        setRequestsRemaining(Math.max(0, safeNumber(data.requestsRemaining)));
        setSetsCreated(Math.max(0, safeNumber(data.setsCreated)));
        const normalizedCategories = Array.isArray(data.topCategories)
          ? data.topCategories
              .filter((category: unknown): category is string => typeof category === "string")
              .map((category: string) => category.trim())
              .filter(Boolean)
          : [];
        const uniqueCategories = new Map<string, string>();
        normalizedCategories.forEach((category: string) => {
          uniqueCategories.set(category.toLocaleLowerCase(), category);
        });
        setTopCategories(Array.from(uniqueCategories.values()).slice(0, 3));
        setIsSubscribed(data.isSubscribed === true);
        setCompletedLessons(Math.max(0, safeNumber(data.completedLessons)));
        setOverallProgress(Math.min(100, Math.max(0, safeNumber(data.overallProgress))));
        setAverageQuizScore(Math.min(100, Math.max(0, safeNumber(data.averageQuizScore))));
        setSetData(
          Array.isArray(data.setData)
            ? data.setData.filter((set: unknown): set is SetData => {
                if (!set || typeof set !== "object") return false;
                const candidate = set as Partial<SetData>;
                return typeof candidate.id === "number"
                  && typeof candidate.title === "string"
                  && typeof candidate.description === "string"
                  && typeof candidate.category === "string"
                  && typeof candidate.completed === "boolean";
              })
            : [],
        );
      } catch {
        setLoadError(true);
        toast.error("Could not fetch profile data");
      } finally {
        setLoading(false);
      }
    };

    void fetchProfileData();
  }, []);

  const completedSets = useMemo(
    () => setData.filter((set) => set.completed),
    [setData],
  );
  const completionPercentage = setsCreated > 0
    ? Math.min(100, Math.max(0, (completedSets.length / setsCreated) * 100))
    : 0;

  function formatDate(dateString?: string): string {
    if (!dateString) return "N/A";
    const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
    const date = dateOnlyMatch
      ? new Date(Number(dateOnlyMatch[1]), Number(dateOnlyMatch[2]) - 1, Number(dateOnlyMatch[3]))
      : new Date(dateString);
    return Number.isNaN(date.getTime())
      ? "N/A"
      : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-[72rem] px-4 py-8 sm:px-6 md:py-10 lg:px-8" role="status" aria-live="polite" aria-busy="true" aria-label="Loading profile">
        <div className="h-8 w-56 animate-pulse rounded-xl bg-surface" />
        <div className="mt-8 h-40 animate-pulse rounded-2xl border border-border bg-surface" />
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-xl border border-border bg-surface" />
          ))}
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mx-auto grid min-h-[65vh] max-w-[42rem] place-items-center px-4 py-12 text-center">
        <div>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-surface text-brand"><Sparkles className="h-7 w-7" aria-hidden="true" /></div>
          <h1 className="mt-5 text-display-sm text-3xl text-primary">We couldn’t load your profile.</h1>
          <p className="mt-3 text-body text-muted">Your learning data is safe. Try the request again in a moment.</p>
          <button type="button" className="focus-ring mt-6 min-h-11 rounded-xl bg-cta px-5 text-label text-cta-text hover:bg-cta-hover" onClick={() => window.location.reload()}>Try again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-12">
      <div className="mx-auto max-w-[72rem] px-4 py-8 sm:px-6 md:py-10 lg:px-8">
        <Link href="/dashboard" className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl text-label text-sm text-muted transition-colors hover:text-primary">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Dashboard
        </Link>

        <header className="mt-4 overflow-hidden rounded-2xl border border-border bg-surface p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface-raised text-display-sm text-2xl uppercase text-brand">
                {username.charAt(0) || "L"}
              </div>
              <div className="min-w-0">
                <span className="text-label text-xs font-semibold uppercase tracking-[0.16em] text-brand">Learning profile</span>
                <h1 className="mt-1 truncate text-display-sm text-3xl text-primary sm:text-4xl">{username}</h1>
                <p className="mt-1 truncate text-body text-sm text-muted">{email}</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-label text-sm ${isSubscribed ? "border-accent-progress bg-accent-progress-track text-primary" : "border-border bg-surface-raised text-muted"}`}>
                {isSubscribed && <Crown className="h-4 w-4 text-brand" aria-hidden="true" />}
                {isSubscribed ? "Pro member" : "Free plan"}
              </span>
              <Link href="/subscriptions" className="focus-ring inline-flex min-h-11 items-center gap-2 rounded-xl border border-border-interactive bg-surface-raised px-4 text-label text-sm text-primary transition-colors hover:bg-surface">
                <Settings className="h-4 w-4" aria-hidden="true" />
                Manage plan
              </Link>
            </div>
          </div>
        </header>

        <section aria-label="Learning statistics" className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <MetricCard icon={BookCheck} label="Lessons completed" value={`${completedLessons}`} />
          <MetricCard icon={ChartNoAxesCombined} label="Overall progress" value={`${Math.round(overallProgress)}%`} />
          <MetricCard icon={Star} label="Average quiz score" value={`${Math.round(averageQuizScore)}%`} />
        </section>

        <div className="mt-8">
          <section aria-labelledby="progress-heading" className="rounded-2xl border border-border bg-surface-raised p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-brand"><Target className="h-5 w-5" aria-hidden="true" /></div>
              <div>
                <h2 id="progress-heading" className="text-heading text-xl text-primary">Progress overview</h2>
                <p className="text-caption text-muted">A clear view of your current learning capacity.</p>
              </div>
            </div>
            <div className="mt-6 space-y-6">
              <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface p-4">
                <div>
                  <span className="text-label text-sm text-primary">Set requests remaining</span>
                  <p className="mt-1 text-caption text-muted">Available for new AI learning paths.</p>
                </div>
                <span className="text-numeral text-2xl text-primary">{requestsRemaining}</span>
              </div>
              <div>
                <div className="mb-2 flex items-end justify-between gap-3">
                  <span className="text-label text-sm text-muted">Sets completed</span>
                  <span className="text-numeral text-xl text-primary">{completedSets.length}/{setsCreated}</span>
                </div>
                <Progress width={640} percentage={completionPercentage} ariaLabel="Completed sets progress" />
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-brand"><Sparkles className="h-5 w-5" aria-hidden="true" /></div>
                <div>
                  <h3 className="text-heading text-base text-primary">Frequent categories</h3>
                  <p className="mt-1 text-caption text-muted">The subjects represented most often in your learning sets.</p>
                </div>
              </div>
              <ul className="flex max-w-xl flex-wrap gap-2 sm:justify-end" aria-label="Frequent learning categories">
                {topCategories.length > 0 ? topCategories.map((category) => (
                  <li key={category.toLocaleLowerCase()} className="max-w-52 truncate rounded-full border border-border bg-surface px-3 py-1 text-label text-sm text-muted" title={category}>{category}</li>
                )) : (
                  <li className="list-none text-body text-sm text-muted sm:text-right">Create learning sets and their most common categories will appear here.</li>
                )}
              </ul>
            </div>
          </section>
        </div>

        <section aria-labelledby="completed-heading" className="mt-8 overflow-hidden rounded-2xl border border-border bg-surface">
          <button
            type="button"
            className="focus-ring flex min-h-20 w-full items-center justify-between gap-4 px-6 text-left transition-colors hover:bg-surface-raised"
            aria-expanded={displayCompletedSets}
            aria-controls="completed-sets-content"
            onClick={() => setDisplayCompletedSets((visible) => !visible)}
          >
            <div>
              <h2 id="completed-heading" className="text-heading text-xl text-primary">Completed sets</h2>
              <p className="mt-1 text-caption text-muted">Your finished learning paths, kept as a record of progress.</p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="rounded-full border border-border bg-surface-raised px-3 py-1 text-numeral text-sm text-primary">{completedSets.length}</span>
              <ChevronDown className={`h-5 w-5 text-muted transition-transform ${displayCompletedSets ? "rotate-180" : ""}`} aria-hidden="true" />
            </div>
          </button>

          <div id="completed-sets-content" hidden={!displayCompletedSets} className="border-t border-border p-6">
            {displayCompletedSets && (
              <>
              {completedSets.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {completedSets.map((set) => (
                    <CompletedSetCard key={set.id} id={set.id} title={set.title} description={set.description} date={formatDate(set.completed_at)} isSubscribed={isSubscribed} />
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-surface-raised text-brand"><BookCheck className="h-6 w-6" aria-hidden="true" /></div>
                  <h3 className="mt-4 text-heading text-lg text-primary">Your first finish line is waiting.</h3>
                  <p className="mx-auto mt-2 max-w-md text-body text-sm text-muted">Complete a learning set and it will become part of your history here.</p>
                  <Link href="/learn" className="focus-ring mt-5 inline-flex min-h-11 items-center rounded-xl bg-cta px-4 text-label text-sm text-cta-text hover:bg-cta-hover">Browse learning sets</Link>
                </div>
              )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
