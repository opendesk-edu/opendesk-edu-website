import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock all Node.js modules before importing the route
const mockPrepare = vi.fn();
const mockExec = vi.fn();
const mockClose = vi.fn();
const mockGet = vi.fn();
const mockRun = vi.fn();
const mockPragma = vi.fn();

vi.mock("better-sqlite3", async () => {
  return {
    default: function MockDatabase() {
      return {
        prepare: mockPrepare,
        exec: mockExec,
        close: mockClose,
        pragma: mockPragma,
      };
    },
  };
});

vi.mock("fs", async () => {
  return {
    default: {
      existsSync: vi.fn().mockReturnValue(false),
      mkdirSync: vi.fn(),
    },
    promises: {},
  };
});

vi.mock("path", async () => {
  return {
    default: {
      join: vi.fn().mockReturnValue("/tmp/test.db"),
      dirname: vi.fn().mockReturnValue("/tmp"),
    },
  };
});

// Now import the route handler
const { POST } = await import("./route");

describe("POST /api/subscribe", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrepare.mockReturnValue({
      get: mockGet,
      run: mockRun,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should subscribe a new email successfully", async () => {
    mockGet.mockReturnValue(undefined);
    mockRun.mockReturnValue({ lastInsertRowid: 1 });

    const request = new Request("http://localhost/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
    expect(mockGet).toHaveBeenCalledWith("test@example.com");
    expect(mockRun).toHaveBeenCalledWith("test@example.com");
  });

  it("should handle already subscribed email gracefully", async () => {
    mockGet.mockReturnValue({ id: 1, confirmed: 0 });

    const request = new Request("http://localhost/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "existing@example.com" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true, alreadySubscribed: true });
    expect(mockRun).not.toHaveBeenCalled();
  });

  it("should reject request with missing email", async () => {
    const request = new Request("http://localhost/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Valid email address is required." });
    expect(mockGet).not.toHaveBeenCalled();
    expect(mockRun).not.toHaveBeenCalled();
  });

  it("should reject request with invalid email format (no @)", async () => {
    const request = new Request("http://localhost/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid-email" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Valid email address is required." });
    expect(mockGet).not.toHaveBeenCalled();
    expect(mockRun).not.toHaveBeenCalled();
  });

  it("should reject request with email exceeding 254 characters", async () => {
    const longEmail = "a".repeat(250) + "@example.com";
    const request = new Request("http://localhost/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: longEmail }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Valid email address is required." });
    expect(mockGet).not.toHaveBeenCalled();
    expect(mockRun).not.toHaveBeenCalled();
  });

  it("should handle database errors gracefully", async () => {
    mockGet.mockImplementation(() => {
      throw new Error("Database connection failed");
    });

    const request = new Request("http://localhost/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Failed to subscribe. Please try again later." });
  });

  it("should accept email with valid format and subdomain", async () => {
    mockGet.mockReturnValue(undefined);
    mockRun.mockReturnValue({ lastInsertRowid: 1 });

    const request = new Request("http://localhost/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "user@mail.subdomain.example.com" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
  });

  it("should accept email with plus addressing", async () => {
    mockGet.mockReturnValue(undefined);
    mockRun.mockReturnValue({ lastInsertRowid: 1 });

    const request = new Request("http://localhost/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "user+tag@example.com" }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
  });
});
