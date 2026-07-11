/**
 * Free / smaller models often rename fields (correct_answer, etc.) or use
 * option indexes. Normalize before Zod validation.
 */
export function normalizeSetOutput(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;

  const obj = raw as Record<string, unknown>;

  const lessons = Array.isArray(obj.lessons)
    ? obj.lessons.map((lesson) => {
        if (!lesson || typeof lesson !== "object") {
          return { title: "", paragraphs: [] };
        }
        const l = lesson as Record<string, unknown>;
        const paragraphs = Array.isArray(l.paragraphs)
          ? l.paragraphs.map((p) => String(p ?? "")).filter(Boolean)
          : Array.isArray(l.content)
            ? l.content.map((p) => String(p ?? "")).filter(Boolean)
            : typeof l.content === "string"
              ? [l.content]
              : [];
        return {
          title: String(l.title ?? l.name ?? "Lesson"),
          paragraphs,
        };
      })
    : [];

  const quizzes = Array.isArray(obj.quizzes)
    ? obj.quizzes.map((quiz) => {
        if (!quiz || typeof quiz !== "object") {
          return { title: "", questions: [] };
        }
        const qz = quiz as Record<string, unknown>;
        const questions = Array.isArray(qz.questions) ? qz.questions : [];
        return {
          title: String(qz.title ?? qz.name ?? "Quiz"),
          questions: questions.map((question) =>
            normalizeQuestion(question),
          ),
        };
      })
    : [];

  return {
    lessons,
    quizzes,
    flagged: Boolean(obj.flagged),
  };
}

function normalizeQuestion(question: unknown): {
  question: string;
  options: string[];
  answer: string | undefined;
} {
  if (!question || typeof question !== "object") {
    return { question: "", options: [], answer: undefined };
  }

  const q = question as Record<string, unknown>;
  const options = Array.isArray(q.options)
    ? q.options.map((o) => String(o ?? "")).filter(Boolean)
    : Array.isArray(q.choices)
      ? q.choices.map((o) => String(o ?? "")).filter(Boolean)
      : [];

  let answer: unknown =
    q.answer ??
    q.correct_answer ??
    q.correctAnswer ??
    q.correct ??
    q.correctOption ??
    q.correct_option;

  if (typeof answer === "number" && options[answer] !== undefined) {
    answer = options[answer];
  } else if (typeof answer === "string" && options.length > 0) {
    const trimmed = answer.trim();
    const letter = trimmed.match(/^[A-Da-d]$/);
    if (letter) {
      const idx = letter[0].toUpperCase().charCodeAt(0) - 65;
      if (options[idx]) answer = options[idx];
    } else if (/^[1-4]$/.test(trimmed) && options[Number(trimmed) - 1]) {
      answer = options[Number(trimmed) - 1];
    } else if (!options.includes(trimmed)) {
      // Model sometimes returns "A) text" — try matching by option text
      const match = options.find(
        (opt) =>
          opt === trimmed ||
          trimmed.endsWith(opt) ||
          opt.endsWith(trimmed.replace(/^[A-Da-d][).:\s]+/, "")),
      );
      if (match) answer = match;
    }
  }

  // Last resort: look for an option marked as correct in nested objects
  if (answer === undefined || answer === null || answer === "") {
    const marked = options.find((_, i) => {
      const opt = Array.isArray(q.options) ? q.options[i] : null;
      return (
        opt &&
        typeof opt === "object" &&
        (opt as Record<string, unknown>).correct === true
      );
    });
    if (marked) answer = marked;
  }

  return {
    question: String(q.question ?? q.prompt ?? q.text ?? ""),
    options,
    answer:
      answer === undefined || answer === null || answer === ""
        ? undefined
        : String(answer),
  };
}
