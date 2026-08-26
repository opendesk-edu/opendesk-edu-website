import { describe, it, expect, vi } from "vitest";

// generateStaticParams reads every post across all sections and locales from
// disk; under coverage instrumentation this is slow, so allow a generous
// per-file timeout.
vi.setConfig({ testTimeout: 30000 });

// The page modules pull in next-intl/navigation, server helpers, and heavy
// client components. Mock them so importing the routes only loads the module
// exports (dynamicParams / generateStaticParams) that these tests inspect.
vi.mock("next/navigation", () => ({ notFound: vi.fn() }));
vi.mock("next-intl/server", () => ({ getTranslations: vi.fn() }));
vi.mock("@/i18n/navigation", () => ({ Link: () => null }));
vi.mock("@/components/PostList", () => ({ default: () => null }));
vi.mock("@/components/ArticlePage", () => ({ default: () => null }));
vi.mock("@/components/RelatedPosts", () => ({ default: () => null }));

import * as sectionPage from "../[section]/page";
import * as slugPage from "../[section]/[slug]/page";
import * as tagPage from "../blog/tag/[tag]/page";

/**
 * Guards for the soft-404 fix.
 *
 * To serve a real HTTP 404 (instead of a streamed 200 with a 404 body) each
 * content route must generate all valid params statically and reject anything
 * outside that set.
 *
 * Requirements enforced here:
 *  - `dynamicParams` must be `false` (unknown params -> 404, not on-demand).
 *  - `revalidate` must NOT be set: ISR + dynamicParams=false still renders
 *    unlisted params on-demand, reintroducing the soft-404.
 *  - generateStaticParams must emit per-locale paths (a post/section present
 *    in one locale but missing in another is correctly 404 elsewhere).
 */
describe("soft-404 route config", () => {
  it("[section] page rejects unknown sections", () => {
    expect(sectionPage.dynamicParams).toBe(false);
  });

  it("[section] page is fully static (no revalidate/ISR)", () => {
    expect("revalidate" in sectionPage).toBe(false);
  });

  it("[section] page generates a path for every section and locale", async () => {
    const paths = await sectionPage.generateStaticParams();
    expect(paths).toContainEqual({ locale: "en", section: "blog" });
    expect(paths).toContainEqual({ locale: "de", section: "architecture" });
    expect(paths).toContainEqual({ locale: "zh", section: "architecture" });
  });

  it("[slug] page rejects unknown slugs", () => {
    expect(slugPage.dynamicParams).toBe(false);
  });

  it("[slug] page is fully static (no revalidate/ISR)", () => {
    expect("revalidate" in slugPage).toBe(false);
  });

  it("[slug] page generates per-locale, per-section slugs", async () => {
    const paths = await slugPage.generateStaticParams();
    // A slug that exists in this locale but not necessarily others is emitted
    // only for that locale (per-locale generation).
    expect(paths).toContainEqual({
      locale: "en",
      section: "blog",
      slug: "maui-cluster-sprint-update",
    });
    expect(paths).toContainEqual({
      locale: "de",
      section: "architecture",
      slug: "overview",
    });
    // Every generated path must pair a valid locale with an existing slug.
    for (const p of paths) {
      expect(["en", "de", "fr", "zh"]).toContain(p.locale);
      expect(["blog", "architecture"]).toContain(p.section);
      expect(typeof p.slug).toBe("string");
    }
  });

  it("tag page rejects unknown tags", () => {
    expect(tagPage.dynamicParams).toBe(false);
  });

  it("tag page is fully static (no revalidate/ISR)", () => {
    expect("revalidate" in tagPage).toBe(false);
  });
});