"use client";
import { useState } from "react";
import { X, Loader2 } from "lucide-react";

import toast from "react-hot-toast";

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

const ACCEPTED_TYPES =
  ".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.csv,.json,.html,.png,.jpg,.jpeg,.webp,.gif,.mp3,.wav,.m4a,.ogg,.webm,.mp4";

const MAX_FILES = 8;

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

  if (!open) {
    return;
  }

  const handleClose = () => {
    setTitle("");
    setDescription("");
    setCategory("");
    setIsLoading(false);
    setUploadedFiles([]);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const incoming = Array.from(files);
    setUploadedFiles((prev) => {
      const room = MAX_FILES - prev.length;
      if (room <= 0) {
        toast.error(
          `You can upload up to ${MAX_FILES} files. Remove one to add another.`,
        );
        return prev;
      }
      if (incoming.length > room) {
        toast.error(`Only ${room} more file(s) can be added (max ${MAX_FILES}).`);
      }
      return [...prev, ...incoming.slice(0, room)];
    });
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    if (
      title.trim() === "" ||
      description.trim() === "" ||
      category.trim() === ""
    ) {
      toast.error("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    if (uploadedFiles.length === 0) {
      toast.error("Please upload at least one file");
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    uploadedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await fetch("/api/create-buddy", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.error) {
        toast.error(data.error);
        setIsLoading(false);
        return;
      }

      if (data.success && (data.chunks_count ?? 0) > 0) {
        onCreateStudyBuddy(title, description, category, data.buddyId);
        toast.success(
          `Study buddy created with ${data.chunks_count} indexed sections`,
        );
        setIsLoading(false);
        handleClose();
        return;
      }

      const detail =
        Array.isArray(data.errors) && data.errors.length > 0
          ? data.errors[0]
          : data.message ||
            "Could not extract content from your files. Try PDF, DOCX, PPTX, text, images, or audio.";
      toast.error(detail);
      setIsLoading(false);
    } catch (error) {
      console.log("Error creating study buddy:", error);
      toast.error(
        "There was an error creating your Study Buddy. Please try again.",
      );
      setIsLoading(false);
    }
  };

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
            className="flex flex-col justify-center items-center"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close create study buddy modal"
              className="focus-ring absolute right-2 top-2 cursor-pointer rounded-xl bg-surface p-1 text-muted hover:bg-surface-raised hover:text-primary"
              onClick={handleClose}
            >
              <X />
            </button>
            <span id="create-study-buddy-title" className="text-heading">
              Create New Study Buddy
            </span>
            <span className="text-body text-sm text-muted">
              Upload any study materials — text, PDFs, slides,
              <br />
              images, or audio — then chat with AI about them
            </span>

            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
              onSubmit={formSubmit}
            >
              <div className="flex flex-col gap-1">
                <label className="text-label text-sm">Title</label>
                <input
                  type="text"
                  placeholder="Title"
                  className="focus-ring w-80 rounded-xl border border-border-interactive bg-surface-raised px-2 py-2 text-body text-primary placeholder:text-muted"
                  required
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-label">Category</label>
                <input
                  type="text"
                  placeholder="e.g., Biology, History, Math"
                  className="focus-ring w-80 rounded-xl border border-border-interactive bg-surface-raised px-2 py-2 text-body text-primary placeholder:text-muted"
                  required
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1 col-span-2">
                <label className="text-label">Description</label>
                <textarea
                  placeholder="What will your Study Buddy help you with?"
                  rows={3}
                  className="focus-ring resize-none rounded-xl border border-border-interactive bg-surface-raised px-2 py-2 text-body text-primary placeholder:text-muted"
                  required
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-1 md:col-span-2 items-center text-center">
                <label className="text-label">
                  Upload files (PDF, Office, text, images, audio — max{" "}
                  {MAX_FILES})
                </label>
                <input
                  type="file"
                  multiple
                  accept={ACCEPTED_TYPES}
                  onChange={handleFileUpload}
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
                      <span className="truncate text-left">{file.name}</span>
                      <button
                        type="button"
                        className="shrink-0 text-muted hover:text-primary"
                        aria-label={`Remove ${file.name}`}
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="mt-7 flex md:col-span-2 justify-center">
                <button
                  type="button"
                  className="focus-ring w-39 cursor-pointer rounded-xl border border-border bg-surface py-2 text-label text-primary hover:bg-surface-raised"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="focus-ring ml-2 flex w-39 cursor-pointer items-center justify-center gap-2 rounded-xl bg-cta py-2 text-label text-cta-text hover:bg-cta-hover disabled:bg-cta-disabled disabled:text-muted"
                  disabled={isLoading}
                >
                  {isLoading && (
                    <>
                      <Loader2 className="animate-spin w-4 h-4" />
                      <span>Ingesting...</span>
                    </>
                  )}
                  {!isLoading && "Create Study Buddy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
