"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

import { Input } from "@/app/components/ui/Input";
import { Button } from "@/app/components/ui/Button";
import SignInWithGoogle from "../components/misc/SignInWithGoogle";

export default function SignupPage() {
  // state for validation errors
  const [usernameError, setUsernameError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [confirmError, setConfirmError] = useState<string>("");
  const [ageError, setAgeError] = useState<string>("");

  // state to manage input values
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [ageConfirmed, setAgeConfirmed] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    // Reset errors
    setUsernameError("");
    setPasswordError("");
    setConfirmError("");
    setAgeError("");

    let hasError = false;

    // Username check
    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 5) {
      setUsernameError("Username must be at least 5 characters.");
      hasError = true;
    } else if (trimmedUsername.length > 15) {
      setUsernameError("Username must be no more than 15 characters.");
      hasError = true;
    } else if (/[^a-zA-Z0-9]/.test(trimmedUsername)) {
      setUsernameError("Username must contain only alphanumeric characters.");
      hasError = true;
    }

    // Password check
    const trimmedPassword = password.trim();
    if (trimmedPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      hasError = true;
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/.test(trimmedPassword)
    ) {
      setPasswordError(
        "Password must contain uppercase, lowercase, and special characters."
      );
      hasError = true;
    }

    // Confirm password check
    if (password !== confirmPassword) {
      setConfirmError("Passwords do not match.");
      hasError = true;
    }

    // Age gate check
    if (!ageConfirmed) {
      setAgeError("You must confirm you are 16 or older to create an account.");
      hasError = true;
    }

    if (hasError) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: trimmedUsername,
          email,
          password: trimmedPassword,
          ageConfirmed,
        }),
      });

      if (!response.ok) {
        toast.error("Signup failed. Please check your inputs and try again.");
        setLoading(false);
        return;
      }

      toast.success("Check your email to confirm your account!");
      setLoading(false);
    } catch {
      toast.error("Signup failed. Please check your connection and try again.");
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
        <div className="text-display text-4xl text-primary mb-2">
          Welcome to Learnium
        </div>
        <span className="text-body text-xl text-muted mb-6">
          We&apos;re thrilled to have you!
        </span>
        <div className="flex w-full max-w-[30rem] flex-col items-center justify-center space-y-6 rounded-2xl border border-border bg-surface-raised px-6 py-8 text-primary shadow-sm">
          <span className="text-heading text-2xl font-semibold">Sign Up</span>
          <form
            className="flex w-full max-w-sm flex-col space-y-4"
            onSubmit={handleSubmit}
          >
            <Input
              type="text"
              label="Start by creating a username"
              placeholder="Create a username"
              required
              value={username}
              onKeyDown={(e) => {
                if (e.key === " ") e.preventDefault();
              }}
              onChange={(e) => {
                const val = e.target.value.replace(/\s+/g, "");
                setUsername(val);
                if (usernameError) setUsernameError("");
              }}
              error={usernameError || undefined}
            />

            <Input
              type="email"
              label="Email"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError("");
              }}
              error={passwordError || undefined}
            />

            <Input
              type="password"
              label="Confirm Password"
              placeholder="Confirm your password"
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (confirmError) setConfirmError("");
              }}
              error={confirmError || undefined}
            />

            <div className="flex flex-col gap-1.5 py-1">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={ageConfirmed}
                  onChange={(e) => {
                    setAgeConfirmed(e.target.checked);
                    if (e.target.checked) setAgeError("");
                  }}
                  className="mt-1 h-4 w-4 rounded border-border-interactive bg-surface-raised text-brand focus-ring"
                />
                <span className="text-body text-sm text-primary">
                  I confirm that I am 16 years of age or older.
                </span>
              </label>
              {ageError && (
                <span className="text-error text-xs font-medium flex items-center gap-1 select-none">
                  <span aria-hidden="true">⚠️</span>
                  {ageError}
                </span>
              )}
            </div>

            <Link href="/login" className="text-center py-1">
              <span className="text-label cursor-pointer text-brand hover:underline text-sm font-medium">
                Already have an account? Sign In
              </span>
            </Link>

            <Button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="animate-spin w-4 h-4" />}
              {loading ? "Signing up..." : "Sign Up"}
            </Button>
          </form>
          <SignInWithGoogle
            login={false}
            ageGateChecked={ageConfirmed}
            onAgeGateError={() =>
              setAgeError("You must confirm you are 16 or older to create an account.")
            }
          />
        </div>
      </main>
    </div>
  );
}
