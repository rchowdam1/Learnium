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
      console.error("Unauthorized settings save attempt:", userError);
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { daily_goal_tier } = body;

    if (!daily_goal_tier) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!DAILY_GOAL_TIERS.has(daily_goal_tier)) {
      return NextResponse.json(
        { success: false, error: "Invalid daily goal tier" },
        { status: 400 }
      );
    }

    // Persist daily_goal_tier to profile table
    const { error: updateError } = await supabase
      .from("profile")
      .update({
        daily_goal_tier,
      })
      .eq("id", user.id);

    if (updateError) {
      console.error("Failed to update profile settings:", updateError);
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("Settings endpoint error:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Internal Server Error" },
      { status: 500 }
    );
  }
}
