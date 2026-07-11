import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import {
  retrieveBuddyContext,
  buildContextPrompt,
  answerWithContext,
  buildChatCitations,
  type ChatCitation,
} from "@/lib/ingest";

export const maxDuration = 120;

/**
 * POST /api/send-chat
 *
 * Pipeline (strict order — AC from Story 2.1 / 2.10):
 *   1. Authenticate
 *   2. Validate input
 *   3. Verify buddy ownership
 *   4. Atomic check-and-claim chat quota (consume_chat_quota RPC)
 *   5. RAG retrieval
 *   6. LLM call
 *   7. Persist chat messages
 *   8. Return success
 *
 * Quota is claimed atomically BEFORE the LLM call.
 * The pre-check and decrement are a single atomic operation — no race window.
 */
export async function POST(request: Request) {
  // ─── Step 1: Parse + Auth ──────────────────────────────────────────
  let reqData: Record<string, unknown>;
  try {
    reqData = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body" },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 },
    );
  }

  // ─── Step 2: Validate input ────────────────────────────────────────
  const messageToSend = String(reqData.userMessage || "").trim();
  const buddyId = Number(reqData.buddyId);
  const rawEmbedding = reqData.queryEmbedding;
  const queryEmbedding = Array.isArray(rawEmbedding)
    ? (rawEmbedding as number[]).map(Number)
    : undefined;

  if (!messageToSend || !Number.isFinite(buddyId)) {
    return NextResponse.json(
      { success: false, message: "buddyId and userMessage are required" },
      { status: 400 },
    );
  }

  if (
    queryEmbedding &&
    (queryEmbedding.length !== 384 ||
      queryEmbedding.some((n) => !Number.isFinite(n)))
  ) {
    return NextResponse.json(
      {
        success: false,
        message: "queryEmbedding must be a 384-d number array",
      },
      { status: 400 },
    );
  }

  // ─── Step 3: Verify ownership ──────────────────────────────────────
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

  // ─── Step 4: Atomic check-and-claim quota ──────────────────────────
  const { data: quotaClaimed, error: quotaError } = await supabase.rpc(
    "consume_chat_quota",
  );

  if (quotaError) {
    console.error("consume_chat_quota error:", quotaError.message);
    return NextResponse.json(
      { success: false, message: "Could not verify chat quota" },
      { status: 500 },
    );
  }

  if (!quotaClaimed) {
    return NextResponse.json(
      {
        success: false,
        message: "No chat quota remaining for today",
        code: "QUOTA_EXHAUSTED",
        retryable: true,
      },
      { status: 429 },
    );
  }

  // ─── Step 5: RAG retrieval ─────────────────────────────────────────
  let assistantMessage: string;
  let citations: ChatCitation[] = [];

  try {
    const chunks = await retrieveBuddyContext({
      supabase,
      profileId: user.id,
      studyBotId: buddyId,
      query: messageToSend,
      matchCount: 8,
      queryEmbedding,
    });

    const context = buildContextPrompt(chunks);
    citations = buildChatCitations(chunks);
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
      { success: false, message, code: "PROVIDER_ERROR", retryable: true },
      { status: 502 },
    );
  }

  // ─── Step 6: Persist chat messages ────────────────────────────────
  const { error: userMsgError } = await supabase
    .from("study_bot_chats")
    .insert({
      profile_id: user.id,
      bot_id: buddyId,
      is_user_message: true,
      message: messageToSend,
    });

  if (userMsgError) {
    console.error("Failed to persist user message:", userMsgError.message);
  }

  const { error: asstMsgError } = await supabase
    .from("study_bot_chats")
    .insert({
      profile_id: user.id,
      bot_id: buddyId,
      is_user_message: false,
      message: assistantMessage,
      citations: citations.length > 0 ? citations : null,
    });

  if (asstMsgError) {
    console.error("Failed to persist assistant message:", asstMsgError.message);
  }

  // ─── Step 7: Return success ────────────────────────────────────────
  return NextResponse.json(
    { success: true, assistantMessage, citations },
    { status: 200 },
  );
}
