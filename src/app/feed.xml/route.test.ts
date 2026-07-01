import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const mockGetAllPosts = vi.fn();
const mockEscapeXml = vi.fn((str: string) => str);

vi.mock("@/lib/content", () => ({
  getAllPosts: mockGetAllPosts,
}));

vi.mock("@/lib/xml", () => ({
  escapeXml: mockEscapeXml,
}));

vi.mock("@/lib/config", () => ({
  SITE_URL: "https://opendesk-edu.org",
  SITE_NAME: "openDesk Edu",
  SITE_DESCRIPTION: "Educational resources",
}));

describe("RSS Feed API route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns XML content type", async () => {
    mockGetAllPosts.mockResolvedValue([]);

    const { GET } = await import("@/app/feed.xml/route");
    const response = await GET();

    expect(response.headers.get("Content-Type")).toBe("application/xml; charset=utf-8");
  });

  it("returns Cache-Control headers", async () => {
    mockGetAllPosts.mockResolvedValue([]);

    const { GET } = await import("@/app/feed.xml/route");
    const response = await GET();

    expect(response.headers.get("Cache-Control")).toBe("public, max-age=3600, s-maxage=3600");
  });

  it("returns valid RSS XML structure", async () => {
    mockGetAllPosts.mockResolvedValue([]);

    const { GET } = await import("@/app/feed.xml/route");
    const response = await GET();
    const xml = await response.text();

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain("xmlns:atom");
    expect(xml).toContain("<channel>");
    expect(xml).toContain("</channel>");
    expect(xml).toContain("</rss>");
  });

  it("includes site metadata in RSS feed", async () => {
    mockGetAllPosts.mockResolvedValue([]);

    const { GET } = await import("@/app/feed.xml/route");
    const response = await GET();
    const xml = await response.text();

    expect(xml).toContain("<title>openDesk Edu</title>");
    expect(xml).toContain("<link>https://opendesk-edu.org</link>");
    expect(xml).toContain("<description>Educational resources</description>");
    expect(xml).toContain('<atom:link href="https://opendesk-edu.org/feed.xml" rel="self" type="application/rss+xml"/>');
  });

  it("includes lastBuildDate in RSS feed", async () => {
    mockGetAllPosts.mockResolvedValue([]);

    const { GET } = await import("@/app/feed.xml/route");
    const response = await GET();
    const xml = await response.text();

    expect(xml).toMatch(/<lastBuildDate>.*<\/lastBuildDate>/);
  });

  it("includes posts as items in RSS feed", async () => {
    const mockPosts = [
      {
        title: "Test Post",
        slug: "test-post",
        section: "blog",
        description: "Test description",
        date: "2024-01-01",
        categories: ["Category1"],
        tags: ["tag1", "tag2"],
      },
    ];
    mockGetAllPosts.mockResolvedValue(mockPosts);
    mockEscapeXml.mockImplementation((str: string) => str);

    const { GET } = await import("@/app/feed.xml/route");
    const response = await GET();
    const xml = await response.text();

    expect(xml).toContain("<item>");
    expect(xml).toContain("<title>Test Post</title>");
    expect(xml).toContain("<link>https://opendesk-edu.org/en/blog/test-post</link>");
    expect(xml).toContain("<guid>https://opendesk-edu.org/en/blog/test-post</guid>");
    expect(xml).toContain("<description>Test description</description>");
    expect(xml).toContain("<pubDate>Mon, 01 Jan 2024 00:00:00 GMT</pubDate>");
  });

  it("includes categories in RSS items", async () => {
    const mockPosts = [
      {
        title: "Test Post",
        slug: "test-post",
        section: "blog",
        description: "Test",
        date: "2024-01-01",
        categories: ["Education", "Technology"],
        tags: [],
      },
    ];
    mockGetAllPosts.mockResolvedValue(mockPosts);
    mockEscapeXml.mockImplementation((str: string) => str);

    const { GET } = await import("@/app/feed.xml/route");
    const response = await GET();
    const xml = await response.text();

    expect(xml).toContain("<category>Education</category>");
    expect(xml).toContain("<category>Technology</category>");
  });

  it("includes tags in RSS items", async () => {
    const mockPosts = [
      {
        title: "Test Post",
        slug: "test-post",
        section: "blog",
        description: "Test",
        date: "2024-01-01",
        categories: [],
        tags: ["tutorial", "beginner"],
      },
    ];
    mockGetAllPosts.mockResolvedValue(mockPosts);
    mockEscapeXml.mockImplementation((str: string) => str);

    const { GET } = await import("@/app/feed.xml/route");
    const response = await GET();
    const xml = await response.text();

    expect(xml).toContain("<category>tutorial</category>");
    expect(xml).toContain("<category>beginner</category>");
  });

  it("handles posts without categories gracefully", async () => {
    const mockPosts = [
      {
        title: "Test Post",
        slug: "test-post",
        section: "blog",
        description: "Test",
        date: "2024-01-01",
        categories: undefined,
        tags: undefined,
      },
    ];
    mockGetAllPosts.mockResolvedValue(mockPosts);
    mockEscapeXml.mockImplementation((str: string) => str);

    const { GET } = await import("@/app/feed.xml/route");
    const response = await GET();
    const xml = await response.text();

    expect(xml).toContain("<item>");
    expect(xml).not.toContain("undefined");
  });

  it("escapes special XML characters in post data", async () => {
    const mockPosts = [
      {
        title: "Test <Post> & \"Quotes\"",
        slug: "test-post",
        section: "blog",
        description: "Description with <special> chars",
        date: "2024-01-01",
        categories: [],
        tags: [],
      },
    ];
    mockGetAllPosts.mockResolvedValue(mockPosts);
    mockEscapeXml.mockImplementation((str: string) => `escaped:${str}`);

    const { GET } = await import("@/app/feed.xml/route");
    await GET();

    expect(mockEscapeXml).toHaveBeenCalledWith("Test <Post> & \"Quotes\"");
    expect(mockEscapeXml).toHaveBeenCalledWith("Description with <special> chars");
  });

  it("handles empty posts array", async () => {
    mockGetAllPosts.mockResolvedValue([]);

    const { GET } = await import("@/app/feed.xml/route");
    const response = await GET();
    const xml = await response.text();

    expect(xml).toContain("<channel>");
    expect(xml).not.toContain("<item>");
  });

  it("fetches posts for English locale only", async () => {
    mockGetAllPosts.mockResolvedValue([]);

    const { GET } = await import("@/app/feed.xml/route");
    await GET();

    expect(mockGetAllPosts).toHaveBeenCalledWith("en");
  });
});
