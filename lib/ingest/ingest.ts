import type { SupabaseClient } from "@supabase/supabase-js";
import { extractFromFile } from "./extract";
import { chunkText } from "./chunk";
import { embedText } from "./embed";
import { detectLanguage } from "../detect-language";

export type IngestFileResult = {
  fileName: string;
  documentId: number | null;
  chunksStored: number;
  sourceType: string;
  warnings: string[];
  error?: string;
};

export type IngestBuddyResult = {
  success: boolean;
  chunksCount: number;
  files: IngestFileResult[];
  errors: string[];
};

const MAX_FILE_BYTES = 40 * 1024 * 1024; // 40 MB
const MAX_FILES = 8;
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain", "text/markdown", "text/csv", "image/png", "image/jpeg",
]);

/**
 * Extract, chunk, embed, and store uploaded files under a study buddy + user.
 */
export async function ingestBuddyDocuments(options: {
  supabase: SupabaseClient;
  profileId: string;
  studyBotId: number;
  files: File[];
}): Promise<IngestBuddyResult> {
  const { supabase, profileId, studyBotId, files } = options;
  if (files.length === 0 || files.length > MAX_FILES) {
    return { success: false, chunksCount: 0, files: [], errors: [`Upload between 1 and ${MAX_FILES} files.`] };
  }
  const limited = files;
  const results: IngestFileResult[] = [];
  const errors: string[] = [];
  let chunksCount = 0;

  for (const file of limited) {
    const fileResult: IngestFileResult = {
      fileName: file.name,
      documentId: null,
      chunksStored: 0,
      sourceType: "unknown",
      warnings: [],
    };

    if (file.size > MAX_FILE_BYTES) {
      fileResult.error = `File too large (max ${MAX_FILE_BYTES / (1024 * 1024)}MB)`;
      errors.push(`${file.name}: ${fileResult.error}`);
      results.push(fileResult);
      continue;
    }
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      fileResult.error = "Unsupported file type";
      errors.push(`${file.name}: ${fileResult.error}`);
      results.push(fileResult);
      continue;
    }

    const { data: docRow, error: docError } = await supabase
      .from("study_bot_documents")
      .insert({
        study_bot_id: studyBotId,
        document_name: file.name,
        document_size: file.size,
      })
      .select("id")
      .single();

    if (docError || !docRow) {
      fileResult.error =
        docError?.message || "Failed to store document metadata";
      errors.push(`${file.name}: ${fileResult.error}`);
      results.push(fileResult);
      continue;
    }

    fileResult.documentId = docRow.id;

    let extracted;
    try {
      extracted = await extractFromFile(file);
    } catch (error) {
      fileResult.error = error instanceof Error ? error.message : "Extraction failed";
      errors.push(`${file.name}: ${fileResult.error}`);
      await supabase.from("study_bot_documents").delete().eq("id", docRow.id);
      results.push(fileResult);
      continue;
    }
    fileResult.sourceType = extracted.sourceType;
    fileResult.warnings.push(...extracted.warnings);

    const text = extracted.text?.trim() || "";
    if (!text) {
      fileResult.error =
        extracted.warnings[0] || "No extractable content from file";
      errors.push(`${file.name}: ${fileResult.error}`);
      results.push(fileResult);
      await supabase.from("study_bot_documents").delete().eq("id", docRow.id);
      continue;
    }

    const chunks = chunkText(text);
    if (chunks.length === 0) {
      fileResult.error = "Chunking produced no content";
      errors.push(`${file.name}: ${fileResult.error}`);
      results.push(fileResult);
      continue;
    }

    // Detect language for FTS indexing (one detection per file)
    const { pgConfig: langConfig } = detectLanguage(text);

    const rows = chunks.map((content, chunkIndex) => ({
      profile_id: profileId,
      study_bot_id: studyBotId,
      document_id: docRow.id,
      document_name: file.name,
      content,
      chunk_index: chunkIndex,
      mime_type: extracted.mimeType,
      source_type: extracted.sourceType,
      embedding: embedText(content),
      language: langConfig,
    }));

    const BATCH = 40;
    for (let i = 0; i < rows.length; i += BATCH) {
      const batch = rows.slice(i, i + BATCH);
      const { error: insertError } = await supabase
        .from("document_chunks")
        .insert(batch);

      if (insertError) {
        fileResult.error = insertError.message;
        errors.push(`${file.name}: ${insertError.message}`);
        break;
      }
      fileResult.chunksStored += batch.length;
    }

    chunksCount += fileResult.chunksStored;
    results.push(fileResult);
  }

  return {
    success: chunksCount > 0,
    chunksCount,
    files: results,
    errors,
  };
}
