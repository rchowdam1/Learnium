import type {
  TopicBreadth,
  TopicComplexity,
  TopicDensity,
  TopicProfile,
} from "./analyze-topic";
import { clampScore } from "./judge-complexity";

/**
 * Deterministic scale: complexity score 1–10 → curriculum profile.
 * Max lessons = 50 at score 10.
 */

export type ScaledProfile = TopicProfile & {
  score: number;
  batchSize: number;
  questionsPerQuiz: number;
  paragraphsPerLesson: [number, number]; // min, max
};

/** Smooth ramp: score 1 → 4 lessons, score 10 → 50 lessons */
export function lessonsForScore(score: number): number {
  const s = clampScore(score);
  return Math.min(50, Math.max(4, Math.round(4 + ((s - 1) * 46) / 9)));
}

export function densityForScore(score: number): TopicDensity {
  const s = clampScore(score);
  if (s <= 3) return "light";
  if (s <= 6) return "standard";
  return "dense";
}

export function tierForScore(score: number): TopicComplexity {
  const s = clampScore(score);
  if (s <= 3) return "intro";
  if (s <= 6) return "intermediate";
  if (s <= 8) return "advanced";
  return "expert";
}

/** Lessons per API content call — 1 for deep scores to avoid JSON truncation */
export function batchSizeForScore(score: number): number {
  const s = clampScore(score);
  if (s >= 7) return 1;
  if (s >= 5) return 2;
  return 3;
}

export function questionsPerQuizForScore(score: number): number {
  const s = clampScore(score);
  if (s >= 9) return 5;
  if (s >= 7) return 4;
  if (s >= 5) return 4;
  if (s >= 3) return 3;
  return 3;
}

export function paragraphsRangeForScore(score: number): [number, number] {
  const s = clampScore(score);
  if (s >= 9) return [5, 7];
  if (s >= 7) return [5, 6];
  if (s >= 5) return [4, 5];
  if (s >= 3) return [3, 4];
  return [3, 3];
}

const WEB_KEYWORDS =
  /\b(aws|azure|gcp|cloud|kubernetes|k8s|latest|202[4-9]|api|sdk|docs?|release|changelog|framework|react|next\.?js|node|terraform|docker|openai|llm)\b/i;

export function needsWebForScore(
  score: number,
  description: string,
  category?: string,
): boolean {
  const s = clampScore(score);
  const text = `${category ?? ""} ${description}`;
  if (s >= 8 && WEB_KEYWORDS.test(text)) return true;
  if (s >= 6 && WEB_KEYWORDS.test(text)) return true;
  if (/\b(latest|news|current|202[5-9])\b/i.test(text)) return true;
  return false;
}

export function breadthForScore(score: number): TopicBreadth {
  return clampScore(score) >= 7 ? "broad" : "narrow";
}

/**
 * Build full TopicProfile (+ scale helpers) from a 1–10 score.
 */
export function scaleFromScore(
  score: number,
  description: string,
  category?: string,
): ScaledProfile {
  const s = clampScore(score);
  const estimatedLessons = lessonsForScore(s);
  const density = densityForScore(s);
  const complexity = tierForScore(s);

  return {
    score: s,
    complexity,
    needsWeb: needsWebForScore(s, description, category),
    breadth: breadthForScore(s),
    estimatedLessons,
    density,
    subtopics: [], // filled by plan phase
    rationale: `Complexity score ${s}/10 → ${estimatedLessons} ${density} lessons (${complexity}).`,
    batchSize: batchSizeForScore(s),
    questionsPerQuiz: questionsPerQuizForScore(s),
    paragraphsPerLesson: paragraphsRangeForScore(s),
  };
}
