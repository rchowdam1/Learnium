import type { SetSource } from "@/app/schema/OutputSchema";
import type { TopicProfile } from "./analyze-topic";
import { chatJson } from "./openrouter-client";

export type PlannedLesson = {
  title: string;
  objectives: string[];
  difficulty: number;
  density: "light" | "standard" | "dense";
  sourceIds: number[];
};

export type CurriculumPlan = {
  lessons: PlannedLesson[];
  overallComplexity: string;
  passThreshold: number;
};

export type PlanCurriculumOpts = {
  description: string;
  category?: string;
  profile: TopicProfile;
  sources?: SetSource[];
  signal?: AbortSignal;
};

const SYSTEM = `You are an expert instructional designer creating a progressive microlearning curriculum.

Return ONLY valid JSON:
{
  "lessons": [
    {
      "title": "string",
      "objectives": ["learning objective 1", "objective 2"],
      "difficulty": 1-5,
      "density": "light" | "standard" | "dense",
      "sourceIds": [1, 2]
    }
  ],
  "overallComplexity": "intro|intermediate|advanced|expert",
  "passThreshold": 0.75
}

Rules:
- Lesson count MUST match the requested count exactly (or as close as possible).
- difficulty is an integer 1–5 and MUST be nondecreasing across the sequence.
- Start with foundations; end with synthesis/application/mastery.
- Each lesson needs 1–4 concrete, measurable objectives.
- density should match the profile; early lessons may be slightly lighter.
- sourceIds reference provided source ids when available.
- Titles must be specific and teachable in one focused session.
- passThreshold defaults to 0.75.
- For long curricula (20–50 lessons), ensure coverage without huge gaps or pure repetition.`;

function clampDifficulty(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.min(5, Math.max(1, Math.round(n)));
}

function asDensity(
  v: unknown,
  fallback: PlannedLesson["density"],
): PlannedLesson["density"] {
  const s = String(v ?? "").toLowerCase();
  if (s === "light" || s === "standard" || s === "dense") return s;
  return fallback;
}

function enforceNondecreasing(lessons: PlannedLesson[]): PlannedLesson[] {
  let floor = 1;
  return lessons.map((lesson) => {
    const d = Math.max(floor, clampDifficulty(lesson.difficulty));
    floor = d;
    return { ...lesson, difficulty: d };
  });
}

function parseLessons(
  raw: unknown,
  profile: TopicProfile,
  sources: SetSource[],
): PlannedLesson[] {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const validSourceIds = new Set(sources.map((s) => s.id));
  const list = Array.isArray(obj.lessons) ? obj.lessons : [];

  return list.map((item, i) => {
    const l = (item && typeof item === "object" ? item : {}) as Record<
      string,
      unknown
    >;
    const objectives = Array.isArray(l.objectives)
      ? l.objectives
          .map((o) => String(o ?? "").trim())
          .filter(Boolean)
          .slice(0, 4)
      : [];
    const rawSourceIds = l.sourceIds ?? l.source_ids;
    const sourceIds = Array.isArray(rawSourceIds)
      ? rawSourceIds
          .map((id) => Number(id))
          .filter((id) => Number.isFinite(id) && validSourceIds.has(id))
      : [];

    return {
      title:
        String(l.title ?? l.name ?? `Lesson ${i + 1}`).trim() ||
        `Lesson ${i + 1}`,
      objectives:
        objectives.length > 0
          ? objectives
          : [`Understand core ideas of lesson ${i + 1}`],
      difficulty: clampDifficulty(Number(l.difficulty ?? 1)),
      density: asDensity(l.density, profile.density),
      sourceIds,
    };
  });
}

function scaffoldLessons(
  profile: TopicProfile,
  sources: SetSource[],
  count: number,
): PlannedLesson[] {
  const n = Math.min(50, Math.max(4, count));
  const lessons: PlannedLesson[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / Math.max(1, n - 1);
    lessons.push({
      title: profile.subtopics[i] || `Module ${i + 1}: Deep dive`,
      objectives: [
        `Master the concepts required for stage ${i + 1} of this path`,
      ],
      difficulty: clampDifficulty(1 + Math.floor(t * 4)),
      density: profile.density,
      sourceIds: sources.slice(0, 2).map((s) => s.id),
    });
  }
  return lessons;
}

function finalizeLessons(
  lessonsIn: PlannedLesson[],
  profile: TopicProfile,
  sources: SetSource[],
): PlannedLesson[] {
  let lessons = lessonsIn;
  const target = Math.min(50, Math.max(4, profile.estimatedLessons));

  if (lessons.length === 0) {
    lessons = scaffoldLessons(profile, sources, target);
  }

  if (lessons.length > target) {
    lessons = lessons.slice(0, target);
  }

  lessons = enforceNondecreasing(lessons).slice(0, 50);

  while (lessons.length < Math.min(4, target)) {
    const i = lessons.length;
    const prev = lessons[i - 1];
    lessons.push({
      title: `Synthesis ${i + 1}`,
      objectives: ["Integrate prior lessons"],
      difficulty: prev?.difficulty ?? 3,
      density: profile.density,
      sourceIds: [],
    });
  }

  // Pad up to target with synthesis/extension if model returned too few
  while (lessons.length < target) {
    const i = lessons.length;
    const prev = lessons[i - 1];
    lessons.push({
      title: `Advanced extension ${i + 1}`,
      objectives: ["Deepen and apply prior modules"],
      difficulty: Math.min(5, (prev?.difficulty ?? 3) + (i % 3 === 0 ? 1 : 0)),
      density: profile.density,
      sourceIds: [],
    });
  }

  return enforceNondecreasing(lessons).slice(0, target);
}

async function planChunk(
  opts: PlanCurriculumOpts & {
    count: number;
    partLabel: string;
    priorTitles: string[];
  },
): Promise<PlannedLesson[]> {
  const { description, category, profile, sources = [], signal, count, partLabel, priorTitles } =
    opts;

  const sourceBlock =
    sources.length > 0
      ? `Available sources:\n${sources
          .map(
            (s) =>
              `- id=${s.id}: ${s.title} (${s.url})${s.excerpt ? ` — ${s.excerpt}` : ""}`,
          )
          .join("\n")}`
      : "No external sources available; plan from established knowledge.";

  const prior =
    priorTitles.length > 0
      ? `Already planned titles (continue after these, do not repeat):\n${priorTitles.map((t, i) => `${i + 1}. ${t}`).join("\n")}`
      : "This is the start of the curriculum.";

  const { data } = await chatJson({
    system: SYSTEM,
    user: [
      category ? `Category: ${category}` : null,
      `Topic: ${description}`,
      `Profile: score=${profile.score ?? "?"}/10, complexity=${profile.complexity}, density=${profile.density}, breadth=${profile.breadth}`,
      `Request EXACTLY ${count} lessons for ${partLabel}.`,
      prior,
      sourceBlock,
      `Return JSON with exactly ${count} lessons.`,
    ]
      .filter(Boolean)
      .join("\n\n"),
    temperature: 0.35,
    max_tokens: 16_384,
    signal,
    reasoning: { effort: "high", exclude: true },
  });

  return parseLessons(data, profile, sources);
}

/**
 * Plan a progressive curriculum. Splits into two API calls when N > 25.
 */
export async function planCurriculum(
  opts: PlanCurriculumOpts,
): Promise<CurriculumPlan> {
  const { profile, sources = [] } = opts;
  const target = Math.min(50, Math.max(4, profile.estimatedLessons));

  let lessons: PlannedLesson[] = [];

  if (target <= 25) {
    lessons = await planChunk({
      ...opts,
      count: target,
      partLabel: "the full path",
      priorTitles: [],
    });
  } else {
    const first = Math.ceil(target / 2);
    const second = target - first;
    const part1 = await planChunk({
      ...opts,
      count: first,
      partLabel: `part 1 (lessons 1–${first})`,
      priorTitles: [],
    });
    const part2 = await planChunk({
      ...opts,
      count: second,
      partLabel: `part 2 (lessons ${first + 1}–${target})`,
      priorTitles: part1.map((l) => l.title),
    });
    lessons = [...part1, ...part2];
  }

  lessons = finalizeLessons(lessons, profile, sources);

  // Capture subtopics for research continuity
  if (profile.subtopics.length === 0) {
    profile.subtopics = lessons.slice(0, 12).map((l) => l.title);
  }

  return {
    lessons,
    overallComplexity: profile.complexity,
    passThreshold: 0.75,
  };
}
