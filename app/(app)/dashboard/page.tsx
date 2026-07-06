"use client";

import StatCard from "@/app/components/cards/StatCards";
import SetCard from "@/app/components/cards/SetCards";
import StudyBuddyCard from "@/app/components/cards/StudyBuddyCards";
import CreateSetController from "@/app/components/controllers/CreateSetController";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import CreateStudyBuddyController from "@/app/components/controllers/CreateStudyBuddyController";

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
  // state for skeleton loading
  const [loading, setLoading] = useState<boolean>(true);

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
          setLoading(false);
          toast.success("Fetched sets");
        }
      } catch {
        toast.error("Could not fetch sets - 124");
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
          setLoading(false);
        }
      } catch {
        toast.error("Could not fetch study buddies");
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
          setProfileData([
            {
              title: "Total Sets",
              icon: 1,
              content: (data.setsCreated - data.setsCompleted).toString(),
            },
            {
              title: "Completed Lessons",
              icon: 2,
              content: data.completedLessons.toString(),
            },
            {
              title: "Overall Progress",
              icon: 3,
              content: data.overallProgress.toString() + "%",
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
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[72rem] px-4 pt-6 sm:px-6 lg:px-8">
        {/*Stat Cards*/}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-8 mt-5">
          {profileData.length === 0 &&
            Array(3)
              .fill(0)
              .map((_, index) => {
                return (
                  <div
                    key={index}
                    className="h-30 w-100 animate-pulse rounded-xl border border-border bg-surface"
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
        </div>

        {/* Learning Sets */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex rounded-2xl border border-border bg-surface p-1" role="tablist" aria-label="Dashboard views">
            <button
              type="button"
              role="tab"
              aria-selected={isLearningSetsActive}
              className={`focus-ring rounded-xl px-3 py-2 text-heading text-xl ${
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
              role="tab"
              aria-selected={!isLearningSetsActive}
              className={`focus-ring rounded-xl px-3 py-2 text-heading text-xl ${
                isLearningSetsActive
                  ? "text-muted"
                  : "bg-surface-raised text-primary"
              } cursor-pointer`}
              onClick={() => setIsLearningSetsActive(false)}
            >
              Study Buddies
            </button>
          </div>

          {isLearningSetsActive && (
            <CreateSetController onCreateSet={createSet} />
          )}
          {!isLearningSetsActive && (
            <CreateStudyBuddyController onCreateStudyBuddy={createStudyBuddy} />
          )}
        </div>

        {/*Learning Set Cards*/}
        <br />
        {isLearningSetsActive && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-11">
            {loading &&
              Array(3)
                .fill(0)
                .map((_, index) => {
                  return (
                    <div
                      className="h-70 w-100 animate-pulse rounded-2xl border border-border bg-surface"
                      key={index}
                    />
                  );
                })}
            {!loading &&
              setCards.map((setCard, index) => {
                return (
                  <SetCard
                    key={index}
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
          </div>
        )}

        {!isLearningSetsActive && (
          <div>
            <span className="text-body text-md text-muted">
              Upload your study materials and chat with AI to enhance your
              learning
            </span>
            <br />
            {!studyBuddySets.length && (
              <span className="text-heading text-lg text-primary">
                No Study Buddies created yet. Upload study materials to get
                started!
              </span>
            )}
            <br />
            <br />
            {/* Study Buddy UI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-11">
              {studyBuddySets.map((buddy, index) => {
                //console.log("buddy.title: ", buddy.title);
                return (
                  <StudyBuddyCard
                    key={index}
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

        <br />
        <br />
      </div>
    </div>
  );
}
