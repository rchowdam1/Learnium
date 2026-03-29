import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

/**
 *
 * Receives:
 * - userId: string
 * - buddyId: string
 * - userMessage: string
 */
export async function POST(request: Request) {
  const reqData = await request.json();

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.log("User is not logged in");
    return NextResponse.json(
      { success: false, message: "User is not logged in" },
      { status: 401 },
    );
  }

  // check if user has chats remaining for the day
  const { data: profileChatData, error: profileChatError } = await supabase
    .from("profile")
    .select("chats_remaining")
    .eq("id", user?.id)
    .single();

  if (profileChatError) {
    console.log("Could not retrieve profile chat data");
    return NextResponse.json(
      { success: false, message: "Could not retrieve profile chat data" },
      { status: 400 },
    );
  }

  if (profileChatData.chats_remaining <= 0) {
    console.log("User has no chats remaining for the day");
    return NextResponse.json(
      { success: false, message: "User has no chats remaining for the day" },
      { status: 200 },
    );
  }

  // send user query to rag api
  const messageToSend = reqData.userMessage;
  const buddyId = reqData.buddyId;

  let assistantMessage: string = "";

  try {
    const response = await fetch("http://localhost:8000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question: messageToSend,
        buddy_id: buddyId,
      }),
    });

    if (!response.ok) {
      console.log("An error happened while trying to chat with the RAG API");
      return NextResponse.json(
        {
          success: false,
          message: "An error happened while trying to chat with the RAG API",
        },
        { status: 400 },
      );
    }

    // if the response is ok, get the assistant message from the response
    const data = await response.json();

    if (!data.response) {
      console.log("No response from RAG API");
      return NextResponse.json(
        { success: false, message: "No response from RAG API" },
        { status: 400 },
      );
    }

    // data.response is the assistant message
    assistantMessage = data.response;
    // we have successfully gotten the assistant message
  } catch (error) {
    console.log("An error happened while trying to chat with the RAG API");
    return NextResponse.json(
      {
        success: false,
        message: "An error happened while trying to chat with the RAG API",
      },
      { status: 400 },
    );
  }

  // store the user and assistant message in the database

  // user first
  const { error: userMessageError } = await supabase
    .from("study_bot_chats")
    .insert({
      profile_id: user?.id,
      bot_id: buddyId,
      is_user_message: true,
      message: messageToSend,
    });

  if (userMessageError) {
    console.log("Couldn't insert user's chat into database");
    return NextResponse.json(
      { success: false, message: "Couldn't insert user's chat into database" },
      { status: 400 },
    );
  }

  // now assistant
  const { error: assistantMessageError } = await supabase
    .from("study_bot_chats")
    .insert({
      profile_id: user?.id,
      bot_id: buddyId,
      is_user_message: false,
      message: assistantMessage,
    });

  if (assistantMessageError) {
    console.log("Couldn't insert assistant's chat into database");
    return NextResponse.json(
      {
        success: false,
        message: "Coudn't insert assistant's chat into database",
      },
      { status: 400 },
    );
  }

  // now decrement the user's chats_remaining by 1 using rpc function
  const { error: rpcError } = await supabase.rpc("decrement_chat_quota", {
    user_id: user?.id,
  });

  if (rpcError) {
    console.log("Couldn't decrement user's chat quota");
    return NextResponse.json(
      { success: false, message: "Couldn't decrement user's chat quota" },
      { status: 400 },
    );
  }

  // success
  return NextResponse.json(
    { success: true, assistantMessage: assistantMessage },
    { status: 200 },
  );
}
