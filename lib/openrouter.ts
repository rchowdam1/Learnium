const DEFAULT_FREE_MODEL = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free";

/**
 * Explicitly-approved paid models. The `:free` guard below refuses paid models
 * even when an env var is misconfigured; entries here are deliberate exceptions.
 * DeepSeek V4 Flash is the default generation + multimodal extract model.
 */
const APPROVED_PAID_MODELS = new Set<string>(["deepseek/deepseek-v4-flash"]);

/** Refuse paid OpenRouter models even if an environment variable is misconfigured. */
export function freeOpenRouterModel(variable: string): string {
  const configured = process.env[variable] || process.env.OPENROUTER_MODEL || DEFAULT_FREE_MODEL;
  if (!configured.endsWith(":free") && !APPROVED_PAID_MODELS.has(configured)) {
    throw new Error(`${variable} must name an OpenRouter free model`);
  }
  return configured;
}
