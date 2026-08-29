import { test, expect } from "@playwright/test";

/** E2E tests for article pages, blog listings, privacy/imprint, architecture, SEO. */

test.describe("Blog listing", () => {
  for (const locale of ["en", "de", "fr", "zh"] as const) {
    test("/" + locale + "/blog renders links", async ({ page }) => {
      const resp = await page.goto("/" + locale + "/blog");
      expect(resp?.status()).toBe(200);
      await expect(page.locator('a[href*="/' + locale + '/blog/"]').first()).toBeVisible();
    });
  }

  test("blog posts show dates", async ({ page }) => {
    await page.goto("/en/blog");
    await expect(page.locator("time").first()).toBeVisible();
  });

  test("tag pages work", async ({ page }) => {
    const resp = await page.goto("/en/blog/tag/CLA");
    expect(resp?.status()).toBe(200);
  });
});

test.describe("Article pages", () => {
  for (const locale of ["en", "de", "fr", "zh"] as const) {
    test("article /" + locale + "/blog/federated-student-email-architecture renders", async ({ page }) => {
      const resp = await page.goto("/" + locale + "/blog/federated-student-email-architecture");
      expect(resp?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.locator('article p, article div[class*="prose"] p').first()).toBeVisible();
    });
  }

  test("ShareButtons render on article page", async ({ page }) => {
    await page.goto("/en/blog/federated-student-email-architecture");
    await expect(page.getByRole("button", { name: "Copy Link", exact: true })).toBeVisible();
  });

  test("ZH article has Chinese characters", async ({ page }) => {
    await page.goto("/zh/blog/federated-student-email-architecture");
    const text = await page.textContent("article");
    expect(text).toMatch(/[\u4e00-\u9fff]/);
  });
});

test.describe("Privacy and Imprint", () => {
  test("privacy pages all return 200", async ({ page }) => {
    for (const path of ["/en/privacy", "/de/datenschutz", "/fr/politique-de-confidentialite", "/zh/privacy"]) {
      const resp = await page.goto(path);
      expect(resp?.status()).toBe(200);
    }
  });

  test("imprint pages all return 200", async ({ page }) => {
    for (const path of ["/en/imprint", "/de/impressum", "/fr/mentions-legales"]) {
      const resp = await page.goto(path);
      expect(resp?.status()).toBe(200);
    }
  });

  test("AI statement pages all return 200", async ({ page }) => {
    for (const path of ["/en/ai-statement", "/de/ki-erklaerung", "/fr/declaration-ia"]) {
      const resp = await page.goto(path);
      expect(resp?.status()).toBe(200);
    }
  });
});

test.describe("SEO", () => {
  test("article page has OG meta tags", async ({ page }) => {
    await page.goto("/en/blog/federated-student-email-architecture");
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /\S/);
    await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
  });

  test("homepage has OG meta tags", async ({ page }) => {
    await page.goto("/en/");
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /openDesk/);
  });

  test("article page has canonical URL", async ({ page }) => {
    await page.goto("/en/blog/federated-student-email-architecture");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /opendesk-edu\.org/);
  });
});

test.describe("Accessibility", () => {
  test("main landmark exists", async ({ page }) => {
    await page.goto("/en/");
    await expect(page.locator('main')).toBeAttached();
  });

  test("skip-to-content link exists", async ({ page }) => {
    await page.goto("/en/");
    await expect(page.getByRole("link", { name: /skip/i })).toBeAttached();
  });

  test("nav elements exist", async ({ page }) => {
    await page.goto("/en/");
    await expect(page.locator('nav').first()).toBeAttached();
  });

  test("footer has role=contentinfo", async ({ page }) => {
    await page.goto("/en/");
    await expect(page.getByRole('contentinfo')).toBeAttached();
  });

  test("search button has aria-label", async ({ page }) => {
    await page.goto("/en/");
    await expect(page.getByRole("button", { name: /search/i })).toBeAttached();
  });
});

test.describe("Landscape page", () => {
  for (const loc of ["en", "de", "fr", "zh"] as const) {
    test("/" + loc + "/landscape returns 200", async ({ page }) => {
      const resp = await page.goto("/" + loc + "/landscape");
      expect(resp?.status()).toBe(200);
    });
  }
});

test.describe("Sitemap and robots.txt", () => {
  test("/sitemap.xml is XML", async ({ page }) => {
    const resp = await page.goto("/sitemap.xml");
    expect(resp?.status()).toBe(200);
    const body = await page.content();
    expect(body).toContain("urlset");
  });

  test("/robots.txt contains Sitemap", async ({ page }) => {
    const resp = await page.goto("/robots.txt");
    expect(resp?.status()).toBe(200);
    await expect(page.locator("body")).toContainText("Sitemap");
  });
});

test.describe("RSS feeds", () => {
  test("/en/rss is XML", async ({ page }) => {
    const resp = await page.goto("/en/rss");
    expect(resp?.status()).toBe(200);
    expect(resp?.headers()['content-type']).toContain("xml");
  });

  test("/de/rss is XML", async ({ page }) => {
    const resp = await page.goto("/de/rss");
    expect(resp?.status()).toBe(200);
    expect(resp?.headers()['content-type']).toContain("xml");
  });
});

test.describe("Architecture section", () => {
  for (const slug of ["overview", "identity-authentication", "networking-traffic-flow", "storage-data-management", "security", "capacity-and-governance"] as const) {
    test("/en/architecture/" + slug + " returns 200", async ({ page }) => {
      const resp = await page.goto("/en/architecture/" + slug);
      expect(resp?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });
  }

  test("architecture landing page links to overview", async ({ page }) => {
    await page.goto("/en/architecture");
    await expect(page.getByRole("link", { name: /Overview/i })).toBeVisible();
  });
});
