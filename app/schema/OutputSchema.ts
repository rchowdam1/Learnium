import { z } from "zod";

const zLesson = z.object({
  title: z.string(),
  paragraphs: z.array(z.string()),
});

const zQuestion = z.object({
  question: z.string(),
  options: z.array(z.string()),
  answer: z.string(),
});

const zQuiz = z.object({
  title: z.string(),
  questions: z.array(zQuestion),
});

export const zOutputSchema = z.object({
  lessons: z.array(zLesson),
  quizzes: z.array(zQuiz),
  flagged: z.boolean(),
});

export type OutputSchema = z.infer<typeof zOutputSchema>;
