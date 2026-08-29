import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock functions — referenced indirectly via arrow wrappers in vi.mock factories
// so that hoisting doesn't cause TDZ errors (same pattern as [section]/[slug] test)
const mockGetPostsByTag = vi.fn();
const mockGetAllTags = vi.fn();
const mockGetPostsBySection = vi.fn();
const mockNotFound = vi.fn();
const mockGetTranslations = vi.fn();

vi.mock("@/lib/content", () => ({
  getPostsByTag: (...args: unknown[]) => mockGetPostsByTag(...args),
  getAllTags: (...args: unknown[]) => mockGetAllTags(...args),
  getPostsBySection: (...args: unknown[]) => mockGetPostsBySection(...args),
}));

vi.mock("@/lib/config", () => ({
  SITE_URL: "https://opendesk-edu.org",
  SITE_NAME: "openDesk Edu",
}));

vi.mock("@/i18n/routing", () => ({
  routing: { locales: ["en", "de", "fr", "zh"], defaultLocale: "en" },
}));

vi.mock("next/navigation", () => ({
  notFound: () => mockNotFound(),
}));

vi.mock("next-intl/server", () => ({
  getTranslations: (...args: unknown[]) => mockGetTranslations(...args),
}));

vi.mock("@/components/PostList", () => ({
  default: () => null,
}));

import TagPage, {
  generateMetadata,
  generateStaticParams,
  dynamicParams,
} from "@/app/[locale]/blog/tag/[tag]/page";

const posts1 = [
  {
    slug: "a",
    title: "Post A",
    date: "2025-01-01",
    description: "d",
    section: "blog",
    tags: ["tag1"],
    categories: [],
  },
];

describe("blog/tag/[tag] page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPostsByTag.mockResolvedValue(posts1);
    mockGetAllTags.mockResolvedValue(["tag1", "tag2"]);
    mockGetPostsBySection.mockResolvedValue(posts1);
    mockGetTranslations.mockReturnValue(vi.fn((k: string) => k));
    mockNotFound.mockImplementation(() => {
      throw new Error("NEXT_NOT_FOUND");
    });
  });

  describe("exports", () => {
    it("exports default component", () => {
      expect(typeof TagPage).toBe("function");
    });

    it("exports generateStaticParams", () => {
      expect(typeof generateStaticParams).toBe("function");
    });

    it("exports generateMetadata", () => {
      expect(typeof generateMetadata).toBe("function");
    });

    it("exports dynamicParams=false", () => {
      expect(dynamicParams).toBe(false);
    });
  });

  describe("generateStaticParams", () => {
    it("returns all tag/locale combinations", async () => {
      const params = await generateStaticParams();
      expect(params.length).toBe(8);
      const tags = new Set(params.map((p) => p.tag));
      expect([...tags]).toContain("tag1");
      expect([...tags]).toContain("tag2");
    });

    it("covers all four locales", async () => {
      const params = await generateStaticParams();
      const locales = new Set(params.map((p) => p.locale));
      expect(locales.size).toBe(4);
      expect([...locales]).toContain("en");
      expect([...locales]).toContain("de");
    });

    it("calls getAllTags for each locale", async () => {
      await generateStaticParams();
      expect(mockGetAllTags).toHaveBeenCalledTimes(4);
    });
  });

  describe("generateMetadata", () => {
    it("returns title in format: tagName — Blog | SITE_NAME", async () => {
      const md = await generateMetadata({
        params: Promise.resolve({ locale: "en", tag: "tag1" }),
      });
      expect(md.title).toBe("tag1 — Blog | openDesk Edu");
    });

    it("description contains post count with plural", async () => {
      mockGetPostsByTag.mockResolvedValueOnce([{}, {}, {}] as never[]);
      const md = await generateMetadata({
        params: Promise.resolve({ locale: "en", tag: "multi" }),
      });
      expect(md.description).toContain("3 posts");
    });

    it("description contains post count with singular", async () => {
      mockGetPostsByTag.mockResolvedValueOnce([{}] as never[]);
      const md = await generateMetadata({
        params: Promise.resolve({ locale: "en", tag: "single" }),
      });
      expect(md.description).toContain("1 post");
    });

    it("returns SITE_NAME when tag has no posts", async () => {
      mockGetPostsByTag.mockResolvedValueOnce([] as never[]);
      const md = await generateMetadata({
        params: Promise.resolve({ locale: "en", tag: "empty" }),
      });
      expect(md.title).toBe("openDesk Edu");
    });

    it("sets website openGraph type", async () => {
      const md = await generateMetadata({
        params: Promise.resolve({ locale: "en", tag: "tag1" }),
      });
      expect(
        (md as { openGraph?: { type?: string } }).openGraph?.type
      ).toBe("website");
    });

    it("sets canonical alternate", async () => {
      const md = await generateMetadata({
        params: Promise.resolve({ locale: "en", tag: "tag1" }),
      });
      expect(md.alternates?.canonical).toBe(
        "https://opendesk-edu.org/en/blog/tag/tag1"
      );
    });
  });

  describe("page server component", () => {
    it("returns a React element", async () => {
      const result = await TagPage({
        params: Promise.resolve({ locale: "en", tag: "infrastructure" }),
      });
      expect(result).toBeDefined();
    });

    it("calls getPostsByTag with tag and locale", async () => {
      mockGetPostsByTag.mockClear();
      await TagPage({
        params: Promise.resolve({ locale: "fr", tag: "federation" }),
      });
      expect(mockGetPostsByTag).toHaveBeenCalledWith("federation", "fr");
    });

    it("calls getPostsBySection for blog and locale", async () => {
      mockGetPostsBySection.mockClear();
      await TagPage({
        params: Promise.resolve({ locale: "de", tag: "tag1" }),
      });
      expect(mockGetPostsBySection).toHaveBeenCalledWith("blog", "de");
    });

    it("calls notFound when no posts for the tag", async () => {
      mockGetPostsByTag.mockResolvedValueOnce([] as never[]);
      await expect(
        TagPage({ params: Promise.resolve({ locale: "en", tag: "nope" }) })
      ).rejects.toThrow("NEXT_NOT_FOUND");
    });

    it("calls getTranslations with 'section' namespace", async () => {
      mockGetTranslations.mockClear();
      mockGetTranslations.mockReturnValue(vi.fn((k: string) => k));
      await TagPage({
        params: Promise.resolve({ locale: "en", tag: "tag1" }),
      });
      expect(mockGetTranslations).toHaveBeenCalledWith("section");
    });
  });
});
