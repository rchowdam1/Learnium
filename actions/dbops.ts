import { OutputSchema } from "@/app/schema/OutputSchema";
import { createClient } from "@/lib/server";
// create the set with the given parsedResponse
export async function createSet(
  parsedResponse: OutputSchema,
  title: string,
  description: string,
  category: string
): Promise<false | { id: number; lessonCount: number }> {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.log("Could not retrieve authenticated user in actions");
    return false;
  }

  /* 1. create the set
   *  Attributes:
   *     - profile_id
   *     - title
   *     - description
   *     - category
   *     - is_flagged
   */

  const { data: set, error: createSetError } = await supabase
    .from("sets")
    .insert({
      profile_id: user?.id,
      title: title,
      description: description,
      category: category,
      is_flagged: false, // route handler deals with the outcome of flagged set to true upon the request
    })
    .select()
    .single();

  if (createSetError) {
    console.log("Error creating set");
    return false;
  }

  let lessonCount = 0;

  /*
   * For each of the lessons from the input create the lessons, paragraphs, quizzes, questions, and options
   * There will be the same number of lessons and quizzes
   */

  // 2. Create lessons, paragraphs, quizzes, questions, and options
  for (let i = 0; i < parsedResponse.lessons.length; i++) {
    const lesson = parsedResponse.lessons[i];

    const { data: curLesson, error: createLessonError } = await supabase
      .from("lessons")
      .insert({ set_id: set.id, title: lesson.title, position: i })
      .select()
      .single();

    if (createLessonError) {
      console.log("Could not create lesson");
      return false;
    }

    // Paragraphs
    for (let j = 0; j < lesson.paragraphs.length; j++) {
      const paragraph = lesson.paragraphs[j];

      const { error: paragraphError } = await supabase
        .from("paragraphs")
        .insert({ lesson_id: curLesson.id, content: paragraph, position: j });

      if (paragraphError) {
        console.log("Could not create paragraph");
        return false;
      }
    }

    // Quiz
    const currentQuiz = parsedResponse.quizzes[i];
    const { data: quiz, error: createQuizError } = await supabase
      .from("quizzes")
      .insert({ lesson_id: curLesson.id, title: currentQuiz.title })
      .select()
      .single();

    if (createQuizError) {
      console.log("Could not create quiz");
      return false;
    }

    // Questions and Options
    for (let q = 0; q < currentQuiz.questions.length; q++) {
      const question = currentQuiz.questions[q];
      const { data: curQuestion, error: createQuestionError } = await supabase
        .from("questions")
        .insert({
          quiz_id: quiz.id,
          question: question.question,
          answer: question.answer,
          position: q,
        })
        .select()
        .single();

      if (createQuestionError) {
        console.log("Could not create question");
        return false;
      }

      for (let o = 0; o < question.options.length; o++) {
        const option = question.options[o];
        const { error: createOptionError } = await supabase
          .from("options")
          .insert({ question_id: curQuestion.id, option: option, position: o });

        if (createOptionError) {
          console.log("Could not create option");
          return false;
        }
      }
    }

    lessonCount++;
  }

  /*parsedResponse.lessons.forEach(async (lesson, key) => {
   
    const { data: curLesson, error: createLessonError } = await supabase
      .from("lessons")
      .insert({
        set_id: set?.id,
        title: lesson.title,
        position: key,
      })
      .select()
      .single();

    if (createLessonError) {
      console.log("Could not create lesson");
      return false;
    }

   

    // loop through each paragraph per lesson
    lesson.paragraphs.forEach(async (paragraph, key) => {
      const { data: curParagraph, error: paragraphError } = await supabase
        .from("paragraphs")
        .insert({
          lesson_id: curLesson?.id,
          content: paragraph,
          position: key,
        });

      if (paragraphError) {
        console.log("Could not create paragraph");
        return false;
      }
    });

    // assign the corresponding quiz to its lesson
    const currentQuiz = parsedResponse.quizzes[key];
    

    const { data: quiz, error: createQuizError } = await supabase
      .from("quizzes")
      .insert({
        lesson_id: curLesson?.id,
        title: currentQuiz.title, // should be the same as the title of the current lesson
      })
      .select()
      .single();

    if (createQuizError) {
      console.log("Could not create quiz");
      return false;
    }

    // now add the questions to the quiz

    currentQuiz.questions.forEach(async (question, quesKey) => {
     

      const { data: curQuestion, error: createQuestionError } = await supabase
        .from("questions")
        .insert({
          quiz_id: quiz?.id,
          question: question.question,
          answer: question.answer,
          position: quesKey,
        })
        .select()
        .single();

      if (createQuestionError) {
        console.log("Could not create question");
        return false;
      }

      // now need to make the options for each question

      question.options.forEach(async (option, optionKey) => {
        

        const { data: optionData, error: createOptionError } = await supabase
          .from("options")
          .insert({
            question_id: curQuestion?.id,
            option: option,
            position: optionKey,
          });

        if (createOptionError) {
          console.log("Could not create option");
          return false;
        }
      });
    });
  });*/

  return { id: set.id, lessonCount };
}
