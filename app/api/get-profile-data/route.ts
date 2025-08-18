import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import { resetSets, updateSetResetDate } from "@/actions/ProfileUpdates";

type Categories = {
  Business?: number;
  Communication?: number;
  Creativity?: number;
  Health?: number;
  Humanities?: number;
  Mathematics?: number;
  Productivity?: number;
  Science?: number;
  Technology?: number;
  "Test Prep"?: number;
  Miscellaneous?: number;
};

type SetData = {
  id: number;
  created_at: string;
  profile_id: string;
  title: string;
  description: string;
  category: string;
  is_flagged: boolean;
  completed: boolean;
};

export async function GET() {
  const supabase = await createClient();

  /**
   * Data returned:
   * -Username
   * -Email
   * -Requests remaining
   * -Sets created
   * -Sets completed
   * -Current plan (free or pro)
   * -Completed lessons
   * -Overall progress
   * -Average quiz score
   * -Top Categories (as an array, if the user has created any sets)
   */

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.log("User is not logged in");
    return NextResponse.json({ success: false }, { status: 403 });
  }

  // get the profile
  const userId = user?.id;
  const { data: profileData, error: profileError } = await supabase
    .from("profile")
    .select("*")
    .eq("id", userId)
    .single();

  if (profileError) {
    console.log("Could not fetch profile data");
    return NextResponse.json({ success: false }, { status: 400 });
  }

  // username, email, requests remaining
  let username = profileData.username;
  let email = user?.email;
  //let requestsRemaining = profileData.sets_remaining;
  let isSubscribed = profileData.is_subscribed;
  let requestsRemaining;

  // if today is >= profileData.sets_refresh_at, then reset requests and update the value
  const today = new Date().toISOString().split("T")[0];
  const setsRefreshAt = profileData.sets_refresh_at
    ? profileData.sets_refresh_at.split("T")[0]
    : null;

  if (
    profileData.sets_remaining === 0 &&
    setsRefreshAt &&
    setsRefreshAt <= today
  ) {
    // if it's past the refresh date, then reset the requests. This will allow the page to display
    // the correct number of remaining requests
    let result = await updateSetResetDate();
    if (result.success === false) {
      console.log("Failed to reset set request date");
    }

    // result.success == true
    result = await resetSets();
    if (result.success === false) {
      console.log("Failed to reset set requests");
    }
    // result.success == true
  }

  requestsRemaining = profileData.sets_remaining;

  // get the sets
  const { data: setData, error: setError } = await supabase
    .from("sets")
    .select("*")
    .eq("profile_id", profileData.id);

  if (setError) {
    console.log("Could not retrieve sets");
    return NextResponse.json({ success: false }, { status: 200 });
  }

  // Sets created and sets completed
  let setsCreated = setData.length;
  let setsCompleted = setData.filter((set) => set.completed).length;

  // completed lessons
  let completedLessons = 0;
  let totalLessons = 0; // used to calculate overall progress

  // average quiz score
  let numQuizzesCompleted = 0;
  let totalQuizScore = 0;
  for (const set of setData) {
    const { data: lessonData, error: lessonError } = await supabase
      .from("lessons")
      .select("*")
      .eq("set_id", set.id);

    if (lessonError) {
      console.log(`Could not retrieve lessons for set ${set.id}`);
      return NextResponse.json({ success: false }, { status: 200 });
    }

    totalLessons += lessonData.length;
    completedLessons += lessonData.filter((lesson) => lesson.completed).length;

    // get the quizzes for each lesson
    for (const lesson of lessonData) {
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("lesson_id", lesson.id)
        .single(); // should be 1 quiz per lesson that is returned

      if (quizError) {
        console.log("Could not retrieve quizzes for a lesson");
        return NextResponse.json({ success: false }, { status: 200 });
      }

      // get the number of questions for this quiz
      if (quizData) {
        if (quizData.completed) {
          numQuizzesCompleted++;

          // get the correct questions of the quiz
          const questionsCorrect = quizData.questions_correct;

          const { data: questionData, error: questionError } = await supabase
            .from("questions")
            .select("*")
            .eq("quiz_id", quizData.id);

          if (questionError) {
            console.log("Could not retrieve questions for a quiz");
            return NextResponse.json({ success: false }, { status: 200 });
          }

          if (questionData) {
            totalQuizScore += questionsCorrect / questionData.length;
          }
        }
      }
    }
  }

  let overallProgress = ((completedLessons / totalLessons) * 100).toFixed(2);
  let averageQuizScore = ((totalQuizScore / numQuizzesCompleted) * 100).toFixed(
    2
  );

  // Get the top categories of the user
  const categoryCounts: Categories = {};
  const topCategories: string[] = []; // max length will be 3

  setData.forEach((set) => {
    categoryCounts[set.category] = (categoryCounts[set.category] || 0) + 1;
  });

  const sortedEntries = Object.entries(categoryCounts).sort(
    (a, b) => b[1] - a[1]
  );
  for (const [category, count] of sortedEntries) {
    if (topCategories.length < 3 && count > 0) {
      topCategories.push(category);
    }
  }

  return NextResponse.json({
    success: true,
    username: username,
    email: email,
    requestsRemaining: requestsRemaining,
    setsCreated: setsCreated,
    setsCompleted: setsCompleted,
    isSubscribed: isSubscribed,
    completedLessons: completedLessons,
    overallProgress: overallProgress,
    averageQuizScore: averageQuizScore,
    topCategories: topCategories,
    setData: setData,
  });
}
