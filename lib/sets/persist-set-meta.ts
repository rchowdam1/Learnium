import type { OutputSchema } from "@/app/schema/OutputSchema";
import type { SupabaseClient } from "@supabase/supabase-js";

const DEFAULT_PASS_THRESHOLD = 0.75;

/**
 * Patch depth/sources/pass meta onto a set graph after
 * create_set_graph_with_quota returns a set id.
 *
 * RPC is left unchanged (quota + core graph). Best-effort: logs errors
 * but does not fail set creation if meta columns cannot be written.
 */
export async function persistSetMeta(
  supabase: SupabaseClient,
  setId: number,
  parsed: OutputSchema,
  extra?: { complexityScore?: number },
): Promise<void> {
  const passThreshold =
    typeof parsed.passThreshold === "number" &&
    Number.isFinite(parsed.passThreshold)
      ? parsed.passThreshold
      : DEFAULT_PASS_THRESHOLD;

  const setUpdate: Record<string, unknown> = {
    pass_threshold: passThreshold,
  };
  if (parsed.complexity) {
    setUpdate.complexity = parsed.complexity;
  }
  if (parsed.sources && parsed.sources.length > 0) {
    setUpdate.sources = parsed.sources;
  }
  if (
    typeof extra?.complexityScore === "number" &&
    Number.isFinite(extra.complexityScore)
  ) {
    setUpdate.complexity_score = Math.min(
      10,
      Math.max(1, Math.round(extra.complexityScore)),
    );
  }

  const { error: setError } = await supabase
    .from("sets")
    .update(setUpdate)
    .eq("id", setId);

  if (setError) {
    console.error(
      `persistSetMeta: failed to update set ${setId}:`,
      setError.message,
    );
  }

  const { data: lessons, error: lessonsError } = await supabase
    .from("lessons")
    .select("id, position")
    .eq("set_id", setId)
    .order("position", { ascending: true });

  if (lessonsError || !lessons) {
    console.error(
      `persistSetMeta: failed to load lessons for set ${setId}:`,
      lessonsError?.message,
    );
    return;
  }

  for (const lesson of lessons) {
    const idx = lesson.position as number;
    const lessonMeta = parsed.lessons[idx];
    if (!lessonMeta) continue;

    const lessonUpdate: Record<string, unknown> = {};
    if (lessonMeta.difficulty !== undefined) {
      lessonUpdate.difficulty = lessonMeta.difficulty;
    }
    if (lessonMeta.objectives && lessonMeta.objectives.length > 0) {
      lessonUpdate.objectives = lessonMeta.objectives;
    }

    if (Object.keys(lessonUpdate).length > 0) {
      const { error } = await supabase
        .from("lessons")
        .update(lessonUpdate)
        .eq("id", lesson.id);
      if (error) {
        console.error(
          `persistSetMeta: failed to update lesson ${lesson.id}:`,
          error.message,
        );
      }
    }

    // Quiz is 1:1 with lesson; update pass_threshold on linked quiz
    const { data: quiz, error: quizFetchError } = await supabase
      .from("quizzes")
      .select("id")
      .eq("lesson_id", lesson.id)
      .maybeSingle();

    if (quizFetchError || !quiz) {
      if (quizFetchError) {
        console.error(
          `persistSetMeta: failed to load quiz for lesson ${lesson.id}:`,
          quizFetchError.message,
        );
      }
      continue;
    }

    const { error: quizError } = await supabase
      .from("quizzes")
      .update({ pass_threshold: passThreshold })
      .eq("id", quiz.id);

    if (quizError) {
      console.error(
        `persistSetMeta: failed to update quiz ${quiz.id}:`,
        quizError.message,
      );
    }
  }
}
