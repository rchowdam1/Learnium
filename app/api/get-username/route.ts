import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.log("Could not fetch username");
    return NextResponse.json({ success: false }, { status: 400 });
  }

  // get the profile
  const userId = user?.id;
  const { data, error } = await supabase
    .from("profile")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.log("Could not fetch username");
    return NextResponse.json({ success: false }, { status: 400 });
  }

  // got the username
  return NextResponse.json(
    { success: true, username: data.username },
    { status: 200 }
  );
}
