/** Free tier total Study Buddy file storage (bytes). */
export const FREE_STORAGE_BYTES = 750 * 1024 * 1024;

/** Plus tier total Study Buddy file storage (bytes). */
export const PLUS_STORAGE_BYTES = 5 * 1024 * 1024 * 1024;

/** Max size of a single uploaded file (bytes). */
export const MAX_FILE_BYTES = 100 * 1024 * 1024;

/** Max files per Study Buddy create. */
export const MAX_FILES_PER_BUDDY = 8;

/** Embedding model id stored on chunks (client MiniLM). */
export const EMBEDDING_MODEL_ID = "Xenova/all-MiniLM-L6-v2";

/** Must match document_chunks.embedding vector(384). */
export const EMBEDDING_DIM = 384;

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
