import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    return NextResponse.json(
      { error: "User is not logged in" },
      { status: 401 }
    );
  }

  const email: string | undefined = user?.email;

  const { data: profileData, error: profileError } = await supabase
    .from("profile")
    .select("*")
    .eq("id", user?.id)
    .single();

  if (profileError) {
    return NextResponse.json({ message: "No profile found" }, { status: 404 });
  }

  return NextResponse.json(
    {
      message: "Found user data",
      email,
      isSubscribed: profileData.is_subscribed,
    },
    { status: 200 }
  );
}
