/** Embedding dimension — must match document_chunks.embedding vector(384) */
export const EMBEDDING_DIM = 384;

/**
 * Local feature-hash embedding (no external API).
 * Produces L2-normalized 384-d vectors suitable for cosine similarity in pgvector.
 */
export function embedText(text: string): number[] {
  const vec = new Float64Array(EMBEDDING_DIM);
  const tokens = tokenize(text);

  if (tokens.length === 0) {
    vec[0] = 1;
    return Array.from(vec);
  }

  for (const token of tokens) {
    const h = hash32(token);
    const idx = h % EMBEDDING_DIM;
    const sign = (h & 1) === 0 ? 1 : -1;
    // Sublinear TF weighting
    vec[idx] += sign * (1 + Math.log(1 + token.length));
  }

  // Light bigram signal for phrase sensitivity
  for (let i = 0; i < tokens.length - 1; i++) {
    const bigram = `${tokens[i]}_${tokens[i + 1]}`;
    const h = hash32(bigram);
    const idx = h % EMBEDDING_DIM;
    const sign = (h & 1) === 0 ? 1 : -1;
    vec[idx] += sign * 0.5;
  }

  return l2Normalize(vec);
}

export function embedTexts(texts: string[]): number[][] {
  return texts.map(embedText);
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

function hash32(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function l2Normalize(vec: Float64Array): number[] {
  let sum = 0;
  for (let i = 0; i < vec.length; i++) sum += vec[i] * vec[i];
  const norm = Math.sqrt(sum) || 1;
  const out = new Array<number>(vec.length);
  for (let i = 0; i < vec.length; i++) out[i] = vec[i] / norm;
  return out;
}
