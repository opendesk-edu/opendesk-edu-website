import { test, expect } from "@playwright/test";

/**
 * E2E regression suite for the soft-404 fix and the re-enabled architecture
 * section. Run with: npx playwright test e2e/routing.spec.ts
 */

test.describe("Soft-404: unknown localized paths return a real 404", () => {
  const unknownPaths = [
    "/en/nonexistent",
    "/en/zzz-nonsense",
    "/de/nicht-vorhanden",
    "/fr/page-inconnue",
    "/zh/bu-cun-zai",
    "/en/blog/not-a-real-slug",
    "/en/blog/tag/not-a-real-tag",
    "/de/architecture/not-a-real-doc",
    // Sections that were deliberately removed must not silently resolve;
    // they should 404 rather than serve a 200 with a not-found body.
    "/en/docs/deployment",
    "/en/components/comparison",
  ];

  for (const path of unknownPaths) {
    test(`${path} returns 404 with the styled page`, async ({ page }) => {
      const resp = await page.goto(path);
      expect(resp?.status()).toBe(404);
      await expect(
        page.locator('link[rel="stylesheet"][href="/static/404.css"]')
      ).toBeAttached();
      await expect(page.getByText("404", { exact: true }).first()).toBeVisible();
    });
  }
});

test.describe("Known localized pages still return 200", () => {
  const knownPaths = [
    "/en/",
    "/de/blog",
    "/fr/blog",
    "/zh/blog",
    "/en/blog/maui-cluster-sprint-update",
    "/de/architecture",
    "/en/architecture/overview",
    "/de/architecture/component-alternatives",
    "/de/landscape",
  ];

  for (const path of knownPaths) {
    test(`${path} returns 200`, async ({ page }) => {
      const resp = await page.goto(path);
      expect(resp?.status()).toBe(200);
    });
  }
});

test.describe("Architecture section is navigable", () => {
  test("architecture landing page renders its heading", async ({ page }) => {
    const resp = await page.goto("/de/architecture");
    expect(resp?.status()).toBe(200);
    await expect(
      page.getByRole("heading", { level: 1, name: /architektur|architecture/i }).first()
    ).toBeVisible();
  });

  test("an architecture article renders body content", async ({ page }) => {
    const resp = await page.goto("/en/architecture/overview");
    expect(resp?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("architecture appears in the main navigation", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("link", { name: /architecture|architektur/i }).first()
    ).toBeVisible();
  });
});