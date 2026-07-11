import type { OutputSchema, SetSource } from "@/app/schema/OutputSchema";
import { normalizeSetOutput } from "@/lib/normalize-set-output";
import type { TopicProfile } from "./analyze-topic";
import type { CurriculumPlan, PlannedLesson } from "./curriculum-plan";
import { batchSizeForScore } from "./complexity-scale";
import { chatJson } from "./openrouter-client";

const MAX_PARALLEL_CONTENT_BATCHES = 6;

export type GenerateSetContentOpts = {
  description: string;
  category?: string;
  plan: CurriculumPlan;
  sources?: SetSource[];
  profile: TopicProfile;
  signal?: AbortSignal;
  onProgress?: (detail: string) => void;
};

function densityGuidance(profile: TopicProfile): string {
  const score = profile.score ?? 5;
  const [pMin, pMax] = profile.paragraphsPerLesson ?? [3, 5];
  const q = profile.questionsPerQuiz ?? 4;

  if (score >= 9) {
    return `ULTRA-DEEP (score ${score}/10): Write ${pMin}–${pMax} dense paragraphs per lesson (each 4–8 sentences). Include precise definitions, intuition, worked examples, edge cases, and common misconceptions. Quiz: exactly ${q} hard questions testing application, multi-step reasoning, and trade-offs — not pure recall. Exam-level distractors.`;
  }
  if (score >= 7) {
    return `DEEP (score ${score}/10): ${pMin}–${pMax} technical paragraphs with mechanisms, pitfalls, and real constraints. Quiz: ${q} application/analysis questions.`;
  }
  if (score <= 3) {
    return `INTRO (score ${score}/10): clear friendly paragraphs (${pMin}–${pMax}). Quiz: ${q} accessible recall + simple application questions.`;
  }
  return `STANDARD (score ${score}/10): solid paragraphs (${pMin}–${pMax}). Mix comprehension and application. Quiz: ${q} questions.`;
}

function contentSystem(profile: TopicProfile): string {
  const q = profile.questionsPerQuiz ?? 4;
  return `You are an elite instructor writing world-class microlearning content.
Generate lessons and quizzes that match the curriculum plan EXACTLY.

Return ONLY valid JSON:
{
  "flagged": false,
  "lessons": [
    {
      "title": "Lesson title (must match plan)",
      "paragraphs": ["paragraph 1", "paragraph 2"],
      "difficulty": 1-5,
      "objectives": ["..."],
      "sourceRefs": [1, 2]
    }
  ],
  "quizzes": [
    {
      "title": "Same as lesson title",
      "questions": [
        {
          "question": "Question text?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "answer": "Option A",
          "difficulty": 1-5,
          "rationale": "Why correct"
        }
      ]
    }
  ],
  "complexity": "${profile.complexity}",
  "passThreshold": 0.75
}

Rules:
- Generate EXACTLY the lessons listed for this batch, matching titles.
- Exactly one quiz per lesson; quiz title = lesson title.
- Each quiz has exactly ${q} questions; each question has exactly 4 options.
- "answer" MUST equal one option string exactly.
- Include difficulty/objectives/sourceRefs from the plan.
- ${densityGuidance(profile)}
- Ground time-sensitive claims in provided sources; use sourceRefs.
- Complete, valid JSON only — never truncate.
- Do NOT invent lessons beyond this batch.`;
}

function formatPlanLessons(lessons: PlannedLesson[]): string {
  return lessons
    .map(
      (l, i) =>
        `${i + 1}. "${l.title}" (difficulty ${l.difficulty}, density ${l.density})
   objectives: ${l.objectives.join("; ")}
   sourceIds: ${l.sourceIds.length ? l.sourceIds.join(", ") : "none"}`,
    )
    .join("\n");
}

function formatSources(sources: SetSource[]): string {
  if (sources.length === 0) return "No external sources.";
  return sources
    .map(
      (s) =>
        `- id=${s.id}: ${s.title} | ${s.url}${s.excerpt ? ` | ${s.excerpt}` : ""}`,
    )
    .join("\n");
}

type PartialSet = {
  flagged?: boolean;
  lessons: OutputSchema["lessons"];
  quizzes: OutputSchema["quizzes"];
};

function extractPartial(raw: unknown): PartialSet {
  const normalized = normalizeSetOutput(raw) as {
    flagged?: boolean;
    lessons?: OutputSchema["lessons"];
    quizzes?: OutputSchema["quizzes"];
  };
  return {
    flagged: Boolean(normalized.flagged),
    lessons: Array.isArray(normalized.lessons) ? normalized.lessons : [],
    quizzes: Array.isArray(normalized.quizzes) ? normalized.quizzes : [],
  };
}

function alignBatch(
  partial: PartialSet,
  planned: PlannedLesson[],
  questionsPerQuiz: number,
): PartialSet {
  if (
    partial.lessons.length !== planned.length ||
    partial.quizzes.length !== planned.length ||
    partial.lessons.some((lesson) => lesson.paragraphs.length === 0) ||
    partial.quizzes.some((quiz) => quiz.questions.length !== questionsPerQuiz)
  ) {
    throw new Error("Generated batch did not include complete lesson and quiz content");
  }

  const lessons = planned.map((p, i) => {
    const gen = partial.lessons[i];
    return {
      title: p.title,
      paragraphs: gen.paragraphs,
      difficulty: p.difficulty,
      objectives: p.objectives,
      sourceRefs:
        gen?.sourceRefs && gen.sourceRefs.length > 0
          ? gen.sourceRefs
          : p.sourceIds.length > 0
            ? p.sourceIds
            : undefined,
    };
  });

  const quizzes = planned.map((p, i) => {
    const gen = partial.quizzes[i];
    return { title: p.title, questions: gen.questions };
  });

  return { flagged: partial.flagged, lessons, quizzes };
}

async function generateBatch(opts: {
  description: string;
  category?: string;
  profile: TopicProfile;
  sources: SetSource[];
  planned: PlannedLesson[];
  priorTitles: string[];
  batchIndex: number;
  batchCount: number;
  signal?: AbortSignal;
}): Promise<PartialSet> {
  const {
    description,
    category,
    profile,
    sources,
    planned,
    priorTitles,
    batchIndex,
    batchCount,
    signal,
  } = opts;

  const q = profile.questionsPerQuiz ?? 4;

  const continuity =
    priorTitles.length > 0
      ? `Other curriculum lessons (do NOT duplicate their coverage):\n${priorTitles
          .slice(-12)
          .map((t, i) => `${i + 1}. ${t}`)
          .join("\n")}\nWrite only the requested batch.`
      : "This is the first batch; start from foundations.";

  const { data } = await chatJson({
    system: contentSystem(profile),
    user: [
      category ? `Category: ${category}` : null,
      `Topic: ${description}`,
      `Score: ${profile.score ?? "?"}/10 · complexity=${profile.complexity} · density=${profile.density}`,
      `Batch ${batchIndex + 1} of ${batchCount} — generate ONLY these ${planned.length} lesson(s) and quiz/quizzes (${q} questions each):`,
      formatPlanLessons(planned),
      continuity,
      `Sources:\n${formatSources(sources)}`,
      "Return a COMPLETE valid JSON object. Do not truncate.",
    ]
      .filter(Boolean)
      .join("\n\n"),
    temperature: 0.5,
    max_tokens: 32_768,
    signal,
    repairOnParseError: true,
    reasoning: { effort: "high", exclude: true },
  });

  return alignBatch(extractPartial(data), planned, q);
}

/**
 * Generate full set content. Batch size scales with complexity score.
 * Score ≥7 → 1 lesson per call for reliability + depth.
 */
export async function generateSetContent(
  opts: GenerateSetContentOpts,
): Promise<OutputSchema> {
  const {
    description,
    category,
    plan,
    sources = [],
    profile,
    signal,
    onProgress,
  } = opts;

  const allPlanned = plan.lessons;
  const size = profile.batchSize ?? batchSizeForScore(profile.score ?? 5);
  const batches: PlannedLesson[][] = [];

  for (let i = 0; i < allPlanned.length; i += size) {
    batches.push(allPlanned.slice(i, i + size));
  }

  const completedBatches: PartialSet[] = new Array(batches.length);
  let flagged = false;
  let nextBatch = 0;
  let completedLessonCount = 0;
  const workerCount = Math.min(MAX_PARALLEL_CONTENT_BATCHES, batches.length);
  const batchController = new AbortController();
  const abortBatches = () => batchController.abort();
  if (signal?.aborted) abortBatches();
  else signal?.addEventListener("abort", abortBatches, { once: true });

  async function runWorker() {
    try {
      while (true) {
        if (batchController.signal.aborted) {
          throw new Error("Generation cancelled");
        }
      const batchIndex = nextBatch++;
      if (batchIndex >= batches.length) return;
      const planned = batches[batchIndex];
      const partial = await generateBatch({
        description,
        category,
        profile,
        sources,
        planned,
        // Batches are independent; use the curriculum plan rather than only
        // completed calls so parallel work cannot reorder or repeat lessons.
        priorTitles: allPlanned.slice(0, batchIndex).map((lesson) => lesson.title),
        batchIndex,
        batchCount: batches.length,
        signal: batchController.signal,
      });
      completedBatches[batchIndex] = partial;
      if (partial.flagged) flagged = true;
      completedLessonCount += planned.length;
      onProgress?.(`Written ${completedLessonCount} of ${allPlanned.length} lessons…`);
      }
    } catch (error) {
      batchController.abort();
      throw error;
    }
  }

  try {
    await Promise.all(Array.from({ length: workerCount }, runWorker));
  } finally {
    signal?.removeEventListener("abort", abortBatches);
  }

  const lessons = completedBatches.flatMap((partial) => partial.lessons);
  const quizzes = completedBatches.flatMap((partial) => partial.quizzes);

  const assembled = {
    flagged,
    lessons,
    quizzes,
    sources: sources.length > 0 ? sources : undefined,
    complexity: plan.overallComplexity || profile.complexity,
    passThreshold: plan.passThreshold ?? 0.75,
  };

  return normalizeSetOutput(assembled) as OutputSchema;
}
