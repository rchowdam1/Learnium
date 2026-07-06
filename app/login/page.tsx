"use client";

import Link from "next/link";
import { useState } from "react";
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
    } catch {
      toast.error("Login failed. Please try again.");
      setLoading(false);
      return;
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background py-5">
      <div className="text-display text-4xl text-primary">Learnium</div>
      <span className="text-body my-2 text-xl text-muted">Welcome Back!</span>
      <div className="flex w-[30rem] flex-col items-center justify-center space-y-2 rounded-2xl border border-border bg-surface-raised py-8 text-primary">
        <span className="text-heading text-2xl">Log In</span>
        <form
          className="flex w-full max-w-sm flex-col space-y-4"
          onSubmit={handleSubmit}
        >
          <label className="text-label">Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="focus-ring rounded-xl border border-border-interactive bg-surface-raised px-3 py-3 text-body text-primary placeholder:text-muted"
            required
            onChange={(e) => setEmail(e.target.value)}
          />
          <label className="text-label">Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            className="focus-ring rounded-xl border border-border-interactive bg-surface-raised px-3 py-3 text-body text-primary placeholder:text-muted"
            required
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <span className="text-body text-sm text-error">
              Incorrect Email or Password. Please Try Again
            </span>
          )}

          <Link href="/signup" className="text-center">
            <span className="text-label cursor-pointer text-brand hover:underline">
              Don&apos;t have an account? Create One
            </span>
          </Link>

          <button
            type="submit"
            className="focus-ring flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-cta py-2 text-label text-cta-text hover:bg-cta-hover disabled:bg-cta-disabled disabled:text-muted"
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
