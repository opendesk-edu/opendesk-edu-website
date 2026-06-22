import { describe, it, expect } from "vitest";

describe("SEO route files exist and export correctly", () => {
  it("sitemap.ts exports a default function", async () => {
    const mod = await import("@/app/sitemap");
    expect(typeof mod.default).toBe("function");
  });

  it("robots.ts exports a default function", async () => {
    const mod = await import("@/app/robots");
    expect(typeof mod.default).toBe("function");
  });

  it("feed.xml/route.ts exports a GET function", async () => {
    const mod = await import("@/app/feed.xml/route");
    expect(typeof mod.GET).toBe("function");
  });

  it("xml.ts escapeXml handles special characters", async () => {
    const { escapeXml } = await import("@/lib/xml");
    const input = '<title>"Hello" & \'World\'</title>';
    const escaped = escapeXml(input);
    expect(escaped).not.toContain("<title>");
    expect(escaped).not.toContain("</title>");
    expect(escaped).toContain("&lt;");
    expect(escaped).toContain("&gt;");
    expect(escaped).toContain("&quot;");
    expect(escaped).toContain("&apos;");
    expect(escaped).toContain("&amp;");
  });

  it("sitemap returns entries with valid URLs", { timeout: 15000 }, async () => {
    const sitemap = (await import("@/app/sitemap")).default;
    const result = await sitemap();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    for (const entry of result) {
      expect(entry.url).toMatch(/^https:\/\/opendesk-edu\.org/);
    }
  });

  it("robots returns sitemap URL pointing to opendesk-edu.org", async () => {
    const robots = (await import("@/app/robots")).default;
    const result = robots();
    expect(result.sitemap).toBe("https://opendesk-edu.org/sitemap.xml");
    expect(result.rules).toBeDefined();
    expect(Array.isArray(result.rules)).toBe(true);
    expect((result.rules as unknown[]).length).toBeGreaterThan(0);
  });
});
