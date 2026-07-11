"use client";
import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";

import toast from "react-hot-toast";
import { ACCEPTED_TYPES_ATTR, isAllowedFile } from "@/lib/ingest/allowed-types";
import {
  formatBytes,
  FREE_STORAGE_BYTES,
  MAX_FILE_BYTES,
  MAX_FILES_PER_BUDDY,
} from "@/lib/ingest/limits";
import {
  prepareFileForIngest,
  type PipelineProgress,
} from "@/lib/ingest/client/pipeline";
import { needsServerExtract } from "@/lib/ingest/allowed-types";
import { preloadEmbedder } from "@/lib/ingest/client/embed";

type CreateStudyBuddyModalProps = {
  open: boolean;
  onClose: () => void;
  onCreateStudyBuddy: (
    title: string,
    description: string,
    category: string,
    buddyId?: number,
  ) => void;
};

export default function CreateStudyBuddyModal({
  open,
  onClose,
  onCreateStudyBuddy,
}: CreateStudyBuddyModalProps) {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<PipelineProgress>({ phase: "idle" });
  const [storageUsed, setStorageUsed] = useState(0);
  const [storageCap, setStorageCap] = useState(FREE_STORAGE_BYTES);

  useEffect(() => {
    if (!open) return;
    fetch("/api/storage-usage")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setStorageUsed(Number(data.storageBytesUsed) || 0);
          setStorageCap(Number(data.storageBytesCap) || FREE_STORAGE_BYTES);
        }
      })
      .catch(() => {});
  }, [open]);

  if (!open) {
    return null;
  }

  const handleClose = () => {
    if (isLoading) return;
    setTitle("");
    setDescription("");
    setCategory("");
    setIsLoading(false);
    setUploadedFiles([]);
    setProgress({ phase: "idle" });
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const incoming = Array.from(files);
    setUploadedFiles((prev) => {
      const room = MAX_FILES_PER_BUDDY - prev.length;
      if (room <= 0) {
        toast.error(
          `You can upload up to ${MAX_FILES_PER_BUDDY} files. Remove one to add another.`,
        );
        return prev;
      }

      const accepted: File[] = [];
      let batchBytes = prev.reduce((s, f) => s + f.size, 0);

      for (const file of incoming.slice(0, room)) {
        if (!isAllowedFile(file)) {
          toast.error(`${file.name}: unsupported file type`);
          continue;
        }
        if (file.size > MAX_FILE_BYTES) {
          toast.error(
            `${file.name}: max ${formatBytes(MAX_FILE_BYTES)} per file`,
          );
          continue;
        }
        if (storageUsed + batchBytes + file.size > storageCap) {
          toast.error(
            `Not enough storage (${formatBytes(storageUsed)} / ${formatBytes(storageCap)} used). Free tier includes 750MB.`,
          );
          break;
        }
        accepted.push(file);
        batchBytes += file.size;
      }

      if (incoming.length > room) {
        toast.error(
          `Only ${room} more file(s) can be added (max ${MAX_FILES_PER_BUDDY}).`,
        );
      }
      return [...prev, ...accepted];
    });
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setProgress({ phase: "loading-model", detail: "Starting…" });

    if (
      title.trim() === "" ||
      description.trim() === "" ||
      category.trim() === ""
    ) {
      toast.error("Please fill in all fields");
      setIsLoading(false);
      setProgress({ phase: "idle" });
      return;
    }

    if (uploadedFiles.length === 0) {
      toast.error("Please upload at least one file");
      setIsLoading(false);
      setProgress({ phase: "idle" });
      return;
    }

    const totalBytes = uploadedFiles.reduce((s, f) => s + f.size, 0);
    if (storageUsed + totalBytes > storageCap) {
      toast.error(
        `These files exceed your storage limit (${formatBytes(storageUsed)} / ${formatBytes(storageCap)}).`,
      );
      setIsLoading(false);
      setProgress({ phase: "idle" });
      return;
    }

    let buddyId: number | undefined;

    try {
      setProgress({
        phase: "loading-model",
        detail: "Loading local embedding model…",
      });
      try {
        await preloadEmbedder();
      } catch {
        // Fallback path inside embed client
      }

      // 1. Create buddy shell
      const createRes = await fetch("/api/create-buddy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, category }),
      });
      const createData = await createRes.json();

      if (!createRes.ok || !createData.success || !createData.buddyId) {
        toast.error(createData.error || createData.message || "Could not create buddy");
        setIsLoading(false);
        setProgress({ phase: "error", detail: createData.message });
        return;
      }

      buddyId = createData.buddyId as number;
      if (typeof createData.storageBytesUsed === "number") {
        setStorageUsed(createData.storageBytesUsed);
      }
      if (typeof createData.storageBytesCap === "number") {
        setStorageCap(createData.storageBytesCap);
      }

      let chunksTotal = 0;
      const errors: string[] = [];

      // 2. Per-file client pipeline + server ingest
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        setProgress({
          phase: "extracting",
          fileName: file.name,
          fileIndex: i + 1,
          fileTotal: uploadedFiles.length,
          detail: `Processing ${file.name}…`,
        });

        let overrideText: string | undefined;

        if (needsServerExtract(file)) {
          setProgress({
            phase: "extracting",
            fileName: file.name,
            fileIndex: i + 1,
            fileTotal: uploadedFiles.length,
            detail: `Transcribing/analyzing ${file.name} with AI…`,
          });
          const mediaForm = new FormData();
          mediaForm.append("file", file);
          const mediaRes = await fetch("/api/extract-media", {
            method: "POST",
            body: mediaForm,
          });
          const mediaData = await mediaRes.json();
          if (!mediaRes.ok || !mediaData.success || !mediaData.text) {
            errors.push(
              `${file.name}: ${mediaData.message || "media extract failed"}`,
            );
            continue;
          }
          overrideText = mediaData.text as string;
        }

        const prepared = await prepareFileForIngest(file, {
          overrideText,
          fileIndex: i + 1,
          fileTotal: uploadedFiles.length,
          onProgress: setProgress,
        });

        if (prepared.error || prepared.chunks.length === 0) {
          errors.push(`${file.name}: ${prepared.error || "no chunks"}`);
          continue;
        }

        setProgress({
          phase: "uploading",
          fileName: file.name,
          fileIndex: i + 1,
          fileTotal: uploadedFiles.length,
          detail: `Uploading ${file.name} to Supabase…`,
        });

        const form = new FormData();
        form.append("buddyId", String(buddyId));
        form.append("file", file);
        form.append("sourceType", prepared.sourceType);
        form.append("language", prepared.language);
        form.append("embeddingModel", prepared.embeddingModel);
        form.append(
          "chunks",
          JSON.stringify(
            prepared.chunks.map((c) => ({
              content: c.content,
              chunkIndex: c.chunkIndex,
              embedding: c.embedding,
            })),
          ),
        );

        const ingestRes = await fetch("/api/ingest-document", {
          method: "POST",
          body: form,
        });
        const ingestData = await ingestRes.json();

        if (!ingestRes.ok || !ingestData.success) {
          errors.push(
            `${file.name}: ${ingestData.message || "ingest failed"}`,
          );
          continue;
        }

        chunksTotal += Number(ingestData.chunksStored) || 0;
      }

      if (chunksTotal === 0) {
        // Clean up empty buddy
        await fetch("/api/delete-buddy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ buddyId }),
        }).catch(() => {});

        toast.error(
          errors[0] ||
            "Could not extract content from your files. Try PDF, DOCX, PPTX, text, images, or audio.",
        );
        setIsLoading(false);
        setProgress({ phase: "error", detail: errors[0] });
        return;
      }

      onCreateStudyBuddy(title, description, category, buddyId);
      toast.success(
        `Study buddy created with ${chunksTotal} indexed sections`,
      );
      if (errors.length > 0) {
        toast.error(`${errors.length} file(s) failed: ${errors[0]}`);
      }
      setIsLoading(false);
      setProgress({ phase: "done" });
      handleClose();
    } catch (error) {
      console.error("Error creating study buddy:", error);
      if (buddyId) {
        await fetch("/api/delete-buddy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ buddyId }),
        }).catch(() => {});
      }
      toast.error(
        "There was an error creating your Study Buddy. Please try again.",
      );
      setIsLoading(false);
      setProgress({ phase: "error" });
    }
  };

  const selectedBytes = uploadedFiles.reduce((s, f) => s + f.size, 0);
  const projectedUsed = storageUsed + selectedBytes;
  const usagePct = Math.min(100, (projectedUsed / storageCap) * 100);

  const progressLabel = (() => {
    if (!isLoading) return null;
    switch (progress.phase) {
      case "loading-model":
        return progress.detail || "Loading embedding model…";
      case "extracting":
        return progress.detail || "Extracting…";
      case "embedding":
        return progress.detail || "Embedding…";
      case "uploading":
        return progress.detail || "Uploading…";
      default:
        return "Working…";
    }
  })();

  return (
    <>
      <button
        type="button"
        aria-label="Close create study buddy modal"
        className={`fixed inset-0 z-40 transition-all duration-200 ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
        style={{ backgroundColor: "var(--overlay)" }}
        onClick={handleClose}
      />
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
        <div
          className={`pointer-events-auto max-h-[80vh] overflow-y-auto rounded-2xl border border-border bg-surface-raised p-6 text-center shadow-sm transition-all ${
            open ? "scale-100 opacity-100" : "scale-125 opacity-0"
          } `}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-study-buddy-title"
        >
          <div
            className="relative flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close create study buddy modal"
              className="focus-ring absolute right-2 top-2 cursor-pointer rounded-xl bg-surface p-1 text-muted hover:bg-surface-raised hover:text-primary"
              onClick={handleClose}
              disabled={isLoading}
            >
              <X />
            </button>
            <span id="create-study-buddy-title" className="text-heading">
              Create New Study Buddy
            </span>
            <span className="text-body text-sm text-muted">
              Upload study materials — PDF, DOCX, PPTX, MP3, WAV, MP4, and more.
              <br />
              Chunking &amp; embeddings run in your browser; files store on Supabase.
            </span>

            {/* Storage meter */}
            <div className="mt-3 w-full max-w-md rounded-xl border border-border bg-surface px-3 py-2 text-left">
              <div className="flex items-center justify-between gap-2">
                <span className="text-label text-xs text-muted">Storage</span>
                <span className="text-numeral text-caption text-primary">
                  {formatBytes(projectedUsed)} / {formatBytes(storageCap)}
                </span>
              </div>
              <div
                className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-accent-progress-track"
                role="progressbar"
                aria-valuenow={Math.round(usagePct)}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="h-full rounded-full bg-accent-progress transition-all"
                  style={{ width: `${usagePct}%` }}
                />
              </div>
              <p className="text-caption mt-1 text-muted">
                Free accounts include 750MB of Study Buddy files.
              </p>
            </div>

            <form
              className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2"
              onSubmit={formSubmit}
            >
              <div className="flex flex-col gap-1">
                <label className="text-label text-sm">Title</label>
                <input
                  type="text"
                  placeholder="Title"
                  value={title}
                  className="focus-ring w-80 rounded-xl border border-border-interactive bg-surface-raised px-2 py-2 text-body text-primary placeholder:text-muted"
                  required
                  disabled={isLoading}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-label">Category</label>
                <input
                  type="text"
                  placeholder="e.g., Biology, History, Math"
                  value={category}
                  className="focus-ring w-80 rounded-xl border border-border-interactive bg-surface-raised px-2 py-2 text-body text-primary placeholder:text-muted"
                  required
                  disabled={isLoading}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div className="col-span-2 flex flex-col gap-1">
                <label className="text-label">Description</label>
                <textarea
                  placeholder="What will your Study Buddy help you with?"
                  value={description}
                  rows={3}
                  className="focus-ring resize-none rounded-xl border border-border-interactive bg-surface-raised px-2 py-2 text-body text-primary placeholder:text-muted"
                  required
                  disabled={isLoading}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex flex-col items-center gap-1 text-center md:col-span-2">
                <label className="text-label">
                  Upload files (pdf, docx, pptx, mp3, wav, mp4, images, notes —
                  max {MAX_FILES_PER_BUDDY})
                </label>
                <input
                  type="file"
                  multiple
                  accept={ACCEPTED_TYPES_ATTR}
                  onChange={handleFileUpload}
                  disabled={isLoading}
                  className="text-body text-sm text-muted file:mr-5 file:cursor-pointer file:rounded-full file:border file:border-border file:bg-surface file:px-4 file:py-2 file:text-label file:text-primary hover:file:bg-surface-raised"
                />
                <div className="mt-2"></div>
                {uploadedFiles.map((file, index) => {
                  return (
                    <div
                      key={`${file.name}-${index}`}
                      className={`flex w-80 items-center justify-between gap-2 truncate rounded-xl border border-border bg-surface px-2 py-2 text-body text-primary ${
                        index !== uploadedFiles.length - 1 ? "mb-1" : ""
                      }`}
                    >
                      <span className="truncate text-left">
                        {file.name}{" "}
                        <span className="text-caption text-muted">
                          ({formatBytes(file.size)})
                        </span>
                      </span>
                      <button
                        type="button"
                        className="shrink-0 text-muted hover:text-primary"
                        aria-label={`Remove ${file.name}`}
                        onClick={() => removeFile(index)}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {isLoading && progressLabel && (
                <div className="col-span-2 flex flex-col items-center gap-2 rounded-xl border border-border bg-surface px-3 py-3">
                  <Loader2 className="h-5 w-5 animate-spin text-brand" />
                  <p className="text-caption text-muted">{progressLabel}</p>
                </div>
              )}

              <div className="col-span-2 mt-2 flex justify-end gap-2">
                <button
                  type="button"
                  className="focus-ring rounded-xl border border-border-interactive px-4 py-2 text-label text-primary hover:bg-surface"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="focus-ring inline-flex items-center gap-2 rounded-xl bg-cta px-4 py-2 text-label text-cta-text disabled:cursor-not-allowed disabled:bg-cta-disabled disabled:text-disabled"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create Buddy
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
