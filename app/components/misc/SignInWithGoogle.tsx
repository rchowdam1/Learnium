"use client";

import Image from "next/image";

export default function SignInWithGoogle({ login }: { login: boolean }) {
  return (
    <form action="/api/login/google" method="GET" className="w-96 mt-1">
      <button
        type="submit"
        className="focus-ring flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 py-2 text-label text-primary hover:bg-surface-raised"
      >
        <Image src="/google2.png" alt="google" height="30" width="30" />
        {login ? "Log In" : "Sign Up"} with Google
      </button>
    </form>
  );
}
