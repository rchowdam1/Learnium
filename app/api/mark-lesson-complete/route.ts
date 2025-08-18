import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

type OptionData = {
  id: number;
  option: string;
};

export async function POST(request: Request) {
  const supabase = await createClient();

  // get the set id from request
  const body: { quizId: number; answers: string[]; options: OptionData[][] } =
    await request.json();

  const quizId = body.quizId;

  // mark the quiz and lesson complete
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
      { message: "Quiz has already been completed" },
      { status: 200 }
    );
  }

  const { data: quizData, error: quizUpdateError } = await supabase
    .from("quizzes")
    .update({ completed: true })
    .eq("id", quizId)
    .select()
    .single();

  if (quizUpdateError) {
    console.log("Could not retrieve the quiz");
    return NextResponse.json({ success: false }, { status: 200 });
  }

  let quizScore: number = 0;
  // update the options (options.user_answer)

  for (let index = 0; index < body.answers.length; index++) {
    const answer = body.answers[index];
    const quesOptions: OptionData[] = body.options[index];

    for (const option of quesOptions) {
      if (option.option === answer) {
        // this option was selected
        const { data: optionData, error: optionError } = await supabase
          .from("options")
          .update({ user_answer: true })
          .eq("id", option.id)
          .select()
          .single();

        if (optionError) {
          console.log(optionError);
        }

        // then calculate the score of the quiz (quizzes.questions_correct)
        const { data: questionData, error: questionError } = await supabase
          .from("questions")
          .select("*")
          .eq("id", optionData.question_id)
          .single();

        if (questionError) {
          console.log("There was an error trying to fetch the question");
        }

        if (questionData && questionData.answer === answer) {
          quizScore += 1;
        }
      } else {
        // this option was not selected
        const { error: optionError } = await supabase
          .from("options")
          .update({ user_answer: false })
          .eq("id", option.id)
          .select()
          .single();

        if (optionError) {
          console.log(optionError);
        }
      }
    }
  }

  console.log(`The score on this quiz is ${quizScore}`);

  // update quizzes.questions_correct
  const { error: quizScoreUpdateError } = await supabase
    .from("quizzes")
    .update({ questions_correct: quizScore })
    .eq("id", quizId);
  // works, now send to frontend and display on quiz completion

  if (quizScoreUpdateError) {
    console.log("Could not update the score of the quiz");
    return NextResponse.json({ success: false }, { status: 200 });
  }

  // update the lesson
  const { error: lessonUpdateError } = await supabase
    .from("lessons")
    .update({ completed: true })
    .eq("id", quizData.lesson_id);

  if (lessonUpdateError) {
    console.log("Could not retrieve the lesson");
    return NextResponse.json({ success: false }, { status: 200 });
  }

  return NextResponse.json(
    { success: true, quizScore: quizScore },
    { status: 200 }
  );
}
