"use client";

import { chunkText } from "../chunk";
import { extractInBrowser } from "./extract-browser";
import { embedTextsClient, EMBEDDING_MODEL_ID } from "./embed";
import {
  isAllowedFile,
  mimeOfFile,
  needsServerExtract,
} from "../allowed-types";
import { MAX_FILE_BYTES } from "../limits";
import { detectLanguage } from "../../detect-language";

export type PreparedChunk = {
  content: string;
  chunkIndex: number;
  embedding: number[];
};

export type PreparedFile = {
  file: File;
  fileName: string;
  mimeType: string;
  sourceType: string;
  language: string;
  embeddingModel: string;
  chunks: PreparedChunk[];
  warnings: string[];
  error?: string;
};

export type PipelineProgress = {
  phase:
    | "idle"
    | "loading-model"
    | "extracting"
    | "embedding"
    | "uploading"
    | "done"
    | "error";
  fileName?: string;
  fileIndex?: number;
  fileTotal?: number;
  detail?: string;
  embedDone?: number;
  embedTotal?: number;
};

/**
 * Extract + chunk + embed one file in the browser.
 * For media files, call serverExtractText first and pass the text via overrideText.
 */
export async function prepareFileForIngest(
  file: File,
  options?: {
    overrideText?: string;
    onProgress?: (p: PipelineProgress) => void;
    fileIndex?: number;
    fileTotal?: number;
  },
): Promise<PreparedFile> {
  const onProgress = options?.onProgress;
  const base: PreparedFile = {
    file,
    fileName: file.name,
    mimeType: mimeOfFile(file),
    sourceType: "unknown",
    language: "english",
    embeddingModel: EMBEDDING_MODEL_ID,
    chunks: [],
    warnings: [],
  };

  if (!isAllowedFile(file)) {
    return { ...base, error: "Unsupported file type" };
  }
  if (file.size > MAX_FILE_BYTES) {
    return {
      ...base,
      error: `File too large (max ${MAX_FILE_BYTES / (1024 * 1024)}MB)`,
    };
  }

  let text = options?.overrideText?.trim() || "";
  let sourceType = "text";
  const warnings: string[] = [];

  if (!text) {
    onProgress?.({
      phase: "extracting",
      fileName: file.name,
      fileIndex: options?.fileIndex,
      fileTotal: options?.fileTotal,
      detail: "Extracting text…",
    });

    if (needsServerExtract(file) && !options?.overrideText) {
      return {
        ...base,
        error: "Server extract required for this media file",
        warnings: ["Call extract-media first"],
      };
    }

    const extracted = await extractInBrowser(file);
    text = extracted.text.trim();
    sourceType = extracted.sourceType;
    warnings.push(...extracted.warnings);

    if (extracted.needsServerExtract) {
      return {
        ...base,
        sourceType,
        warnings,
        error: "Server extract required for this media file",
      };
    }
  } else {
    sourceType = needsServerExtract(file)
      ? (needsServerExtract(file) ? "media" : "text")
      : "text";
    if (file.type.startsWith("image/")) sourceType = "image";
    else if (file.type.startsWith("audio/")) sourceType = "audio";
    else if (file.type.startsWith("video/")) sourceType = "video";
  }

  if (!text) {
    return {
      ...base,
      sourceType,
      warnings,
      error: warnings[0] || "No extractable content",
    };
  }

  const chunks = chunkText(text);
  if (chunks.length === 0) {
    return {
      ...base,
      sourceType,
      warnings,
      error: "Chunking produced no content",
    };
  }

  onProgress?.({
    phase: "loading-model",
    fileName: file.name,
    fileIndex: options?.fileIndex,
    fileTotal: options?.fileTotal,
    detail: "Loading local embedding model…",
  });

  onProgress?.({
    phase: "embedding",
    fileName: file.name,
    fileIndex: options?.fileIndex,
    fileTotal: options?.fileTotal,
    detail: "Embedding chunks…",
    embedDone: 0,
    embedTotal: chunks.length,
  });

  const embeddings = await embedTextsClient(chunks, (done, total) => {
    onProgress?.({
      phase: "embedding",
      fileName: file.name,
      fileIndex: options?.fileIndex,
      fileTotal: options?.fileTotal,
      detail: `Embedding ${done}/${total}…`,
      embedDone: done,
      embedTotal: total,
    });
  });

  const { pgConfig: language } = detectLanguage(text);

  return {
    ...base,
    sourceType,
    language,
    warnings,
    chunks: chunks.map((content, chunkIndex) => ({
      content,
      chunkIndex,
      embedding: embeddings[chunkIndex],
    })),
  };
}
