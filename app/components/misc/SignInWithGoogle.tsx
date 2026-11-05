"use client";

import Image from "next/image";

export default function SignInWithGoogle({ login }: { login: boolean }) {
  return (
    <form action="/api/login/google" method="GET" className="w-96 mt-1">
      <button
        type="submit"
        className="w-full bg-[#1d4159] py-2 rounded-lg cursor-pointer hover:bg-[#166ea8] transition-colors duration-400 disabled:bg-[#9ccef0] flex items-center justify-center gap-2"
      >
        <Image src="/google2.png" alt="google" height="30" width="30" />
        {login ? "Log In" : "Sign Up"} with Google
      </button>
    </form>
  );
}
