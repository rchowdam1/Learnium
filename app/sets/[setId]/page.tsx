"use client";

import AuthNav from "@/app/components/nav/AuthNav";
import LessonBubble from "@/app/components/lessons/LessonBubble";
import LessonChain from "@/app/components/lessons/LessonChain";

import Link from "next/link";

import { Undo2 } from "lucide-react";
export default function SetPage({ params }: { params: { setId: string } }) {
  return (
    <div className="relative min-h-screen bg-gray-50">
      <AuthNav />
      {/*Back Home Page*/}
      <Link href="/dashboard">
        <div className="absolute top-26 left-10 flex justify-center gap-2 items-center rounded-2xl px-2 py-1 hover:bg-gray-200 transition-colors duration-350 cursor-pointer">
          <Undo2 />
          <span>Return to home</span>
        </div>
      </Link>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40">
        <div className="bg-white shadow-md rounded-lg  w-fit py-16 px-16">
          <LessonChain lessons={10} active={1} completed={1} />
        </div>
      </main>
    </div>
  );
}
