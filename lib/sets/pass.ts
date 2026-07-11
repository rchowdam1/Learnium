/** Minimum fraction correct required to pass a lesson quiz (75%). */
export const PASS_THRESHOLD = 0.75;

/**
 * Score as a fraction in [0, 1]. Returns 0 when total is 0 or negative.
 */
export function scorePercent(correct: number, total: number): number {
  if (total <= 0) return 0;
  return correct / total;
}

/**
 * Whether the attempt meets the pass threshold.
 */
export function didPass(
  correct: number,
  total: number,
  threshold: number = PASS_THRESHOLD,
): boolean {
  return scorePercent(correct, total) >= threshold;
}

/**
 * Minimum number of correct answers required to pass (ceiling).
 */
export function requiredCorrect(
  total: number,
  threshold: number = PASS_THRESHOLD,
): number {
  if (total <= 0) return 0;
  return Math.ceil(total * threshold);
}
