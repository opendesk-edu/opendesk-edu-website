import { test, expect } from "@playwright/test";

/**
 * Basic E2E tests for the openDesk Edu website
 * Run with: npm run test:e2e
 */

test.describe("Homepage", () => {
  test("should load successfully", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/openDesk Edu/);
  });

  test("should have main heading", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /openDesk Edu/, exact: false }).first()
    ).toBeVisible();
  });

  test("should have navigation links", async ({ page }) => {
    await page.goto("/");
    
    // Check for main navigation sections - should have at least 4 links
    const navLinks = page.getByRole("link");
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(3);
  });

  test("should have footer", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  test("should have search functionality", async ({ page }) => {
    await page.goto("/");
    
    // Check for search button/icon
    const searchButton = page.getByRole("button", { name: /search/i });
    await expect(searchButton).toBeVisible();
  });

  test("should handle 404 gracefully with a real 404 status", async ({ page }) => {
    // Any unknown path is redirected by the middleware to the localized page,
    // which must now return a real 404 (soft-404 regression guard) with the
    // styled not-found UI.
    const resp = await page.goto("/nonexistent-page");
    expect(resp?.status()).toBe(404);
    await expect(page).toHaveTitle(/404/);
    // The styled root 404 page is served instead of a bare error.
    await expect(
      page.locator('link[rel="stylesheet"][href="/static/404.css"]')
    ).toBeAttached();
    await expect(page.getByRole("link", { name: /blog/i }).first()).toBeVisible();
  });
});

test.describe("Localization", () => {
  test("should support English locale", async ({ page }) => {
    await page.goto("/en/");
    await expect(page).toHaveURL(/\/en\/?$/);
  });

  test("should support German locale", async ({ page }) => {
    await page.goto("/de/");
    await expect(page).toHaveURL(/\/de\/?$/);
  });

  test("should support French locale", async ({ page }) => {
    await page.goto("/fr/");
    await expect(page).toHaveURL(/\/fr\/?$/);
  });

  test("should support Chinese locale", async ({ page }) => {
    await page.goto("/zh/");
    await expect(page).toHaveURL(/\/zh\/?$/);
  });
});

test.describe("Static Pages", () => {
  test("should have about page", async ({ page }) => {
    await page.goto("/about");
    await expect(page).toHaveTitle(/About/);
  });

  test("should have privacy page", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page).toHaveTitle(/Privacy/);
  });

  test("should have imprint page", async ({ page }) => {
    await page.goto("/imprint");
    await expect(page).toHaveTitle(/Imprint/);
  });
});
