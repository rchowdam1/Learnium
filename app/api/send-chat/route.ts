import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import {
  retrieveBuddyContext,
  buildContextPrompt,
  answerWithContext,
} from "@/lib/ingest";

export const maxDuration = 120;

/**
 * Receives:
 * - buddyId: number | string
 * - userMessage: string
 */
export async function POST(request: Request) {
  const reqData = await request.json();
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { success: false, message: "User is not logged in" },
      { status: 401 },
    );
  }

  const { data: profileChatData, error: profileChatError } = await supabase
    .from("profile")
    .select("chats_remaining")
    .eq("id", user.id)
    .single();

  if (profileChatError) {
    return NextResponse.json(
      { success: false, message: "Could not retrieve profile chat data" },
      { status: 400 },
    );
  }

  if (profileChatData.chats_remaining <= 0) {
    return NextResponse.json(
      { success: false, message: "User has no chats remaining for the day" },
      { status: 200 },
    );
  }

  const messageToSend = String(reqData.userMessage || "").trim();
  const buddyId = Number(reqData.buddyId);

  if (!messageToSend || !Number.isFinite(buddyId)) {
    return NextResponse.json(
      { success: false, message: "buddyId and userMessage are required" },
      { status: 400 },
    );
  }

  // Ensure buddy belongs to this user
  const { data: buddy, error: buddyError } = await supabase
    .from("study_bots")
    .select("id, bot_name, description, profile_id")
    .eq("id", buddyId)
    .eq("profile_id", user.id)
    .single();

  if (buddyError || !buddy) {
    return NextResponse.json(
      { success: false, message: "Study buddy not found" },
      { status: 404 },
    );
  }

  let assistantMessage: string;

  try {
    const chunks = await retrieveBuddyContext({
      supabase,
      profileId: user.id,
      studyBotId: buddyId,
      query: messageToSend,
      matchCount: 8,
    });

    const context = buildContextPrompt(chunks);
    assistantMessage = await answerWithContext({
      question: messageToSend,
      context,
      buddyName: buddy.bot_name,
      buddyDescription: buddy.description || undefined,
    });
  } catch (err) {
    console.error("Study buddy chat error:", err);
    const message =
      err instanceof Error ? err.message : "Failed to generate a response";
    return NextResponse.json(
      { success: false, message },
      { status: 400 },
    );
  }

  const { error: userMessageError } = await supabase
    .from("study_bot_chats")
    .insert({
      profile_id: user.id,
      bot_id: buddyId,
      is_user_message: true,
      message: messageToSend,
    });

  if (userMessageError) {
    return NextResponse.json(
      { success: false, message: "Couldn't insert user's chat into database" },
      { status: 400 },
    );
  }

  const { error: assistantMessageError } = await supabase
    .from("study_bot_chats")
    .insert({
      profile_id: user.id,
      bot_id: buddyId,
      is_user_message: false,
      message: assistantMessage,
    });

  if (assistantMessageError) {
    return NextResponse.json(
      {
        success: false,
        message: "Couldn't insert assistant's chat into database",
      },
      { status: 400 },
    );
  }

  const { error: rpcError } = await supabase.rpc("decrement_chat_quota", {
    user_id: user.id,
  });

  if (rpcError) {
    return NextResponse.json(
      { success: false, message: "Couldn't decrement user's chat quota" },
      { status: 400 },
    );
  }

  return NextResponse.json(
    { success: true, assistantMessage },
    { status: 200 },
  );
}
