import { createClient } from "@/lib/server";
import { NextResponse } from "next/server";

import { createProfile } from "@/lib/admin";

export async function POST(request: Request) {
  const supabase = await createClient();

  const reqData = await request.json();

  const email = reqData.email;
  const password = reqData.password;

  const userData = {
    email: email,
    password: password,
    options: {
      emailRedirectTo: "http://localhost:3000/dashboard",
    },
  };

  const { data, error } = await supabase.auth.signUp(userData);

  if (error) {
    console.error("Sign up error");
    return NextResponse.json({ success: false }, { status: 400 });
  }

  // user creation success, now create the profile
  const userId = data.user?.id;
  const username = reqData.username;

  // 6/19 profile creation when a new user signs up
  createProfile(userId!, username);

  return NextResponse.json({ success: true }, { status: 200 });
}
