import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

export async function GET(request: Request) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return NextResponse.redirect(new URL("/error", request.url));
  }

  // successful
  return NextResponse.redirect(new URL("/", request.url));
}
