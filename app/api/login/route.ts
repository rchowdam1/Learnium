import { NextResponse } from "next/server";
import { createClient } from "@/lib/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const data = await request.json();

  const email = data.email;
  const password = data.password;

  const userData = {
    email: email,
    password: password,
  };

  const { error } = await supabase.auth.signInWithPassword(userData);

  if (error) {
    console.log("Error happened while logging in");
    return NextResponse.json({ success: false }, { status: 500 });
  }

  // successful
  console.log("Success happened while logging in");
  return NextResponse.redirect(new URL("/dashboard", request.url));
}
