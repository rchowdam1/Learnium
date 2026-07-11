import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

/**
 * Delete a study buddy owned by the current user.
 * Cascades documents/chunks; storage bytes released via DB trigger.
 * Also removes storage objects when storage_path is set.
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

  let body: { buddyId?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid body" },
      { status: 400 },
    );
  }

  const buddyId = Number(body.buddyId);
  if (!Number.isFinite(buddyId)) {
    return NextResponse.json(
      { success: false, message: "buddyId required" },
      { status: 400 },
    );
  }

  const { data: docs } = await supabase
    .from("study_bot_documents")
    .select("storage_path")
    .eq("study_bot_id", buddyId);

  const paths = (docs || [])
    .map((d) => d.storage_path)
    .filter((p): p is string => Boolean(p));

  if (paths.length > 0) {
    await supabase.storage.from("study-documents").remove(paths);
  }

  const { error } = await supabase
    .from("study_bots")
    .delete()
    .eq("id", buddyId)
    .eq("profile_id", user.id);

  if (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}
