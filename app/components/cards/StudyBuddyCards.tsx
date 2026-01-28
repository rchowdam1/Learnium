"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";

type StudyBuddyCardProps = {
  id: number;
  title: string;
  category: string;
  description: string;
};

export default function StudyBuddyCard({
  id,
  title,
  category,
  description,
}: StudyBuddyCardProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col justify-between h-70 w-100 bg-white rounded-sm bg-card text-card-foreground shadow-sm px-4 py-5">
      {/*Card Header (includes title and category)*/}
      <div className="flex items-center justify-between gap-2">
        <div className="flex">
          <span className="text-lg font-bold">{title}</span>

          {/*category*/}
          <div className="bg-gray-200 rounded-full px-2 ml-2">
            <span className="text-xs font-medium">{category}</span>
          </div>
        </div>
      </div>

      {/*Card Description*/}
      <div className="mt-3">
        <span className="text-gray-500">{description}</span>
      </div>

      {/*Date and Continue/Start button*/}
      <div className="mt-12 flex items-center justify-between">
        <Link href={`/buddy/${id}`}>
          <button className="flex items-center h-9 rounded-md px-3 bg-black text-white hover:bg-gray-800 active:bg-white active:text-black transition-colors duration-200 cursor-pointer">
            <Play className="w-4 h-4 mr-2" />
            <span>Chat</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
