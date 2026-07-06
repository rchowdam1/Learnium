"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import toast from "react-hot-toast";
import SignInWithGoogle from "../components/misc/SignInWithGoogle";

export default function SignupPage() {
  // state for input errors
  const [usernameError, setUsernameError] = useState<boolean>(false); // please enter at least 5 alphanumeric characters
  const [usernameLengthError, setUsernameLengthError] =
    useState<boolean>(false);
  const [passwordError, setPasswordError] = useState<boolean>(false); // please use at least 8 characters with 1+ special characters
  const [passwordLengthError, setPasswordLengthError] =
    useState<boolean>(false);
  const [confirmError, setConfirmError] = useState<boolean>(false); // please make sure pass and confirm pass are the same

  // state to manage input values
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // password check
    if (password.trim().length < 8) {
      setPasswordLengthError(true);
      setLoading(false);
      return;
    } else {
      setPasswordLengthError(false);
    }

    if (password !== confirmPassword) {
      setConfirmError(true);
      setLoading(false);
      return;
    } else {
      setConfirmError(false);
    }

    // username check
    if (username.trim().length < 5) {
      setUsernameError(true);
      setLoading(false);
      return;
    } else if (username.trim().length > 15) {
      setUsernameLengthError(true);
      setLoading(false);
      return;
    }

    // regex
    if (/[^a-zA-z0-9]/.test(username)) {
      setUsernameError(true); // username must contain alphanumeric characters and be at least 5 characters
      setLoading(false);
      return;
    } else {
      setUsernameError(false);
    }

    if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/.test(password.trim())
    ) {
      setPasswordError(true);
      setLoading(false);
      return; // password must contain lowercase letters, uppercase letters, and 1 special character
    } else {
      setPasswordError(false);
    }

    // all inputs valid, send request

    try {
      const response = await fetch("api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      if (!response.ok) {
        toast.error("Signup failed. Please try again");
        setLoading(false);
        return;
      }

      // request was successful, redirect to confirm email page (create confirm email page)
      toast.success("Check your email to confirm your account!");
      setLoading(false);
    } catch {
      toast.error("Signup failed. Please try again");
      setLoading(false);
      return;
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background py-5">
      <div className="text-display text-4xl text-primary">
        Welcome to Learnium
      </div>
      <span className="text-body my-2 text-xl text-muted">
        We&apos;re thrilled to have you!
      </span>
      <div className="flex w-[30rem] flex-col items-center justify-center space-y-2 rounded-2xl border border-border bg-surface-raised py-8 text-primary">
        <span className="text-heading text-2xl">Sign Up</span>
        <form
          className="flex w-full max-w-sm flex-col space-y-4"
          onSubmit={handleSubmit}
        >
          <label className="text-label">Start by creating a username</label>
          <input
            type="text"
            placeholder="Create a username"
            className="focus-ring rounded-xl border border-border-interactive bg-surface-raised px-3 py-3 text-body text-primary placeholder:text-muted"
            required
            onKeyDown={(e) => {
              if (e.key === " ") e.preventDefault();
            }}
            onChange={(e) => {
              e.target.value = e.target.value.replace(/\s+/g, "");
              setUsername(e.target.value);
            }}
          />
          <span className="text-body text-sm text-error">
            {usernameLengthError
              ? "Please enter no more than 15 characters"
              : usernameError
              ? "Please enter at least 5 alphanumeric characters"
              : ""}
          </span>
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
          <span className="text-body text-sm text-error">
            {passwordLengthError
              ? "Please use at least 8 characters"
              : passwordError
              ? "Please use special, uppercase, and lowercase letters"
              : ""}
          </span>

          <label className="text-label">Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm your password"
            className="focus-ring rounded-xl border border-border-interactive bg-surface-raised px-3 py-3 text-body text-primary placeholder:text-muted"
            required
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <span className="text-body text-sm text-error">
            {confirmError
              ? "Please make sure that password and confirm password are the same"
              : ""}
          </span>

          <Link
            href="/login"
            className="text-center text-label text-brand cursor-pointer hover:underline"
          >
            Already have an account? Sign In
          </Link>

          <button
            type="submit"
            className="focus-ring flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-cta py-2 text-label text-cta-text hover:bg-cta-hover disabled:bg-cta-disabled disabled:text-muted"
            disabled={loading}
          >
            {loading && (
              <>
                <Loader2 className="animate-spin w-4 h-4" />
                <span>Signing up...</span>
              </>
            )}
            {!loading && "Sign Up"}
          </button>
        </form>
        <SignInWithGoogle login={false} />
      </div>
    </div>
  );
}
