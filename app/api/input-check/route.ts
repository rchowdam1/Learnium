import { NextResponse } from "next/server";
import OpenAI from "openai";
import { zOutputSchema, type OutputSchema } from "@/app/schema/OutputSchema";
import { createClient } from "@/lib/server";
import { updateSetResetDate } from "@/actions/ProfileUpdates";
import { normalizeSetOutput } from "@/lib/normalize-set-output";
import { freeOpenRouterModel } from "@/lib/openrouter";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "dummy_key",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    "X-Title": "Learnium",
  },
});

const MODEL = freeOpenRouterModel("OPENROUTER_MODEL");

const SYSTEM_PROMPT = `You are a knowledgeable teacher specializing in microlearning sets.
Generate a set of 4-12 lessons with quizzes based on the user's topic description.

Return ONLY valid JSON (no markdown fences) matching this exact shape:

{
  "flagged": false,
  "lessons": [
    {
      "title": "Lesson title",
      "paragraphs": ["paragraph 1", "paragraph 2", "paragraph 3"]
    }
  ],
  "quizzes": [
    {
      "title": "Same as lesson title",
      "questions": [
        {
          "question": "Question text?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "answer": "Option A"
        }
      ]
    }
  ]
}

Rules:
- Generate 4-12 lessons (adjust based on topic breadth).
- Each lesson must have a title and 3-5 non-empty paragraph strings.
- There must be exactly one quiz per lesson (same length arrays), quiz title matching the lesson.
- Each quiz has 3-5 questions; each question has exactly 4 options.
- "answer" is REQUIRED and MUST be the exact string of one of the options (not an index or letter).
- If the topic is unsafe, illegal, unethical, or nonsensical, set "flagged" to true and use empty lessons/quizzes arrays.`;

const RETRY_PROMPT = `Your previous JSON was invalid. Return corrected JSON only.
Every question MUST include an "answer" field whose value is exactly one of that question's "options" strings.
Do not use correct_answer, indexes, or letters like "A". Use the key name "answer".`;

async function generateSetJson(
  description: string,
  extraUserMessage?: string,
): Promise<{ parsed: unknown; usageTokens?: number }> {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `The description given is "${description}". Generate the microlearning set as JSON.`,
    },
  ];

  if (extraUserMessage) {
    messages.push({ role: "user", content: extraUserMessage });
  }

  const completion = await openai.chat.completions.create({
    model: MODEL,
    messages,
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 4096,
  });

  const content = completion.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from model");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    console.error("Failed to parse model JSON:", content.slice(0, 200));
    throw new Error("Failed to parse generated content");
  }

  return {
    parsed,
    usageTokens: completion.usage?.total_tokens,
  };
}

function validateSetOutput(raw: unknown): OutputSchema | null {
  const normalized = normalizeSetOutput(raw);
  const validation = zOutputSchema.safeParse(normalized);
  if (!validation.success) {
    console.error("Schema validation failed:", validation.error.issues);
    return null;
  }
  return validation.data;
}

/**
 * POST /api/input-check
 *
 * Pipeline (strict order — AC from Story 2.1):
 *   1. Parse request body
 *   2. Authenticate
 *   3. Validate input
 *   4. Check quota (read-only, refresh if eligible)
 *   5. Call OpenRouter
 *   6. Normalize + validate output (one retry)
 *   7. Handle flagged content
 *   8. Persist graph atomically (create_set_graph RPC)
 *   9. Consume quota atomically (consume_set_quota RPC)
 *  10. Return success
 *
 * Quota is NEVER consumed before persistence succeeds.
 */
export async function POST(request: Request) {
  // ─── Step 1: Parse body ────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body" },
      { status: 400 },
    );
  }

  const rawTitle = typeof body.title === "string" ? body.title.trim() : "";
  const rawDescription =
    typeof body.description === "string" ? body.description.trim() : "";
  const rawCategory =
    typeof body.category === "string" ? body.category.trim() : "";

  // ─── Step 2: Authenticate ──────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 },
    );
  }

  // ─── Step 3: Validate input ────────────────────────────────────────
  if (!rawTitle || !rawDescription || !rawCategory) {
    return NextResponse.json(
      { success: false, message: "Title, description, and category are required" },
      { status: 400 },
    );
  }

  // Heuristic content checks (preserved from original)
  if (!/[aeiou]{1,}/i.test(rawDescription)) {
    return NextResponse.json(
      { success: false, message: "Description must contain meaningful text" },
      { status: 400 },
    );
  }

  if (/[^aeiou]{7,}/i.test(rawDescription)) {
    return NextResponse.json(
      { success: false, message: "Description contains too many consecutive consonants" },
      { status: 400 },
    );
  }

  if (/(.{3,})\1{1,}/i.test(rawDescription)) {
    return NextResponse.json(
      { success: false, message: "Description contains repeating text" },
      { status: 400 },
    );
  }

  // Title length guard
  if (rawTitle.length > 120) {
    return NextResponse.json(
      { success: false, message: "Title must be under 120 characters" },
      { status: 400 },
    );
  }

  // ─── Step 4: Fetch profile and check quota ─────────────────────────
  const { data: profileData, error: profileError } = await supabase
    .from("profile")
    .select("sets_remaining, sets_refresh_at, is_subscribed")
    .eq("id", user.id)
    .single();

  if (profileError || !profileData) {
    return NextResponse.json(
      { success: false, message: "Could not retrieve profile" },
      { status: 500 },
    );
  }

  // Ensure sets_refresh_at is set
  if (profileData.sets_refresh_at === null) {
    await updateSetResetDate();
  }

  // Check if quota needs a daily refresh
  const today = new Date().toISOString().split("T")[0];
  const refreshAt = profileData.sets_refresh_at
    ? profileData.sets_refresh_at.split("T")[0]
    : null;

  if (profileData.sets_remaining === 0 && refreshAt && refreshAt <= today) {
    // Refresh quota for the new day
    const refreshCount = profileData.is_subscribed ? 5 : 1;
    const { error: refreshError } = await supabase
      .from("profile")
      .update({
        sets_remaining: refreshCount,
        sets_refresh_at: new Date(
          new Date(today).getTime() + 86400000,
        ).toISOString(),
      })
      .eq("id", user.id);

    if (refreshError) {
      return NextResponse.json(
        { success: false, message: "Could not refresh quota" },
        { status: 500 },
      );
    }
  }

  // Re-read quota after potential refresh
  const { data: refreshedProfile } = await supabase
    .from("profile")
    .select("sets_remaining")
    .eq("id", user.id)
    .single();

  if (!refreshedProfile || refreshedProfile.sets_remaining <= 0) {
    return NextResponse.json(
      {
        success: false,
        message: "No set generation quota remaining for today",
        code: "QUOTA_EXHAUSTED",
        retryable: true,
      },
      { status: 429 },
    );
  }

  // ─── Step 5: Call OpenRouter ───────────────────────────────────────
  let parsedResponse: OutputSchema | null = null;
  let usageTokens: number | undefined;

  try {
    const { parsed, usageTokens: tokens } =
      await generateSetJson(rawDescription);
    usageTokens = tokens;
    parsedResponse = validateSetOutput(parsed);

    // One correction retry
    if (!parsedResponse) {
      console.warn("Retrying set generation after schema validation failure");
      const retry = await generateSetJson(rawDescription, RETRY_PROMPT);
      usageTokens = retry.usageTokens;
      parsedResponse = validateSetOutput(retry.parsed);
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("OpenRouter API error:", message);
    return NextResponse.json(
      {
        success: false,
        message: "AI provider error — please try again",
        code: "PROVIDER_ERROR",
        retryable: true,
      },
      { status: 502 },
    );
  }

  // ─── Step 6: Validate output ───────────────────────────────────────
  if (!parsedResponse) {
    return NextResponse.json(
      {
        success: false,
        message: "Generated content failed quality validation — please try again",
        code: "VALIDATION_FAILED",
        retryable: true,
      },
      { status: 422 },
    );
  }

  // ─── Step 7: Handle flagged content ────────────────────────────────
  if (parsedResponse.flagged) {
    const { error: flagError } = await supabase.from("flagged").insert({
      profile_id: user.id,
      profile_email: user.email,
      query: rawDescription,
    });
    if (flagError) {
      console.error("Failed to log flagged query:", flagError.message);
    }
    return NextResponse.json(
      {
        success: false,
        message: "Could not process your request",
        code: "CONTENT_FLAGGED",
        retryable: false,
      },
      { status: 422 },
    );
  }

  // ─── Step 8: Persist graph atomically ─────────────────────────────
  const graphData = {
    title: rawTitle,
    description: rawDescription,
    category: rawCategory,
    lessons: parsedResponse.lessons,
    quizzes: parsedResponse.quizzes,
  };

  const { data: setId, error: graphError } = await supabase.rpc(
    "create_set_graph_with_quota",
    { graph_data: graphData },
  );

  if (graphError || !setId) {
    if (graphError?.message.includes("QUOTA_EXHAUSTED")) {
      return NextResponse.json({ success: false, message: "No set generation quota remaining for today", code: "QUOTA_EXHAUSTED", retryable: true }, { status: 429 });
    }
    console.error("create_set_graph failed:", graphError?.message);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to save generated set",
        code: "PERSISTENCE_ERROR",
        retryable: true,
      },
      { status: 500 },
    );
  }

  // Quota decrement and graph persistence are one database transaction.
  console.log(
    `Set ${setId} generated with model ${MODEL}: ${usageTokens ?? "?"} tokens used`,
  );

  return NextResponse.json({
    success: true,
    setId,
    parsedResponse,
  });
}
