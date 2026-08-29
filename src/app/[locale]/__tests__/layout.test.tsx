import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import React from "react";

// Mock functions — referenced indirectly via arrow wrappers in vi.mock factories
// to avoid TDZ errors from vi.mock hoisting (same pattern as [section]/[slug] test)
const mockSetRequestLocale = vi.fn();
const mockGetMessages = vi.fn();
const mockNotFound = vi.fn();

vi.mock("next-intl/server", () => ({
  getMessages: (...args: unknown[]) => mockGetMessages(...args),
  setRequestLocale: (...args: unknown[]) => mockSetRequestLocale(...args),
}));

vi.mock("next-intl", () => ({
  NextIntlClientProvider: ({
    children,
  }: {
    children: React.ReactNode;
  }) => children,
}));

vi.mock("next/navigation", () => ({
  notFound: () => mockNotFound(),
}));

vi.mock("@/i18n/routing", () => ({
  routing: { locales: ["en", "de", "fr", "zh"], defaultLocale: "en" },
}));

vi.mock("@/lib/config", () => ({
  SITE_URL: "https://opendesk-edu.org",
  SITE_NAME: "openDesk Edu",
  SITE_DESCRIPTION:
    "Educational digital infrastructure for universities - openDesk CE with 15 integrated services for seamless digital transformation.",
}));

vi.mock("next/font/google", () => ({
  Inter: () => ({ variable: "--font-inter" }),
}));

vi.mock("@/components/ThemeProvider", () => ({
  ThemeProvider: ({
    children,
  }: {
    children: React.ReactNode;
  }) => children,
}));
vi.mock("@/components/ErrorBoundary", () => ({
  default: ({
    children,
  }: {
    children: React.ReactNode;
  }) => children,
}));
vi.mock("@/components/Header", () => ({
  default: () =>
    React.createElement("div", { "data-testid": "header" }),
}));
vi.mock("@/components/Footer", () => ({
  default: () =>
    React.createElement("div", { "data-testid": "footer" }),
}));
vi.mock("@/components/ScrollToTop", () => ({
  default: () => null,
}));
vi.mock("@/components/CookieConsent", () => ({
  default: () => null,
}));
vi.mock("@/components/SearchDialogWrapper", () => ({
  default: () => null,
}));
vi.mock("@/components/SearchContext", () => ({
  SearchProvider: ({
    children,
  }: {
    children: React.ReactNode;
  }) => children,
}));

import LocaleLayout, {
  generateStaticParams,
  generateMetadata,
} from "@/app/[locale]/layout";

describe("[locale] layout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetMessages.mockResolvedValue({ common: {} });
    mockNotFound.mockImplementation(() => {
      throw new Error("NEXT_NOT_FOUND");
    });
  });

  describe("generateStaticParams", () => {
    it("returns all four locales", () => {
      const params = generateStaticParams();
      expect(params).toHaveLength(4);
      const locales = params.map((p) => p.locale);
      expect(locales).toContain("en");
      expect(locales).toContain("de");
      expect(locales).toContain("fr");
      expect(locales).toContain("zh");
    });

    it("returns objects with locale property", () => {
      const params = generateStaticParams();
      for (const p of params) {
        expect(p).toHaveProperty("locale");
        expect(typeof p.locale).toBe("string");
      }
    });
  });

  describe("generateMetadata", () => {
    it("returns SITE_NAME as title", async () => {
      const md = await generateMetadata({
        params: Promise.resolve({ locale: "en" }),
      });
      expect(md.title).toBe("openDesk Edu");
    });

    it("returns SITE_DESCRIPTION as description", async () => {
      const md = await generateMetadata({
        params: Promise.resolve({ locale: "en" }),
      });
      expect(md.description).toBe(
        "Educational digital infrastructure for universities - openDesk CE with 15 integrated services for seamless digital transformation."
      );
    });

    it("sets metadataBase to SITE_URL", async () => {
      const md = await generateMetadata({
        params: Promise.resolve({ locale: "en" }),
      });
      expect(md.metadataBase?.toString()).toBe("https://opendesk-edu.org/");
    });

    it("sets openGraph type to website", async () => {
      const md = await generateMetadata({
        params: Promise.resolve({ locale: "en" }),
      });
      expect(md.openGraph?.type).toBe("website");
    });

    it("sets openGraph url with locale", async () => {
      const md = await generateMetadata({
        params: Promise.resolve({ locale: "de" }),
      });
      expect(md.openGraph?.url).toBe("https://opendesk-edu.org/de");
    });

    it("sets openGraph locale", async () => {
      const md = await generateMetadata({
        params: Promise.resolve({ locale: "fr" }),
      });
      expect(md.openGraph?.locale).toBe("fr");
    });

    it("sets openGraph siteName", async () => {
      const md = await generateMetadata({
        params: Promise.resolve({ locale: "en" }),
      });
      expect(md.openGraph?.siteName).toBe("openDesk Edu");
    });

    it("sets openGraph images with og-image", async () => {
      const md = await generateMetadata({
        params: Promise.resolve({ locale: "en" }),
      });
      expect(md.openGraph?.images).toEqual(["/static/brand/og-image.png"]);
    });

    it("sets openGraph alternateLocale excluding current locale", async () => {
      const md = await generateMetadata({
        params: Promise.resolve({ locale: "en" }),
      });
      expect(md.openGraph?.alternateLocale).toEqual(["de", "fr", "zh"]);
    });

    it("sets alternates canonical with locale", async () => {
      const md = await generateMetadata({
        params: Promise.resolve({ locale: "de" }),
      });
      expect(md.alternates?.canonical).toBe("https://opendesk-edu.org/de");
    });

    it("sets alternates languages for all locales", async () => {
      const md = await generateMetadata({
        params: Promise.resolve({ locale: "en" }),
      });
      const languages = md.alternates?.languages as Record<string, string>;
      expect(languages.en).toBe("https://opendesk-edu.org/en");
      expect(languages.de).toBe("https://opendesk-edu.org/de");
      expect(languages.fr).toBe("https://opendesk-edu.org/fr");
      expect(languages.zh).toBe("https://opendesk-edu.org/zh");
    });

    it("sets twitter card to summary_large_image", async () => {
      const md = await generateMetadata({
        params: Promise.resolve({ locale: "en" }),
      });
      expect(md.twitter?.card).toBe("summary_large_image");
    });

    it("sets icons with svg", async () => {
      const md = await generateMetadata({
        params: Promise.resolve({ locale: "en" }),
      });
      expect(md.icons).toEqual([
        { url: "/static/brand/icon.svg", type: "image/svg+xml" },
      ]);
    });

    it("sets manifest", async () => {
      const md = await generateMetadata({
        params: Promise.resolve({ locale: "en" }),
      });
      expect(md.manifest).toBe("/static/manifest.json");
    });

    it("sets robots to index and follow", async () => {
      const md = await generateMetadata({
        params: Promise.resolve({ locale: "en" }),
      });
      expect(md.robots).toEqual({ index: true, follow: true });
    });
  });

  describe("LocaleLayout (default export)", () => {
    it("calls notFound for invalid locale", async () => {
      await expect(
        LocaleLayout({
          children: React.createElement("div"),
          params: Promise.resolve({ locale: "invalid" }),
        })
      ).rejects.toThrow("NEXT_NOT_FOUND");
      expect(mockNotFound).toHaveBeenCalled();
    });

    it("calls setRequestLocale with the locale", async () => {
      await LocaleLayout({
        children: React.createElement("div"),
        params: Promise.resolve({ locale: "en" }),
      });
      expect(mockSetRequestLocale).toHaveBeenCalledWith("en");
    });

    it("calls getMessages", async () => {
      await LocaleLayout({
        children: React.createElement("div"),
        params: Promise.resolve({ locale: "en" }),
      });
      expect(mockGetMessages).toHaveBeenCalled();
    });

    it("returns an html element with lang attribute", async () => {
      const result = await LocaleLayout({
        children: React.createElement("div"),
        params: Promise.resolve({ locale: "fr" }),
      });
      const htmlEl = result as React.ReactElement;
      expect(htmlEl.type).toBe("html");
      expect(htmlEl.props.lang).toBe("fr");
    });

    it("includes JSON-LD organization script", async () => {
      const result = await LocaleLayout({
        children: React.createElement("div"),
        params: Promise.resolve({ locale: "en" }),
      });
      const html = renderToStaticMarkup(result);
      expect(html).toContain('"@type":"Organization"');
      expect(html).toContain("openDesk Edu");
    });

    it("includes theme script", async () => {
      const result = await LocaleLayout({
        children: React.createElement("div"),
        params: Promise.resolve({ locale: "en" }),
      });
      const html = renderToStaticMarkup(result);
      expect(html).toContain("localStorage");
      expect(html).toContain("data-theme");
    });

    it("renders children", async () => {
      const child = React.createElement(
        "div",
        { "data-testid": "child" },
        "Content"
      );
      const result = await LocaleLayout({
        children: child,
        params: Promise.resolve({ locale: "en" }),
      });
      const html = renderToStaticMarkup(result);
      expect(html).toContain("Content");
    });

    it("includes RSS link for locale", async () => {
      const result = await LocaleLayout({
        children: React.createElement("div"),
        params: Promise.resolve({ locale: "de" }),
      });
      const html = renderToStaticMarkup(result);
      expect(html).toContain("/de/rss");
    });

    it("includes AdSense script", async () => {
      const result = await LocaleLayout({
        children: React.createElement("div"),
        params: Promise.resolve({ locale: "en" }),
      });
      const html = renderToStaticMarkup(result);
      expect(html).toContain("pagead2.googlesyndication.com");
    });

    it("includes JSON-LD with locale-specific description for de", async () => {
      const result = await LocaleLayout({
        children: React.createElement("div"),
        params: Promise.resolve({ locale: "de" }),
      });
      const html = renderToStaticMarkup(result);
      expect(html).toContain("Open-Source-Digitalarbeitsplatz");
    });

    it("includes JSON-LD with locale-specific description for fr", async () => {
      const result = await LocaleLayout({
        children: React.createElement("div"),
        params: Promise.resolve({ locale: "fr" }),
      });
      const html = renderToStaticMarkup(result);
      expect(html).toContain("Espace de travail");
    });

    it("includes JSON-LD with locale-specific description for zh", async () => {
      const result = await LocaleLayout({
        children: React.createElement("div"),
        params: Promise.resolve({ locale: "zh" }),
      });
      const html = renderToStaticMarkup(result);
      expect(html).toContain("面向高等教育");
    });

    it("includes JSON-LD with contactPoint email", async () => {
      const result = await LocaleLayout({
        children: React.createElement("div"),
        params: Promise.resolve({ locale: "en" }),
      });
      const html = renderToStaticMarkup(result);
      expect(html).toContain("info@opendesk-edu.org");
    });

    it("includes JSON-LD with SearchAction", async () => {
      const result = await LocaleLayout({
        children: React.createElement("div"),
        params: Promise.resolve({ locale: "en" }),
      });
      const html = renderToStaticMarkup(result);
      expect(html).toContain("SearchAction");
      expect(html).toContain("search_term_string");
    });

    it("includes skip-to-content link", async () => {
      const result = await LocaleLayout({
        children: React.createElement("div"),
        params: Promise.resolve({ locale: "en" }),
      });
      const html = renderToStaticMarkup(result);
      expect(html).toContain("Skip to content");
      expect(html).toContain("#main-content");
    });

    it("includes main content wrapper with id", async () => {
      const result = await LocaleLayout({
        children: React.createElement("div"),
        params: Promise.resolve({ locale: "en" }),
      });
      const html = renderToStaticMarkup(result);
      expect(html).toContain('id="main-content"');
    });
  });
});
