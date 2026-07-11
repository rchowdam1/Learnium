import { zOutputSchema, type OutputSchema } from "@/app/schema/OutputSchema";
import type { SetSource } from "@/app/schema/OutputSchema";
import { normalizeSetOutput } from "@/lib/normalize-set-output";
import { analyzeTopic, type TopicProfile } from "./analyze-topic";
import { planCurriculum, type CurriculumPlan } from "./curriculum-plan";
import { generateSetContent } from "./generate-content";
import { researchTopic } from "./web-research";

export type GenerateLearningSetOpts = {
  title: string;
  description: string;
  category: string;
  signal?: AbortSignal;
  onPhase?: (phase: string, detail?: string) => void;
};

export type GenerateLearningSetResult = {
  success: boolean;
  profile?: TopicProfile;
  sources?: SetSource[];
  plan?: CurriculumPlan;
  parsed?: OutputSchema;
  error?: string;
  code?: string;
};

function validateSetOutput(raw: unknown): OutputSchema | null {
  const normalized = normalizeSetOutput(raw);
  const validation = zOutputSchema.safeParse(normalized);
  if (!validation.success) {
    console.error("Schema validation failed:", validation.error.issues);
    return null;
  }
  return validation.data;
}

/**
 * Multi-phase adaptive + web-grounded set generation.
 * Phases: judge score 1–10 → scale → research? → plan → generate → validate.
 */
export async function generateLearningSet(
  opts: GenerateLearningSetOpts,
): Promise<GenerateLearningSetResult> {
  const { title, description, category, signal, onPhase } = opts;

  try {
    // ─── Phase 1: Judge complexity 1–10 ONLY ─────────────────────────
    onPhase?.("analyze", "Scoring topic complexity (1–10)…");
    const profile = await analyzeTopic(description, category, signal);
    onPhase?.(
      "analyze",
      `Complexity ${profile.score ?? "?"}/10 → ${profile.estimatedLessons} ${profile.density} lessons`,
    );

    // ─── Phase 2: Web research (conditional) ─────────────────────────
    let sources: SetSource[] = [];
    if (profile.needsWeb) {
      onPhase?.("research", "Researching high-quality web sources…");
      try {
        sources = await researchTopic({
          description,
          subtopics: profile.subtopics.length
            ? profile.subtopics
            : [title, description].filter(Boolean),
          signal,
        });
      } catch (err) {
        console.warn(
          "Web research failed, continuing without sources:",
          err instanceof Error ? err.message : err,
        );
        sources = [];
      }
    }

    // ─── Phase 3: Curriculum plan (up to 50) ─────────────────────────
    onPhase?.(
      "plan",
      `Planning ${profile.estimatedLessons} progressive lessons…`,
    );
    const plan = await planCurriculum({
      description,
      category,
      profile,
      sources,
      signal,
    });

    // ─── Phase 4: Generate content (1-lesson batches when score ≥ 7) ──
    onPhase?.(
      "generate",
      `Writing ${plan.lessons.length} lessons (batch size ${profile.batchSize ?? 1})…`,
    );
    const content = await generateSetContent({
      description: `${title}: ${description}`,
      category,
      plan,
      sources,
      profile,
      signal,
      onProgress: (detail) => onPhase?.("generate", detail),
    });

    // ─── Phase 5: Validate ───────────────────────────────────────────
    onPhase?.("validate", "Validating generated set…");
    let parsed = validateSetOutput(content);

    if (!parsed) {
      const repaired = normalizeSetOutput({
        ...content,
        complexity:
          content.complexity ?? plan.overallComplexity ?? profile.complexity,
        passThreshold:
          content.passThreshold ?? plan.passThreshold ?? 0.75,
        sources:
          content.sources ?? (sources.length > 0 ? sources : undefined),
      });
      parsed = validateSetOutput(repaired);
    }

    if (!parsed) {
      return {
        success: false,
        profile,
        sources,
        plan,
        error: "Generated content failed quality validation",
        code: "VALIDATION_FAILED",
      };
    }

    if (!parsed.complexity) {
      parsed = {
        ...parsed,
        complexity: plan.overallComplexity || profile.complexity,
      };
    }
    if (
      (!parsed.sources || parsed.sources.length === 0) &&
      sources.length > 0
    ) {
      parsed = { ...parsed, sources };
    }
    if (parsed.passThreshold === undefined || parsed.passThreshold === null) {
      parsed = { ...parsed, passThreshold: plan.passThreshold ?? 0.75 };
    }

    // Stash score on complexity string for UI if column missing:
    // also returned on profile for persistSetMeta
    return {
      success: true,
      profile,
      sources,
      plan,
      parsed,
    };
  } catch (error: unknown) {
    if (signal?.aborted) {
      return {
        success: false,
        error: "Generation cancelled",
        code: "GENERATION_CANCELLED",
      };
    }
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("generateLearningSet error:", message);
    return {
      success: false,
      error: message,
      code: "PROVIDER_ERROR",
    };
  }
}
