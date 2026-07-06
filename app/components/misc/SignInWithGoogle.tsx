"use client";

import Image from "next/image";
import { Button } from "@/app/components/ui/Button";

interface SignInWithGoogleProps {
  login: boolean;
  ageGateChecked?: boolean;
  onAgeGateError?: () => void;
}

export default function SignInWithGoogle({
  login,
  ageGateChecked,
  onAgeGateError,
}: SignInWithGoogleProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!login && !ageGateChecked) {
      e.preventDefault();
      if (onAgeGateError) {
        onAgeGateError();
      }
    }
  };

  return (
    <form
      action="/api/login/google"
      method="GET"
      className="w-full max-w-sm mt-1"
      onSubmit={handleSubmit}
    >
      <Button
        type="submit"
        variant="secondary"
        className="w-full"
      >
        <Image src="/google2.png" alt="google" height="30" width="30" />
        {login ? "Log In" : "Sign Up"} with Google
      </Button>
    </form>
  );
}
