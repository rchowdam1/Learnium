import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import LoginPage from "@/app/login/page";
import SignupPage from "@/app/signup/page";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter() {
    return {
      prefetch: () => null,
      replace: vi.fn(),
      push: vi.fn(),
    };
  },
  useParams() {
    return {};
  },
}));

// Mock next/image
vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

describe("Authentication Pages Smoke Test", () => {
  it("renders the login page", () => {
    render(<LoginPage />);
    // Check for "Log In" text
    expect(screen.getAllByText("Log In")[0]).toBeInTheDocument();
    // Check for inputs
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  it("renders the signup page", () => {
    render(<SignupPage />);
    // Check for "Sign Up" text
    expect(screen.getAllByText("Sign Up")[0]).toBeInTheDocument();
    // Check for input labels
    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
  });
});
