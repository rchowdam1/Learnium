"use client";

import { useState } from "react";

import { ArrowRight, ArrowLeft } from "lucide-react";
import next from "next";

type OptionProps = {
  option: OptionData;
  correct: boolean;
  selected: boolean;
  onSelectAnswer: (selected: string) => void;
  displayCorrectAnswer: boolean;
  previousAnswer?: string;
};

const Option = ({
  option,
  correct,
  selected,
  onSelectAnswer,
  displayCorrectAnswer,
  previousAnswer,
}: OptionProps) => {
  console.log(previousAnswer, "previous answer in option");
  return (
    <div
      className={`w-120 rounded-lg px-5 py-5 border border-gray-300 relative transition-all duration-200 shadow-sm text-left
    ${displayCorrectAnswer ? "" : "cursor-pointer"}
    ${displayCorrectAnswer && !selected && correct ? "bg-green-400" : ""}
    ${
      displayCorrectAnswer && selected
        ? correct
          ? "bg-green-400"
          : "bg-red-300"
        : selected
        ? "bg-blue-300"
        : !displayCorrectAnswer
        ? "hover:bg-gray-300 hover:shadow-md"
        : ""
    }
      ${
        previousAnswer && !correct && previousAnswer === option.option
          ? "bg-red-300"
          : ""
      }
  `}
      onClick={() => {
        if (!displayCorrectAnswer) {
          onSelectAnswer(option.option);
        }
      }}
    >
      <span className="text-left text-gray-600">{option.option}</span>
    </div>
  );
};

type QuestionProps = {
  question: string;
  options: OptionData[];
  correct: string;
  selected: string;
  onSelectAnswer: (selected: string) => void;
  currentQues: number;
  totalQues: number;
  disabled: boolean;
  next: () => void;
  prev: () => void;
  setAnswer: (answer: string) => void;
  displayCorrectAnswers: boolean;
  previousAnswer?: string;
};

const Question = ({
  question,
  options,
  correct,
  selected,
  onSelectAnswer,
  next,
  prev,
  disabled,
  currentQues,
  totalQues,
  displayCorrectAnswers,
  previousAnswer,
}: QuestionProps) => {
  return (
    <div className="w-140 py-4 bg-white rounded-lg shadow-md border border-gray-300 m-5">
      <p className="text-lg font-semibold my-5 break-words max-w-[90%] mx-auto">
        {question}
      </p>
      <div className="flex flex-col space-y-2 justify-center items-center">
        {options.map((option, key) => {
          return (
            <Option
              key={key}
              option={option}
              correct={correct === option.option}
              selected={option.option === selected}
              onSelectAnswer={onSelectAnswer}
              displayCorrectAnswer={displayCorrectAnswers}
              previousAnswer={previousAnswer ?? ""}
            />
          );
        })}
      </div>

      {/*Next and Previous Question Arrows*/}
      <div className="flex justify-center items-center mt-2">
        <div className="flex justiy-center items-center gap-5 mt-2">
          <ArrowLeft
            className="h-6 w-6 rounded-md hover:border hover:border-gray-50 cursor-pointer"
            onClick={prev}
          />
          <span>
            {currentQues}/{totalQues}
          </span>
          <ArrowRight
            className="h-6 w-6 rounded-md hover:border hover:border-gray-50 cursor-pointer"
            onClick={next}
          />
        </div>
      </div>
    </div>
  );
};

type OptionData = {
  optionId: number;
  option: string;
};

type LessonQuizModalProps = {
  quizId: number;
  open: boolean;
  onClose: () => void;
  questions: string[];
  options: OptionData[][]; // options[0] -> the options for question 1
  correctAnswers: string[]; // correctAnswers[0] -> the correct answer for question 1
  onComplete: () => void;
  lessonCompleted: boolean;
  quizSubmitted: boolean;
  previousAnswers?: string[]; // previous answers if the quiz has been submitted before
  fetchedQuizScore?: number;
  lastLesson: boolean;
  displayCompletedSetModal?: () => void;
};

export default function LessonQuizModal({
  quizId,
  open,
  onClose,
  questions,
  options,
  correctAnswers,
  onComplete,
  lessonCompleted,
  quizSubmitted,
  previousAnswers,
  fetchedQuizScore,
  lastLesson,
  displayCompletedSetModal,
}: LessonQuizModalProps) {
  const [currentAnswers, setCurrentAnswers] = useState<string[]>(
    questions.map((question, key) => {
      return "";
    })
  );

  const answersFilled = (): boolean => {
    //console.log("current answers", currentAnswers);

    if (quizSubmitted) {
      return true;
    }

    for (let i = 0; i < currentAnswers.length; i++) {
      if (!currentAnswers[i]) {
        return false;
      }
    }

    return true;
  };
  /*
   * if the user has submitted the quiz, display the correct answers
   */
  //const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // current question
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);

  const correctColors: string[] = ["#cef0c2", "green-400"];
  const incorrectColors: string[] = ["#f0c2c6", "red-400"];

  // state to decide whether to display the correct answers
  const [displayCorrectAnswers, setDisplayCorrectAnswers] =
    useState<boolean>(false);

  // state to get the score from the submission
  const [quizScore, setQuizScore] = useState<number>();

  const onQuizClose = (): void => {
    setCurrentAnswers(
      questions.map((_) => {
        return "";
      })
    );
    setCurrentQuestion(0);
    setDisplayCorrectAnswers(false);
    setQuizScore(undefined);

    /**If it is the last quiz, then the user has just completed the quiz.
     * Pressing continue should lead to the SetCompleteModal to open
     */

    if (lastLesson) {
      // to display the completed set modal and close the current one
      console.log("executed");
      displayCompletedSetModal?.();
    }
    onClose();
  };

  if (!open) {
    return;
  }
  return (
    <div
      className={`fixed inset-0 z-51 flex justify-center items-center transition-all duration-200 ${
        open ? "visible opacity-100 bg-black/80" : "invisible opacity-0"
      }`}
    >
      <div
        className={`bg-white rounded-md z-50 shadow p-6 text-center relative transition-all ${
          open ? "scale-100 opacity-100" : "scale-125 opacity-0"
        } `}
      >
        <span className="text-2xl font-medium">Test your understanding</span>
        <Question
          question={questions[currentQuestion]}
          options={options[currentQuestion]}
          correct={correctAnswers[currentQuestion]}
          selected={currentAnswers[currentQuestion]}
          onSelectAnswer={(select: string) => {
            setCurrentAnswers((prevCurrentAnswers) => {
              const updated = [...prevCurrentAnswers];
              updated[currentQuestion] = select;
              return updated;
            });
          }}
          currentQues={currentQuestion + 1}
          totalQues={questions.length}
          next={() => {
            if (currentQuestion < questions.length - 1) {
              setCurrentQuestion(currentQuestion + 1);
            }
          }}
          prev={() => {
            if (currentQuestion > 0) {
              setCurrentQuestion(currentQuestion - 1);
            }
          }}
          displayCorrectAnswers={quizSubmitted}
          previousAnswer={
            previousAnswers ? previousAnswers[currentQuestion] : ""
          } // if the previous answers are provided, then use them
        />

        {/*Score Note*/}
        {quizSubmitted && (
          <div
            className={`px-3 py-2 b ${
              (fetchedQuizScore ?? quizScore) === questions.length
                ? "bg-green-100 border-green-400"
                : "bg-red-100 border-red-400"
            } rounded-md w-[80%] mx-auto mb-2`}
          >
            <span className="text-gray-600">
              {(fetchedQuizScore ?? quizScore) === questions.length &&
                "Nice Job! "}
              You got {fetchedQuizScore ?? quizScore}/{questions.length}{" "}
              questions correct.
            </span>
          </div>
        )}

        {/*Disable Button */}
        <div>
          <button
            disabled={!answersFilled()}
            className="font-medium text-white bg-black rounded-md py-2 px-3 cursor-pointer hover:bg-gray-700 transition-colors duration-100 disabled:bg-gray-300 disabled:cursor-not-allowed"
            onClick={async () => {
              if (quizSubmitted) {
                // the quiz has been submitted already, then just close
                onQuizClose();
                return;
              }

              /**
               *  the quiz hasn't been submitted yet, now check the answers
               *  at this point the answers have been filled
               */

              setDisplayCorrectAnswers(true);

              //submit
              try {
                // send current answers to let the backend know which options have been selected by the user
                const response = await fetch("/api/mark-lesson-complete", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    quizId: quizId,
                    answers: currentAnswers,
                    options: options,
                  }),
                });

                if (response.ok) {
                  const data = await response.json();

                  if (data.message) {
                    console.log("Already completed quiz");
                    onQuizClose();
                  }
                  if (data.success) {
                    console.log("completed the lesson and quiz");
                    //setQuizSubmitted(true);

                    if (data.quizScore || data.quizScore === 0) {
                      setQuizScore(data.quizScore);
                    }

                    onComplete();
                    //onClose();
                  }
                }
              } catch (error) {
                console.error("Could not complete set");
              }
            }}
          >
            {quizSubmitted ? "Continue" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
