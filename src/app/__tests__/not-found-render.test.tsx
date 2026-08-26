import { describe, it, expect, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import NotFound from "../not-found";

vi.mock("@/lib/content", () => ({
  getPostsBySection: vi.fn().mockResolvedValue([]),
}));

/**
 * The root not-found boundary is what `dynamicParams=false` serves for unknown
 * section/slug/tag paths. It must be fully static and render the branded 404
 * page (with our own /static/404.css) instead of Next's bare default error.
 */
describe("root NotFound page", () => {
  it("exports an async component named NotFound", async () => {
    expect(typeof NotFound).toBe("function");
    expect(NotFound.name).toBe("NotFound");
  });

  it("renders the styled 404 page with the English copy and stylesheet link", async () => {
    const element = await NotFound();
    const html = renderToStaticMarkup(element);

    expect(html).toContain('rel="stylesheet" href="/static/404.css"');
    expect(html).toContain("nf-code"); // branded 404 code
    expect(html).toContain("Page Not Found");
    // Locale-agnostic section links (absolute /en/… hrefs from a static root
    // page) that route through next-intl middleware.
    expect(html).toContain('href="/en/blog"');
    expect(html).toContain('href="/en/architecture"');
    // Correct document language for the default locale.
    expect(html).toContain('lang="en"');
  });

  it("renders recent posts when content is available", async () => {
    const { getPostsBySection } = await import("@/lib/content");
    vi.mocked(getPostsBySection).mockResolvedValue([
      {
        section: "blog",
        slug: "hello-world",
        title: "Hello World",
        description: "A test description",
        date: "2026-01-01",
      },
    ] as never);

    const element = await NotFound();
    const html = renderToStaticMarkup(element);

    expect(html).toContain("Hello World");
    expect(html).toContain('href="/en/blog/hello-world"');
  });
});