import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

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
        quizScore: quizCheck.questions_correct ?? 0,
      },
      { status: 200 },
    );
  }

  const { data: quizData, error: quizUpdateError } = await supabase
    .from("quizzes")
    .update({ completed: true })
    .eq("id", quizId)
    .select()
    .single();

  if (quizUpdateError) {
    console.log("Could not update the quiz");
    return NextResponse.json({ success: false }, { status: 200 });
  }

  const { data: questionData, error: questionError } = await supabase
    .from("questions")
    .select("*")
    .eq("quiz_id", quizId)
    .order("position", { ascending: true });

  if (questionError || !questionData) {
    console.log("Could not retrieve questions for scoring");
    return NextResponse.json({ success: false }, { status: 200 });
  }

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

  console.log(`The score on this quiz is ${quizScore}`);

  const { error: quizScoreUpdateError } = await supabase
    .from("quizzes")
    .update({ questions_correct: quizScore })
    .eq("id", quizId);

  if (quizScoreUpdateError) {
    console.log("Could not update the score of the quiz");
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
    { success: true, quizScore },
    { status: 200 },
  );
}
