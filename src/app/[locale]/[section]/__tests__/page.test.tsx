import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";

const getPostsBySectionMock = vi.fn();
const getSectionBySlugMock = vi.fn();
const isValidSectionMock = vi.fn();
const getTranslationsMock = vi.fn();
const notFoundMock = vi.fn();

vi.mock("@/lib/content", () => ({
  getPostsBySection: (section: string, locale: string) => getPostsBySectionMock(section, locale),
  getSectionBySlug: (s: string) => getSectionBySlugMock(s),
  isValidSection: (s: string) => isValidSectionMock(s),
  SECTION_INFO: [
    { slug: "blog", title: "Blog", name: "Blog", description: "Blog description" },
    { slug: "architecture", title: "Architecture", name: "Architecture", description: "Architecture description" },
  ],
}));

vi.mock("@/i18n/routing", () => ({
  routing: { locales: ["en", "de", "fr", "zh"], defaultLocale: "en" },
}));

vi.mock("@/lib/config", () => ({
  SITE_URL: "https://opendesk-edu.org",
  SITE_NAME: "openDesk Edu",
}));

vi.mock("next-intl/server", () => ({
  getTranslations: (ns: string) => getTranslationsMock(ns),
}));

vi.mock("next/navigation", () => ({
  notFound: () => notFoundMock(),
}));

vi.mock("@/components/PostList", () => ({
  default: ({ posts, section, locale }: { posts: unknown[]; section: string; locale: string }) => (
    <div data-testid="post-list" data-section={section} data-locale={locale} data-count={posts.length}>
      PostList
    </div>
  ),
}));

import SectionPage, {
  generateStaticParams,
  generateMetadata,
  dynamicParams,
} from "@/app/[locale]/[section]/page";

const mockPosts = [
  { slug: "post-1", title: "Post 1", date: "2025-01-01" },
  { slug: "post-2", title: "Post 2", date: "2025-01-02" },
];

describe("[section]/page.tsx", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isValidSectionMock.mockReturnValue(true);
    getSectionBySlugMock.mockImplementation((s: string) =>
      s === "blog"
        ? { slug: "blog", title: "Blog", description: "Blog description" }
        : s === "architecture"
          ? { slug: "architecture", title: "Architecture", description: "Architecture description" }
          : undefined,
    );
    getPostsBySectionMock.mockResolvedValue(mockPosts);
    getTranslationsMock.mockResolvedValue((key: string) => key);
  });

  describe("exports", () => {
    it("exports generateStaticParams", () => {
      expect(typeof generateStaticParams).toBe("function");
    });

    it("exports generateMetadata", () => {
      expect(typeof generateMetadata).toBe("function");
    });

    it("exports default page component", () => {
      expect(typeof SectionPage).toBe("function");
    });

    it("sets dynamicParams to false", () => {
      expect(dynamicParams).toBe(false);
    });
  });

  describe("generateStaticParams", () => {
    it("returns params for all sections × locales", async () => {
      const paths = await generateStaticParams();
      // 2 sections × 4 locales = 8
      expect(paths).toHaveLength(8);
      for (const p of paths) {
        expect(["en", "de", "fr", "zh"]).toContain(p.locale);
        expect(["blog", "architecture"]).toContain(p.section);
      }
    });

    it("includes all locales for each section", async () => {
      const paths = await generateStaticParams();
      const blogLocales = paths.filter((p) => p.section === "blog").map((p) => p.locale);
      expect(blogLocales.sort()).toEqual(["de", "en", "fr", "zh"]);
    });
  });

  describe("generateMetadata", () => {
    it("returns title with section name and site name for valid section", async () => {
      const md = await generateMetadata({
        params: Promise.resolve({ locale: "en", section: "blog" }),
      });
      expect(md.title).toBe("Blog | openDesk Edu");
    });

    it("returns description for valid section", async () => {
      const md = await generateMetadata({
        params: Promise.resolve({ locale: "en", section: "architecture" }),
      });
      expect(md.description).toBe("Architecture description");
    });

    it("returns openGraph metadata for valid section", async () => {
      const md = await generateMetadata({
        params: Promise.resolve({ locale: "en", section: "blog" }),
      });
      expect(md.openGraph?.type).toBe("website");
      expect(md.openGraph?.title).toBe("Blog");
      expect(md.openGraph?.siteName).toBe("openDesk Edu");
    });

    it("returns fallback title for unknown section", async () => {
      const md = await generateMetadata({
        params: Promise.resolve({ locale: "en", section: "nonexistent" }),
      });
      expect(md.title).toBe("openDesk Edu");
    });
  });

  describe("page render", () => {
    it("renders without error when posts exist", async () => {
      const elem = await SectionPage({
        params: Promise.resolve({ locale: "en", section: "blog" }),
      });
      expect(elem).toBeTruthy();
      const reactElem = elem as React.ReactElement;
      expect(reactElem.type).toBeTruthy();
    });

    it("calls getPostsBySection with correct arguments", async () => {
      await SectionPage({
        params: Promise.resolve({ locale: "de", section: "blog" }),
      });
      expect(getPostsBySectionMock).toHaveBeenCalledWith("blog", "de");
    });

    it("renders breadcrumb JSON-LD", async () => {
      const elem = await SectionPage({
        params: Promise.resolve({ locale: "en", section: "blog" }),
      });
      const reactElem = elem as React.ReactElement;
      // Find the JSON-LD script in the rendered tree
      const jsonLd = findJsonLd(reactElem);
      expect(jsonLd).toBeDefined();
      expect(jsonLd!["@type"]).toBe("BreadcrumbList");
      expect(jsonLd!.itemListElement).toHaveLength(2);
      expect(jsonLd!.itemListElement[0].name).toBe("Home");
      expect(jsonLd!.itemListElement[1].name).toBe("Blog");
      expect(jsonLd!.itemListElement[1].item).toBe("https://opendesk-edu.org/en/blog");
    });

    it("renders section title as h1", async () => {
      const elem = await SectionPage({
        params: Promise.resolve({ locale: "en", section: "architecture" }),
      });
      const h1 = findElementByText(elem, "h1", "Architecture");
      expect(h1).toBeTruthy();
    });

    it("renders section description", async () => {
      const elem = await SectionPage({
        params: Promise.resolve({ locale: "en", section: "blog" }),
      });
      const desc = findElementByText(elem, "p", "Blog description");
      expect(desc).toBeTruthy();
    });

    it("calls getTranslations with 'section' namespace", async () => {
      await SectionPage({
        params: Promise.resolve({ locale: "en", section: "blog" }),
      });
      expect(getTranslationsMock).toHaveBeenCalledWith("section");
    });

    it("calls notFound when section is invalid", async () => {
      isValidSectionMock.mockReturnValue(false);
      notFoundMock.mockImplementation(() => {
        throw new Error("NEXT_NOT_FOUND");
      });
      await expect(
        SectionPage({
          params: Promise.resolve({ locale: "en", section: "invalid" }),
        }),
      ).rejects.toThrow("NEXT_NOT_FOUND");
    });

    it("calls notFound when section info not found", async () => {
      isValidSectionMock.mockReturnValue(true);
      getSectionBySlugMock.mockReturnValue(undefined);
      notFoundMock.mockImplementation(() => {
        throw new Error("NEXT_NOT_FOUND");
      });
      await expect(
        SectionPage({
          params: Promise.resolve({ locale: "en", section: "blog" }),
        }),
      ).rejects.toThrow("NEXT_NOT_FOUND");
    });
  });
});

// Helpers to traverse React elements without rendering to DOM
function findJsonLd(elem: React.ReactElement): Record<string, unknown> | undefined {
  if (elem.props?.dangerouslySetInnerHTML) {
    try {
      return JSON.parse(elem.props.dangerouslySetInnerHTML.__html);
    } catch {
      return undefined;
    }
  }
  if (elem.props?.children) {
    const children = Array.isArray(elem.props.children) ? elem.props.children : [elem.props.children];
    for (const child of children) {
      if (React.isValidElement(child)) {
        const found = findJsonLd(child);
        if (found) return found;
      }
    }
  }
  return undefined;
}

function findElementByText(
  elem: React.ReactElement,
  tag: string,
  text: string,
): React.ReactElement | null {
  if (elem.type === tag && elem.props?.children === text) {
    return elem;
  }
  if (elem.props?.children) {
    const children = Array.isArray(elem.props.children) ? elem.props.children : [elem.props.children];
    for (const child of children) {
      if (React.isValidElement(child)) {
        const found = findElementByText(child, tag, text);
        if (found) return found;
      }
    }
  }
  return null;
}
