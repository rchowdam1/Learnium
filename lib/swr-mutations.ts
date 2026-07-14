import { mutate } from "swr";
import { SetData, ProfileData } from "@/types/dashboard/DashboardTypes";

const SETS_KEY = "/api/get-sets";
const PROFILE_KEY = "/api/get-profile-data";

export function optimisticallyCompleteLesson(
  setId: number,
  isLastLesson: boolean,
) {
  mutate(
    SETS_KEY,
    (current: SetData[] | undefined) => {
      if (!current) return current;

      return current.map((set) => {
        if (set.id !== setId) return set;

        return {
          ...set,
          completedLessons: isLastLesson
            ? set.numLessons
            : set.completedLessons + 1,
          completed: isLastLesson ? true : set.completed,
        };
      });
    },
    { revalidate: true },
  );

  mutate(
    PROFILE_KEY,
    (current: ProfileData | undefined) => {
      if (!current) return current;

      return {
        ...current,
        completedLessons: current.completedLessons + 1,
        setsCompleted: isLastLesson
          ? current.setsCompleted + 1
          : current.setsCompleted,
      };
    },
    { revalidate: true },
  );
}

export function optimisticallyCreateSet(
  title: string,
  description: string,
  category: string,
  numLessons: number,
  setId: number,
  profile_id: string,
  is_flagged: boolean,
) {
  mutate(
    SETS_KEY,
    (current: SetData[] | undefined) => {
      return [
        ...(current ?? []),
        {
          id: setId,
          title,
          description,
          category,
          numLessons,
          completedLessons: 0,
          completed: false,
          date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          profile_id,
          is_flagged,
        },
      ];
    },
    { revalidate: true },
  );

  mutate(
    PROFILE_KEY,
    (current: ProfileData | undefined) => {
      if (!current) return current;

      return {
        ...current,
        setsCreated: current.setsCreated + 1,
        requestsRemaining:
          current.requestsRemaining !== undefined
            ? Math.max(0, current.requestsRemaining - 1)
            : current.requestsRemaining,
      };
    },
    { revalidate: true },
  );
}
