import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

/*
used to fetch the set data such as lessons, paragraphs, quizzes to be displayed on the set page
the set data will be stored in state variables and displayed when 
desired by the user
*/

/**
 * The data returned will be:
 * - lessons (for the setId)
 * - paragraphs (for each lesson)
 * - quizzes (for each lesson)
 * - questions (for each quiz)
 * - options (for each question)
 */

type Option = {
  optionId: number;
  option: string;
  user_answer?: boolean;
};

type Question = {
  id?: number;
  question?: string;
  options?: Option[];
  correctAnswer?: string;
};

type Quiz = {
  quizId: number;
  questions: Question[];
  lessonId: number;
  quizScore?: number;
  previousAnswers?: string[];
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ setId: string }> }
) {
  const supabase = await createClient();

  // use the set id argument passed by the client
  const { setId } = await params; // correct setId

  // get the set title
  const { data: setData, error: setError } = await supabase
    .from("sets")
    .select("*")
    .eq("id", setId)
    .single();

  if (setError) {
    console.log("Could not retrieve the set's title");
  }

  // fetch the lessons
  const { data: lessonData, error: lessonError } = await supabase
    .from("lessons")
    .select("*")
    .eq("set_id", setId);

  if (lessonError) {
    console.log(`Could not get lessons for set ${setId}`);
    return NextResponse.json(
      {
        error: `Could not get lessons for set ${setId}`,
      },
      {
        status: 200,
      }
    );
  }

  // sort the lessons
  for (let i = 0; i < lessonData.length; i++) {
    for (let j = 0; j < lessonData.length - 1; j++) {
      if (lessonData[j].position > lessonData[j + 1].position) {
        //swap
        const temp = lessonData[j];
        lessonData[j] = lessonData[j + 1];
        lessonData[j + 1] = temp;
      }
    }
  }

  // # of completed lessons
  let completed = 0;
  lessonData.forEach((lesson) => {
    if (lesson.completed) {
      completed++;
    }
  });

  // fetch the paragraphs for each lesson
  const paragraphs = await Promise.all(
    lessonData.map(async (lesson, key) => {
      const { data: paragraphData, error: paragraphError } = await supabase
        .from("paragraphs")
        .select("*")
        .eq("lesson_id", lesson.id);

      if (paragraphError) {
        console.log("Could not retrieve paragraph data");
        return {};
      }

      // take the position of the paragraph into account (sort using bubble sort)
      for (let i = 0; i < paragraphData.length; i++) {
        for (let j = 0; j < paragraphData.length - 1; j++) {
          if (paragraphData[j].position > paragraphData[j + 1].position) {
            //swap
            const temp = paragraphData[j + 1];
            paragraphData[j + 1] = paragraphData[j];
            paragraphData[j] = temp;
          }
        }
      }

      return [...paragraphData];
    })
  );

  // to get all of the quizzes go through all of the lessons and get
  // the quizzes associated with their ids
  // the index of the quiz will indicate which lesson it belongs to
  const quizzes: Quiz[] = await Promise.all(
    lessonData.map(async (lesson, key) => {
      const { data: quizData, error: quizError } = await supabase
        .from("quizzes")
        .select("*")
        .eq("lesson_id", lesson.id)
        .select()
        .single();

      if (quizError) {
        console.log("Could not retrieve quiz data");
        return {};
      }

      const quiz: Quiz = {};

      quiz.lessonId = lesson.id;
      quiz.quizId = quizData.id;

      if (quizData) {
        // to store the previous answers if quiz has been completed
        let previousAnswers: string[] = [];

        // also get the quiz score
        if (quizData.completed) {
          quiz.quizScore = quizData.questions_correct;
        }
        // get the question, options, and correct answer
        const { data: questionData, error: questionError } = await supabase
          .from("questions")
          .select("*")
          .eq("quiz_id", quizData.id);

        if (questionError) {
          console.log("Could not retrieve question data");
          return {};
        }

        if (questionData) {
          /**
           * Loop through the questions that belong to this quiz and assign the attributes
           */
          const curQuestions: Question[] = [];
          await Promise.all(
            questionData.map(async (question) => {
              const curQuestion: Question = {};
              curQuestion.question = question.question;
              curQuestion.correctAnswer = question.answer;
              curQuestion.id = question.id;

              /**
               * Loop through the options that belong to this question
               */

              const { data: optionData, error: optionError } = await supabase
                .from("options")
                .select("*")
                .eq("question_id", question.id);

              if (optionError) {
                console.log("Could not retrieve options");
                return;
              }

              if (optionData) {
                // if the quiz has been completed, check which option is the answer
                if (quizData.completed) {
                  // check each option to see if it was selected
                  optionData.forEach((option) => {
                    if (option.user_answer) {
                      previousAnswers.push(option.option);
                    }
                  });
                }

                // sort the questions in random order

                const order: Option[] = [
                  optionData[0] /*.option*/,
                  optionData[1] /*.option*/,
                  optionData[2] /*.option*/,
                  optionData[3] /*.option*/,
                ];

                for (let i = 0; i < 10; i++) {
                  const first = Math.floor(Math.random() * 4);
                  const second = Math.floor(Math.random() * 4);

                  //swap
                  const temp = order[first];
                  order[first] = order[second];
                  order[second] = temp;
                }
                curQuestion.options = order;
                //console.log(curQuestion.options);
                // once the question attributes have been filled, append it to curQuestions
                curQuestions.push(curQuestion);
              }
            })
          );
          quiz.questions = curQuestions;
        }

        // since quiz.previousAnswers is optional
        if (previousAnswers.length > 0) {
          quiz.previousAnswers = previousAnswers;
        }
      }

      return quiz;
    })
  );

  // calculate completed lessons

  return NextResponse.json(
    {
      title: setData.title,
      lessons: lessonData,
      paragraphs: paragraphs,
      completedLessons: completed,
      quizzes: quizzes,
    },
    {
      status: 200,
    }
  );
}
