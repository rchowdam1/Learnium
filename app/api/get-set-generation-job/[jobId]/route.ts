import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

type Context = { params: Promise<{ jobId: string }> };

export async function GET(_request: Request, { params }: Context) {
  const { jobId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 });
  const { data, error } = await supabase.from("set_generation_jobs").select("id, status, phase, completed_lessons, total_lessons, set_id, error_code, error_message").eq("id", jobId).eq("profile_id", user.id).single();
  if (error || !data) return NextResponse.json({ success: false, message: "Generation job not found" }, { status: 404 });
  return NextResponse.json({ success: true, job: data });
}
