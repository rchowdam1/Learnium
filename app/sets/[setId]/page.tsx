"use client";

import AuthNav from "@/app/components/nav/AuthNav";
import LessonBubble from "@/app/components/lessons/LessonBubble";
import LessonChain from "@/app/components/lessons/LessonChain";
import LessonQuizModal from "@/app/components/modals/LessonQuizModal";
import SetCompleteModal from "@/app/components/modals/SetCompleteModal";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import {
  Undo2,
  CircleCheckBig,
  BrainCog,
  SquareChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

type LessonData = {
  id: number;
  created_at: string;
  set_id: number;
  title: string;
  position: number;
};

type ParagraphData = {
  id: number;
  created_at: string;
  lesson_id: number;
  content: string;
  position: number;
};

type OptionData = {
  optionId: number;
  option: string;
};

type QuestionData = {
  question: string;
  options: OptionData[];
  correctAnswer: string;
};

type QuizData = {
  quizId: number;
  questions: QuestionData[];
  lessonId: number;
  quizScore?: number;
  previousAnswers?: string[];
};

type APIResponse = {
  title?: string;
  error?: string;
  lessons?: LessonData[];
  paragraphs?: ParagraphData[][];
  completedLessons?: number;
  quizzes: QuizData[];
};

export default function SetPage({ params }: { params: { setId: string } }) {
  const param = useParams();

  const setId = param.setId;

  // state for set data, and ui styling, formatting
  const [lessons, setLessons] = useState<LessonData[]>();
  // the paragraph data will be set based on which lesson is selected in the UI
  /**
   * paragraphs[0] will be the paragraphs (in order) for lesson 1
   * paragraphs[1] will be the paragraphs for lesson 2, and so on
   */
  const [paragraphs, setParagraphs] = useState<ParagraphData[][]>();
  const [quizzes, setQuizzes] = useState<QuizData[]>();

  // the current lesson
  const [currentLesson, setCurrentLesson] = useState<number>(0);

  const [completedLessons, setCompletedLessons] = useState<number>();

  // the current lesson completed
  const [currentLessonCompleted, setCurrentLessonCompleted] =
    useState<boolean>(false);

  // if the current quiz is completed
  const [currentQuizCompleted, setCurrentQuizCompleted] =
    useState<boolean>(false);

  // an array to show which lessons are completed denoted by the index
  const [lessonComplete, setLessonComplete] = useState<boolean[]>([]);

  const [quizOpen, setQuizOpen] = useState<boolean>(false);

  // the answers to the current quiz if it has been completed or null
  const [previousAnswers, setPreviousAnswers] = useState<string[] | null>(null);

  // to display the completed set modal if the last lesson is completed
  const [completedSetModalOpen, setCompletedSetModalOpen] =
    useState<boolean>(false);

  // title of the set
  const [setTitle, setSetTitle] = useState<string | undefined>();

  useEffect(() => {
    const getSetData = async () => {
      try {
        const response = await fetch(`/api/get-set-data/${setId}`);

        if (response.ok) {
          const data: APIResponse = await response.json();

          if (data.error) {
            toast.error(`Could not fetch data for ${setId}`);
          }

          // set the lessons and paragraphs to state
          if (data.paragraphs && data.lessons) {
            console.log(data);
            setSetTitle(data.title);
            setParagraphs(data.paragraphs);
            setLessons(data.lessons);
            setCompletedLessons(data.completedLessons);
            if (
              data.completedLessons &&
              data.completedLessons === data.lessons.length
            ) {
              setCurrentLesson(0);
            } else if (
              data.completedLessons &&
              currentLesson < data.completedLessons
            ) {
              setCurrentLesson(data.completedLessons);
            }

            if (data.completedLessons) {
              for (let i = 0; i < data.lessons.length; i++) {
                if (i < data.completedLessons) {
                  setLessonComplete((prevLessonComplete) => {
                    return [...prevLessonComplete, true];
                  });
                } else {
                  setLessonComplete((prevLessonComplete) => {
                    return [...prevLessonComplete, false];
                  });
                }
              }
            }

            setQuizzes(data.quizzes);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    getSetData();
  }, []);

  useEffect(() => {
    // check to see if the quiz is completed
    if (completedLessons && currentLesson < completedLessons) {
      setCurrentQuizCompleted(true);
    } else {
      setCurrentQuizCompleted(false);
    }

    if (quizzes) {
      if (quizzes[currentLesson].previousAnswers) {
        setPreviousAnswers(quizzes[currentLesson].previousAnswers);
      }
    }
  }, [currentLesson]);

  return (
    <div className="relative min-h-screen bg-gray-50">
      <AuthNav />
      {/*Back Home Page*/}
      <Link href="/dashboard">
        <div className="absolute top-26 left-10 flex justify-center gap-2 items-center rounded-2xl px-2 py-1 hover:bg-gray-200 transition-colors duration-350 cursor-pointer">
          <Undo2 />
          <span>Return to home</span>
        </div>
      </Link>

      <main className="flex flex-col justify-center lg:flex-row items-center mr-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-40">
          <div className="bg-white shadow-md rounded-lg  w-fit py-16 px-16 overflow-auto h-130 relative lg:right-45 flex flex-col justify-center items-center space-y-5">
            {!lessons &&
              Array(5)
                .fill(0)
                .map((_, key) => {
                  return (
                    <div
                      key={key}
                      className="w-47 h-50 bg-gray-100 animate-pulse"
                    ></div>
                  );
                })}
            {lessons && (
              <LessonChain
                lessons={lessons.length}
                active={currentLesson}
                completed={completedLessons ? completedLessons : 0}
                onLessonClick={(index: number) => {
                  setCurrentLesson(index);
                }}
              />
            )}
          </div>
        </div>

        <div className="pt-40 mb-10">
          <div className="bg-white shadow-md rounded-lg min-h-[24rem] lg:min-h-[32rem] w-full max-w-[38rem] text-center p-5">
            <span className="text-4xl font-bold">
              {lessons && lessons[currentLesson].title}
            </span>
            <br />
            <br />
            <br />
            {!paragraphs &&
              Array(15)
                .fill(0)
                .map((_, key) => {
                  return (
                    <div
                      key={key}
                      className="flex flex-col justify-center items-center space-y-2 mb-1"
                    >
                      <div className="h-5 w-140 animate-pulse bg-gray-100"></div>
                    </div>
                  );
                })}
            {paragraphs &&
              paragraphs[currentLesson].map((paragraph, key) => {
                return (
                  <span key={key}>
                    <span className="text-lg">{paragraph.content}</span> <br />{" "}
                    <br />
                  </span>
                );
              })}

            {/*Complete and Quiz buttons*/}
            {paragraphs && (
              <div className="flex flex-col lg:flex-row justify-center items-center space-x-2">
                <button
                  className="bg-gray-200 px-5 py-2 w-40 rounded-md text-sm flex justify-around items-center transition-colors duration-200 hover:text-white cursor-pointer hover:bg-gray-500"
                  onClick={() => setQuizOpen(true)}
                >
                  <BrainCog className="w-4 h-4" />
                  Take Quiz
                </button>
                {lessons && currentLesson < lessons.length - 1 && (
                  <button
                    disabled={!lessonComplete[currentLesson]}
                    className="text-white bg-black w-40 py-2 rounded-md text-sm flex justify-around items-center transition-colors duration-200 hover:text-black cursor-pointer hover:bg-gray-400 disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                    onClick={() => {
                      setCurrentLesson(currentLesson + 1);
                      setCurrentLessonCompleted(false);
                    }}
                  >
                    Next Lesson
                    <SquareChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        {quizzes && (
          <LessonQuizModal
            quizId={quizzes[currentLesson].quizId}
            open={quizOpen}
            onClose={() => setQuizOpen(false)}
            questions={quizzes[currentLesson].questions.map((question, key) => {
              return question.question;
            })}
            options={quizzes[currentLesson].questions.map((question, key) => {
              return question.options;
            })}
            correctAnswers={quizzes[currentLesson].questions.map(
              (question, key) => {
                return question.correctAnswer;
              }
            )}
            onComplete={async () => {
              setCurrentLessonCompleted(true);

              //mark lesson as completed
              setCompletedLessons((prev) => (prev ?? 0) + 1);
              setLessonComplete((prevLessonComplete) => {
                const updated = [...prevLessonComplete];
                updated[currentLesson] = true;
                return updated;
              });

              setCurrentQuizCompleted(true);

              // if it is the last lesson is the set, then call set complete route
              if (lessons && currentLesson === lessons.length - 1) {
                try {
                  const response = await fetch("/api/mark-set-complete", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ setId: setId }),
                  });

                  if (response.ok) {
                    const data = await response.json();

                    if (data.success) {
                      // marked the set as complete
                      toast.success("Completed Set!");
                      //setCompletedSetModalOpen(true);
                    } else {
                      toast.error("Could not complete set");
                    }
                  }
                } catch (error) {
                  toast.error("Could not complete set.");
                  console.log("Could not mark set as complete");
                }
                //setCompletedSetModalOpen(true);
              }
            }}
            lessonCompleted={currentLessonCompleted}
            quizSubmitted={currentQuizCompleted}
            previousAnswers={previousAnswers ?? undefined}
            fetchedQuizScore={quizzes[currentLesson].quizScore}
            lastLesson={
              (lessons && currentLesson === lessons.length - 1) ?? false
            }
            displayCompletedSetModal={() => setCompletedSetModalOpen(true)}
          />
        )}
        <SetCompleteModal
          open={completedSetModalOpen}
          onClose={() => setCompletedSetModalOpen(false)}
          setTitle={setTitle ?? ""}
        />
      </main>
    </div>
  );
}
