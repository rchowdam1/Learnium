"use client";

import StatCard from "@/app/components/cards/StatCards";
import SetCard from "@/app/components/cards/SetCards";
import StudyBuddyCard from "@/app/components/cards/StudyBuddyCards";
import CreateSetController from "@/app/components/controllers/CreateSetController";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import CreateStudyBuddyController from "@/app/components/controllers/CreateStudyBuddyController";
import { BookOpen, Sparkles } from "lucide-react";

type StatCards = {
  title: string;
  icon: number;
  content: string;
};

type SetCards = {
  id: number;
  title: string;
  category: string;
  description: string;
  totalLessons: number;
  completedLessons: number;
  date: string;
};

type StudyBuddyCards = {
  id: number;
  title: string;
  category: string;
  description: string;
  documents: {
    id: number;
    studyBuddyId: number;
    name: string;
    size: number;
  }[];
};

type SetApiItem = {
  id: number;
  title: string;
  category: string;
  description: string;
  numLessons: number;
  completedLessons?: number;
  completed: boolean;
  date: string;
};

type BuddyApiItem = {
  id: number;
  bot_name: string;
  category: string;
  description: string;
};

export default function Dashboard() {
  const router = useRouter();
  const [setsLoading, setSetsLoading] = useState(true);
  const [buddiesLoading, setBuddiesLoading] = useState(true);

  const [setCards, setSetCards] = useState<SetCards[]>([
    /*{
      id: 10,
      title: "Spanish Basics",
      category: "Communication",
      description: "Learn fundamental Spanish vocabulary and phrases",
      totalLessons: 10,
      completedLessons: 3,
      date: new Date().toISOString(),
    },
    {
      id: 11,
      title: "JavaScript Fundamentals",
      category: "Technology",
      description: "Master the basics of JavaScript programming",
      totalLessons: 15,
      completedLessons: 7,
      date: new Date().toISOString(),
    },
    {
      id: 12,
      title: "Digital Marketing",
      category: "Business",
      description: "Learn essential digital marketing strategies",
      totalLessons: 8,
      completedLessons: 0,
      date: new Date().toISOString(),
    },*/
  ]);

  // state to toggle between learning sets and ai studdy buddy
  const [isLearningSetsActive, setIsLearningSetsActive] =
    useState<boolean>(true);
  const [studyBuddySets, setStudyBuddySets] = useState<StudyBuddyCards[]>([]);
  const [profileData, setProfileData] = useState<StatCards[]>([]);

  const createSet = (
    title: string,
    description: string,
    category: string,
    numLessons?: number,
    setId?: number,
  ): void => {
    //create a set
    toast.success("Set created successfully!");
    setSetCards((prevSetCards) => {
      return [
        ...prevSetCards,
        {
          id: setId ?? 0,
          title: title,
          category: category,
          description: description,
          totalLessons: numLessons ?? 5,
          completedLessons: 0,
          date: new Date().toISOString(),
        },
      ];
    });
  };

  const createStudyBuddy = (
    title: string,
    description: string,
    category: string,
    buddyId?: number,
  ): void => {
    setStudyBuddySets((prevStudyBuddySets) => {
      return [
        ...prevStudyBuddySets,
        {
          id: buddyId ?? 0,
          title: title,
          description: description,
          category: category,
          documents: [],
        },
      ];
    });
  };

  const onDeleteSet = (id: number): void => {
    toast.success("Set deleted successfully");
    setSetCards((prevSetCards) => {
      return prevSetCards.filter((prevSetCard) => {
        return prevSetCard.id !== id;
      });
    });
  };

  // load up the sets of the user and/or study buddies
  useEffect(() => {
    const loadSets = async () => {
      try {
        const response = await fetch("/api/get-sets");

        if (!response.ok) {
          toast.error("Could not fetch sets - 115");
          return;
        }

        const data = await response.json();
        if (data.data) {
          //console.log(data.data, "fetched sets");
          const sets = data.data as SetApiItem[];

          setSetCards(
            sets
              .filter((set) => set.completed === false)
              .map((set) => ({
                id: set.id,
                title: set.title,
                category: set.category,
                description: set.description,
                totalLessons: set.numLessons,
                completedLessons: set.completedLessons || 0,
                date: set.date,
              })),
          );
          toast.success("Fetched sets");
        }
      } catch {
        toast.error("Could not fetch sets - 124");
      } finally {
        setSetsLoading(false);
      }
    };

    const loadBuddies = async () => {
      try {
        const response = await fetch("/api/get-buddies");

        if (!response.ok) {
          toast.error("Could not fetch study buddies");
          return;
        }

        const data = await response.json();

        if (data.success) {
          if (data.data) {
            const buddies = data.data.buddyData as BuddyApiItem[];
            const documents = data.data.documentData;
            setStudyBuddySets(
              buddies.map((buddy, index: number) => {
                return {
                  id: buddy.id,
                  title: buddy.bot_name,
                  category: buddy.category,
                  description: buddy.description,
                  documents: documents.length > 0 ? documents[index] : [],
                };
              }),
            );
            toast.success("Fetched study buddies.");
          }
        }
      } catch {
        toast.error("Could not fetch study buddies");
      } finally {
        setBuddiesLoading(false);
      }
    };

    const getProfInfo = async () => {
      try {
        const response = await fetch("/api/get-profile-data");

        if (!response.ok) {
          toast.error("Could not fetch profile data");
          return;
        }

        const data = await response.json();

        if (data.success) {
          if (!data.daily_goal_tier) {
            router.replace("/onboarding");
            return;
          }
          const safeNumber = (value: unknown) => {
            const parsed = Number(value);
            return Number.isFinite(parsed) ? parsed : 0;
          };
          const activeSets = Math.max(
            0,
            safeNumber(data.setsCreated) - safeNumber(data.setsCompleted),
          );
          const progress = Math.min(100, Math.max(0, safeNumber(data.overallProgress)));
          setProfileData([
            {
              title: "Total Sets",
              icon: 1,
              content: activeSets.toString(),
            },
            {
              title: "Completed Lessons",
              icon: 2,
              content: safeNumber(data.completedLessons).toString(),
            },
            {
              title: "Overall Progress",
              icon: 3,
              content: `${Math.round(progress)}%`,
            },
          ]);
        }
      } catch {
        toast.error("Could not fetch profile data");
      }
    };

    loadSets();
    loadBuddies();
    getProfInfo();
  }, [router]);

  return (
    <div className="min-h-screen bg-background pb-28 md:pb-12">
      <div className="mx-auto max-w-[72rem] px-4 py-8 sm:px-6 md:py-10 lg:px-8">
        <header className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-label text-xs font-semibold uppercase tracking-[0.16em] text-brand">
              Your workspace
            </span>
            <h1 className="mt-2 text-display-sm text-3xl text-primary sm:text-4xl">
              Keep your momentum.
            </h1>
            <p className="mt-2 max-w-xl text-body text-muted">
              Pick up a lesson, build a new learning path, or ask a Study Buddy.
            </p>
          </div>
        </header>

        {/*Stat Cards*/}
        <section aria-label="Learning overview" className="mb-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {profileData.length === 0 &&
            Array(3)
              .fill(0)
              .map((_, index) => {
                return (
                  <div
                    key={index}
                    className="h-[114px] animate-pulse rounded-xl border border-border bg-surface"
                  />
                );
              })}
          {profileData.length > 0 &&
            profileData.map((statCard, index) => {
              return (
                <StatCard
                  key={index}
                  title={statCard.title}
                  icon={statCard.icon}
                  content={statCard.content}
                />
              );
            })}
        </section>

        {/* Learning Sets */}
        <section aria-labelledby="dashboard-library-title">
        <div className="mb-6 flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="dashboard-library-title" className="text-heading text-xl text-primary">Your library</h2>
            <p className="mt-1 text-caption text-muted">Everything you are actively learning, in one place.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex rounded-xl border border-border bg-surface p-1" role="group" aria-label="Dashboard views">
            <button
              type="button"
              aria-pressed={isLearningSetsActive}
              className={`focus-ring min-h-11 rounded-xl px-4 py-2 text-label text-sm transition-colors ${
                isLearningSetsActive
                  ? "bg-surface-raised text-primary"
                  : "text-muted"
              } cursor-pointer`}
              onClick={() => setIsLearningSetsActive(true)}
            >
              Learning Sets
            </button>
            <button
              type="button"
              aria-pressed={!isLearningSetsActive}
              className={`focus-ring min-h-11 rounded-xl px-4 py-2 text-label text-sm transition-colors ${
                isLearningSetsActive
                  ? "text-muted"
                  : "bg-surface-raised text-primary"
              } cursor-pointer`}
              onClick={() => setIsLearningSetsActive(false)}
            >
              Study Buddies
            </button>
          </div>

          {isLearningSetsActive && (setsLoading || setCards.length > 0) && (
            <CreateSetController onCreateSet={createSet} />
          )}
          {!isLearningSetsActive && studyBuddySets.length > 0 && (
            <CreateStudyBuddyController onCreateStudyBuddy={createStudyBuddy} />
          )}
          </div>
        </div>

        {/*Learning Set Cards*/}
        {isLearningSetsActive && (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {setsLoading &&
              Array(3)
                .fill(0)
                .map((_, index) => {
                  return (
                    <div
                      className="h-70 animate-pulse rounded-xl border border-border bg-surface"
                      key={index}
                    />
                  );
                })}
            {!setsLoading &&
              setCards.map((setCard) => {
                return (
                  <SetCard
                    key={setCard.id}
                    id={setCard.id}
                    title={setCard.title}
                    category={setCard.category}
                    description={setCard.description}
                    totalLessons={setCard.totalLessons}
                    completedLessons={setCard.completedLessons}
                    date={setCard.date}
                    onDeleteSet={onDeleteSet}
                  />
                );
              })}
            {!setsLoading && setCards.length === 0 && (
              <div className="col-span-full grid min-h-[300px] place-items-center rounded-2xl border border-border bg-surface px-6 py-12 text-center">
                <div className="max-w-md">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-surface-raised text-brand">
                    <BookOpen className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <span className="mt-6 block text-label text-xs font-semibold uppercase tracking-[0.16em] text-brand">Nova</span>
                  <h3 className="mt-2 text-display-sm text-2xl text-primary">Start with one useful thing.</h3>
                  <p className="mt-3 text-body text-muted">
                    Tell me what you want to understand. I’ll turn it into a focused path you can finish in small sessions.
                  </p>
                  <div className="mt-6 flex justify-center"><CreateSetController onCreateSet={createSet} /></div>
                </div>
              </div>
            )}
          </div>
        )}

        {!isLearningSetsActive && (
          <div>
            {!buddiesLoading && !studyBuddySets.length && (
              <div className="grid min-h-[300px] place-items-center rounded-2xl border border-border bg-surface px-6 py-12 text-center">
                <div className="max-w-md">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-surface-raised text-brand">
                    <Sparkles className="h-7 w-7" aria-hidden="true" />
                  </div>
                  <span className="mt-6 block text-label text-xs font-semibold uppercase tracking-[0.16em] text-brand">Study Buddy</span>
                  <h3 className="mt-2 text-display-sm text-2xl text-primary">Bring your own material.</h3>
                  <p className="mt-3 text-body text-muted">Upload notes, documents, images, or audio and get a focused AI partner grounded in your sources.</p>
                  <div className="mt-6 flex justify-center"><CreateStudyBuddyController onCreateStudyBuddy={createStudyBuddy} /></div>
                </div>
              </div>
            )}
            {/* Study Buddy UI Cards */}
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {studyBuddySets.map((buddy) => {
                //console.log("buddy.title: ", buddy.title);
                return (
                  <StudyBuddyCard
                    key={buddy.id}
                    id={buddy.id}
                    title={buddy.title}
                    category={buddy.category}
                    description={buddy.description}
                    documents={buddy.documents}
                  />
                );
              })}
            </div>
          </div>
        )}
        </section>
      </div>
    </div>
  );
}
