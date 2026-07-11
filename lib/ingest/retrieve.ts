import type { SupabaseClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import { embedText } from "./embed";

export type RetrievedChunk = {
  id: number;
  document_name: string;
  content: string;
  chunk_index: number;
  score: number;
};

/**
 * Hybrid retrieval: semantic (pgvector) + keyword (tsvector), fused by id.
 */
export async function retrieveBuddyContext(options: {
  supabase: SupabaseClient;
  profileId: string;
  studyBotId: number;
  query: string;
  matchCount?: number;
}): Promise<RetrievedChunk[]> {
  const { supabase, profileId, studyBotId, query } = options;
  const matchCount = options.matchCount ?? 8;
  const queryEmbedding = embedText(query);

  const [{ data: semantic, error: semErr }, { data: keyword, error: kwErr }] =
    await Promise.all([
      supabase.rpc("match_document_chunks", {
        query_embedding: queryEmbedding,
        filter_study_bot_id: studyBotId,
        filter_profile_id: profileId,
        match_count: matchCount,
        match_threshold: 0.05,
      }),
      supabase.rpc("keyword_document_chunks", {
        query_text: query,
        filter_study_bot_id: studyBotId,
        filter_profile_id: profileId,
        match_count: matchCount,
      }),
    ]);

  if (semErr) console.error("match_document_chunks error:", semErr.message);
  if (kwErr) console.error("keyword_document_chunks error:", kwErr.message);

  const byId = new Map<number, RetrievedChunk>();

  (semantic || []).forEach(
    (
      row: {
        id: number;
        document_name: string;
        content: string;
        chunk_index: number;
        similarity: number;
      },
      rank: number,
    ) => {
      byId.set(row.id, {
        id: row.id,
        document_name: row.document_name,
        content: row.content,
        chunk_index: row.chunk_index,
        score: 1 / (50 + rank + 1) + (row.similarity || 0) * 0.5,
      });
    },
  );

  (keyword || []).forEach(
    (
      row: {
        id: number;
        document_name: string;
        content: string;
        chunk_index: number;
        rank: number;
      },
      rank: number,
    ) => {
      const existing = byId.get(row.id);
      const add = 1 / (50 + rank + 1) + (row.rank || 0);
      if (existing) {
        existing.score += add;
      } else {
        byId.set(row.id, {
          id: row.id,
          document_name: row.document_name,
          content: row.content,
          chunk_index: row.chunk_index,
          score: add,
        });
      }
    },
  );

  // If both RPCs returned nothing, pull recent chunks as weak context
  if (byId.size === 0) {
    const { data: fallback } = await supabase
      .from("document_chunks")
      .select("id, document_name, content, chunk_index")
      .eq("study_bot_id", studyBotId)
      .eq("profile_id", profileId)
      .order("chunk_index", { ascending: true })
      .limit(matchCount);

    return (fallback || []).map((row, i) => ({
      id: row.id,
      document_name: row.document_name,
      content: row.content,
      chunk_index: row.chunk_index,
      score: 1 / (i + 1),
    }));
  }

  return [...byId.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, matchCount);
}

export function buildContextPrompt(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) {
    return "No indexed study materials were found for this buddy.";
  }

  return chunks
    .map(
      (c, i) =>
        `[Source ${i + 1}: ${c.document_name} §${c.chunk_index}]\n${c.content}`,
    )
    .join("\n\n---\n\n");
}

export async function answerWithContext(options: {
  question: string;
  context: string;
  buddyName?: string;
  buddyDescription?: string;
}): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  const client = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey: key,
    defaultHeaders: {
      "HTTP-Referer":
        process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
      "X-Title": "Learnium Study Buddy",
    },
  });

  const model =
    process.env.OPENROUTER_MODEL ||
    "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free";

  const system = `You are a helpful study buddy AI named "${options.buddyName || "Study Buddy"}".
${options.buddyDescription ? `Your purpose: ${options.buddyDescription}` : ""}

Answer the student's question using ONLY the provided source context when possible.
If the context does not contain enough information, say what is missing and answer carefully from general knowledge while clearly labeling that part.
Be concise, accurate, and cite sources like [Source N] when you use them.
Never invent quotes from the materials.`;

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: "system", content: system },
      {
        role: "user",
        content: `Context from the student's uploaded materials:\n\n${options.context}\n\n---\n\nQuestion: ${options.question}`,
      },
    ],
    max_tokens: 1200,
    temperature: 0.3,
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) throw new Error("Empty response from language model");
  return text;
}
