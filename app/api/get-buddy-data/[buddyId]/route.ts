import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

/**
 *
 * This route will be used to fetch data about the buddy (title, etc.)
 * as well as the chats in this buddy
 */

export async function GET(
  request: Request,
  { params }: { params: Promise<{ buddyId: string }> }
) {
  const supabase = await createClient();

  // use the buddy id argument passed by the client
  const { buddyId } = await params;

  // get the buddy from supabase
  const { data: buddyData, error: buddyError } = await supabase
    .from("study_bots")
    .select("*")
    .eq("id", buddyId)
    .single();

  if (buddyError) {
    console.log("Could not retrieve the study buddy");
    return NextResponse.json(
      { error: "Could not retrieve the study buddy" },
      { status: 400 }
    );
  }

  // get the chats in order
  const { data: chatData, error: chatError } = await supabase
    .from("study_bot_chats")
    .select("*")
    .eq("bot_id", buddyData.id)
    .order("created_at", { ascending: true });

  if (chatError) {
    console.log("Could not retrieve study buddy chats");
    return NextResponse.json(
      { error: "Could not retrieve study buddy chats" },
      { status: 400 }
    );
  }

  console.log("title:", buddyData.bot_name);
  // success
  return NextResponse.json(
    { title: buddyData.bot_name, chats: chatData },
    { status: 200 }
  );
}
