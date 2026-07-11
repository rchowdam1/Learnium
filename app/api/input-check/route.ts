import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

const EDGE_FUNCTION_URL = `${process.env.SUPABASE_URL ?? "https://mcyljssaisahfpwrdikt.supabase.co"}/functions/v1/generate-set-job`;

/**
 * POST /api/input-check
 *
 * Enqueue pipeline (replaces synchronous multi-phase generation):
 *   1. Parse request body
 *   2. Authenticate
 *   3. Validate input
 *   4. Check quota (read-only, refresh if eligible)
 *   5. Idempotency: reject duplicate active jobs for same user+title
 *   6. Insert queued set_generation_jobs row
 *   7. Invoke Edge Function with service-role key
 *   8. Return { success: true, jobId } immediately
 *
 * PATCH /api/input-check
 *   Cancel a queued/running job. Body: { jobId }.
 */
export async function POST(request: Request) {
  // ─── Step 1: Parse body ────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body" },
      { status: 400 },
    );
  }

  const rawTitle = typeof body.title === "string" ? body.title.trim() : "";
  const rawDescription =
    typeof body.description === "string" ? body.description.trim() : "";
  const rawCategory =
    typeof body.category === "string" ? body.category.trim() : "";

  // ─── Step 2: Authenticate ──────────────────────────────────────────
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

  // ─── Step 3: Validate input ────────────────────────────────────────
  if (!rawTitle || !rawDescription || !rawCategory) {
    return NextResponse.json(
      { success: false, message: "Title, description, and category are required" },
      { status: 400 },
    );
  }

  if (!/[aeiou]{1,}/i.test(rawDescription)) {
    return NextResponse.json(
      { success: false, message: "Description must contain meaningful text" },
      { status: 400 },
    );
  }

  if (/[^aeiou]{7,}/i.test(rawDescription)) {
    return NextResponse.json(
      { success: false, message: "Description contains too many consecutive consonants" },
      { status: 400 },
    );
  }

  if (/(.{3,})\1{1,}/i.test(rawDescription)) {
    return NextResponse.json(
      { success: false, message: "Description contains repeating text" },
      { status: 400 },
    );
  }

  if (rawTitle.length > 120) {
    return NextResponse.json(
      { success: false, message: "Title must be under 120 characters" },
      { status: 400 },
    );
  }

  // ─── Step 4: Read-only quota pre-check ─────────────────────────────
  const { data: profileData, error: profileError } = await supabase
    .from("profile")
    .select("sets_remaining, sets_refresh_at")
    .eq("id", user.id)
    .single();

  if (profileError || !profileData) {
    return NextResponse.json(
      { success: false, message: "Could not retrieve profile" },
      { status: 500 },
    );
  }

  const refreshDue =
    profileData.sets_refresh_at === null ||
    new Date(profileData.sets_refresh_at) <= new Date();
  const quotaAvailable = profileData.sets_remaining > 0 || refreshDue;

  if (!quotaAvailable) {
    return NextResponse.json(
      {
        success: false,
        message: "No set generation quota remaining for today",
        code: "QUOTA_EXHAUSTED",
        retryable: true,
      },
      { status: 429 },
    );
  }

  // ─── Step 5: Idempotency check ─────────────────────────────────────
  // Prevent duplicate active jobs for the same user+title
  const { data: existingJobs } = await supabase
    .from("set_generation_jobs")
    .select("id, title")
    .eq("profile_id", user.id)
    .in("status", ["queued", "running"]);

  const existingJob = existingJobs?.find(
    (candidate) => candidate.title.toLocaleLowerCase() === rawTitle.toLocaleLowerCase(),
  );
  if (existingJob) {
    // Invoke the Edge Function to ensure the existing job is being processed
    await invokeEdgeFunction(existingJob.id);
    return NextResponse.json({
      success: true,
      jobId: existingJob.id,
      deduplicated: true,
    });
  }

  // ─── Step 6: Create queued job ─────────────────────────────────────
  const { data: job, error: insertError } = await supabase
    .from("set_generation_jobs")
    .insert({
      profile_id: user.id,
      title: rawTitle,
      description: rawDescription,
      category: rawCategory,
      status: "queued",
      phase: "Queued",
      completed_lessons: 0,
    })
    .select("id")
    .single();

  if (insertError || !job) {
    if (insertError?.code === "23505") {
      const { data: activeJob } = await supabase
        .from("set_generation_jobs")
        .select("id, title")
        .eq("profile_id", user.id)
        .in("status", ["queued", "running"]);
      const matchingJob = activeJob?.find(
        (candidate) => candidate.title.toLocaleLowerCase() === rawTitle.toLocaleLowerCase(),
      );
      if (matchingJob) {
        const invokeResult = await invokeEdgeFunction(matchingJob.id);
        if (invokeResult.ok) {
          return NextResponse.json({ success: true, jobId: matchingJob.id, deduplicated: true });
        }
      }
    }
    console.error("Failed to create generation job:", insertError?.message);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to enqueue generation job",
        code: "ENQUEUE_ERROR",
        retryable: true,
      },
      { status: 500 },
    );
  }

  // ─── Step 7: Invoke Edge Function ──────────────────────────────────
  const invokeResult = await invokeEdgeFunction(job.id);

  if (!invokeResult.ok) {
    console.warn(
      `Job ${job.id} enqueued but Edge Function invocation failed: ${invokeResult.error}`,
    );
    return NextResponse.json(
      {
        success: false,
        jobId: job.id,
        message: "Generation worker could not start. Please try again.",
        code: "WORKER_START_ERROR",
        retryable: true,
      },
      { status: 502 },
    );
  }

  // ─── Step 8: Return immediately ────────────────────────────────────
  return NextResponse.json({ success: true, jobId: job.id });
}

/**
 * PATCH /api/input-check — Cancel a queued/running generation job.
 */
export async function PATCH(request: Request) {
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

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request body" },
      { status: 400 },
    );
  }

  const jobId = typeof body.jobId === "string" ? body.jobId : "";

  if (!jobId) {
    return NextResponse.json(
      { success: false, message: "jobId is required" },
      { status: 400 },
    );
  }

  const { data: cancelledJobs, error } = await supabase
    .from("set_generation_jobs")
    .update({ status: "cancelled", phase: "Cancelled" })
    .eq("id", jobId)
    .eq("profile_id", user.id)
    .in("status", ["queued", "running"])
    .select("id");

  if (error) {
    console.error("Failed to cancel job:", error.message);
    return NextResponse.json(
      { success: false, message: "Failed to cancel job" },
      { status: 500 },
    );
  }

  if (!cancelledJobs || cancelledJobs.length === 0) {
    return NextResponse.json(
      { success: false, message: "Generation job is no longer cancellable" },
      { status: 409 },
    );
  }

  return NextResponse.json({ success: true });
}

// ─── Helpers ────────────────────────────────────────────────────────────────

async function invokeEdgeFunction(jobId: string): Promise<{ ok: boolean; error?: string }> {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    console.error("SUPABASE_SERVICE_ROLE_KEY not configured");
    return { ok: false, error: "Service role key not configured" };
  }

  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apiKey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({ jobId }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return { ok: false, error: `HTTP ${response.status}: ${errorText.slice(0, 200)}` };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { ok: false, error: message };
  }
}
