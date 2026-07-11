import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import {
  decrementRequests,
  updateSetResetDate,
  resetSets,
} from "@/actions/ProfileUpdates";
import { createBuddy } from "@/actions/dbops";
import { ingestBuddyDocuments } from "@/lib/ingest";

export const maxDuration = 300;

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 },
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
      { status: 400 },
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const setsRefreshAt = profileData.sets_refresh_at
    ? profileData.sets_refresh_at.split("T")[0]
    : null;

  if (
    profileData.sets_remaining === 0 &&
    setsRefreshAt &&
    setsRefreshAt <= today
  ) {
    let result = await updateSetResetDate();
    if (result.success === false) {
      return NextResponse.json(
        { error: "Could not update the reset date" },
        { status: 400 },
      );
    }

    result = await resetSets();
    if (result.success === false) {
      return NextResponse.json(
        { error: "Could not reset the remaining set requests" },
        { status: 400 },
      );
    }
  }

  const decrementResult = await decrementRequests();
  if (!decrementResult.success) {
    if (
      decrementResult.message ===
      "User does not have any set requests remaining"
    ) {
      return NextResponse.json(
        { error: "No remaining requests" },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        error: "An error occurred while trying to decrease 'sets_remaining'",
      },
      { status: 400 },
    );
  }

  const data = await request.formData();
  const title = data.get("title") as string;
  const description = data.get("description") as string;
  const category = data.get("category") as string;
  const files = data.getAll("files").filter((f): f is File => f instanceof File);

  if (!title?.trim() || !description?.trim() || !category?.trim()) {
    return NextResponse.json(
      { error: "Title, description, and category are required" },
      { status: 400 },
    );
  }

  if (files.length === 0) {
    return NextResponse.json(
      { error: "Please upload at least one file" },
      { status: 400 },
    );
  }

  const createBuddyResult = await createBuddy(title, description, category);
  if (createBuddyResult === false) {
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while creating the buddy",
      },
      { status: 400 },
    );
  }

  const ingestResult = await ingestBuddyDocuments({
    supabase,
    profileId: user.id,
    studyBotId: createBuddyResult.id,
    files,
  });

  if (!ingestResult.success || ingestResult.chunksCount === 0) {
    const detail =
      ingestResult.errors[0] ||
      "Could not extract content from your files. Try PDF, DOCX, PPTX, text, images, or audio.";

    return NextResponse.json(
      {
        success: false,
        buddyId: createBuddyResult.id,
        chunks_count: 0,
        errors: ingestResult.errors,
        files: ingestResult.files,
        message: detail,
      },
      { status: 200 },
    );
  }

  return NextResponse.json(
    {
      success: true,
      status: "success",
      buddyId: createBuddyResult.id,
      chunks_count: ingestResult.chunksCount,
      files: ingestResult.files,
      errors: ingestResult.errors,
    },
    { status: 200 },
  );
}
