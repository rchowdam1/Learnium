"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/app/components/ui/Button";

type OptionData = {
  id?: number;
  optionId?: number;
  option: string;
};

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
  const wasPreviousWrong =
    Boolean(previousAnswer) &&
    !correct &&
    previousAnswer === option.option;

  let stateClass =
    "border-border-interactive bg-surface-raised text-primary hover:bg-surface";

  if (displayCorrectAnswer) {
    if (correct) {
      stateClass = "border-accent bg-accent text-on-accent";
    } else if (selected || wasPreviousWrong) {
      stateClass = "border-error bg-surface text-error";
    } else {
      stateClass = "border-border bg-surface text-muted";
    }
  } else if (selected) {
    stateClass = "border-brand bg-surface text-primary";
  }

  return (
    <button
      type="button"
      className={`focus-ring relative w-full max-w-xl rounded-xl border px-5 py-5 text-left text-body transition-all duration-200 ${
        displayCorrectAnswer ? "" : "cursor-pointer"
      } ${stateClass}`}
      onClick={() => {
        if (!displayCorrectAnswer) {
          onSelectAnswer(option.option);
        }
      }}
    >
      <span className="block text-left">{option.option}</span>
    </button>
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
  next: () => void;
  prev: () => void;
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
  currentQues,
  totalQues,
  displayCorrectAnswers,
  previousAnswer,
}: QuestionProps) => {
  return (
    <div className="m-5 w-full max-w-xl rounded-xl border border-border bg-surface py-4">
      <p className="text-heading mx-auto my-5 max-w-[90%] break-words text-lg text-primary">
        {question}
      </p>
      <div className="flex flex-col items-center justify-center space-y-2 px-4">
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

      <div className="mt-2 flex items-center justify-center">
        <div className="mt-2 flex items-center justify-center gap-5">
          <button
            type="button"
            onClick={prev}
            aria-label="Previous question"
            className="focus-ring cursor-pointer rounded-xl p-1 text-primary transition-colors hover:bg-surface"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <span className="text-numeral text-sm text-muted">
            {currentQues}/{totalQues}
          </span>
          <button
            type="button"
            onClick={next}
            aria-label="Next question"
            className="focus-ring cursor-pointer rounded-xl p-1 text-primary transition-colors hover:bg-surface"
          >
            <ArrowRight className="h-6 w-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

type LessonQuizModalProps = {
  quizId: number;
  open: boolean;
  onClose: () => void;
  questions: string[];
  options: OptionData[][];
  correctAnswers: string[];
  onComplete: () => void;
  lessonCompleted: boolean;
  quizSubmitted: boolean;
  previousAnswers?: string[];
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
  quizSubmitted,
  previousAnswers,
  fetchedQuizScore,
  lastLesson,
  displayCompletedSetModal,
}: LessonQuizModalProps) {
  const [currentAnswers, setCurrentAnswers] = useState<string[]>(() =>
    questions.map(() => ""),
  );
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [displayCorrectAnswers, setDisplayCorrectAnswers] = useState(false);
  const [quizScore, setQuizScore] = useState<number | undefined>(undefined);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const wasOpenRef = useRef(false);

  // Initialize only when the modal opens (not on every parent re-render)
  useEffect(() => {
    if (open && !wasOpenRef.current) {
      if (quizSubmitted) {
        setHasSubmitted(true);
        setDisplayCorrectAnswers(true);
        setQuizScore(
          typeof fetchedQuizScore === "number" ? fetchedQuizScore : undefined,
        );
        setCurrentAnswers(
          previousAnswers?.length
            ? previousAnswers
            : questions.map(() => ""),
        );
      } else {
        setHasSubmitted(false);
        setDisplayCorrectAnswers(false);
        setQuizScore(undefined);
        setCurrentAnswers(questions.map(() => ""));
        setCurrentQuestion(0);
      }
      setIsSubmitting(false);
    }

    if (!open && wasOpenRef.current) {
      setHasSubmitted(false);
      setDisplayCorrectAnswers(false);
      setQuizScore(undefined);
      setIsSubmitting(false);
      setCurrentQuestion(0);
    }

    wasOpenRef.current = open;
  }, [open, quizSubmitted, fetchedQuizScore, previousAnswers, questions]);

  // If parent marks the quiz submitted while open, keep results visible
  useEffect(() => {
    if (open && quizSubmitted) {
      setHasSubmitted(true);
      setDisplayCorrectAnswers(true);
      if (typeof fetchedQuizScore === "number") {
        setQuizScore(fetchedQuizScore);
      }
    }
  }, [open, quizSubmitted, fetchedQuizScore]);

  const submitted = hasSubmitted || quizSubmitted;

  const answersFilled = (): boolean => {
    if (submitted) return true;
    return currentAnswers.every((answer) => Boolean(answer));
  };

  const finishAndClose = () => {
    setCurrentAnswers(questions.map(() => ""));
    setCurrentQuestion(0);
    setDisplayCorrectAnswers(false);
    setQuizScore(undefined);
    setHasSubmitted(false);
    setIsSubmitting(false);

    if (lastLesson) {
      displayCompletedSetModal?.();
    }
    onClose();
  };

  if (!open) {
    return null;
  }

  const score = fetchedQuizScore ?? quizScore;
  const perfect = score === questions.length;

  const handleSubmit = async () => {
    if (submitted) {
      finishAndClose();
      return;
    }

    if (isSubmitting || !answersFilled()) return;

    setIsSubmitting(true);
    setDisplayCorrectAnswers(true);

    try {
      const response = await fetch("/api/mark-lesson-complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          quizId,
          answers: currentAnswers,
          options: options.map((questionOptions) =>
            questionOptions.map((option) => ({
              id: option.id ?? option.optionId,
              option: option.option,
            })),
          ),
        }),
      });

      if (!response.ok) {
        setIsSubmitting(false);
        return;
      }

      const data = await response.json();

      // Already completed in DB — keep modal open and show results
      if (data.message || data.alreadyCompleted) {
        setHasSubmitted(true);
        if (typeof data.quizScore === "number") {
          setQuizScore(data.quizScore);
        } else if (typeof fetchedQuizScore === "number") {
          setQuizScore(fetchedQuizScore);
        }
        onComplete();
        setIsSubmitting(false);
        return;
      }

      if (data.success) {
        if (typeof data.quizScore === "number") {
          setQuizScore(data.quizScore);
        }
        setHasSubmitted(true);
        onComplete();
      }
    } catch {
      console.error("Could not complete quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ backgroundColor: "var(--overlay)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          // Backdrop dismiss only before submit; after submit require Continue
          if (!submitted) onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quiz-modal-title"
        className="relative z-50 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface-raised p-6 text-center text-primary shadow-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="quiz-modal-title"
          className="text-heading text-xl font-bold text-primary md:text-2xl"
        >
          Test your understanding
        </h2>
        <Question
          question={questions[currentQuestion]}
          options={options[currentQuestion]}
          correct={correctAnswers[currentQuestion]}
          selected={currentAnswers[currentQuestion]}
          onSelectAnswer={(select: string) => {
            if (submitted) return;
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
          displayCorrectAnswers={displayCorrectAnswers || submitted}
          previousAnswer={
            previousAnswers ? previousAnswers[currentQuestion] : ""
          }
        />

        {submitted && typeof score === "number" && (
          <div
            className={`mx-auto mb-4 w-[80%] rounded-xl border px-3 py-2 ${
              perfect ? "border-accent bg-surface" : "border-error bg-surface"
            }`}
          >
            <span className="text-body text-primary">
              {perfect && "Nice Job! "}
              You got{" "}
              <span className="text-numeral">
                {score}/{questions.length}
              </span>{" "}
              questions correct.
            </span>
          </div>
        )}

        <div className="flex justify-center">
          <Button
            variant={submitted ? "progress" : "primary"}
            disabled={!answersFilled() || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? "Submitting..." : submitted ? "Continue" : "Submit"}
          </Button>
        </div>
      </div>
    </div>
  );
}
