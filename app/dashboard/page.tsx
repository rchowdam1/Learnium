"use client";

import AuthNav from "../components/nav/AuthNav";
import StatCard from "../components/cards/StatCards";
import SetCard from "../components/cards/SetCards";
import CreateSetController from "../components/controllers/CreateSetController";

import { Plus } from "lucide-react";
import { useState, useEffect } from "react";

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

export default function Dashboard() {
  const [setCards, setSetCards] = useState<SetCards[]>([
    {
      id: 1,
      title: "Spanish Basics",
      category: "Communication",
      description: "Learn fundamental Spanish vocabulary and phrases",
      totalLessons: 10,
      completedLessons: 3,
      date: new Date().toISOString(),
    },
    {
      id: 2,
      title: "JavaScript Fundamentals",
      category: "Technology",
      description: "Master the basics of JavaScript programming",
      totalLessons: 15,
      completedLessons: 7,
      date: new Date().toISOString(),
    },
    {
      id: 3,
      title: "Digital Marketing",
      category: "Business",
      description: "Learn essential digital marketing strategies",
      totalLessons: 8,
      completedLessons: 0,
      date: new Date().toISOString(),
    },
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
    category: string
  ): void => {
    //create a set
    setSetCards((prevSetCards) => {
      return [
        ...prevSetCards,
        {
          id: prevSetCards.length + 1,
          title: title,
          category: category,
          description: description,
          totalLessons: 10,
          completedLessons: 0,
          date: new Date().toISOString(),
        },
      ];
    });
  };

  const onDeleteSet = (id: number): void => {
    setSetCards((prevSetCards) => {
      return prevSetCards.filter((prevSetCard) => {
        return prevSetCard.id !== id;
      });
    });
  };

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
          {/*<button
            className="flex justify-center items-center bg-black text-white p-3 rounded-md hover:bg-gray-800 active:bg-white active:text-black 
             transition-colors duration-200 cursor-pointer"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Set
          </button>*/}
          <CreateSetController onCreateSet={createSet} />
        </div>

        {/*Learning Set Cards*/}
        <br />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-11">
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
