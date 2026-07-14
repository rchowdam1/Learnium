"use client";

import AuthNav from "../components/nav/AuthNav";
import StatCard from "../components/cards/StatCards";
import SetCard from "../components/cards/SetCards";
import StudyBuddyCard from "../components/cards/StudyBuddyCards";
import CreateSetController from "../components/controllers/CreateSetController";
import CreateStudyBuddyController from "../components/controllers/CreateStudyBuddyController";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import toast from "react-hot-toast";

import {
  SetData,
  BuddyData,
  ProfileData,
  OnCreateSet,
} from "@/types/dashboard/DashboardTypes";
import { optimisticallyCreateSet } from "@/lib/swr-mutations";

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

export default function Dashboard() {
  // state for skeleton loading
  const [loading, setLoading] = useState<boolean>(true);

  const [setCards, setSetCards] = useState<SetCards[]>([]);

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

  const createSet = (createSetData: OnCreateSet): void => {
    //create a set
    toast.success("Set created successfully!");

    // optimistic UI update for set creation
    optimisticallyCreateSet(
      createSetData.title,
      createSetData.description,
      createSetData.category,
      createSetData.numLessons,
      createSetData.setId,
      createSetData.profile_id,
      createSetData.is_flagged,
    );
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
  // getting the set data, gonna replace all of the fetching in useEffect with
  // useSWR

  // set data first
  const {
    data: setData,
    error: setError,
    isLoading: setsLoading,
  } = useSWR<SetData[]>("/api/get-sets", fetcher);
  // buddy data 2nd
  const {
    data: buddyData,
    error: buddyError,
    isLoading: buddyLoading,
  } = useSWR<BuddyData>("/api/get-buddies", fetcher);
  // profile info last
  const {
    data: profileInfo,
    error: profileError,
    isLoading: profileLoading,
  } = useSWR<ProfileData>("/api/get-profile-data", fetcher);

  const errorSources = [
    setError ? "sets" : null,
    buddyError ? "buddies" : null,
    profileError ? "profile data" : null,
  ].filter(Boolean) as string[];

  useEffect(() => {
    if (errorSources.length > 0) {
      console.error(
        `Dashboard data loading failed for: ${errorSources.join(", ")}`,
      );
    }
  }, [errorSources]);

  if (errorSources.length > 0) {
    return (
      <>
        <AuthNav />

        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-red-700">
              Something went wrong
            </h2>
            <p className="mt-2 text-sm text-red-600">
              We couldn’t load the {errorSources.join(", ")} data. Please
              refresh the page and try again.
            </p>
          </div>
        </main>
      </>
    );
  }

  /*useEffect(() => {
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
            const buddies = data.data.buddyData;
            const documents = data.data.documentData;
            setStudyBuddySets(
              buddies.map((buddy, index) => {
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
  }, []);*/

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        {/*Stat Cards*/}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-8 mt-5">
          {profileLoading &&
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
          {profileInfo &&
            [
              {
                title: "Total Sets",
                icon: 1,
                content: (
                  profileInfo.setsCreated - profileInfo.setsCompleted
                ).toString(),
              },
              {
                title: "Completed Lessons",
                icon: 2,
                content: profileInfo.completedLessons.toString(),
              },
              {
                title: "Overall Progress",
                icon: 3,
                content: profileInfo.overallProgress.toString() + "%",
              },
            ].map((statCard, index) => {
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
            {setsLoading &&
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
            {setData &&
              setData.map((setCard, index) => {
                if (setCard.completed) return;

                return (
                  <SetCard
                    key={index}
                    id={setCard.id}
                    title={setCard.title}
                    category={setCard.category}
                    description={setCard.description}
                    totalLessons={setCard.numLessons}
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
            {buddyData && !buddyData.buddyData.length && (
              <span className="font-bold text-lg">
                No Study Buddies created yet. Upload study materials to get
                started!
              </span>
            )}
            <br />
            <br />
            {/* Study Buddy UI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-11">
              {buddyLoading &&
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
              {buddyData &&
                buddyData.buddyData.map((buddy, index) => {
                  //console.log("buddy.title: ", buddy.title);
                  return (
                    <StudyBuddyCard
                      key={index}
                      id={buddy.id}
                      title={buddy.bot_name}
                      category={buddy.category}
                      description={buddy.description}
                      documents={buddyData.documentData[index]}
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
