import { NextResponse } from "next/server";
import OpenAI from "openai";
import { zOutputSchema, type OutputSchema } from "@/app/schema/OutputSchema";
import { createClient } from "@/lib/server";
import { createSet } from "@/actions/dbops";
import {
  decrementRequests,
  resetSets,
  updateSetResetDate,
} from "@/actions/ProfileUpdates";
import { normalizeSetOutput } from "@/lib/normalize-set-output";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "dummy_key",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    "X-Title": "Learnium",
  },
});

// Default to a free model; override via env for production
const MODEL =
  process.env.OPENROUTER_MODEL ||
    "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free";

const SYSTEM_PROMPT = `You are a knowledgeable teacher specializing in microlearning sets.
Generate a set of 3-5 lessons with quizzes based on the user's topic description.

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

export async function POST(request: Request) {
  const data = await request.json();

  // heuristic regex checks
  const description = data.description.trim();

  // check if description contains any vowels
  if (!/[aeiou]{1,}/i.test(description)) {
    return NextResponse.json(
      { error: "Description doesn't contain a vowel" },
      { status: 200 },
    );
  }

  // check if description contains too many consonants
  if (/[^aeiou]{7,}/i.test(description)) {
    return NextResponse.json(
      { error: "Description contains 7 or more consective consonants" },
      { status: 200 },
    );
  }

  if (/(.{3,})\1{1,}/i.test(description)) {
    return NextResponse.json(
      { error: "Description contains repeating words" },
      { status: 200 },
    );
  }

  // check if user has remaining set requests
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profileData, error: profileError } = await supabase
    .from("profile")
    .select("*")
    .eq("id", user?.id)
    .single();

  if (profileError) {
    console.log("Could not retrieve profile");
    return NextResponse.json(
      { error: "Could not retrieve profile" },
      { status: 200 },
    );
  }

  // if 'sets_refresh_at' is null, set to today
  if (profileData.sets_refresh_at === null) {
    const result = await updateSetResetDate();
    if (result.success === false) {
      console.log("Could not update the set reset date");
    }
  }

  // check if sets need resetting
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
        { status: 200 },
      );
    }
    result = await resetSets();
    if (result.success === false) {
      return NextResponse.json(
        { error: "Could not reset the remaining set requests" },
        { status: 200 },
      );
    }
  }

  // Decrement quota before LLM call
  const result = await decrementRequests();
  if (result.success === false) {
    if (result.message === "User does not have any set requests remaining") {
      return NextResponse.json({ error: result.message }, { status: 200 });
    }
    return NextResponse.json(
      { error: "An error occurred while trying to decrease 'sets_remaining'" },
      { status: 200 },
    );
  }

  try {
    let { parsed, usageTokens } = await generateSetJson(description);
    let parsedResponse = validateSetOutput(parsed);

    // One retry with a stricter correction prompt if schema still fails
    if (!parsedResponse) {
      console.warn("Retrying set generation after schema validation failure");
      const retry = await generateSetJson(description, RETRY_PROMPT);
      parsed = retry.parsed;
      usageTokens = retry.usageTokens;
      parsedResponse = validateSetOutput(parsed);
    }

    if (!parsedResponse) {
      return NextResponse.json(
        {
          error:
            "Generated content failed quality validation — please try again",
        },
        { status: 500 },
      );
    }

    if (parsedResponse.flagged) {
      const { error } = await supabase.from("flagged").insert({
        profile_id: user?.id,
        profile_email: user?.email,
        query: data.description,
      });
      if (error) {
        console.log("Flagged Response, but couldn't add it to db");
      }
      return NextResponse.json(
        { error: "Could not process your request" },
        { status: 200 },
      );
    }

    // Create the set in database
    const title = data.title;
    const category = data.category;
    const createResult = await createSet(
      parsedResponse,
      title,
      description,
      category,
    );

    if (createResult === false) {
      return NextResponse.json(
        {
          success: false,
          message: "Set creation in the database was unsuccessful",
        },
        { status: 400 },
      );
    }

    console.log(
      `Set generated with model ${MODEL}: ${usageTokens} tokens used`,
    );

    return NextResponse.json({
      parsedResponse,
      setId: createResult.id,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("OpenRouter API error:", message);
    return NextResponse.json(
      { error: "AI provider error — please try again" },
      { status: 500 },
    );
  }
}
