"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import toast from "react-hot-toast";
import SignInWithGoogle from "../components/misc/SignInWithGoogle";

export default function SignupPage() {
  const router = useRouter();

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

  const handleSubmit = async (e) => {
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
    } catch (error) {
      toast.error("Signup failed. Please try again");
      setLoading(false);
      return;
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-100 flex flex-col items-center justify-center py-5">
      {/*Name & Logo*/}
      <div className="text-4xl font-extrabold text-[#142937]">
        Welcome to Learnium
      </div>
      <span className="my-2 text-xl text-gray-500">
        We're thrilled to have you!
      </span>
      <div className="w-120 py-8 bg-[#142937] rounded-md shadow-lg text-white flex flex-col items-center justify-center space-y-2">
        <span className="text-2xl font-extrabold">Sign Up</span>
        <form
          className="flex flex-col space-y-4 w-full max-w-sm"
          onSubmit={handleSubmit}
        >
          <label>Start by creating a username</label>
          <input
            type="text"
            placeholder="Create a username"
            className="px-2 py-3 text-lg rounded-md border border-gray-500 transition-colors duration-400 outline-none focus:border-2 focus:border-[#166ea8]"
            required
            onKeyDown={(e) => {
              if (e.key === " ") e.preventDefault();
            }}
            onChange={(e) => {
              e.target.value = e.target.value.replace(/\s+/g, "");
              setUsername(e.target.value);
            }}
          />
          <span className="text-sm text-red-400">
            {usernameLengthError
              ? "Please enter no more than 15 characters"
              : usernameError
              ? "Please enter at least 5 alphanumeric characters"
              : ""}
          </span>
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
          <span className="text-sm text-red-400">
            {passwordLengthError
              ? "Please use at least 8 characters"
              : passwordError
              ? "Please use special, uppercase, and lowercase letters"
              : ""}
          </span>

          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm your password"
            className="px-2 py-3 text-lg rounded-md border border-gray-500 transition-colors duration-400 outline-none focus:border-2 focus:border-[#166ea8]"
            required
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <span className="text-sm text-red-400">
            {confirmError
              ? "Please make sure that password and confirm password are the same"
              : ""}
          </span>

          <Link
            href="/login"
            className="text-center text-[#166ea8] cursor-pointer hover:underline"
          >
            Already have an account? Sign In
          </Link>

          <button
            type="submit"
            className="w-full bg-[#1d4159] py-2 rounded-lg cursor-pointer hover:bg-[#166ea8] transition-colors duration-400 disabled:bg-[#9ccef0] flex items-center justify-center gap-2"
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
