"use client";

import AuthNav from "@/app/components/nav/AuthNav";
import LessonChain from "@/app/components/lessons/LessonChain";
import LessonQuizModal from "@/app/components/modals/LessonQuizModal";
import SetCompleteModal from "@/app/components/modals/SetCompleteModal";
import { Button } from "@/app/components/ui/Button";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import { Undo2, BrainCog, SquareChevronRight } from "lucide-react";
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

export default function SetPage() {
  const param = useParams();
  const setId = param.setId;

  const [lessons, setLessons] = useState<LessonData[]>();
  const [paragraphs, setParagraphs] = useState<ParagraphData[][]>();
  const [quizzes, setQuizzes] = useState<QuizData[]>();
  const [currentLesson, setCurrentLesson] = useState<number>(0);
  const [completedLessons, setCompletedLessons] = useState<number>();
  const [currentLessonCompleted, setCurrentLessonCompleted] =
    useState<boolean>(false);
  const [currentQuizCompleted, setCurrentQuizCompleted] =
    useState<boolean>(false);
  const [lessonComplete, setLessonComplete] = useState<boolean[]>([]);
  const [quizOpen, setQuizOpen] = useState<boolean>(false);
  const [previousAnswers, setPreviousAnswers] = useState<string[] | null>(null);
  const [completedSetModalOpen, setCompletedSetModalOpen] =
    useState<boolean>(false);
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

          if (data.paragraphs && data.lessons) {
            setSetTitle(data.title);
            setParagraphs(data.paragraphs);
            setLessons(data.lessons);
            setCompletedLessons(data.completedLessons);
            if (
              data.completedLessons &&
              data.completedLessons === data.lessons.length
            ) {
              setCurrentLesson(0);
            } else if (data.completedLessons) {
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
  }, [setId]);

  useEffect(() => {
    // Use numeric compare so completedLessons === 0 does not falsely reset
    if (
      typeof completedLessons === "number" &&
      currentLesson < completedLessons
    ) {
      setCurrentQuizCompleted(true);
    } else {
      setCurrentQuizCompleted(false);
    }

    if (quizzes?.[currentLesson]?.previousAnswers) {
      setPreviousAnswers(quizzes[currentLesson].previousAnswers);
    } else {
      setPreviousAnswers(null);
    }
  }, [completedLessons, currentLesson, quizzes]);

  const lessonCount = lessons?.length ?? 0;
  const progressLabel =
    lessons && lessonCount > 0
      ? `Lesson ${currentLesson + 1} of ${lessonCount}`
      : "Loading lessons";

  return (
    <div className="relative flex min-h-screen flex-col bg-background text-primary">
      <a
        href="#main-content"
        className="focus-ring sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-xl focus:border focus:border-border focus:bg-surface-raised focus:px-4 focus:py-2 focus:text-primary"
      >
        Skip to content
      </a>

      <AuthNav />

      <main
        id="main-content"
        className="mx-auto w-full max-w-6xl flex-grow px-4 pb-16 pt-8 sm:px-6 lg:px-8"
        tabIndex={-1}
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/dashboard"
            className="focus-ring text-label inline-flex items-center gap-2 rounded-xl px-3 py-2 text-muted transition-colors hover:bg-surface hover:text-primary"
          >
            <Undo2 className="h-4 w-4" />
            <span>Return to home</span>
          </Link>
          {setTitle && (
            <p className="text-caption text-muted sm:text-right">{setTitle}</p>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-[7.5rem_minmax(0,1fr)] lg:items-start lg:gap-8">
          {/* Lesson path rail */}
          <aside className="rounded-xl border border-border bg-surface-raised p-4 lg:sticky lg:top-24">
            <p className="text-label mb-4 text-center text-xs text-muted">
              Path
            </p>
            <div className="flex justify-center overflow-x-auto no-scrollbar">
              {!lessons && (
                <div className="flex flex-row items-center lg:flex-col">
                  {Array(4)
                    .fill(0)
                    .map((_, key) => (
                      <div
                        key={key}
                        className="flex flex-row items-center lg:flex-col"
                      >
                        <div className="h-14 w-14 animate-pulse rounded-full bg-surface" />
                        {key < 3 && (
                          <div className="h-1 w-6 rounded-full bg-surface lg:h-8 lg:w-1" />
                        )}
                      </div>
                    ))}
                </div>
              )}
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
          </aside>

          {/* Reading panel */}
          <section className="flex min-h-[28rem] flex-col rounded-xl border border-border bg-surface-raised p-6 sm:p-8 lg:min-h-[32rem]">
            <div className="mb-6 border-b border-border pb-4">
              <p className="text-label text-numeral mb-2 text-sm text-muted">
                {progressLabel}
              </p>
              <h1 className="text-heading text-2xl text-primary md:text-3xl">
                {lessons ? lessons[currentLesson].title : "Loading…"}
              </h1>
            </div>

            <div className="flex-grow">
              {!paragraphs &&
                Array(6)
                  .fill(0)
                  .map((_, key) => (
                    <div
                      key={key}
                      className="mb-3 h-4 w-full animate-pulse rounded-xl bg-surface"
                      style={{ width: `${88 - key * 6}%` }}
                    />
                  ))}

              {paragraphs && (
                <div className="space-y-5">
                  {paragraphs[currentLesson].map((paragraph) => (
                    <p
                      key={paragraph.id}
                      className="text-body text-base text-primary"
                    >
                      {paragraph.content}
                    </p>
                  ))}
                </div>
              )}
            </div>

            {paragraphs && (
              <div className="mt-8 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
                <Button
                  variant="secondary"
                  className="w-full sm:w-auto"
                  onClick={() => setQuizOpen(true)}
                >
                  <BrainCog className="h-4 w-4" />
                  Take Quiz
                </Button>
                {lessons && currentLesson < lessons.length - 1 && (
                  <Button
                    variant="progress"
                    className="w-full sm:w-auto"
                    disabled={!lessonComplete[currentLesson]}
                    onClick={() => {
                      setCurrentLesson(currentLesson + 1);
                      setCurrentLessonCompleted(false);
                    }}
                  >
                    Next Lesson
                    <SquareChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </section>
        </div>

        {quizzes && (
          <LessonQuizModal
            quizId={quizzes[currentLesson].quizId}
            open={quizOpen}
            onClose={() => setQuizOpen(false)}
            questions={quizzes[currentLesson].questions.map((question) => {
              return question.question;
            })}
            options={quizzes[currentLesson].questions.map((question) => {
              return question.options;
            })}
            correctAnswers={quizzes[currentLesson].questions.map(
              (question) => {
                return question.correctAnswer;
              },
            )}
            onComplete={async () => {
              setCurrentLessonCompleted(true);
              setCompletedLessons((prev) => (prev ?? 0) + 1);
              setLessonComplete((prevLessonComplete) => {
                const updated = [...prevLessonComplete];
                updated[currentLesson] = true;
                return updated;
              });
              setCurrentQuizCompleted(true);

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
                      toast.success("Completed Set!");
                    } else {
                      toast.error("Could not complete set");
                    }
                  }
                } catch {
                  toast.error("Could not complete set.");
                  console.log("Could not mark set as complete");
                }
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
