import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

/**
 * Data received from the request:
 *  bot_id
 *  userMessage
 *  assistantMessage
 *
 *  First store the user message as {
 *      profile_id: user?.id,
 *      bot_id: data.buddyId,
 *      is_user_message: true,
 *      message: data.userMessage
 * }
 *
 *  Then store the assistant message as {
 *      profile_id: user?.id,
 *      bot_id: data.buddyId,
 *      is_user_message: false,
 *      message: data.assistantMessage
 * }
 * */
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.log("User not logged in");
    return NextResponse.json(
      { error: "User is not logged in" },
      {
        status: 500,
      }
    );
  }

  const data = await request.json();

  // insert the user message into the table first

  const { error: userMessageError } = await supabase
    .from("study_bot_chats")
    .insert({
      profile_id: user?.id,
      bot_id: data.buddyId,
      is_user_message: true,
      message: data.userMessage,
    });

  if (userMessageError) {
    console.log("Couldn't insert user's chat into database");
    return NextResponse.json(
      { error: "Couldn't insert user's chat into database" },
      { status: 409 }
    );
  }

  // now insert assistant chat

  const { error: assistantMessageError } = await supabase
    .from("study_bot_chats")
    .insert({
      profile_id: user?.id,
      bot_id: data.buddyId,
      is_user_message: false,
      message: data.assistantMessage,
    });

  if (assistantMessageError) {
    console.log("Couldn't insert assistant's chat into database");
    return NextResponse.json(
      { error: "Couldn't insert assistant's chat into database" },
      {
        status: 409,
      }
    );
  }

  // successfully inserted chat into database
  return NextResponse.json(
    { message: "Successfully inserted chat into database" },
    { status: 200 }
  );
}
