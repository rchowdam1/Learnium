const DEFAULT_CHUNK_SIZE = 900;
const DEFAULT_OVERLAP = 150;

/**
 * Split text into overlapping chunks for embedding / retrieval.
 */
export function chunkText(
  text: string,
  chunkSize = DEFAULT_CHUNK_SIZE,
  overlap = DEFAULT_OVERLAP,
): string[] {
  const cleaned = text.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  if (!cleaned) return [];

  if (cleaned.length <= chunkSize) {
    return [cleaned];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < cleaned.length) {
    let end = Math.min(start + chunkSize, cleaned.length);

    if (end < cleaned.length) {
      // Prefer breaking on paragraph / sentence / space
      const window = cleaned.slice(start, end);
      const breakAt =
        lastIndexOfAny(window, ["\n\n", ". ", "? ", "! ", "\n", " "]) ?? -1;
      if (breakAt > chunkSize * 0.4) {
        end = start + breakAt + 1;
      }
    }

    const piece = cleaned.slice(start, end).trim();
    if (piece.length > 0) chunks.push(piece);

    if (end >= cleaned.length) break;
    start = Math.max(end - overlap, start + 1);
  }

  return chunks;
}

function lastIndexOfAny(haystack: string, needles: string[]): number | null {
  let best = -1;
  for (const n of needles) {
    const i = haystack.lastIndexOf(n);
    if (i > best) best = i;
  }
  return best >= 0 ? best : null;
}
