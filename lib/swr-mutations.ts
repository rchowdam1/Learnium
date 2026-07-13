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
