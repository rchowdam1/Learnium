import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

export async function GET(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.log("Could not get authenticated user");
    return NextResponse.json(
      { error: "User is not logged in" },
      { status: 500 }
    );
  }

  // fetch the sets (an array of sets)
  const { data: setData, error: setError } = await supabase
    .from("sets")
    .select("*")
    .eq("profile_id", user?.id);
  if (setError) {
    console.log("Could not retrieve sets");
    return NextResponse.json(
      {
        error: "Could not retrieve sets",
      },
      {
        status: 400,
      }
    );
  }

  // get the lessons

  /**
   * The data returned will be an array of sets with these attributes:
   * - id
   * - title
   * - category
   * - description
   * - numLessons
   * - completedLessons
   * - date
   * - profile_id
   * - is_flagged
   */

  const response = await Promise.all(
    setData.map(async (set, key) => {
      // returns the # of lessons associated with the set
      const { data: lessonData, error: lessonError } = await supabase
        .from("lessons")
        .select("*")
        .eq("set_id", set.id);

      if (lessonError) {
        console.log("There was an error fetching the lessons");
        return {};
      }

      // count the number of lessons that are completed
      let completedLessons = 0;
      lessonData?.forEach((lesson) => {
        if (lesson.completed) {
          completedLessons++;
        }
      });

      return {
        key: { key },
        id: set.id,
        title: set.title,
        description: set.description,
        category: set.category,
        numLessons: lessonData?.length,
        completedLessons: completedLessons,
        completed: set.completed,
        date: new Date(set.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        profile_id: set.profile_id,
        is_flagged: set.is_flagged,
      };
    })
  );

  /*console.log("The response is", response);
  console.log(
    "Type of set.created_at (timestamptz) ->",
    typeof setData[0].created_at
  );*/
  return NextResponse.json(
    {
      data: response,
    },
    {
      status: 200,
    }
  );
}
