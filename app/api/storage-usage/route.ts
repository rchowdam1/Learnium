import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";
import {
  FREE_STORAGE_BYTES,
  PLUS_STORAGE_BYTES,
} from "@/lib/ingest/limits";

export async function GET() {
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

  const { data: profile } = await supabase
    .from("profile")
    .select("storage_bytes_used, is_subscribed")
    .eq("id", user.id)
    .single();

  const used = Number(profile?.storage_bytes_used ?? 0);
  const cap = profile?.is_subscribed
    ? PLUS_STORAGE_BYTES
    : FREE_STORAGE_BYTES;

  return NextResponse.json({
    success: true,
    storageBytesUsed: used,
    storageBytesCap: cap,
    storageBytesRemaining: Math.max(0, cap - used),
    isSubscribed: Boolean(profile?.is_subscribed),
  });
}
