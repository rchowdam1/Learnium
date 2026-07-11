import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import { createBuddy } from "@/actions/dbops";
import {
  FREE_STORAGE_BYTES,
  PLUS_STORAGE_BYTES,
} from "@/lib/ingest/limits";

export const maxDuration = 60;

/**
 * Create a Study Buddy shell (no files).
 * Client then runs extract/chunk/embed and posts to /api/ingest-document.
 */
export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { error: "User not authenticated" },
      { status: 401 },
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    // Backward-compat: old multipart form (server-side ingest) no longer supported
    return NextResponse.json(
      {
        error:
          "Send JSON { title, description, category }. Files are ingested client-side via /api/ingest-document.",
      },
      { status: 400 },
    );
  }

  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim();
  const category = String(body.category || "").trim();

  if (!title || !description || !category) {
    return NextResponse.json(
      { error: "Title, description, and category are required" },
      { status: 400 },
    );
  }

  const createBuddyResult = await createBuddy(title, description, category);
  if (createBuddyResult === false) {
    return NextResponse.json(
      {
        success: false,
        message: "Something went wrong while creating the buddy",
      },
      { status: 400 },
    );
  }

  const { data: profile } = await supabase
    .from("profile")
    .select("storage_bytes_used, is_subscribed")
    .eq("id", user.id)
    .single();

  const used = Number(profile?.storage_bytes_used ?? 0);
  const cap = profile?.is_subscribed
    ? PLUS_STORAGE_BYTES
    : FREE_STORAGE_BYTES;

  return NextResponse.json(
    {
      success: true,
      buddyId: createBuddyResult.id,
      storageBytesUsed: used,
      storageBytesCap: cap,
      storageBytesRemaining: Math.max(0, cap - used),
    },
    { status: 200 },
  );
}
