import OpenAI from "openai";
import { freeOpenRouterModel } from "@/lib/openrouter";

export const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "dummy_key",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    "X-Title": "Learnium",
  },
  // Deep multi-lesson generation can take several minutes per call
  timeout: 300_000,
});

export const MODEL = freeOpenRouterModel("OPENROUTER_MODEL");

/** Keep one stalled provider request from consuming the route's entire budget. */
export const PROVIDER_CALL_TIMEOUT_MS = 45_000;

/** OpenRouter reasoning control — high effort, hide CoT from content. */
export type ReasoningOpts = {
  effort?: "low" | "medium" | "high";
  /** When true, exclude reasoning tokens from the assistant message content */
  exclude?: boolean;
};

export const DEFAULT_REASONING: ReasoningOpts = {
  effort: "high",
  exclude: true,
};

export type ChatJsonOptions = {
  system: string;
  user: string;
  temperature?: number;
  max_tokens?: number;
  web?: boolean;
  signal?: AbortSignal;
  /** Retry once if JSON is truncated/invalid */
  repairOnParseError?: boolean;
  /** Defaults to high effort + exclude (hide) */
  reasoning?: ReasoningOpts | false;
};

export type ChatJsonResult<T = unknown> = {
  data: T;
  usage?: {
    total_tokens?: number;
    prompt_tokens?: number;
    completion_tokens?: number;
  };
  raw: string;
};

/** Extract the outermost JSON object/array from a model response. */
export function extractJsonPayload(text: string): string {
  const trimmed = text.trim();
  const unfenced = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  const startObj = unfenced.indexOf("{");
  const startArr = unfenced.indexOf("[");
  let start = -1;
  if (startObj === -1) start = startArr;
  else if (startArr === -1) start = startObj;
  else start = Math.min(startObj, startArr);

  if (start === -1) return unfenced;

  const open = unfenced[start];
  const close = open === "{" ? "}" : "]";
  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < unfenced.length; i++) {
    const ch = unfenced[i];
    if (inString) {
      if (escape) {
        escape = false;
      } else if (ch === "\\") {
        escape = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === open) depth++;
    else if (ch === close) {
      depth--;
      if (depth === 0) {
        return unfenced.slice(start, i + 1);
      }
    }
  }

  return unfenced.slice(start);
}

function parseJsonStrict(text: string): unknown {
  const payload = extractJsonPayload(text);
  return JSON.parse(payload);
}

function abortSignalWithTimeout(signal?: AbortSignal): {
  signal: AbortSignal;
  dispose: () => void;
} {
  const controller = new AbortController();
  const abort = () => controller.abort();
  const timeout = setTimeout(abort, PROVIDER_CALL_TIMEOUT_MS);

  if (signal) {
    if (signal.aborted) abort();
    else signal.addEventListener("abort", abort, { once: true });
  }

  return {
    signal: controller.signal,
    dispose: () => {
      clearTimeout(timeout);
      signal?.removeEventListener("abort", abort);
    },
  };
}

/**
 * Shared JSON chat helper for multi-phase set generation.
 * Uses response_format json_object; optional OpenRouter web plugin;
 * reasoning high + exclude (hide) by default.
 */
export async function chatJson<T = unknown>(
  opts: ChatJsonOptions,
): Promise<ChatJsonResult<T>> {
  const {
    system,
    user,
    temperature = 0.5,
    max_tokens = 8192,
    web = false,
    signal,
    repairOnParseError = true,
    reasoning = DEFAULT_REASONING,
  } = opts;

  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: "system", content: system },
    { role: "user", content: user },
  ];

  const bodyBase: Record<string, unknown> = {
    model: MODEL,
    response_format: { type: "json_object" },
    temperature,
    max_tokens,
  };

  if (reasoning !== false) {
    bodyBase.reasoning = {
      effort: reasoning.effort ?? "high",
      exclude: reasoning.exclude !== false,
    };
  }

  if (web) {
    bodyBase.plugins = [{ id: "web", max_results: 8 }];
  }

  async function once(
    msgs: OpenAI.Chat.Completions.ChatCompletionMessageParam[],
    tokenBudget: number,
  ): Promise<{ content: string; usage?: ChatJsonResult["usage"] }> {
    const timedRequest = abortSignalWithTimeout(signal);
    let completion: OpenAI.Chat.Completions.ChatCompletion;
    try {
      completion = await openai.chat.completions.create(
        {
          ...bodyBase,
          max_tokens: tokenBudget,
          messages: msgs,
        } as unknown as OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming,
        { signal: timedRequest.signal },
      );
    } catch (error) {
      if (timedRequest.signal.aborted && !signal?.aborted) {
        throw new Error("OpenRouter request timed out");
      }
      throw error;
    } finally {
      timedRequest.dispose();
    }

    const content = completion.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from model");
    }

    return {
      content,
      usage: completion.usage
        ? {
            total_tokens: completion.usage.total_tokens,
            prompt_tokens: completion.usage.prompt_tokens,
            completion_tokens: completion.usage.completion_tokens,
          }
        : undefined,
    };
  }

  const first = await once(messages, max_tokens);

  try {
    const data = parseJsonStrict(first.content) as T;
    return { data, usage: first.usage, raw: first.content };
  } catch (parseErr) {
    if (!repairOnParseError) {
      console.error(
        "Failed to parse model JSON:",
        first.content.slice(0, 300),
      );
      throw new Error("Failed to parse generated content");
    }

    console.warn(
      "JSON parse failed, attempting repair. Snippet:",
      first.content.slice(0, 200),
    );

    const repairMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
      [
        ...messages,
        { role: "assistant", content: first.content },
        {
          role: "user",
          content: `Your previous reply was truncated or invalid JSON (parse error: ${
            parseErr instanceof Error ? parseErr.message : "invalid"
          }).
Rewrite the COMPLETE response as a single valid JSON object only.
- No markdown fences
- Close all brackets/braces
- Keep the same schema
- Prefer slightly shorter paragraphs if needed to fit, but include ALL requested lessons and quizzes
- Every quiz question needs "answer" equal to one option string`,
        },
      ];

    const second = await once(
      repairMessages,
      Math.max(max_tokens, 32_768),
    );

    try {
      const data = parseJsonStrict(second.content) as T;
      return {
        data,
        usage: second.usage ?? first.usage,
        raw: second.content,
      };
    } catch {
      console.error("Repair JSON still invalid:", second.content.slice(0, 300));
      throw new Error("Failed to parse generated content");
    }
  }
}
