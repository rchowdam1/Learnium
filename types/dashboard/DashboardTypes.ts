export type SetData = {
  id: number;
  title: string;
  description: string;
  category: string;
  numLessons: number;
  completedLessons: number;
  completed: boolean;
  date: string;
  profile_id: string;
  is_flagged: boolean;
};

type StudyBuddy = {
  id: number;
  created_at: string;
  profile_id: string;
  bot_name: string; // bot_name
  description: string;
  category: string;
};

type Document = {
  id: number;
  studyBuddyId: number;
  name: string;
  size: number;
};

export type BuddyData = {
  buddyData: StudyBuddy[];
  documentData: Document[][];
};

export type ProfileData = {
  username: string;
  email: string | undefined;
  requestsRemaining: number | undefined;
  setsCreated: number;
  setsCompleted: number;
  isSubscribed: boolean;
  completedLessons: number;
  overallProgress: string;
  averageQuizScore: string;
  topCategories: string[];
  // ignore the setData property because we don't need it now
};

export type OnCreateSet = {
  title: string;
  description: string;
  category: string;
  numLessons: number;
  setId: number;
  profile_id: string;
  is_flagged: boolean;
};
