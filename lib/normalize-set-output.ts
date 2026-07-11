/**
 * Free / smaller models often rename fields (correct_answer, etc.) or use
 * option indexes. Normalize before Zod validation.
 */

const DEFAULT_PASS_THRESHOLD = 0.75;

function coerceDifficulty(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return undefined;
  const rounded = Math.round(n);
  if (rounded < 1 || rounded > 5) return undefined;
  return rounded;
}

function coercePassThreshold(value: unknown): number {
  if (value === undefined || value === null || value === "") {
    return DEFAULT_PASS_THRESHOLD;
  }
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return DEFAULT_PASS_THRESHOLD;
  // Accept 0–1 or percent 0–100
  if (n > 1 && n <= 100) return Math.min(1, Math.max(0, n / 100));
  if (n < 0 || n > 1) return DEFAULT_PASS_THRESHOLD;
  return n;
}

function normalizeSource(raw: unknown, index: number): {
  id: number;
  title: string;
  url: string;
  publisher?: string;
  publishedAt?: string;
  excerpt?: string;
  triageScore?: number;
} | null {
  if (!raw || typeof raw !== "object") return null;
  const s = raw as Record<string, unknown>;
  const url = String(s.url ?? s.link ?? s.href ?? "").trim();
  const title = String(s.title ?? s.name ?? "").trim();
  if (!url && !title) return null;
  // Require a URL for usable sources
  if (!url || !/^https?:\/\//i.test(url)) return null;

  const idRaw = s.id ?? s.sourceId ?? s.source_id;
  const id =
    typeof idRaw === "number" && Number.isFinite(idRaw)
      ? idRaw
      : Number.isFinite(Number(idRaw))
        ? Number(idRaw)
        : index + 1;

  const triageRaw = s.triageScore ?? s.triage_score ?? s.score;
  const triageScore =
    triageRaw === undefined || triageRaw === null
      ? undefined
      : Number(triageRaw);

  const out: {
    id: number;
    title: string;
    url: string;
    publisher?: string;
    publishedAt?: string;
    excerpt?: string;
    triageScore?: number;
  } = {
    id,
    title: title || url,
    url,
  };

  const publisher = s.publisher ?? s.source ?? s.site;
  if (typeof publisher === "string" && publisher.trim()) {
    out.publisher = publisher.trim();
  }

  const publishedAt = s.publishedAt ?? s.published_at ?? s.date;
  if (typeof publishedAt === "string" && publishedAt.trim()) {
    out.publishedAt = publishedAt.trim();
  }

  const excerpt = s.excerpt ?? s.snippet ?? s.summary;
  if (typeof excerpt === "string" && excerpt.trim()) {
    out.excerpt = excerpt.trim();
  }

  if (Number.isFinite(triageScore)) {
    out.triageScore = triageScore as number;
  }

  return out;
}

function normalizeStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value
    .map((v) => String(v ?? "").trim())
    .filter(Boolean);
  return items.length > 0 ? items : undefined;
}

function normalizeNumberArray(value: unknown): number[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const items = value
    .map((v) => (typeof v === "number" ? v : Number(v)))
    .filter((n) => Number.isFinite(n));
  return items.length > 0 ? items : undefined;
}

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

        const difficulty = coerceDifficulty(
          l.difficulty ?? l.level ?? l.depth,
        );
        const objectives = normalizeStringArray(
          l.objectives ?? l.goals ?? l.learningObjectives,
        );
        const sourceRefs = normalizeNumberArray(
          l.sourceRefs ?? l.source_refs ?? l.sources,
        );

        const result: Record<string, unknown> = {
          title: String(l.title ?? l.name ?? "Lesson"),
          paragraphs,
        };
        if (difficulty !== undefined) result.difficulty = difficulty;
        if (objectives) result.objectives = objectives;
        if (sourceRefs) result.sourceRefs = sourceRefs;
        return result;
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

  const sourcesRaw = Array.isArray(obj.sources)
    ? obj.sources
    : Array.isArray(obj.citations)
      ? obj.citations
      : Array.isArray(obj.references)
        ? obj.references
        : [];
  const sources = sourcesRaw
    .map((s, i) => normalizeSource(s, i))
    .filter((s): s is NonNullable<typeof s> => s !== null);

  const complexityRaw = obj.complexity ?? obj.depth ?? obj.level;
  const complexity =
    typeof complexityRaw === "string" && complexityRaw.trim()
      ? complexityRaw.trim()
      : undefined;

  const passThreshold = coercePassThreshold(
    obj.passThreshold ?? obj.pass_threshold ?? obj.threshold,
  );

  const result: Record<string, unknown> = {
    lessons,
    quizzes,
    flagged: Boolean(obj.flagged),
    passThreshold,
  };
  if (sources.length > 0) result.sources = sources;
  if (complexity) result.complexity = complexity;
  return result;
}

function normalizeQuestion(question: unknown): {
  question: string;
  options: string[];
  answer: string | undefined;
  difficulty?: number;
  rationale?: string;
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

  const difficulty = coerceDifficulty(q.difficulty ?? q.level);
  const rationaleRaw = q.rationale ?? q.explanation ?? q.reason;
  const rationale =
    typeof rationaleRaw === "string" && rationaleRaw.trim()
      ? rationaleRaw.trim()
      : undefined;

  const result: {
    question: string;
    options: string[];
    answer: string | undefined;
    difficulty?: number;
    rationale?: string;
  } = {
    question: String(q.question ?? q.prompt ?? q.text ?? ""),
    options,
    answer:
      answer === undefined || answer === null || answer === ""
        ? undefined
        : String(answer),
  };
  if (difficulty !== undefined) result.difficulty = difficulty;
  if (rationale) result.rationale = rationale;
  return result;
}
