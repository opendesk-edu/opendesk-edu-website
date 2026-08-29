import { test, expect } from "@playwright/test";

/** E2E tests for interactive elements: Search dialog, mobile nav, contact form. */

test.describe("Search Dialog", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/");
  });

  test("opens via Ctrl+K", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("search input appears when open", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await expect(page.getByRole("combobox")).toBeVisible();
  });

  test("Escape closes search dialog", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("typing populates results list", async ({ page }) => {
    await page.keyboard.press("Control+k");
    await page.keyboard.type("email");
    await expect(page.getByRole("listbox")).toBeVisible();
  });
});

test.describe("Mobile Navigation", () => {
  test.use({ viewport: { width: 480, height: 800 } });

  test("hamburger button exists on mobile viewport", async ({ page }) => {
    await page.goto("/en/");
    await expect(page.getByRole("button", { name: /menu|hamburger|open menu/i })).toBeVisible();
  });

  test("hamburger opens mobile menu", async ({ page }) => {
    await page.goto("/en/");
    await page.getByRole("button", { name: /menu|hamburger|open menu/i }).click();
    await expect(page.locator('nav:visible')).toBeVisible();
  });

  test("mobile menu contains Blog link", async ({ page }) => {
    await page.goto("/en/");
    await page.getByRole("button", { name: /menu|hamburger|open menu/i }).click();
    await expect(page.getByRole("link", { name: "Blog" })).toBeVisible();
  });

  test("mobile menu contains Architecture link", async ({ page }) => {
    await page.goto("/en/");
    await page.getByRole("button", { name: /menu|hamburger/ }).click();
    await expect(page.getByRole("link", { name: "Architecture" })).toBeVisible();
  });

  test("close button closes mobile menu", async ({ page }) => {
    await page.goto("/en/");
    await page.getByRole("button", { name: /menu/i }).click();
    await page.getByRole("button", { name: /close menu/i }).click();
    await expect(page.locator('nav:visible')).not.toBeVisible();
  });
});

test.describe("Contact Form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/");
  });

  test("has name field", async ({ page }) => {
    await expect(page.getByRole("textbox", { name: /name/i })).toBeVisible();
  });

  test("has email field", async ({ page }) => {
    await expect(page.getByRole("textbox", { name: /email/i })).toBeVisible();
  });

  test("has message field", async ({ page }) => {
    await expect(page.getByRole("textbox", { name: /message/i })).toBeVisible();
  });

  test("has submit button", async ({ page }) => {
    await expect(page.getByRole("button", { name: /send|submit/i })).toBeVisible();
  });

  test("has honeypot for spam protection", async ({ page }) => {
    await expect(page.locator('input[name="botCheck"]')).toBeAttached();
  });
});

test.describe("Social Links", () => {
  test("has GitHub link", async ({ page }) => {
    await page.goto("/en/");
    await expect(page.getByRole("link", { name: /GitHub/i })).toBeAttached();
  });

  test("has LinkedIn / XING link", async ({ page }) => {
    await page.goto("/en/");
    await expect(page.getByRole("link", { name: /LinkedIn|XING/i })).toBeAttached();
  });
});
