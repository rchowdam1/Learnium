const DEFAULT_FREE_MODEL = "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free";

/** Refuse paid OpenRouter models even if an environment variable is misconfigured. */
export function freeOpenRouterModel(variable: string): string {
  const configured = process.env[variable] || process.env.OPENROUTER_MODEL || DEFAULT_FREE_MODEL;
  if (!configured.endsWith(":free")) {
    throw new Error(`${variable} must name an OpenRouter free model`);
  }
  return configured;
}
