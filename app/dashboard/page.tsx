"use client";

import AuthNav from "../components/nav/AuthNav";
import StatCard from "../components/cards/StatCards";
import SetCard from "../components/cards/SetCards";
import CreateSetController from "../components/controllers/CreateSetController";

import { Plus } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

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
    setId?: number
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

  const onDeleteSet = (id: number): void => {
    toast.success("Set deleted successfully");
    setSetCards((prevSetCards) => {
      return prevSetCards.filter((prevSetCard) => {
        return prevSetCard.id !== id;
      });
    });
  };

  // load up the sets of the user
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
          console.log(data.data, "fetched sets");
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
              }))
          );
          setLoading(false);
          toast.success("Fetched sets");
        }
      } catch (error) {
        toast.error("Could not fetch sets - 124");
      }
    };

    loadSets();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16">
        {/*Stat Cards*/}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 mb-8 mt-5">
          {sampleStatCards.map((statCard, index) => {
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
          <h2 className="text-2xl font-bold text-gray-900">
            Your Learning Sets
          </h2>
          <CreateSetController onCreateSet={createSet} />
        </div>

        {/*Learning Set Cards*/}
        <br />
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
          {setCards.map((setCard, index) => {
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
        <br />
        <br />
      </main>
    </div>
  );
}
