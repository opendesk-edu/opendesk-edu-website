import { describe, it, expect, vi } from "vitest";
import { GET } from "./route";

vi.mock("@/lib/content", () => ({
  getAllPosts: vi.fn(),
}));

vi.mock("@/i18n/routing", () => ({
  routing: {
    defaultLocale: "en",
    locales: ["en", "de", "fr", "zh"],
  },
}));

import { getAllPosts } from "@/lib/content";

const mockGetAllPosts = getAllPosts as ReturnType<typeof vi.fn>;

function mockRequest(url: string) {
  const parsed = new URL(url);
  return {
    nextUrl: {
      searchParams: parsed.searchParams,
    },
  };
}

describe("Search API", () => {
  it("returns 400 for invalid locale", async () => {
    const request = mockRequest("http://localhost/api/search?locale=invalid");
    const response = await GET(request as never);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBe("Invalid locale");
  });

  it("uses default locale when no locale provided", async () => {
    mockGetAllPosts.mockResolvedValue([]);
    const request = mockRequest("http://localhost/api/search");
    const response = await GET(request as never);
    expect(response.status).toBe(200);
    expect(mockGetAllPosts).toHaveBeenCalledWith("en");
  });

  it("returns search entries with correct structure", async () => {
    const posts = [
      {
        title: "Jitsi",
        slug: "jitsi",
        section: "components",
        description: "Video conferencing",
        categories: ["communication"],
        tags: ["video"],
        date: "2026-01-01",
      },
    ];
    mockGetAllPosts.mockResolvedValue(posts);
    const request = mockRequest("http://localhost/api/search?locale=en");
    const response = await GET(request as never);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body[0]).toHaveProperty("title", "Jitsi");
    expect(body[0]).toHaveProperty("slug", "jitsi");
    expect(body[0]).toHaveProperty("section", "components");
    expect(body[0]).toHaveProperty("description");
    expect(body[0]).toHaveProperty("categories");
    expect(body[0]).toHaveProperty("tags");
  });

  it("accepts fr locale", async () => {
    mockGetAllPosts.mockResolvedValue([]);
    const request = mockRequest("http://localhost/api/search?locale=fr");
    const response = await GET(request as never);
    expect(response.status).toBe(200);
    expect(mockGetAllPosts).toHaveBeenCalledWith("fr");
  });

  it("accepts de locale", async () => {
    mockGetAllPosts.mockResolvedValue([]);
    const request = mockRequest("http://localhost/api/search?locale=de");
    const response = await GET(request as never);
    expect(response.status).toBe(200);
    expect(mockGetAllPosts).toHaveBeenCalledWith("de");
  });
});
