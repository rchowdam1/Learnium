import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import {
  decrementRequests,
  updateSetResetDate,
  resetSets,
} from "@/actions/ProfileUpdates";
import { createBuddy } from "@/actions/dbops";

export async function POST(request: Request) {
  const supabase = await createClient();

  // check user's remaining requests
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 400 }
    );
  }

  const { data: profileData, error: profileError } = await supabase
    .from("profile")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError) {
    console.log("Could not retrieve profile - create buddy");
    return NextResponse.json(
      { error: "Could not retrieve profile" },
      { status: 200 }
    );
  }

  // check sets_remaining and sets_refresh_at

  // if 'sets_remaining' == 0 and 'sets_refresh_at' <= today, then call resetSets()
  const today = new Date().toISOString().split("T")[0];

  const setsRefreshAt = profileData.sets_refresh_at
    ? profileData.sets_refresh_at.split("T")[0]
    : null;
  console.log("The set refresh date is", setsRefreshAt);

  if (
    profileData.sets_remaining === 0 &&
    setsRefreshAt &&
    setsRefreshAt <= today
  ) {
    // if it's past the refresh date, reset the set requests
    let result = await updateSetResetDate();
    if (result.success === false) {
      return NextResponse.json(
        { error: "Could not update the reset date" },
        { status: 200 }
      );
    }

    // result.success == true
    result = await resetSets();

    if (result.success === false) {
      return NextResponse.json(
        { error: "Could not reset the remaining set requests" },
        { status: 200 }
      );
    }

    // result.success == true
  }

  // decrement_sets_remaining by 1
  const decrementResult = await decrementRequests();

  if (!decrementResult.success) {
    if (
      decrementResult.message ===
      "User does not have any set requests remaining"
    ) {
      return NextResponse.json(
        { error: "No remaining requests" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        error: "An error occurred while trying to decrease 'sets_remaining'",
      },
      {
        status: 200,
      }
    );
  }

  // decrementResult.success is true

  // now create the bot
  const data = await request.formData();
  const title = data.get("title") as string;
  const description = data.get("description") as string;
  const category = data.get("category") as string;

  const createBuddyResult = await createBuddy(title, description, category);

  if (createBuddyResult === false) {
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while creating the buddy",
      },
      { status: 200 }
    );
  }

  // buddy creation was successful

  // now upload the files

  // const data = await request.formData();
  // const files = data.getAll("files");
  // console.log(files);
  // now store files in backend

  return NextResponse.json(
    { success: true, buddyId: createBuddyResult.id },
    { status: 200 }
  );
}
