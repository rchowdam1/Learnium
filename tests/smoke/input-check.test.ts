import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "@/app/api/input-check/route";
import { NextResponse } from "next/server";

const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/server", () => ({
  createClient: () => ({
    auth: {
      getUser: mockGetUser,
    },
    from: mockFrom,
  }),
}));

const mockFetch = vi.fn();
global.fetch = mockFetch;

// Helper to make chainable Supabase query objects
function makeMockQuery(result: any) {
  const queryObj: any = {};
  queryObj.select = vi.fn().mockReturnValue(queryObj);
  queryObj.insert = vi.fn().mockReturnValue(queryObj);
  queryObj.update = vi.fn().mockReturnValue(queryObj);
  queryObj.eq = vi.fn().mockReturnValue(queryObj);
  queryObj.in = vi.fn().mockReturnValue(queryObj);
  queryObj.single = vi.fn().mockResolvedValue(result);
  queryObj.then = (onfulfilled: any) => Promise.resolve(result).then(onfulfilled);
  return queryObj;
}

describe("POST /api/input-check", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SUPABASE_SERVICE_ROLE_KEY = "mock-service-role-key";
  });

  it("returns 400 if inputs are missing", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-123" } } });
    mockFrom.mockReturnValue(makeMockQuery({ data: null, error: null }));

    const request = new Request("http://localhost:3000/api/input-check", {
      method: "POST",
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toContain("required");
  });

  it("returns 401 if user is unauthenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const request = new Request("http://localhost:3000/api/input-check", {
      method: "POST",
      body: JSON.stringify({
        title: "Test Set",
        description: "Learn the fundamentals of web development.",
        category: "Test",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.message).toContain("Authentication");
  });

  it("successfully enqueues a new set generation job", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-123" } } });
    
    const mockProfileQuery = makeMockQuery({
      data: { sets_remaining: 5, sets_refresh_at: null },
      error: null,
    });

    const mockActiveJobsQuery = makeMockQuery({
      data: [],
      error: null,
    });

    const mockInsertQuery = makeMockQuery({
      data: { id: "job-123" },
      error: null,
    });

    // Setup mock implementation for .from()
    mockFrom.mockImplementation((table: string) => {
      if (table === "profile") {
        return mockProfileQuery;
      }
      if (table === "set_generation_jobs") {
        const calls = mockFrom.mock.calls.filter(c => c[0] === "set_generation_jobs");
        if (calls.length === 1) {
          return mockActiveJobsQuery;
        }
        return mockInsertQuery;
      }
      return makeMockQuery({ data: null, error: null });
    });

    // Mock fetch for Edge Function invocation
    mockFetch.mockResolvedValue({
      ok: true,
      text: async () => "ok",
    });

    const request = new Request("http://localhost:3000/api/input-check", {
      method: "POST",
      body: JSON.stringify({
        title: "Test Set",
        description: "Learn the fundamentals of web development.",
        category: "Test",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.jobId).toBe("job-123");
    expect(mockFetch).toHaveBeenCalled();
  });
});
