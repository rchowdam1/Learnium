"use client";
import { useEffect, useRef, useState } from "react";
import { X, Loader2 } from "lucide-react";

import toast from "react-hot-toast";

type CreateSetResponse = {
  success?: boolean;
  jobId?: string;
  deduplicated?: boolean;
  warning?: string;
  message?: string;
  code?: string;
  retryable?: boolean;
};

type JobStatusResponse = {
  success?: boolean;
  job?: {
    id: string;
    status: "queued" | "running" | "succeeded" | "failed" | "cancelled";
    phase: string;
    completed_lessons: number;
    total_lessons: number | null;
    set_id: number | null;
    error_code: string | null;
    error_message: string | null;
  };
};

type CreateModalProps = {
  open: boolean;
  onClose: () => void;
  onCreateSet: (
    title: string,
    description: string,
    category: string,
    numLessons?: number,
    setId?: number
  ) => void;
};

const POLL_INTERVAL_MS = 2_000;

export default function CreateSetModal({
  open,
  onClose,
  onCreateSet,
}: CreateModalProps) {
  // input validation state
  const [requireTitle, setRequireTitle] = useState<boolean>(false);
  const [requireDescription, setRequiredDescription] = useState<boolean>(false);
  const [requireCategory, setRequiredCategory] = useState<boolean>(false);
  const [validTitleLength, setValidTitleLength] = useState<boolean>(true);
  const [validDescriptionLength, setValidDescriptionLength] = useState<boolean>(true);
  const [validTitleContent, setValidTitleContent] = useState<boolean>(true);
  const [validDescriptionContent, setValidDescriptionContent] = useState<boolean>(true);

  // form state
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [category, setCategory] = useState<string>("Select a category");

  // generation state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingPhase, setLoadingPhase] = useState<string>("");
  const [loadingDetail, setLoadingDetail] = useState<string>("");
  const generationAbortRef = useRef<AbortController | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentJobIdRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      generationAbortRef.current?.abort();
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, []);

  if (!open) return null;

  const stopPolling = () => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  };

  const resetGenerationState = () => {
    stopPolling();
    generationAbortRef.current = null;
    currentJobIdRef.current = null;
    setIsLoading(false);
    setLoadingPhase("");
    setLoadingDetail("");
  };

  const handleClose = () => {
    generationAbortRef.current?.abort();
    resetGenerationState();
    setRequireTitle(false);
    setRequiredDescription(false);
    setRequiredCategory(false);
    setValidTitleLength(true);
    setValidDescriptionLength(true);
    setValidTitleContent(true);
    setValidDescriptionContent(true);
    setTitle("");
    setDescription("");
    setCategory("Select a category");
    onClose();
  };

  const handleCancelJob = async () => {
    const jobId = currentJobIdRef.current;
    if (!jobId) return;

    try {
      const response = await fetch("/api/input-check", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId }),
      });
      if (!response.ok) {
        toast.error("Could not cancel generation. Please try again.");
        return;
      }
    } catch {
      toast.error("Could not cancel generation. Please try again.");
      return;
    }
    generationAbortRef.current?.abort();
    resetGenerationState();
  };

  // ─── Validation ──────────────────────────────────────────────────────

  const validateTitleLength = (): boolean => {
    if (title.length < 5 || title.length > 50) { setValidTitleLength(false); return false; }
    setValidTitleLength(true); return true;
  };

  const validateDescriptionLength = (): boolean => {
    if (description.length < 10 || description.length > 200) { setValidDescriptionLength(false); return false; }
    setValidDescriptionLength(true); return true;
  };

  const validateTitleContent = (): boolean => {
    if (!/^[a-zA-Z0-9\s.,'-']+$/.test(title)) { setValidTitleContent(false); return false; }
    setValidTitleContent(true); return true;
  };

  const validateDescriptionContent = (): boolean => {
    if (!/[a-zA-Z]{3}/.test(description)) { setValidDescriptionContent(false); return false; }
    if (/(asdf|qwer|lorem ipsum|aaaaa|xyz123)/i.test(description)) { setValidDescriptionContent(false); return false; }
    setValidDescriptionContent(true); return true;
  };

  const validateInputs = (): boolean => {
    let valid = true;
    if (!title) { valid = false; setRequireTitle(true); } else setRequireTitle(false);
    if (!description) { valid = false; setRequiredDescription(true); } else setRequiredDescription(false);
    if (category === "Select a category") { valid = false; setRequiredCategory(true); } else setRequiredCategory(false);
    const tLen = validateTitleLength(), dLen = validateDescriptionLength();
    const tCon = validateTitleContent(), dCon = validateDescriptionContent();
    return valid && tLen && dLen && tCon && dCon;
  };

  // ─── Polling ─────────────────────────────────────────────────────────

  const pollJobStatus = async (jobId: string, signal: AbortSignal) => {
    let pollCount = 0;
    const maxPolls = 300; // ~10 minutes at 2s interval

    const poll = async (): Promise<boolean> => {
      if (signal.aborted) return false;

      try {
        const resp = await fetch(`/api/get-set-generation-job/${jobId}`, { signal });
        if (!resp.ok) {
          if (resp.status === 404) {
            // Job vanished — stop polling
            stopPolling();
            setIsLoading(false);
            toast.error("Generation job was lost. Please try again.");
            return false;
          }
          return true; // transient — retry next poll
        }

        const data = (await resp.json()) as JobStatusResponse;
        if (!data.success || !data.job) return true;

        const job = data.job;

        // Update phase display
        setLoadingPhase(job.phase);

        if (job.total_lessons) {
          setLoadingDetail(`${job.completed_lessons} / ${job.total_lessons} lessons`);
        }

        if (job.status === "succeeded" && job.set_id) {
          // Success!
          stopPolling();
          setIsLoading(false);
          generationAbortRef.current = null;
          currentJobIdRef.current = null;

          onCreateSet(title, description, category, job.total_lessons ?? undefined, job.set_id);
          handleClose();
          return false;
        }

        if (job.status === "failed") {
          stopPolling();
          setIsLoading(false);
          generationAbortRef.current = null;
          currentJobIdRef.current = null;

          const msg = job.error_message || "Generation failed. Please try again.";
          toast.error(msg);
          return false;
        }

        if (job.status === "cancelled") {
          stopPolling();
          setIsLoading(false);
          generationAbortRef.current = null;
          currentJobIdRef.current = null;
          return false;
        }

        // Continue polling
        pollCount++;
        if (pollCount >= maxPolls) {
          stopPolling();
          setIsLoading(false);
          toast.error("Generation is taking too long. The set will appear when ready.");
          return false;
        }
        return true;
      } catch {
        return !signal.aborted;
      }
    };

    // Initial poll immediately
    const shouldContinue = await poll();

    // Recursive timeout guarantees only one status request is in flight.
    const scheduleNext = () => {
      pollTimerRef.current = setTimeout(async () => {
        if (signal.aborted) return stopPolling();
        if (await poll()) scheduleNext();
      }, POLL_INTERVAL_MS);
    };
    if (shouldContinue && !signal.aborted) {
      scheduleNext();
    }
  };

  // ─── Form submit ─────────────────────────────────────────────────────

  const formSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoading || generationAbortRef.current) return;

    if (!validateInputs()) return;

    setIsLoading(true);
    setLoadingPhase("Enqueuing…");
    setLoadingDetail("");

    const controller = new AbortController();
    generationAbortRef.current = controller;

    try {
      const response = await fetch("/api/input-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, category }),
        signal: controller.signal,
      });

      const data = (await response.json().catch(() => ({}))) as CreateSetResponse;

      if (!response.ok || (!data.success && !data.jobId)) {
        const msg = data.message || "Could not enqueue generation. Please try again.";
        toast.error(msg);
        resetGenerationState();
        return;
      }

      if (data.warning) {
        console.warn("Enqueue warning:", data.warning);
      }

      const jobId = data.jobId;
      if (!jobId) {
        toast.error("No job ID returned. Please try again.");
        resetGenerationState();
        return;
      }

      currentJobIdRef.current = jobId;

      // Start polling
      setLoadingPhase("Starting generation…");
      void pollJobStatus(jobId, controller.signal);
    } catch {
      if (!controller.signal.aborted) {
        toast.error("Could not start generation. Please try again.");
      }
      resetGenerationState();
    }
  };

  const isGenerating = isLoading && !!currentJobIdRef.current;
  const closeLabel = isGenerating ? "Close" : "Cancel";

  return (
    <>
      <button
        type="button"
        aria-label="Close create set modal"
        onClick={handleClose}
        className={`fixed inset-0 z-40 transition-all duration-200 ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
        style={{ backgroundColor: "var(--overlay)" }}
      />
      <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
        <div
          className={`pointer-events-auto rounded-2xl border border-border bg-surface-raised p-6 text-center shadow-sm transition-all ${
            open ? "scale-100 opacity-100" : "scale-125 opacity-0"
          }`}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-set-title"
        >
          <div
            className="flex flex-col justify-center items-center"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close create set modal"
              className="focus-ring absolute right-2 top-2 rounded-xl bg-surface p-1 text-muted hover:bg-surface-raised hover:text-primary"
              onClick={handleClose}
            >
              <X />
            </button>
            <span id="create-set-title" className="text-heading">Create New Learning Set</span>
            <span className="text-body text-sm text-muted">
              AI will generate bite-sized lessons based on your
              <br />
              topic and description.
            </span>

            <form
              className="flex flex-col items-start mt-4 space-y-2"
              onSubmit={formSubmit}
            >
              <label className="text-label text-sm">
                Title
                <span className="ml-3 text-xs text-error">
                  {requireTitle
                    ? "Required: Please enter a title"
                    : !validTitleLength
                    ? "Must be between 5-50 characters"
                    : !validTitleContent
                    ? "Must be plausible"
                    : ""}
                </span>
              </label>
              <input
                type="text"
                placeholder="Title"
                value={title}
                className="focus-ring w-80 rounded-xl border border-border-interactive bg-surface-raised px-2 py-2 text-body text-primary placeholder:text-muted"
                required
                disabled={isLoading}
                onChange={(e) => setTitle(e.target.value)}
              />

              <label className="text-label">
                Description
                <span className="ml-3 text-xs text-error">
                  {requireDescription
                    ? "Required: Please enter a description"
                    : !validDescriptionLength
                    ? "Must be between 10-200 characters"
                    : !validDescriptionContent
                    ? "Must be plausible in order to generate a set"
                    : ""}
                </span>
              </label>
              <textarea
                placeholder="Describe what you want to learn..."
                value={description}
                rows={3}
                className="focus-ring w-80 resize-none rounded-xl border border-border-interactive bg-surface-raised px-2 py-2 text-body text-primary placeholder:text-muted"
                required
                disabled={isLoading}
                onChange={(e) => setDescription(e.target.value)}
              />

              <label className="text-label">
                Category
                <span className="ml-3 text-xs text-error">
                  {requireCategory ? "Required: Please select a category" : ""}
                </span>
              </label>
              <select
                name="category"
                id="category"
                value={category}
                className="focus-ring w-80 rounded-xl border border-border-interactive bg-surface-raised px-3 py-3 text-body text-primary"
                disabled={isLoading}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Select a category">Select a category</option>
                <option value="Business">Business</option>
                <option value="Communication">Communication</option>
                <option value="Creativity">Creativity</option>
                <option value="Health">Health</option>
                <option value="Humanities">Humanities</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Productivity">Productivity</option>
                <option value="Science">Science</option>
                <option value="Technology">Technology</option>
                <option value="Test Prep">Test Prep</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>

              {/* Progress status (aria-live) */}
              {isLoading && (
                <div
                  className="w-80 rounded-xl bg-surface p-3 text-left"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Loader2 className="animate-spin w-4 h-4 shrink-0" />
                    <span className="font-medium">{loadingPhase || "Generating…"}</span>
                  </div>
                  {loadingDetail && (
                    <div className="mt-1 text-xs text-muted">{loadingDetail}</div>
                  )}
                </div>
              )}

              {/* Buttons */}
              <div className="mt-4 flex w-80 gap-2">
                <button
                  type="button"
                  className="focus-ring flex-1 cursor-pointer rounded-xl border border-border bg-surface py-2 text-label text-primary hover:bg-surface-raised"
                  onClick={isGenerating ? handleCancelJob : handleClose}
                >
                  {isGenerating ? "Cancel Job" : closeLabel}
                </button>
                <button
                  type="submit"
                  className="focus-ring flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-cta py-2 text-label text-cta-text hover:bg-cta-hover disabled:bg-cta-disabled disabled:text-muted"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="animate-spin w-4 h-4 shrink-0" />
                      <span className="truncate text-xs sm:text-sm">Generating…</span>
                    </span>
                  ) : (
                    "Create Set"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
