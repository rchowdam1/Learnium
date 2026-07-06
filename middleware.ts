import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  //console.log("Middleware running");

  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_API_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const url = request.nextUrl.clone();

  if (user && url.pathname === "/login") {
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  const protectedPaths: string[] = [
    "/dashboard",
    "/sets",
    "/profile",
    "/subscriptions",
    "/buddy",
    "/learn",
    "/review",
    "/leagues",
    "/paths",
    "/settings",
    "/onboarding",
  ];

  //console.log(url.pathname);

  let trespass = false;

  // Prefix matching warning: Using `startsWith` checks can lead to accidental over-matching
  // (e.g., `/settings-profile` starting with `/settings`).
  // To prevent this and preserve exact sub-resource matching (like `/settings/account`),
  // we check if the pathname is an exact match OR is immediately followed by a slash.
  protectedPaths.forEach((path) => {
    if (url.pathname === path || url.pathname.startsWith(path + "/")) {
      trespass = true;
    }
  });

  if (trespass && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    // Preserve the return URL where safe (relative paths only, starting with a single slash)
    const nextPath = url.pathname + url.search;
    loginUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}
