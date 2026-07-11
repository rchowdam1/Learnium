/**
 * Topic profile types + thin wrapper: judge score 1–10 then deterministic scale.
 * Replaces the old multi-field LLM analyzer.
 */

import { scaleFromScore, type ScaledProfile } from "./complexity-scale";
import { judgeComplexity } from "./judge-complexity";

export type TopicComplexity = "intro" | "intermediate" | "advanced" | "expert";
export type TopicBreadth = "narrow" | "broad";
export type TopicDensity = "light" | "standard" | "dense";

export type TopicProfile = {
  complexity: TopicComplexity;
  needsWeb: boolean;
  breadth: TopicBreadth;
  estimatedLessons: number;
  density: TopicDensity;
  subtopics: string[];
  rationale: string;
  /** 1–10 complexity score from judge */
  score?: number;
  batchSize?: number;
  questionsPerQuiz?: number;
  paragraphsPerLesson?: [number, number];
};

/**
 * Judge complexity 1–10 with DeepSeek, then map to lesson count/density/etc.
 */
export async function analyzeTopic(
  description: string,
  category?: string,
  signal?: AbortSignal,
): Promise<TopicProfile> {
  const { score } = await judgeComplexity(description, category, signal);
  const scaled: ScaledProfile = scaleFromScore(score, description, category);
  return scaled;
}
