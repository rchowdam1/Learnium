import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

const DAILY_GOAL_TIERS = new Set(["Casual", "Regular", "Serious"]);

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get current authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Unauthorized onboarding save attempt:", userError);
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { topic, daily_goal_tier } = body;

    if (!topic && !daily_goal_tier) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (daily_goal_tier && !DAILY_GOAL_TIERS.has(daily_goal_tier)) {
      return NextResponse.json(
        { success: false, error: "Invalid daily goal tier" },
        { status: 400 }
      );
    }

    const updates: { onboarding_topic?: string; daily_goal_tier?: string } = {};
    if (typeof topic === "string" && topic.trim()) {
      updates.onboarding_topic = topic.trim();
    }
    if (daily_goal_tier) {
      updates.daily_goal_tier = daily_goal_tier;
    }

    // Persist each onboarding step as it is completed so refreshes and network
    // retries do not lose committed choices.
    const { error: updateError } = await supabase
      .from("profile")
      .update(updates)
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to update profile during onboarding:", updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("Onboarding endpoint error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
