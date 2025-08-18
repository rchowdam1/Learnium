import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/lib/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get("next") ?? "/";
  if (!next.startsWith("/")) {
    // if "next" is not a relative URL, use the default
    next = "/";
  }

  next = "/dashboard";
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    // extract the authenticated user to see if their profile already exists
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.log("User error occurred");
    } else {
      const email = user!.email;
      const defaultUsername = email?.split("@")[0];
      //console.log(user?.email);

      // check if email exists
      const { data: profile } = await supabase
        .from("profile")
        .select("id")
        .eq("id", user?.id)
        .single();

      if (!profile) {
        // before inserting
        console.log("Inserting profile:", {
          id: user?.id,
          username: defaultUsername,
        });

        // insert a new profile with the default username
        const { error: insertError } = await supabase
          .from("profile")
          .insert([
            {
              id: user?.id,
              username: defaultUsername,
            },
          ])
          .select();

        if (insertError) {
          console.log("Failed to create profile for user:", insertError);
        }
      }
    }

    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        /*console.log(
          "Executing here in the Oauth callback, redirecting to /{origin}{next}"
        );*/
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        /*console.log(
          "Executing here in the Oauth callback, redirecting to /{forwardedHost}{next}"
        );*/
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        /*console.log(
          "Executing here in the Oauth callback, redirecting to /dashboard"
        );*/
        return NextResponse.redirect(`${origin}/dashboard`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
