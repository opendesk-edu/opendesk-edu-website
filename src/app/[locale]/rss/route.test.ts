import { describe, it, expect, vi } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";

vi.mock("@/lib/content", () => ({
  getAllPosts: vi.fn(),
}));

vi.mock("@/lib/config", () => ({
  SITE_NAME: "openDesk Edu",
  SITE_URL: "https://opendesk-edu.org",
}));

import { getAllPosts } from "@/lib/content";

const mockGetAllPosts = getAllPosts as ReturnType<typeof vi.fn>;

function makePost(overrides: Record<string, unknown> = {}) {
  return {
    title: "Test Post",
    slug: "test-post",
    section: "blog",
    date: "2026-06-01",
    description: "A test post",
    categories: ["general"],
    tags: ["test"],
    ...overrides,
  };
}

describe("RSS feed route", () => {
  it("returns 200 with Content-Type application/rss+xml", async () => {
    mockGetAllPosts.mockResolvedValue([makePost()]);
    const request = new NextRequest("http://localhost/en/rss");
    const response = await GET(request, { params: Promise.resolve({ locale: "en" }) });
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("application/rss+xml");
  });

  it("includes channel title and link in RSS XML", async () => {
    mockGetAllPosts.mockResolvedValue([makePost()]);
    const request = new NextRequest("http://localhost/en/rss");
    const response = await GET(request, { params: Promise.resolve({ locale: "en" }) });
    const text = await response.text();
    expect(text).toContain("<title>openDesk Edu</title>");
    expect(text).toContain("<link>https://opendesk-edu.org/en</link>");
  });

  it("includes post items with correct URLs", async () => {
    mockGetAllPosts.mockResolvedValue([
      makePost({ title: "My Article", slug: "my-article", section: "blog" }),
    ]);
    const request = new NextRequest("http://localhost/en/rss");
    const response = await GET(request, { params: Promise.resolve({ locale: "en" }) });
    const text = await response.text();
    expect(text).toContain("<title>My Article</title>");
    expect(text).toContain("https://opendesk-edu.org/en/blog/my-article");
  });

  it("limits to 20 most recent posts", async () => {
    const posts = Array.from({ length: 25 }, (_, i) =>
      makePost({ title: `Post ${i}`, slug: `post-${i}`, date: `2026-06-${String(i + 1).padStart(2, "0")}` }),
    );
    mockGetAllPosts.mockResolvedValue(posts);
    const request = new NextRequest("http://localhost/en/rss");
    const response = await GET(request, { params: Promise.resolve({ locale: "en" }) });
    const text = await response.text();
    const itemCount = (text.match(/<item>/g) || []).length;
    expect(itemCount).toBeLessThanOrEqual(20);
  });

  it("sorts posts by date descending", async () => {
    const posts = [
      makePost({ title: "Older", slug: "older", date: "2026-01-01" }),
      makePost({ title: "Newer", slug: "newer", date: "2026-06-01" }),
    ];
    mockGetAllPosts.mockResolvedValue(posts);
    const request = new NextRequest("http://localhost/en/rss");
    const response = await GET(request, { params: Promise.resolve({ locale: "en" }) });
    const text = await response.text();
    const newerIdx = text.indexOf("Newer");
    const olderIdx = text.indexOf("Older");
    expect(newerIdx).toBeLessThan(olderIdx);
  });

  it("includes post description and categories", async () => {
    mockGetAllPosts.mockResolvedValue([
      makePost({ description: "A great article", section: "blog" }),
    ]);
    const request = new NextRequest("http://localhost/en/rss");
    const response = await GET(request, { params: Promise.resolve({ locale: "en" }) });
    const text = await response.text();
    expect(text).toContain("A great article");
    expect(text).toContain("<category>blog</category>");
  });

  it("includes self-referencing atom:link", async () => {
    mockGetAllPosts.mockResolvedValue([makePost()]);
    const request = new NextRequest("http://localhost/en/rss");
    const response = await GET(request, { params: Promise.resolve({ locale: "en" }) });
    const text = await response.text();
    expect(text).toContain("https://opendesk-edu.org/en/rss");
    expect(text).toContain('rel="self"');
  });

  it("sets cache headers", async () => {
    mockGetAllPosts.mockResolvedValue([makePost()]);
    const request = new NextRequest("http://localhost/en/rss");
    const response = await GET(request, { params: Promise.resolve({ locale: "en" }) });
    expect(response.headers.get("Cache-Control")).toContain("public");
  });
});
