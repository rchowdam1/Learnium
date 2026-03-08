"use client";

import AuthNav from "../components/nav/AuthNav";
import StatCard from "../components/cards/StatCards";
import SetCard from "../components/cards/SetCards";
import StudyBuddyCard from "../components/cards/StudyBuddyCards";
import CreateSetController from "../components/controllers/CreateSetController";

import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import CreateStudyBuddyController from "../components/controllers/CreateStudyBuddyController";

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
};

type SetResponse = {
  id: number;
  title: string;
  category: string;
  description: string;
  numLessons: number;
  date: string;
  profile_id: string;
  is_flagged: boolean;
};

type APIResponse = {
  data?: SetResponse;
  error?: string;
};

export default function Dashboard() {
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
  const sampleStatCards: StatCards[] = [
    {
      title: "Total Sets",
      icon: 1,
      content: "3",
    },
    {
      title: "Completed Lessons",
      icon: 2,
      content: "10",
    },
    {
      title: "Overall Progress",
      icon: 3,
      content: "26%",
    },
  ];

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
    toast.success("Study Buddy created successfully!");
    setStudyBuddySets((prevStudyBuddySets) => {
      return [
        ...prevStudyBuddySets,
        {
          id: buddyId ?? 0,
          title: title,
          description: description,
          category: category,
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
          const sets = data.data;

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
      } catch (error) {
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
            const buddies = data.data;
            setStudyBuddySets(
              buddies.map((buddy, index) => {
                return {
                  id: buddy.id,
                  title: buddy.bot_name,
                  category: buddy.category,
                  description: buddy.description,
                };
              }),
            );
            toast.success("Fetched study buddies.");
          }
          setLoading(false);
        }
      } catch (error) {
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
      } catch (error) {
        toast.error("Could not fetch profile data");
      }
    };

    loadSets();
    loadBuddies();
    getProfInfo();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        {/*Stat Cards*/}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-8 mt-5">
          {profileData.length === 0 &&
            Array(3)
              .fill(0)
              .map((_, index) => {
                return (
                  <div
                    key={index}
                    className="h-30 w-100 rounded-sm bg-card bg-gray-300 shadow-sm animate-pulse"
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
          <div className="px-3 py-2 bg-gray-200 rounded-md flex">
            <h2
              className={`text-2xl px-2 py-1 ${
                isLearningSetsActive ? "bg-white" : ""
              } font-bold text-gray-900 rounded-md cursor-pointer`}
              onClick={() => setIsLearningSetsActive(true)}
            >
              Learning Sets
            </h2>
            <h2
              className={`text-2xl font-bold px-2 py-1 ${
                isLearningSetsActive ? "" : "bg-white"
              } text-gray-900 rounded-md cursor-pointer`}
              onClick={() => setIsLearningSetsActive(false)}
            >
              Study Buddies
            </h2>
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
                      className="h-70 w-100 rounded-sm bg-card bg-gray-300 shadow-sm animate-pulse"
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
            <span className="text-gray-500 text-md">
              Upload your study materials and chat with AI to enhance your
              learning
            </span>
            <br />
            {!studyBuddySets.length && (
              <span className="font-bold text-lg">
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
                  />
                );
              })}
            </div>
          </div>
        )}

        <br />
        <br />
      </main>
    </div>
  );
}
