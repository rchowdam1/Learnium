"use client";

import { EMBEDDING_DIM, EMBEDDING_MODEL_ID } from "../limits";

type FeaturePipeline = (
  text: string,
  options?: { pooling?: string; normalize?: boolean },
) => Promise<{ data: Float32Array | number[]; dims?: number[] }>;

let pipelinePromise: Promise<FeaturePipeline> | null = null;

async function getEmbedder(): Promise<FeaturePipeline> {
  if (!pipelinePromise) {
    pipelinePromise = (async () => {
      const { pipeline } = await import("@huggingface/transformers");
      const extractor = await pipeline(
        "feature-extraction",
        EMBEDDING_MODEL_ID,
      );
      return extractor as unknown as FeaturePipeline;
    })();
  }
  return pipelinePromise;
}

/**
 * Embed a single text string with MiniLM (384-d, L2-normalized).
 * Falls back to feature-hash if the model fails to load.
 */
export async function embedTextClient(text: string): Promise<number[]> {
  try {
    const extractor = await getEmbedder();
    const output = await extractor(text, { pooling: "mean", normalize: true });
    const data = Array.from(output.data as ArrayLike<number>);
    if (data.length !== EMBEDDING_DIM) {
      // Some pipelines return nested batches
      if (data.length > EMBEDDING_DIM && data.length % EMBEDDING_DIM === 0) {
        return data.slice(0, EMBEDDING_DIM);
      }
      throw new Error(`Unexpected embedding dim ${data.length}`);
    }
    return data;
  } catch (err) {
    console.warn("MiniLM embed failed, using feature-hash fallback:", err);
    const { embedText } = await import("../embed");
    return embedText(text);
  }
}

export async function embedTextsClient(
  texts: string[],
  onProgress?: (done: number, total: number) => void,
): Promise<number[][]> {
  const out: number[][] = [];
  for (let i = 0; i < texts.length; i++) {
    out.push(await embedTextClient(texts[i]));
    onProgress?.(i + 1, texts.length);
  }
  return out;
}

export async function preloadEmbedder(): Promise<void> {
  await getEmbedder();
}

export { EMBEDDING_MODEL_ID, EMBEDDING_DIM };
