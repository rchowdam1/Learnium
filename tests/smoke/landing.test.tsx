import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Home from "@/app/page";

// Mock next/image since it might not render properly in jsdom
vi.mock("next/image", () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

describe("Landing Page Smoke Test", () => {
  it("renders the landing page main headings and navigation links", () => {
    render(<Home />);
    // Check if the logo/brand name Learnium is present
    expect(screen.getAllByText("Learnium")[0]).toBeInTheDocument();
    // Check for the main hero heading
    expect(
      screen.getByRole("heading", {
        name: /Master Any Topic with AI-Generated/i,
      })
    ).toBeInTheDocument();
  });
});
