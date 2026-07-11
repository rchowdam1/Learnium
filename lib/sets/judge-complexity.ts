import { chatJson } from "./openrouter-client";

/**
 * Single DeepSeek call: rate the learning topic difficulty 1–10 ONLY.
 */
export type ComplexityJudgment = {
  score: number; // integer 1–10
};

const SYSTEM = `You are a strict curriculum difficulty judge.
Rate how hard it is to master the user's learning request as a complete learning path.

Return ONLY this JSON (no other keys):
{ "score": <integer 1-10> }

Calibration:
- 1–2: Trivial / elementary (e.g. "what is a noun", basic animal facts)
- 3–4: Intro high-school / basic skills (e.g. intro fractions, basic HTML)
- 5–6: College / professional intro (e.g. REST APIs basics, intro stats)
- 7–8: Advanced undergrad / professional deep (e.g. distributed consensus, OS kernels)
- 9–10: Graduate / research / multi-month mastery (e.g. quantum error correction from scratch, advanced ML theory end-to-end)

Rules:
- score MUST be an integer from 1 to 10 inclusive
- Do not return lessons, rationale, or any other fields
- Prefer higher scores when the user asks for "complete", "from scratch", "expert", or multi-domain mastery`;

export function clampScore(n: unknown): number {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return 2;
  return Math.min(10, Math.max(1, Math.round(v)));
}

export async function judgeComplexity(
  description: string,
  category?: string,
  signal?: AbortSignal,
): Promise<ComplexityJudgment> {
  try {
    const categoryLine = category ? `Category: ${category}\n` : "";
    const { data } = await chatJson<{ score?: unknown }>({
      system: SYSTEM,
      user: `${categoryLine}Learning request:\n${description}\n\nReturn {"score": N} only.`,
      temperature: 0.1,
      max_tokens: 128,
      signal,
      repairOnParseError: true,
      // High reasoning quality, hide CoT from content
      reasoning: { effort: "high", exclude: true },
    });

    return { score: clampScore(data?.score) };
  } catch (err) {
    console.warn(
      "judgeComplexity failed, defaulting score=5:",
      err instanceof Error ? err.message : err,
    );
    return { score: 2 };
  }
}
