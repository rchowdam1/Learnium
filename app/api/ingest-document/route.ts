import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import {
  EMBEDDING_DIM,
  EMBEDDING_MODEL_ID,
  MAX_FILE_BYTES,
} from "@/lib/ingest/limits";
import { isAllowedFile, mimeOfFile } from "@/lib/ingest/allowed-types";

export const maxDuration = 300;

type IncomingChunk = {
  content: string;
  chunkIndex: number;
  embedding: number[];
};

/**
 * Authenticated ingest: claim storage, store raw file, insert client-embedded chunks.
 *
 * FormData:
 *  - buddyId: string
 *  - file: File
 *  - sourceType?: string
 *  - language?: string
 *  - embeddingModel?: string
 *  - chunks: JSON string of IncomingChunk[]
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { success: false, message: "Expected multipart form data" },
      { status: 400 },
    );
  }

  const buddyId = Number(form.get("buddyId"));
  const file = form.get("file");
  const sourceType = String(form.get("sourceType") || "text");
  const language = String(form.get("language") || "english");
  const embeddingModel = String(
    form.get("embeddingModel") || EMBEDDING_MODEL_ID,
  );
  const chunksRaw = form.get("chunks");

  if (!Number.isFinite(buddyId) || !(file instanceof File)) {
    return NextResponse.json(
      { success: false, message: "buddyId and file are required" },
      { status: 400 },
    );
  }

  if (!isAllowedFile(file)) {
    return NextResponse.json(
      { success: false, message: "Unsupported file type" },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      {
        success: false,
        message: `File too large (max ${MAX_FILE_BYTES / (1024 * 1024)}MB)`,
        code: "FILE_TOO_LARGE",
      },
      { status: 400 },
    );
  }

  let chunks: IncomingChunk[];
  try {
    chunks = JSON.parse(String(chunksRaw || "[]")) as IncomingChunk[];
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid chunks JSON" },
      { status: 400 },
    );
  }

  if (!Array.isArray(chunks) || chunks.length === 0) {
    return NextResponse.json(
      { success: false, message: "At least one chunk is required" },
      { status: 400 },
    );
  }

  for (const c of chunks) {
    if (
      !c ||
      typeof c.content !== "string" ||
      !c.content.trim() ||
      !Array.isArray(c.embedding) ||
      c.embedding.length !== EMBEDDING_DIM
    ) {
      return NextResponse.json(
        {
          success: false,
          message: `Each chunk needs content and a ${EMBEDDING_DIM}-d embedding`,
        },
        { status: 400 },
      );
    }
  }

  // Ownership
  const { data: buddy, error: buddyError } = await supabase
    .from("study_bots")
    .select("id, profile_id")
    .eq("id", buddyId)
    .eq("profile_id", user.id)
    .single();

  if (buddyError || !buddy) {
    return NextResponse.json(
      { success: false, message: "Study buddy not found" },
      { status: 404 },
    );
  }

  // Claim storage quota (atomic)
  const { data: claimed, error: claimError } = await supabase.rpc(
    "claim_study_storage",
    { bytes: file.size },
  );

  if (claimError) {
    console.error("claim_study_storage:", claimError.message);
    return NextResponse.json(
      { success: false, message: "Could not claim storage quota" },
      { status: 500 },
    );
  }

  if (!claimed) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Storage quota exceeded. Free accounts include 750MB for Study Buddy files.",
        code: "STORAGE_QUOTA_EXCEEDED",
      },
      { status: 429 },
    );
  }

  const mimeType = mimeOfFile(file);
  const safeName = file.name.replace(/[^\w.\-()+ ]+/g, "_").slice(0, 180);

  const { data: docRow, error: docError } = await supabase
    .from("study_bot_documents")
    .insert({
      study_bot_id: buddyId,
      document_name: file.name,
      document_size: file.size,
      mime_type: mimeType,
      status: "pending",
      embedding_model: embeddingModel,
    })
    .select("id")
    .single();

  if (docError || !docRow) {
    await supabase.rpc("release_study_storage", { bytes: file.size });
    return NextResponse.json(
      {
        success: false,
        message: docError?.message || "Failed to create document row",
      },
      { status: 500 },
    );
  }

  const storagePath = `${user.id}/${buddyId}/${docRow.id}/${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("study-documents")
    .upload(storagePath, file, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) {
    console.error("storage upload:", uploadError.message);
    await supabase.from("study_bot_documents").delete().eq("id", docRow.id);
    // trigger releases storage on document delete
    return NextResponse.json(
      { success: false, message: `Storage upload failed: ${uploadError.message}` },
      { status: 500 },
    );
  }

  await supabase
    .from("study_bot_documents")
    .update({ storage_path: storagePath, status: "ready" })
    .eq("id", docRow.id);

  const rows = chunks.map((c) => ({
    profile_id: user.id,
    study_bot_id: buddyId,
    document_id: docRow.id,
    document_name: file.name,
    content: c.content,
    chunk_index: c.chunkIndex,
    mime_type: mimeType,
    source_type: sourceType,
    embedding: c.embedding,
    language,
    embedding_model: embeddingModel,
  }));

  const BATCH = 40;
  let chunksStored = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const { error: insertError } = await supabase
      .from("document_chunks")
      .insert(batch);
    if (insertError) {
      console.error("chunk insert:", insertError.message);
      // Clean up partial
      await supabase.from("document_chunks").delete().eq("document_id", docRow.id);
      await supabase.storage.from("study-documents").remove([storagePath]);
      await supabase.from("study_bot_documents").delete().eq("id", docRow.id);
      return NextResponse.json(
        { success: false, message: insertError.message },
        { status: 500 },
      );
    }
    chunksStored += batch.length;
  }

  return NextResponse.json({
    success: true,
    documentId: docRow.id,
    chunksStored,
    storagePath,
  });
}
