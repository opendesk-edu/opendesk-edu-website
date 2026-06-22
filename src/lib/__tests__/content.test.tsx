import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "fs";
import matter from "gray-matter";
import type { PathLike } from "fs";

// Mock fs module
vi.mock("fs", () => ({
  default: {
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
    promises: {
      readFile: vi.fn(),
    },
  },
  existsSync: vi.fn(),
  readdirSync: vi.fn(),
}));

// Mock gray-matter
vi.mock("gray-matter", () => ({
  default: vi.fn(),
}));

// Mock remark pipeline
vi.mock("remark", () => ({
  remark: () => ({
    use: vi.fn().mockReturnThis(),
    process: vi.fn().mockResolvedValue({ toString: () => "<p>processed</p>" }),
  }),
}));

// Import after mocks
import { getPostBySlug, getPostsBySection, getAllPosts, isValidSection, getSectionBySlug, getStaticPathsForSection, getPostsByTag, getAllTags, getStaticPathsForTags } from "@/lib/content";

const mockExistsSync = vi.mocked(fs.existsSync);
const mockReaddirSync = vi.mocked(fs.readdirSync);
const mockReadFile = vi.mocked(fs.promises.readFile);
const mockMatter = vi.mocked(matter);

const sampleFrontmatter = `---
title: Test Post
date: 2024-01-15
description: A test post
tags: [test, edu]
---
# Hello World
`;

const sampleData = {
  title: "Test Post",
  date: "2024-01-15",
  description: "A test post",
  tags: ["test", "edu"],
};

beforeEach(() => {
  vi.clearAllMocks();
  mockExistsSync.mockReturnValue(true);
  mockReaddirSync.mockImplementation(((source: string) => {
    if (source.includes("blog")) return ["test-post.md", "tagged-post.md"];
    return ["test-post.md"];
  }) as never);
  mockReadFile.mockImplementation(((path: string) => {
    if (typeof path === "string" && path.includes("tagged-post.md")) {
      return `---
title: Tagged Post
date: 2024-06-01
description: A post with specific tags
tags: [security, compliance]
---
# Tagged Content
`;
    }
    return sampleFrontmatter;
  }) as never);
  mockMatter.mockImplementation(((raw: string) => {
    if (raw.includes("Tagged Post") || raw.includes("Tagged Content")) {
      return {
        data: { title: "Tagged Post", date: "2024-06-01", description: "A post with specific tags", tags: ["security", "compliance"] },
        content: "# Tagged Content\n",
        excerpt: "",
      } as never;
    }
    return {
      data: sampleData,
      content: "# Hello World\n",
      excerpt: "",
    } as never;
  }) as never);
});

describe("content.ts", () => {
  describe("isValidSection", () => {
    it("returns true for valid sections", () => {
      expect(isValidSection("components")).toBe(true);
      expect(isValidSection("docs")).toBe(true);
      expect(isValidSection("blog")).toBe(true);
    });

    it("returns false for invalid sections", () => {
      expect(isValidSection("invalid")).toBe(false);
      expect(isValidSection("")).toBe(false);
      expect(isValidSection("components-extra")).toBe(false);
    });
  });

  describe("getSectionBySlug", () => {
    it("returns section info for valid slug", () => {
      const section = getSectionBySlug("components");
      expect(section).toBeDefined();
      expect(section?.slug).toBe("components");
      expect(section?.title).toBe("Components");
    });

    it("returns undefined for invalid slug", () => {
      expect(getSectionBySlug("nonexistent")).toBeUndefined();
    });
  });

  describe("getPostBySlug", () => {
    it("returns a post when found via direct match", async () => {
      const post = await getPostBySlug("components", "test-post");
      expect(post).not.toBeNull();
      expect(post?.title).toBe("Test Post");
      expect(post?.slug).toBe("test-post");
      expect(post?.section).toBe("components");
      expect(post?.htmlContent).toBe("<p>processed</p>");
    });

    it("returns null when section directory does not exist", async () => {
      mockExistsSync.mockReturnValue(false);
      const post = await getPostBySlug("nonexistent", "test-post");
      expect(post).toBeNull();
    });

    it("returns null when post not found", async () => {
      // existsSync returns true for directory, false for the candidate file
      mockExistsSync.mockImplementation((p: PathLike) => {
        if (typeof p === "string" && p.endsWith("test-post.md")) return false;
        return true;
      });
      mockReaddirSync.mockReturnValue(["other-post.md"] as never);
      const post = await getPostBySlug("components", "test-post");
      expect(post).toBeNull();
    });

    it("falls back to full scan when candidate file not found", async () => {
      mockExistsSync.mockImplementation((p: PathLike) => {
        if (typeof p === "string" && p.endsWith("test-post.md")) return false;
        return true;
      });
      mockReaddirSync.mockReturnValue(["test-post.md"] as never);
      const post = await getPostBySlug("components", "test-post");
      expect(post).not.toBeNull();
      expect(post?.title).toBe("Test Post");
    });

    it("uses custom slug from frontmatter", async () => {
      mockMatter.mockReturnValue({
        data: { ...sampleData, slug: "custom-slug" },
        content: "# Custom Slug\n",
        excerpt: "",
      } as never);
      mockExistsSync.mockImplementation((p: PathLike) => {
        if (typeof p === "string" && p.endsWith("test-post.md")) return false;
        return true;
      });
      mockReaddirSync.mockReturnValue(["test-post.md"] as never);
      const post = await getPostBySlug("components", "custom-slug");
      expect(post).not.toBeNull();
      expect(post?.slug).toBe("custom-slug");
    });

    it("returns null when custom slug from frontmatter does not match slug arg", async () => {
      mockMatter.mockReturnValue({
        data: { ...sampleData, slug: "other-slug" },
        content: "# Wrong Slug\n",
        excerpt: "",
      } as never);
      mockExistsSync.mockImplementation((p: PathLike) => {
        if (typeof p === "string" && p.endsWith("finds-me.md")) return false;
        return true;
      });
      mockReaddirSync.mockReturnValue(["finds-me.md"] as never);
      const post = await getPostBySlug("components", "test-post");
      expect(post).toBeNull();
    });
  });

  describe("getPostsBySection", () => {
    it("returns posts sorted by date descending", async () => {
      const post = await getPostsBySection("components");
      expect(post).toHaveLength(1);
      expect(post[0].title).toBe("Test Post");
    });

    it("returns empty array when section directory does not exist", async () => {
      mockExistsSync.mockReturnValue(false);
      const post = await getPostsBySection("nonexistent");
      expect(post).toEqual([]);
    });

    it("filters out draft posts", async () => {
      mockMatter.mockReturnValue({
        data: { ...sampleData, draft: true },
        content: "# Draft\n",
        excerpt: "",
      } as never);
      const posts = await getPostsBySection("components");
      expect(posts).toHaveLength(0);
    });

    it("handles invalid content files gracefully", async () => {
      mockReaddirSync.mockReturnValue(["_index.md", "test-post.md", "backup.bak"] as never);
      const posts = await getPostsBySection("components");
      expect(posts).toHaveLength(1);
    });
  });

  describe("readFile edge cases", () => {
    it("handles Date object in frontmatter (normalizes to string)", async () => {
      mockReadFile.mockResolvedValue("---\ntitle: Date Post\ndate: 2024-06-15\n---\n# Content\n");
      mockMatter.mockReturnValue({
        data: { title: "Date Post", date: new Date("2024-06-15") },
        content: "# Content\n",
        excerpt: "",
      } as never);
      mockExistsSync.mockImplementation((p: PathLike) => {
        if (typeof p === "string" && p.endsWith("date-post.md")) return false;
        return true;
      });
      mockReaddirSync.mockReturnValue(["date-post.md"] as never);
      const post = await getPostBySlug("components", "date-post");
      expect(post).not.toBeNull();
      expect(post?.date).toBe("2024-06-15");
    });

    it("throws on frontmatter with invalid date string", async () => {
      mockMatter.mockReturnValue({
        data: { title: "Bad Date", date: "not-a-date" },
        content: "# Bad Date\n",
        excerpt: "",
      } as never);
      mockExistsSync.mockImplementation((p: PathLike) => {
        if (typeof p === "string" && p.endsWith("bad-date.md")) return false;
        return true;
      });
      mockReaddirSync.mockReturnValue(["bad-date.md"] as never);
      await expect(getPostBySlug("components", "bad-date")).rejects.toThrow("Invalid frontmatter");
    });

    it("returns null on non-object frontmatter", async () => {
      mockMatter.mockReturnValue({
        data: "string-not-object",
        content: "# Not an object\n",
        excerpt: "",
      } as never);
      mockExistsSync.mockImplementation((p: PathLike) => {
        if (typeof p === "string" && p.endsWith("bad-frontmatter.md")) return false;
        return true;
      });
      mockReaddirSync.mockReturnValue(["bad-frontmatter.md"] as never);
      await expect(getPostBySlug("components", "bad-frontmatter")).rejects.toThrow("Invalid frontmatter");
    });

    it("throws on invalid frontmatter (missing title)", async () => {
      mockReadFile.mockResolvedValue("---\ndate: 2024-01-01\n---\n# No title\n");
      mockMatter.mockReturnValue({
        data: { date: "2024-01-01" },
        content: "# No title\n",
        excerpt: "",
      } as never);
      mockExistsSync.mockImplementation((p: PathLike) => {
        if (typeof p === "string" && p.endsWith("no-title.md")) return false;
        return true;
      });
      mockReaddirSync.mockReturnValue(["no-title.md"] as never);
      await expect(getPostBySlug("components", "no-title")).rejects.toThrow("Invalid frontmatter");
    });
  });

  describe("error handling", () => {
    it("handles read error in getPostBySlug candidate path catch block", async () => {
      // existsSync returns true for candidate file (enters try block)
      mockExistsSync.mockReturnValue(true);
      mockReadFile.mockRejectedValueOnce(new Error("File read error"));
      // After catch, falls back to full scan — second readFile succeeds
      mockReadFile.mockResolvedValueOnce(sampleFrontmatter);
      mockReaddirSync.mockReturnValue(["test-post.md"] as never);
      const post = await getPostBySlug("components", "test-post");
      expect(post).not.toBeNull();
      expect(post?.title).toBe("Test Post");
    });

    it("handles file processing error in getPostsBySection", async () => {
      mockReadFile.mockRejectedValue(new Error("Processing error"));
      const posts = await getPostsBySection("components");
      expect(posts).toEqual([]);
    });
  });

  describe("getAllPosts", () => {
    it("returns posts from all sections", async () => {
      const posts = await getAllPosts();
      // 3 sections, each with 1 post = 3 posts
      expect(posts.length).toBeGreaterThanOrEqual(3);
    });

    it("accepts custom locale", async () => {
      const posts = await getAllPosts("de");
      expect(posts.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("getStaticPathsForSection", () => {
    it("returns slug array for a section", async () => {
      const paths = await getStaticPathsForSection("components");
      expect(paths).toEqual(["test-post"]);
    });
  });

  describe("getAllTags", () => {
    it("returns sorted unique tags from blog posts", async () => {
      const tags = await getAllTags();
      expect(tags).toContain("test");
      expect(tags).toContain("edu");
      expect(tags).toContain("security");
      expect(tags).toContain("compliance");
      expect(tags.length).toBeGreaterThanOrEqual(4);
    });

    it("returns empty array when blog section has no posts", async () => {
      mockExistsSync.mockReturnValue(false);
      const tags = await getAllTags();
      expect(tags).toEqual([]);
    });
  });

  describe("getPostsByTag", () => {
    it("returns only posts matching the given tag", async () => {
      const posts = await getPostsByTag("security");
      expect(posts).toHaveLength(1);
      expect(posts[0].title).toBe("Tagged Post");
    });

    it("returns empty array when no posts match", async () => {
      const posts = await getPostsByTag("nonexistent-tag");
      expect(posts).toEqual([]);
    });

    it("returns empty array when blog section does not exist", async () => {
      mockExistsSync.mockReturnValue(false);
      const posts = await getPostsByTag("security");
      expect(posts).toEqual([]);
    });
  });

  describe("getStaticPathsForTags", () => {
    it("returns tag strings for a locale", async () => {
      const tags = await getStaticPathsForTags();
      expect(tags.length).toBeGreaterThan(0);
      expect(tags.every((t: string) => typeof t === "string")).toBe(true);
    });
  });
});
