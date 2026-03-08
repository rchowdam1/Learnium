"use client";

import { BookOpen, EllipsisVertical, Play } from "lucide-react";
import Progress from "../misc/Progress";
import SetDropdown from "../modals/SetDropdown";
import { useRouter } from "next/navigation";
import Link from "next/link";

type SetCardProps = {
  id: number;
  title: string;
  category: string;
  description: string;
  totalLessons: number;
  completedLessons: number;
  date: string; // new Date.toISOString()
  onDeleteSet: (id: number) => void;
};

export default function SetCard({
  id,
  title,
  category,
  description,
  totalLessons,
  completedLessons,
  date,
  onDeleteSet,
}: SetCardProps) {
  // convert date to readable format
  const readDate: Date = new Date(date);

  const router = useRouter();

  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const dateString = readDate.toLocaleDateString("en-us", options);

  // function to delete the set
  const onSetDelete = () => {
    console.log("deleting");
    onDeleteSet(id);
  };

  const goToSet = async () => {
    /*try {
      const response = await fetch(`/api/get-set-data/${id}`);

      if (response.ok) {
        const data = await response.json();

        console.log(data, "data received from get-set-data");
      }
    } catch (error) {
      console.log("Error fetching set data");
    }*/
    router.replace(`/sets/${id}`);
  };

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

        {/*Dropdown*/}
        <SetDropdown onDelete={onSetDelete} title={title} />
      </div>

      {/*Card Description*/}
      <div className="mt-3 h-12 overflow-y-auto no-scrollbar">
        <span className="text-gray-500">{description}</span>
      </div>

      {/*Progress and Bar*/}
      <div className="mt-8">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium">
            {completedLessons}/{totalLessons} lessons
          </span>
        </div>
        <div className="mt-1">
          <Progress
            width={365}
            percentage={(completedLessons / totalLessons) * 100}
          />
        </div>
      </div>

      {/*Date and Continue/Start button*/}
      <div className="mt-12 flex items-center justify-between">
        <div className="flex items-center text-sm text-gray-500">
          <BookOpen className="w-4 h-4 mr-1" />
          <span>Created at {dateString}</span>
        </div>

        <Link href={`/sets/${id}`}>
          <button className="flex items-center h-9 rounded-md px-3 bg-black text-white hover:bg-gray-800 active:bg-white active:text-black transition-colors duration-200 cursor-pointer">
            <Play className="w-4 h-4 mr-2" />
            <span>{completedLessons === 0 ? "Start" : "Continue"}</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
