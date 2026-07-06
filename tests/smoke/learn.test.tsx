import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import LearnPage from "@/app/(app)/learn/page";

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
  default: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={alt} {...props} />;
  },
}));

describe("Learn Page Smoke Test", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders loading skeleton state initially", () => {
    // Mock global fetch to return a pending promise
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));

    render(<LearnPage />);

    // Check that we don't render header or list immediately
    expect(screen.queryByText("Learn Hub")).not.toBeInTheDocument();
  });

  it("renders empty state with Nova message when no sets are found", async () => {
    // Mock global fetch to return empty data
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] }),
    } as Response);

    render(<LearnPage />);

    // Wait for the loader to finish and empty state to render
    await waitFor(() => {
      expect(screen.getByText("Learn Hub")).toBeInTheDocument();
    });

    // Check for Nova voice element
    expect(screen.getByText("Nova")).toBeInTheDocument();
    expect(
      screen.getByText(/Looks like you haven't started any learning sets yet/i)
    ).toBeInTheDocument();

    // Check for CTA button
    expect(screen.getByRole("button", { name: /Create Your First Set/i })).toBeInTheDocument();
  });

  it("renders sets grid when sets are fetched successfully", async () => {
    const mockSets = [
      {
        id: 1,
        title: "Introduction to React",
        description: "Learn React components and hooks.",
        category: "Technology",
        numLessons: 5,
        completedLessons: 2,
        completed: false,
        date: "July 6, 2026",
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockSets }),
    } as Response);

    render(<LearnPage />);

    await waitFor(() => {
      expect(screen.getByText("Learn Hub")).toBeInTheDocument();
    });

    // Check that the set card is rendered
    expect(screen.getByText("Introduction to React")).toBeInTheDocument();
    expect(screen.getByText("Learn React components and hooks.")).toBeInTheDocument();
    expect(screen.getByText("Technology")).toBeInTheDocument();
    expect(screen.getByText("2/5 lessons")).toBeInTheDocument();
  });
});
