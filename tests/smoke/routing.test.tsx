import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { updateSession } from "@/middleware";

// Set required env variables for middleware module loading
process.env.SUPABASE_URL = "https://example.supabase.co";
process.env.SUPABASE_API_KEY = "dummy-anon-key";

const mockGetUser = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
  }),
}));

describe("Routing Middleware Smoke Test", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects an unauthenticated user from /dashboard to /login", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const request = new NextRequest(new URL("http://localhost:3000/dashboard"));
    const response = await updateSession(request);

    expect(response).toBeDefined();
    expect(response?.status).toBe(307); // Temporary redirect
    expect(response?.headers.get("location")).toContain("/login?next=%2Fdashboard");
  });

  it("redirects an authenticated user from /login to /dashboard", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "123" } } });

    const request = new NextRequest(new URL("http://localhost:3000/login"));
    const response = await updateSession(request);

    expect(response).toBeDefined();
    expect(response?.status).toBe(307);
    expect(response?.headers.get("location")).toContain("/dashboard");
  });

  it("allows authenticated user to access /dashboard", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "123" } } });

    const request = new NextRequest(new URL("http://localhost:3000/dashboard"));
    const response = await updateSession(request);

    expect(response).toBeDefined();
    expect(response?.status).not.toBe(307);
  });
});
