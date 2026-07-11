import type { SetSource } from "@/app/schema/OutputSchema";
import { chatJson } from "./openrouter-client";

export type ResearchTopicOpts = {
  description: string;
  subtopics: string[];
  signal?: AbortSignal;
};

const SYSTEM = `You are a research librarian for educational content.
Using web search, find high-quality sources for a microlearning curriculum.

Return ONLY valid JSON:
{
  "sources": [
    {
      "id": 1,
      "title": "string",
      "url": "https://...",
      "publisher": "string (optional)",
      "publishedAt": "ISO date or year (optional)",
      "excerpt": "1-2 sentence summary of relevance (optional)",
      "triageScore": 0.0-1.0
    }
  ]
}

Triage priority (highest first):
1. Official documentation, standards bodies, primary sources
2. Peer-reviewed papers, textbooks, academic publishers
3. Reputable technical blogs / established educational sites
4. DROP: SEO spam, content farms, forums-only, broken/paywalled junk, non-HTTPS pages

Rules:
- Prefer https URLs only.
- Cap at 12 sources maximum.
- Assign unique sequential integer ids starting at 1.
- triageScore reflects quality/relevance (0.7+ for keepers).
- Each source must be useful for writing lessons on the given subtopics.`;

function normalizeHttpsUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    const withProto = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;
    const u = new URL(withProto);
    if (u.protocol !== "https:") {
      // Force https only
      if (u.protocol === "http:") {
        u.protocol = "https:";
        return u.toString();
      }
      return null;
    }
    return u.toString();
  } catch {
    return null;
  }
}

function normalizeSources(raw: unknown): SetSource[] {
  const obj = (raw && typeof raw === "object" ? raw : {}) as Record<
    string,
    unknown
  >;
  const list = Array.isArray(obj.sources)
    ? obj.sources
    : Array.isArray(raw)
      ? raw
      : [];

  const out: SetSource[] = [];
  const seen = new Set<string>();

  for (const item of list) {
    if (out.length >= 12) break;
    if (!item || typeof item !== "object") continue;
    const s = item as Record<string, unknown>;
    const url = normalizeHttpsUrl(String(s.url ?? s.link ?? s.href ?? ""));
    if (!url) continue;
    const key = url.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const title = String(s.title ?? s.name ?? "").trim() || url;
    const id = out.length + 1;

    const source: SetSource = { id, title, url };

    if (typeof s.publisher === "string" && s.publisher.trim()) {
      source.publisher = s.publisher.trim();
    }
    if (typeof s.publishedAt === "string" && s.publishedAt.trim()) {
      source.publishedAt = s.publishedAt.trim();
    } else if (typeof s.published_at === "string" && s.published_at.trim()) {
      source.publishedAt = s.published_at.trim();
    }
    if (typeof s.excerpt === "string" && s.excerpt.trim()) {
      source.excerpt = s.excerpt.trim();
    } else if (typeof s.snippet === "string" && s.snippet.trim()) {
      source.excerpt = s.snippet.trim();
    }
    const triage = Number(s.triageScore ?? s.triage_score ?? s.score);
    if (Number.isFinite(triage)) {
      source.triageScore = Math.min(1, Math.max(0, triage));
    }

    out.push(source);
  }

  return out;
}

export async function researchTopic(
  opts: ResearchTopicOpts,
): Promise<SetSource[]> {
  const { description, subtopics, signal } = opts;
  const subtopicList =
    subtopics.length > 0 ? subtopics.join("; ") : "general coverage";

  const { data } = await chatJson({
    system: SYSTEM,
    user: `Topic: ${description}\nSubtopics: ${subtopicList}\n\nFind and triage up to 12 high-quality sources. Return JSON.`,
    temperature: 0.3,
    max_tokens: 8_192,
    web: true,
    signal,
    reasoning: { effort: "high", exclude: true },
  });

  return normalizeSources(data);
}
