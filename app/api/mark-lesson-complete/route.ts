import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import {
  PASS_THRESHOLD,
  didPass,
  scorePercent,
} from "@/lib/sets/pass";

type OptionData = {
  id?: number;
  optionId?: number;
  option: string;
};

export async function POST(request: Request) {
  const supabase = await createClient();

  const body: { quizId: number; answers: string[]; options: OptionData[][] } =
    await request.json();

  const quizId = body.quizId;

  const { data: quizCheck, error: quizCheckError } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .single();

  if (quizCheckError) {
    console.log("Could not retrieve the quiz");
    return NextResponse.json({ success: false }, { status: 200 });
  }

  if (quizCheck.completed) {
    return NextResponse.json(
      {
        message: "Quiz has already been completed",
        success: true,
        alreadyCompleted: true,
        passed: true,
        quizScore: quizCheck.questions_correct ?? 0,
      },
      { status: 200 },
    );
  }

  // Score first — do not mark completed until the pass threshold is met
  const { data: questionData, error: questionError } = await supabase
    .from("questions")
    .select("*")
    .eq("quiz_id", quizId)
    .order("position", { ascending: true });

  if (questionError || !questionData) {
    console.log("Could not retrieve questions for scoring");
    return NextResponse.json({ success: false }, { status: 200 });
  }

  const totalQuestions = questionData.length;
  let quizScore = 0;

  for (let index = 0; index < body.answers.length; index++) {
    const answer = body.answers[index];
    const question = questionData[index];
    if (!question) continue;

    const isCorrect = question.answer === answer;
    if (isCorrect) {
      quizScore += 1;
    }

    const { error: answerUpdateError } = await supabase
      .from("questions")
      .update({ user_answer: isCorrect })
      .eq("id", question.id);

    if (answerUpdateError) {
      console.log("Could not update question user_answer", answerUpdateError);
    }
  }

  const percent = scorePercent(quizScore, totalQuestions);
  const passed = didPass(quizScore, totalQuestions);

  console.log(
    `The score on this quiz is ${quizScore}/${totalQuestions} (${percent}) passed=${passed}`,
  );

  // Always persist attempt score; optionally attempt_count / last_percent when present
  await saveAttemptInfo(supabase, quizId, quizCheck, quizScore, percent);

  if (!passed) {
    return NextResponse.json(
      {
        success: true,
        passed: false,
        quizScore,
        totalQuestions,
        percent,
        requiredPercent: PASS_THRESHOLD,
        message: "Need 75% to unlock the next lesson",
      },
      { status: 200 },
    );
  }

  // Passed — permanently mark quiz + lesson completed for unlock
  const { data: quizData, error: quizUpdateError } = await supabase
    .from("quizzes")
    .update({ completed: true, questions_correct: quizScore })
    .eq("id", quizId)
    .select()
    .single();

  if (quizUpdateError) {
    console.log("Could not update the quiz");
    return NextResponse.json({ success: false }, { status: 200 });
  }

  const { error: lessonUpdateError } = await supabase
    .from("lessons")
    .update({ completed: true })
    .eq("id", quizData.lesson_id);

  if (lessonUpdateError) {
    console.log("Could not update the lesson");
    return NextResponse.json({ success: false }, { status: 200 });
  }

  return NextResponse.json(
    {
      success: true,
      passed: true,
      quizScore,
      totalQuestions,
      percent,
      requiredPercent: PASS_THRESHOLD,
    },
    { status: 200 },
  );
}

/**
 * Persist attempt stats without marking the quiz completed.
 * `questions_correct` always exists; `attempt_count` / `last_percent` are best-effort
 * so the route keeps working if those columns have not been migrated yet.
 */
async function saveAttemptInfo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  quizId: number,
  quizCheck: Record<string, unknown>,
  quizScore: number,
  percent: number,
) {
  const baseUpdate: Record<string, unknown> = {
    questions_correct: quizScore,
  };

  const priorAttempts =
    typeof quizCheck.attempt_count === "number" ? quizCheck.attempt_count : 0;

  const withOptional: Record<string, unknown> = {
    ...baseUpdate,
    last_percent: percent,
    attempt_count: priorAttempts + 1,
  };

  const { error: optionalError } = await supabase
    .from("quizzes")
    .update(withOptional)
    .eq("id", quizId);

  if (!optionalError) {
    return;
  }

  // Columns may not exist yet — fall back to known columns only
  console.log(
    "Optional quiz attempt columns unavailable; saving questions_correct only",
    optionalError,
  );

  const { error: baseError } = await supabase
    .from("quizzes")
    .update(baseUpdate)
    .eq("id", quizId);

  if (baseError) {
    console.log("Could not update the score of the quiz", baseError);
  }
}
