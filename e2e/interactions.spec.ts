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
    await page.getByRole("button", { name: /menu/i }).click();
    // Scope to the mobile nav: the desktop nav also renders a "Blog" link
    const mobileNav = page.getByRole("navigation", { name: /mobile/i });
    await expect(mobileNav.getByRole("link", { name: "Blog" })).toBeVisible();
  });

  test("mobile menu contains Architecture link", async ({ page }) => {
    await page.goto("/en/");
    await page.getByRole("button", { name: /menu/ }).click();
    const mobileNav = page.getByRole("navigation", { name: /mobile/i });
    await expect(mobileNav.getByRole("link", { name: "Architecture" })).toBeVisible();
  });

  test("close button closes mobile menu", async ({ page }) => {
    await page.goto("/en/");
    const toggle = page.getByRole("button", { name: "Toggle menu" });
    await toggle.click();
    await expect(page.getByRole("navigation", { name: /mobile/i })).toBeVisible();
    await toggle.click();
    await expect(page.getByRole("navigation", { name: /mobile/i })).not.toBeVisible();
  });
});

test.describe("Contact Form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/en/");
    // The form opens from the footer contact button
    await page.getByRole("button", { name: "Contact" }).click();
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

});

test.describe("Social Links", () => {
  test("has GitHub link", async ({ page }) => {
    await page.goto("/en/");
    // GitHub is linked from both header and footer; assert the footer one
    await expect(
      page.getByRole("contentinfo").getByRole("link", { name: /GitHub/i })
    ).toBeAttached();
  });

  test("has Codeberg link", async ({ page }) => {
    await page.goto("/en/");
    // Codeberg is linked from the hero CTA and the footer; assert the footer
    await expect(
      page.getByRole("contentinfo").getByRole("link", { name: /Codeberg/i })
    ).toBeAttached();
  });
});
