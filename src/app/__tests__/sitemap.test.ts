import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock content + config BEFORE importing the sitemap module
const mockPosts: Record<string, { slug: string; title: string; description: string; date: string; section: string; tags: string[]; categories: string[] }[]> = {
  en: [
    { slug: "email-arch", title: "Email Arch", description: "d", date: "2025-01-15", section: "blog", tags: ["email"], categories: ["infra"] },
  ],
  de: [
    { slug: "email-arch", title: "E-Mail Arch", description: "d", date: "2025-01-15", section: "blog", tags: ["email"], categories: ["infra"] },
  ],
  fr: [],
  zh: [],
};

const getAllPostsMock = vi.fn(async (locale: string) => mockPosts[locale] ?? []);

vi.mock("@/lib/content", () => ({
  getAllPosts: (locale: string) => getAllPostsMock(locale),
  SECTION_INFO: [
    { slug: "blog", title: "Blog" },
    { slug: "architecture", title: "Architecture" },
  ],
}));

vi.mock("@/lib/config", () => ({
  SITE_URL: "https://opendesk-edu.org",
  SITE_NAME: "openDesk Edu",
}));

// Import AFTER mocks
import sitemap from "@/app/sitemap";

describe("sitemap generation", () => {
  beforeEach(() => {
    getAllPostsMock.mockClear();
  });

  it("returns an array", async () => {
    const result = await sitemap();
    expect(Array.isArray(result)).toBe(true);
  });

  it("includes the root URL for every locale", async () => {
    const result = await sitemap();
    for (const locale of ["en", "de", "fr", "zh"]) {
      const entry = result.find((e) => e.url === `https://opendesk-edu.org/${locale}`);
      expect(entry).toBeDefined();
      expect(entry?.priority).toBe(1.0);
      expect(entry?.changeFrequency).toBe("weekly");
      expect(entry?.lastModified).toBeDefined();
    }
  });

  it("includes the about page for every locale", async () => {
    const result = await sitemap();
    for (const locale of ["en", "de", "fr", "zh"]) {
      const expectedUrl = `https://opendesk-edu.org/${locale}${
        locale === "de" ? "/ueber-uns" : locale === "fr" ? "/a-propos" : "/about"
      }`;
      const entry = result.find((e) => e.url === expectedUrl);
      expect(entry, `about entry for ${locale}`).toBeDefined();
    }
  });

  it("includes the imprint page for every locale", async () => {
    const result = await sitemap();
    for (const locale of ["en", "de", "fr", "zh"]) {
      const expectedUrl = `https://opendesk-edu.org/${locale}${
        locale === "de" ? "/impressum" : locale === "fr" ? "/mentions-legales" : "/imprint"
      }`;
      const entry = result.find((e) => e.url === expectedUrl);
      expect(entry, `imprint entry for ${locale}`).toBeDefined();
    }
  });

  it("includes the privacy page for every locale", async () => {
    const result = await sitemap();
    for (const locale of ["en", "de", "fr", "zh"]) {
      const expectedUrl = `https://opendesk-edu.org/${locale}${
        locale === "de" ? "/datenschutz" : locale === "fr" ? "/politique-de-confidentialite" : "/privacy"
      }`;
      const entry = result.find((e) => e.url === expectedUrl);
      expect(entry, `privacy entry for ${locale}`).toBeDefined();
    }
  });

  it("includes section landing pages for every locale", async () => {
    const result = await sitemap();
    for (const locale of ["en", "de", "fr", "zh"]) {
      for (const section of ["blog", "architecture"]) {
        const entry = result.find((e) => e.url === `https://opendesk-edu.org/${locale}/${section}`);
        expect(entry, `section ${section} for ${locale}`).toBeDefined();
        expect(entry?.priority).toBe(0.8);
      }
    }
  });

  it("includes posts for each locale that has them", async () => {
    const result = await sitemap();
    const enPost = result.find((e) => e.url === "https://opendesk-edu.org/en/blog/email-arch");
    expect(enPost).toBeDefined();
    expect(enPost?.priority).toBe(0.6);
    expect(enPost?.changeFrequency).toBe("monthly");

    const dePost = result.find((e) => e.url === "https://opendesk-edu.org/de/blog/email-arch");
    expect(dePost).toBeDefined();
  });

  it("does not include posts for locales without that post", async () => {
    const result = await sitemap();
    const frPost = result.find((e) => e.url === "https://opendesk-edu.org/fr/blog/email-arch");
    expect(frPost).toBeUndefined();
  });

  it("uses the post date as lastModified", async () => {
    const result = await sitemap();
    const enPost = result.find((e) => e.url === "https://opendesk-edu.org/en/blog/email-arch");
    expect(enPost?.lastModified).toBe("2025-01-15T00:00:00.000Z");
  });

  it("builds alternates languages for root page", async () => {
    const result = await sitemap();
    const enHome = result.find((e) => e.url === "https://opendesk-edu.org/en")!;
    expect(enHome.alternates?.languages).toBeDefined();
    // Root pathname config is "/" so alternates carry the trailing slash
    expect(enHome.alternates?.languages.en).toBe("https://opendesk-edu.org/en/");
    expect(enHome.alternates?.languages.de).toBe("https://opendesk-edu.org/de/");
    expect(enHome.alternates?.languages.fr).toBe("https://opendesk-edu.org/fr/");
    expect(enHome.alternates?.languages.zh).toBe("https://opendesk-edu.org/zh/");
  });

  it("builds alternates languages for localized about page", async () => {
    const result = await sitemap();
    const deAbout = result.find((e) => e.url === "https://opendesk-edu.org/de/ueber-uns")!;
    expect(deAbout.alternates?.languages.de).toBe("https://opendesk-edu.org/de/ueber-uns");
    expect(deAbout.alternates?.languages.en).toBe("https://opendesk-edu.org/en/about");
    expect(deAbout.alternates?.languages.fr).toBe("https://opendesk-edu.org/fr/a-propos");
    expect(deAbout.alternates?.languages.zh).toBe("https://opendesk-edu.org/zh/about");
  });

  it("builds post alternates only for locales that have the post", async () => {
    const result = await sitemap();
    const enPost = result.find((e) => e.url === "https://opendesk-edu.org/en/blog/email-arch")!;
    expect(enPost.alternates?.languages.en).toBe("https://opendesk-edu.org/en/blog/email-arch");
    expect(enPost.alternates?.languages.de).toBe("https://opendesk-edu.org/de/blog/email-arch");
    // fr/zh do not have this post → no alternates for them
    expect(enPost.alternates?.languages.fr).toBeUndefined();
    expect(enPost.alternates?.languages.zh).toBeUndefined();
  });

  it("calls getAllPosts for every locale", async () => {
    await sitemap();
    const calledLocales = getAllPostsMock.mock.calls.map((c) => c[0]);
    for (const locale of ["en", "de", "fr", "zh"]) {
      expect(calledLocales).toContain(locale);
    }
  });

  it("generates a valid lastModified for every entry", async () => {
    const result = await sitemap();
    for (const entry of result) {
      expect(new Date(entry.lastModified as string).toString()).not.toBe("Invalid Date");
    }
  });
});
