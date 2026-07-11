import { z } from "zod";

const zSource = z.object({
  id: z.number(),
  title: z.string(),
  url: z.string(),
  publisher: z.string().optional(),
  publishedAt: z.string().optional(),
  excerpt: z.string().optional(),
  triageScore: z.number().optional(),
});

const zLesson = z.object({
  title: z.string(),
  paragraphs: z.array(z.string()),
  difficulty: z.number().int().min(1).max(5).optional(),
  objectives: z.array(z.string()).optional(),
  sourceRefs: z.array(z.number()).optional(),
});

const zQuestion = z.object({
  question: z.string(),
  options: z.array(z.string()),
  answer: z.string(),
  difficulty: z.number().int().min(1).max(5).optional(),
  rationale: z.string().optional(),
});

const zQuiz = z.object({
  title: z.string(),
  questions: z.array(zQuestion),
});

export const zOutputSchema = z.object({
  lessons: z.array(zLesson),
  quizzes: z.array(zQuiz),
  flagged: z.boolean(),
  sources: z.array(zSource).optional(),
  complexity: z.string().optional(),
  passThreshold: z.number().default(0.75),
});

export type OutputSchema = z.infer<typeof zOutputSchema>;
export type SetSource = z.infer<typeof zSource>;
