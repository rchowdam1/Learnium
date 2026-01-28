"use client";

import AuthNav from "@/app/components/nav/AuthNav";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Undo2 } from "lucide-react";
import Chat from "@/app/components/study-buddy/Chat";
import toast from "react-hot-toast";

export type Message = {
  id?: number;
  created_at?: string;
  profile_id?: string;
  bot_id?: number;
  is_user_message: boolean;
  message: string;
};

export type APIResponse = {
  title: string;
  chats: Message[];
  error?: string;
};

export default function BuddyPage() {
  const param = useParams();

  const buddyId = param.buddyId;

  return (
    <div className="relative min-h-screen bg-gray-100">
      <AuthNav />

      {/*Back Home Page*/}
      <Link href="/dashboard">
        <div className="absolute top-26 left-10 flex justify-center gap-2 items-center rounded-2xl px-2 py-1 hover:bg-gray-200 transition-colors duration-350 cursor-pointer">
          <Undo2 />
          <span>Return to home</span>
        </div>
      </Link>

      {/*Main Content of the page*/}
      <div className="flex justify-center items-center min-h-screen">
        <Chat buddyId={buddyId as string} />
      </div>
    </div>
  );
}
