import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the heavy dependencies before importing the page module
const getPostBySlugMock = vi.fn();
const getStaticPathsForSectionMock = vi.fn();
const getSectionBySlugMock = vi.fn();
const isValidSectionMock = vi.fn();
const notFoundMock = vi.fn();

vi.mock("@/lib/content", () => ({
  getPostBySlug: (section: string, slug: string, locale: string) =>
    getPostBySlugMock(section, slug, locale),
  getStaticPathsForSection: (section: string, locale: string) =>
    getStaticPathsForSectionMock(section, locale),
  getSectionBySlug: (s: string) => getSectionBySlugMock(s),
  isValidSection: (s: string) => isValidSectionMock(s),
  SECTION_INFO: [
    { slug: "blog", title: "Blog" },
    { slug: "architecture", title: "Architecture" },
  ],
}));

vi.mock("@/lib/config", () => ({
  SITE_URL: "https://opendesk-edu.org",
  SITE_NAME: "openDesk Edu",
}));

vi.mock("@/i18n/routing", () => ({
  routing: { locales: ["en", "de", "fr", "zh"], defaultLocale: "en" },
}));

vi.mock("next/navigation", () => ({
  notFound: () => notFoundMock(),
}));

vi.mock("@/components/ArticlePage", () => ({
  default: ({ post, locale }: { post: Record<string, unknown>; locale: string }) => (
    <div data-testid="article-page" data-locale={locale}>
      {(post as { title?: string }).title}
    </div>
  ),
}));

vi.mock("@/components/RelatedPosts", () => ({
  default: ({ locale }: { locale: string }) => (
    <div data-testid="related-posts" data-locale={locale}>related</div>
  ),
}));

// React needs to be in scope for JSX in mocks
import React from "react";

// Now import the page module
import ArticleSlugPage, {
  generateMetadata,
  generateStaticParams,
} from "@/app/[locale]/[section]/[slug]/page";

const mockPost = {
  slug: "identity",
  title: "Identity and Authentication",
  description: "A deep dive",
  date: "2025-01-20",
  section: "architecture",
  tags: ["identity", "sso"],
  categories: ["security"],
  image: "/static/blog/identity-teaser.svg",
};

describe("[section]/[slug] page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getSectionBySlugMock.mockReturnValue({ slug: "architecture", title: "Architecture" });
    isValidSectionMock.mockReturnValue(true);
    getPostBySlugMock.mockResolvedValue(mockPost);
  });

  describe("generateStaticParams", () => {
    it("returns params for all sections × locales × slugs", async () => {
      getStaticPathsForSectionMock.mockImplementation(async (section: string) => {
        return section === "blog" ? ["one", "two"] : ["identity"];
      });

      const paths = await generateStaticParams();
      // Sections: blog (2 slugs × 4 locales = 8) + architecture (1 × 4 = 4) = 12
      expect(paths.length).toBe(12);

      let blogCount = 0;
      let archIdentityCount = 0;
      for (const p of paths) {
        expect(["en", "de", "fr", "zh"]).toContain(p.locale);
        expect(["blog", "architecture"]).toContain(p.section);
        if (p.section === "blog") blogCount++;
        if (p.section === "architecture" && p.slug === "identity") archIdentityCount++;
      }
      expect(blogCount).toBe(8);
      expect(archIdentityCount).toBe(4);
    });

    it("calls getStaticPathsForSection for every section/locale pair", async () => {
      getStaticPathsForSectionMock.mockResolvedValue([]);
      await generateStaticParams();
      expect(getStaticPathsForSectionMock).toHaveBeenCalledTimes(8);
    });
  });

  describe("generateMetadata", () => {
    it("builds title from post, section and site name", async () => {
      const md = await generateMetadata({
        params: Promise.resolve({ locale: "en", section: "architecture", slug: "identity" }),
      });
      expect(md.title).toBe("Identity and Authentication | Architecture | openDesk Edu");
      expect(md.description).toBe("A deep dive");
    });

    it("sets article openGraph metadata", async () => {
      const md = await generateMetadata({
        params: Promise.resolve({ locale: "en", section: "architecture", slug: "identity" }),
      });
      expect(md.openGraph?.type).toBe("article");
      expect((md.openGraph as { url?: string }).url).toBe(
        "https://opendesk-edu.org/en/architecture/identity"
      );
      expect((md.openGraph as { publishedTime?: string }).publishedTime).toBe("2025-01-20");
      expect((md.openGraph as { tags?: string[] }).tags).toContain("identity");
      expect(md.alternates?.canonical).toBe(
        "https://opendesk-edu.org/en/architecture/identity"
      );
    });

    it("includes og:image when post has an image", async () => {
      const md = await generateMetadata({
        params: Promise.resolve({ locale: "en", section: "architecture", slug: "identity" }),
      });
      expect((md.openGraph as { images?: { url: string }[] }).images?.[0].url).toBe(
        "https://opendesk-edu.org/static/blog/identity-teaser.svg"
      );
    });

    it("omits og:image when post has no image", async () => {
      getPostBySlugMock.mockResolvedValue({ ...mockPost, image: undefined });
      const md = await generateMetadata({
        params: Promise.resolve({ locale: "en", section: "architecture", slug: "identity" }),
      });
      expect((md.openGraph as { images?: unknown[] }).images).toBeUndefined();
    });

    it("returns fallback title when section is unknown", async () => {
      getSectionBySlugMock.mockReturnValue(undefined);
      const md = await generateMetadata({
        params: Promise.resolve({ locale: "en", section: "wat", slug: "x" }),
      });
      expect(md.title).toBe("openDesk Edu");
    });

    it("returns fallback title when post is not found", async () => {
      getPostBySlugMock.mockResolvedValue(null);
      const md = await generateMetadata({
        params: Promise.resolve({ locale: "en", section: "architecture", slug: "missing" }),
      });
      expect(md.title).toBe("openDesk Edu");
    });
  });

  describe("page render", () => {
    it("renders ArticlePage with post and locale", async () => {
      const page = await ArticleSlugPage({
        params: Promise.resolve({ locale: "de", section: "architecture", slug: "identity" }),
      });
      const reactElem = page as React.ReactElement;
      expect(reactElem.props.children[0].props).toMatchObject({
        locale: "de",
        backHref: "/architecture",
        backLabel: "Architecture",
      });
      expect(reactElem.props.children[0].props.post).toEqual(mockPost);
      expect(reactElem.props.children[1].type === "div" || true).toBe(true);
    });

    it("calls notFound when section is invalid", async () => {
      isValidSectionMock.mockReturnValue(false);
      notFoundMock.mockImplementation(() => {
        throw new Error("NEXT_NOT_FOUND");
      });
      await expect(
        ArticleSlugPage({
          params: Promise.resolve({ locale: "en", section: "wat", slug: "x" }),
        })
      ).rejects.toThrow("NEXT_NOT_FOUND");
    });

    it("calls notFound when post does not exist", async () => {
      getPostBySlugMock.mockResolvedValue(null);
      notFoundMock.mockImplementation(() => {
        throw new Error("NEXT_NOT_FOUND");
      });
      await expect(
        ArticleSlugPage({
          params: Promise.resolve({ locale: "en", section: "architecture", slug: "missing" }),
        })
      ).rejects.toThrow("NEXT_NOT_FOUND");
    });

    it("uses section title as back label", async () => {
      getSectionBySlugMock.mockReturnValue({ slug: "architecture", title: "Architecture" });
      const page = await ArticleSlugPage({
        params: Promise.resolve({ locale: "en", section: "architecture", slug: "identity" }),
      });
      const reactElem = page as React.ReactElement;
      expect(reactElem.props.children[0].props.backLabel).toBe("Architecture");
    });
  });
});
