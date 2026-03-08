"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import AuthNav from "../components/nav/AuthNav";
import Progress from "../components/misc/Progress";

import {
  CircleUser,
  Settings,
  Undo2,
  Trophy,
  ChartLine,
  Star,
  CheckCircle,
  Lock,
  Eye,
  Crown,
} from "lucide-react";
import toast from "react-hot-toast";

type SetData = {
  id: number;
  title: string;
  description: string;
  category: string;
  completed: boolean;
  completed_at?: string;
};

/**
 * icon values:
 * 1 - Trophy (completed lessons)
 * 2 - Rising Graph (overall progress)
 * 3 - Star (average quiz score)
 */

const SetCard = ({
  title,
  description,
  date,
  isSubscribed,
}: {
  title: string;
  description: string;
  date: string;
  isSubscribed: boolean;
}) => {
  return (
    <div className="w-full min-h-40 rounded-md border-2 border-gray-200 bg-white px-4 py-3 flex flex-col">
      {/** Title and Completed Badge */}
      <div className="flex justify-between items-start">
        <span className="font-semibold text-lg">{title}</span>
        <span className="inline-flex justify-center items-center gap-1 text-green-700 bg-[#c7f5c6] rounded-full px-2 py-1 text-xs">
          <CheckCircle className="w-3 h-3" /> Complete
        </span>
      </div>

      {/** Description and Date */}
      <div className="mt-2 text-sm text-gray-500 text-left line-clamp-2">
        <span>{description}</span> <br />
        <span className="mt-1">Completed on {date}</span>
      </div>

      <hr className="text-gray-300 mt-3" />

      {/**View Set Contents */}
      <div className="mt-3 flex items-center">
        <button
          disabled={!isSubscribed}
          className={`px-2 py-1 flex items-center gap-2 rounded-full cursor-pointer disabled:cursor-not-allowed ${
            isSubscribed && "hover:bg-gray-100"
          } transition-all duration-200 border-2 border-gray-200 ${
            isSubscribed && "hover:border-black"
          }`}
        >
          {isSubscribed ? (
            <Eye className="text-gray-400 w-5 h-5" />
          ) : (
            <Lock className="text-gray-400 w-5 h-5" />
          )}
          <span className="font-semibold text-gray-500">View Set</span>
        </button>
        <div className="ml-2 flex items-center gap-1">
          {!isSubscribed && (
            <>
              <Crown className="text-yellow-400 w-5 h-5" />
              <span className="text-xs text-gray-400">Pro Only</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({
  icon,
  title,
  data,
}: {
  icon: number;
  title: string;
  data: string;
}) => {
  return (
    <div className="h-27 w-90 bg-white rounded-lg shadow-md relative">
      {icon === 1 ? (
        <Trophy className="absolute top-4 right-4 w-5 h-5" />
      ) : icon === 2 ? (
        <ChartLine className="absolute top-4 right-4 w-5 h-5" />
      ) : (
        <Star className="absolute top-4 right-4 w-5 h-5" />
      )}
      <span className="absolute top-4 left-3 font-bold text-lg">{title}</span>
      <span className="absolute left-3 bottom-5 font-bold text-xl">{data}</span>
    </div>
  );
};

export default function ProfilePage() {
  // state for skeleton loading
  const [loading, setLoading] = useState<boolean>(true);
  // state for profile data
  const [username, setUsername] = useState<string>();
  const [email, setEmail] = useState<string>();
  const [requestsRemaining, setRequestsRemaining] = useState<number>();
  const [setsCreated, setSetsCreated] = useState<number>();
  const [setsCompleted, setSetsCompleted] = useState<number>();
  const [topCategories, setTopCategories] = useState<string[]>();
  const [isSubscribed, setIsSubscribed] = useState<boolean>();
  const [completedLessons, setCompletedLessons] = useState<number>();
  const [overallProgress, setOverallProgress] = useState<number>();
  const [averageQuizScore, setAverageQuizScore] = useState<number>();
  const [setData, setSetData] = useState<SetData[]>();

  // state to display completed sets
  const [displayCompletedSets, setDisplayCompletedSets] =
    useState<boolean>(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch("/api/get-profile-data");

        if (response.ok) {
          const data = await response.json();

          if (data.success) {
            toast.success("Requests remaining: ", data.requestsRemaining);
            setLoading(false);
            setUsername(data.username);
            setEmail(data.email);
            setRequestsRemaining(data.requestsRemaining);
            setSetsCreated(data.setsCreated);
            setSetsCompleted(data.setsCompleted);
            setTopCategories(data.topCategories);
            setIsSubscribed(data.isSubscribed);
            setCompletedLessons(data.completedLessons);
            setOverallProgress(data.overallProgress);
            setAverageQuizScore(data.averageQuizScore);
            setSetData(data.setData || []);
            console.log(data.setData);
          } else {
            setLoading(false);
            toast.error("Could not fetch profile data");
          }
        }
      } catch (error) {
        setLoading(false);
        toast.error("Couln't fetch profile data");
      }
    };

    fetchProfileData();
  }, []);

  function formatDate(dateString: string | undefined): string {
    if (dateString === undefined) {
      return "";
    }
    const [year, month, day] = dateString.split("-");
    return `${parseInt(month, 10)}/${parseInt(day, 10)}/${year}`;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthNav />

      <main className="max-w-7xl mx-auto pt-20 text-center relative">
        <span className="text-5xl font-bold">My Profile</span>

        {/*Back Home Page*/}
        <Link href="/dashboard">
          <div className="absolute top-26 left-10 flex justify-center gap-2 items-center rounded-2xl px-2 py-1 hover:bg-gray-200 transition-colors duration-350 cursor-pointer">
            <Undo2 />
            <span>Return to home</span>
          </div>
        </Link>

        {/* profile content (will include a card for each component) */}
        {loading && (
          <div className="max-w-5xl mt-6 p-6 mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="h-90 w-90 bg-gray-300 rounded-lg animate-pulse" />
            <div className="h-90 w-90 bg-gray-300 rounded-lg animate-pulse" />
            <div className="h-90 w-90 bg-gray-300 rounded-lg animate-pulse" />
            <div className="h-90 w-90 bg-gray-300 rounded-lg animate-pulse" />
            <div className="h-90 w-90 bg-gray-300 rounded-lg animate-pulse" />
            <div className="h-90 w-90 bg-gray-300 rounded-lg animate-pulse" />
          </div>
        )}
        {!loading && (
          <div className="max-w-5xl mt-6 p-6 mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="w-110 bg-white rounded-lg shadow-md pb-3">
              <div className="flex justify-around pt-10">
                {/*<CircleUser className="w-20 h-20 relative bottom-3" />*/}
                {/*User Circle*/}
                <div className="w-20 h-20 relative bottom-3 rounded-full bg-gray-100 flex justify-center items-center text-2xl">
                  {username?.charAt(0)}
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xl font-semibold">
                    {username}
                    <button className="text-xs font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded-md hover:text-gray-400 hover:bg-blue-50 ml-2">
                      Change Username
                    </button>
                  </span>
                  <span className="text-md text-gray-500">{email}</span>
                  {/**User's Current Plan*/}
                  <div className="mt-2 flex items-center">
                    <span
                      className={`rounded-tl-full rounded-bl-full pl-4 pr-2 py-2 ${
                        isSubscribed ? "bg-gray-100" : "bg-[#df8af2]"
                      } text-gray-600`}
                    >
                      Free
                    </span>
                    <span
                      className={`rounded-tr-full rounded-br-full pl-3 pr-4 py-2 ${
                        isSubscribed ? "bg-[#df8af2]" : "bg-gray-100"
                      } text-gray-600`}
                    >
                      Pro
                    </span>
                    <div className="relative group">
                      {/**Tooltip: "Change Plan"*/}
                      <Link href="/subscriptions">
                        <Settings className="w-6 h-6 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors duration-200 ml-2" />
                      </Link>
                      {/* Tooltip */}
                      <div className="absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                        Change Plan
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/**Requests Remaining*/}
              <div className="flex flex-col items-center mt-6">
                <span>Requests Remaining: {requestsRemaining}</span>
                <Progress
                  width={400}
                  percentage={requestsRemaining ? 100 : 0}
                  color="#73f062"
                />
              </div>

              {/**Sets Created and Completed */}
              <div className="flex flex-col items-center mt-6">
                <span>
                  Sets Completed: {setsCompleted}/{setsCreated}
                </span>
                {setsCompleted !== undefined && setsCreated !== undefined && (
                  <Progress
                    width={400}
                    percentage={
                      setsCompleted > 0
                        ? (setsCompleted / setsCreated) * 100
                        : 0
                    }
                  />
                )}
              </div>

              {/**Top Categories */}
              <div className="pt-5">
                <span className="font-bold text-lg">Top Categories</span>
                <div className="flex flex-wrap justify-center items-center gap-2 mt-2">
                  {topCategories && topCategories.length > 0 ? (
                    topCategories.map((category, index) => {
                      return (
                        <div
                          className="inline-block bg-gray-200 rounded-full px-2"
                          key={index}
                        >
                          <span className="text-sm font-medium">
                            {category}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <span className="text-md font-medium">
                      No categories found
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              {completedLessons && overallProgress && averageQuizScore ? (
                Array(3)
                  .fill(0)
                  .map((_, index) => {
                    return (
                      <StatCard
                        key={index}
                        icon={index + 1}
                        title={
                          index === 0
                            ? "Completed Lessons"
                            : index === 1
                              ? "Overall Progress"
                              : "Average Quiz Score"
                        }
                        data={
                          index === 0
                            ? `${completedLessons}`
                            : index === 1
                              ? `${overallProgress}%`
                              : `${averageQuizScore}%`
                        }
                      />
                    );
                  })
              ) : (
                <span className="text-md font-medium text-gray-500">
                  No Statistics Available
                </span>
              )}
            </div>

            {/**Completed Sets */}
            <div
              className={`px-4 py-5 bg-white rounded-lg shadow-md relative mx-auto transition-all duration-300 col-span-full ${
                displayCompletedSets
                  ? "w-full max-w-4xl"
                  : "w-fit min-w-[400px]"
              }`}
            >
              <div className="flex items-center justify-between relative gap-8">
                <div className="flex items-center">
                  <CheckCircle className="w-7 h-7 text-green-500" />
                  <span className="ml-3 text-2xl font-bold">
                    Completed Sets
                  </span>
                </div>

                <button
                  className="font-semibold hover:bg-gray-200 px-2 py-1 rounded-full cursor-pointer border-2 border-gray-200 transition-colors duration-200 whitespace-nowrap"
                  onClick={() => setDisplayCompletedSets(!displayCompletedSets)}
                >
                  {displayCompletedSets ? "Hide" : `View (${setsCompleted})`}
                </button>
              </div>

              {/**The actual sets */}
              {displayCompletedSets && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-20 gap-y-10 mt-4 w-full px-5 py-5">
                  {setData &&
                  setData.filter((set) => set.completed).length > 0 ? (
                    setData
                      .filter((set) => set.completed)
                      .map((set, index) => {
                        return (
                          <SetCard
                            key={index}
                            title={set.title}
                            description={set.description}
                            date={
                              set.completed_at
                                ? formatDate(set.completed_at)
                                : "N/A"
                            }
                            isSubscribed={isSubscribed || false}
                          />
                        );
                      })
                  ) : (
                    <span className="mt-3 font-semibold text-xl">
                      You haven't completed any sets
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
