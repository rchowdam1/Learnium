import { OutputSchema } from "@/app/schema/OutputSchema";
import { createClient } from "@/lib/server";
// create the set with the given parsedResponse
export async function createSet(
  parsedResponse: OutputSchema,
  title: string,
  description: string,
  category: string
) {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.log("Could not retrieve authenticated user in actions");
    return false;
  }

  /* create the set
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

  /*
   * For each of the lessons from the input create the lessons, paragraphs, quizzes, questions, and options
   * There will be the same number of lessons and quizzes
   */

  parsedResponse.lessons.forEach(async (lesson, key) => {
    /*
     *  Create the lessons (contains the paragraphs and quizzes, need to create multiple)
     *  Attributes:
     *    - set_id
     *    - title
     *    - position
     *
     */
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

    /**
     * Create the Paragraphs
     * Attributes:
     *    - lesson_id
     *    - content
     *    - position
     */

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
    /**
     * Now create the quiz
     * Attributes:
     * - lesson_id
     * - title
     */

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
      /**
       * Now create the questions
       * Attributes:
       * - quiz_id
       * - question
       * - answer
       * - position
       */

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
        /**
         * Now create the options
         * Attributes:
         * - question_id
         * - option
         * - position
         */

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
  });

  return true;
}
