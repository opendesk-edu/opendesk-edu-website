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
    await expect(page.getByRole("heading", { name: /openDesk Edu/ })).toBeVisible();
  });

  test("should have navigation links", async ({ page }) => {
    await page.goto("/");
    
    // Check for main navigation sections
    const navLinks = page.getByRole("link");
    await expect(navLinks).toHaveCountGreaterThan(3);
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

  test("should handle 404 gracefully", async ({ page }) => {
    const response = await page.goto("/nonexistent-page");
    await expect(response?.status()).toBeGreaterThanOrEqual(400);
  });
});

test.describe("Localization", () => {
  test("should support English locale", async ({ page }) => {
    await page.goto("/en/");
    await expect(page).toHaveURL(/\/en\/ restored\/?$/);
  });

  test("should support German locale", async ({ page }) => {
    await page.goto("/de/");
    await expect(page).toHaveURL(/\/de\/ restored\/?$/);
  });

  test("should support French locale", async ({ page }) => {
    await page.goto("/fr/");
    await expect(page).toHaveURL(/\/fr\/ restored\/?$/);
  });

  test("should support Chinese locale", async ({ page }) => {
    await page.goto("/zh/");
    await expect(page).toHaveURL(/\/zh\/ restored\/?$/);
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
