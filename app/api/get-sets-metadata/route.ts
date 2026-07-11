import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

export async function GET(request: Request) {
  const supabase = await createClient(); // 7/7: think about implementing SWR on the client side instead of the unstable_cache approach

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.log("Could not get authenticated user");
    return NextResponse.json(
      { error: "User is not logged in" },
      { status: 500 },
    );
  }

  // get the progress; can copy /api/get-sets

  const { data: setData, error: setError } = await supabase
    .from("sets")
    .select("*")
    .eq("profile_id", user?.id);

  if (setError) {
    console.log("Could not retrieve sets - get-sets-progress");
    return NextResponse.json(
      { error: "Could not retrieve sets" },
      { status: 400 },
    );
  }

  const response = await Promise.all(
    setData.map(async (set, key) => {
      const { data: lessonData, error: lessonError } = await supabase
        .from("lessons")
        .select("*")
        .eq("set_id", set.id);

      if (lessonError) {
        console.log("There was an error fetching the lessons");
        return {};
      }

      // do not need to count the number of completed lessons
      // this data is static data and does not change
      return {
        key: { key },
        id: set.id,
        title: set.title,
        description: set.description,
        category: set.category,
        numLessons: lessonData?.length,
        date: new Date(set.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        profile_id: set.profile_id,
        is_flagged: set.is_flagged,
      };
    }),
  );

  return NextResponse.json(
    {
      data: response,
    },
    {
      status: 200,
    },
  );
}
