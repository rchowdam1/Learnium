import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

type StudyBuddy = {
  id: number;
  created_at: string;
  profile_id: string;
  bot_name: string; // bot_name
  description: string;
  category: string;
};

export async function GET(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.log("User is not logged in");
    return NextResponse.json(
      { error: "User is not logged in" },
      { status: 500 }
    );
  }

  // fetch the study buddies (an array)
  const { data: buddyData, error: buddyError } = await supabase
    .from("study_bots")
    .select("*")
    .eq("profile_id", user?.id);

  if (buddyError) {
    console.log("Could not retrieve study buddies");
    return NextResponse.json(
      {
        error: "Could not retrieve study buddies",
      },
      {
        status: 400,
      }
    );
  }

  // get the study buddies
  /**
   * The data returned will be an array of these attributes
   * - id
   * - created_at
   * - profile_id
   * - bot_name (title)
   * - description
   * - category
   */

  //console.log(buddyData as StudyBuddy[]);

  return NextResponse.json(
    { success: true, data: buddyData as StudyBuddy[] },
    { status: 200 }
  );
}
