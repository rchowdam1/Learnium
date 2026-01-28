"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Loader2 } from "lucide-react";
import SignInWithGoogle from "../components/misc/SignInWithGoogle";

export default function LoginPage() {
  const router = useRouter();
  // state for input errors
  const [error, setError] = useState<boolean>(false);

  // state for gathering input
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // display loading state
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // login
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        setError(true);
        setLoading(false);
        return;
      }

      // successful login, should redirect
      setError(false);
      toast.success("Logged In");
      router.replace("/dashboard");
    } catch (error) {
      alert(error);
      setLoading(false);
      return;
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      {/*Name & Logo*/}
      <div className="text-4xl font-extrabold text-[#142937]">Learnium</div>
      <span className="my-2 text-xl text-gray-500">Welcome Back!</span>
      <div className="w-120 py-8 bg-[#142937] rounded-md shadow-lg text-white flex flex-col items-center justify-center space-y-2">
        <span className="text-2xl font-extrabold">Log In</span>
        <form
          className="flex flex-col space-y-4 w-full max-w-sm"
          onSubmit={handleSubmit}
        >
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="px-2 py-3 text-lg rounded-md border border-gray-500 transition-colors duration-400 outline-none focus:border-2 focus:border-[#166ea8]"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            className="px-2 py-3 text-lg rounded-md border border-gray-500 transition-colors duration-400 outline-none focus:border-2 focus:border-[#166ea8]"
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <span className="text-red-400 text-sm">
              Incorrect Email or Password. Please Try Again
            </span>
          )}

          <Link href="/signup" className="text-center">
            <span className="text-center text-[#166ea8] cursor-pointer hover:underline">
              Don't have an account? Create One
            </span>
          </Link>

          <button
            type="submit"
            className="w-full bg-[#1d4159] py-2 rounded-lg cursor-pointer hover:bg-[#166ea8] transition-colors duration-400 disabled:bg-[#9ccef0] flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading && (
              <>
                <Loader2 className="animate-spin w-4 h-4" />
                <span>Logging in...</span>
              </>
            )}
            {!loading && "Log In"}
          </button>
        </form>
        <SignInWithGoogle login={true} />
      </div>
    </div>
  );
}
