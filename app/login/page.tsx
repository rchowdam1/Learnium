"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { Loader2 } from "lucide-react";
import { Input } from "@/app/components/ui/Input";
import { Button } from "@/app/components/ui/Button";
import SignInWithGoogle from "../components/misc/SignInWithGoogle";

export default function LoginPage() {
  const router = useRouter();

  // state for input errors
  const [errorMessage, setErrorMessage] = useState<string>("");

  // state for gathering input
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  // display loading state
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

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
        setErrorMessage("Incorrect email or password. Please try again.");
        setLoading(false);
        return;
      }

      toast.success("Logged in successfully!");

      // Check onboarding status
      let hasDailyGoalTier = false;
      try {
        const profileRes = await fetch("/api/get-profile-data");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.success) {
            hasDailyGoalTier = !!profileData.daily_goal_tier;
          }
        }
      } catch (err) {
        console.error("Failed to check onboarding status:", err);
      }

      if (!hasDailyGoalTier) {
        router.replace("/onboarding");
        return;
      }

      // Check for a safe redirect path in search params
      const searchParams = new URLSearchParams(window.location.search);
      const next = searchParams.get("next");
      const isSafeRedirect = (url: string | null) => {
        if (!url) return false;
        // Path must start with exactly one '/' and not be an absolute url or double slash (//)
        return url.startsWith("/") && !url.startsWith("//");
      };

      const redirectTarget = isSafeRedirect(next) ? next! : "/dashboard";
      router.replace(redirectTarget);
    } catch {
      toast.error("Login failed. Please check your connection and try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Skip to Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:rounded-xl focus:bg-surface-raised focus:px-4 focus:py-2 focus:text-primary focus:border focus:border-border focus:shadow-sm focus-ring"
      >
        Skip to content
      </a>

      <main
        id="main-content"
        className="flex-grow flex flex-col items-center justify-center py-5 px-4 focus:outline-none"
        tabIndex={-1}
      >
        <div className="text-display text-4xl text-primary mb-2">Learnium</div>
        <span className="text-body text-xl text-muted mb-6">Welcome Back!</span>
        <div className="flex w-full max-w-[30rem] flex-col items-center justify-center space-y-6 rounded-2xl border border-border bg-surface-raised px-6 py-8 text-primary shadow-sm">
          <span className="text-heading text-2xl font-semibold">Log In</span>
          <form
            className="flex w-full max-w-sm flex-col space-y-4"
            onSubmit={handleSubmit}
          >
            <Input
              type="email"
              label="Email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
            />
            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errorMessage) setErrorMessage("");
              }}
              error={errorMessage || undefined}
            />

            <Link href="/signup" className="text-center py-1">
              <span className="text-label cursor-pointer text-brand hover:underline text-sm font-medium">
                Don&apos;t have an account? Create One
              </span>
            </Link>

            <Button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="animate-spin w-4 h-4" />}
              {loading ? "Logging in..." : "Log In"}
            </Button>
          </form>
          <SignInWithGoogle login={true} />
        </div>
      </main>
    </div>
  );
}
