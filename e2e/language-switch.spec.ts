import { test, expect } from "@playwright/test";

/**
 * E2E tests for the language switcher.
 *
 * These tests verify that:
 * 1. The switcher button displays the CORRECT current locale (not always EN)
 * 2. Switching between locales navigates to the correct URL
 * 3. Localized paths (e.g. /about ↔ /ueber-uns) map correctly
 * 4. Article and tag page paths are preserved during locale switch
 * 5. Server-rendered UI chrome (nav labels, page titles) is in the correct language
 * 6. Footer locale-dependent links use the correct locale prefix
 *
 * Root-cause bug these tests expose:
 *   Without setRequestLocale(locale) in the [locale] layout, next-intl's
 *   getLocale()/getMessages() default to 'en' on every page. This causes
 *   useLocale() to return 'en' in all client components, making the
 *   LanguageSwitcher always show EN and hiding the real current locale
 *   from the dropdown.
 */

const BASE = ""; // baseURL from playwright.config.ts

// --- Helper ---

async function getSwitcherButton(page: import("@playwright/test").Page) {
  return page.locator('button[aria-haspopup="listbox"]').first();
}

async function openDropdown(page: import("@playwright/test").Page) {
  const btn = await getSwitcherButton(page);
  await btn.click();
  await expect(page.locator('[role="listbox"]')).toBeVisible();
}

/**
 * Dismiss the cookie consent banner if present.
 * The banner is a fixed overlay that intercepts pointer events.
 */
async function dismissCookieConsent(page: import("@playwright/test").Page) {
  const banner = page.locator('.fixed.bottom-0');
  if (await banner.isVisible()) {
    // Click the first button (Decline) to dismiss
    await banner.locator('button').first().click();
    await expect(banner).not.toBeVisible();
  }
}

async function switchLocale(
  page: import("@playwright/test").Page,
  target: string,
) {
  await dismissCookieConsent(page);
  await openDropdown(page);
  const option = page.locator(`[role="option"]`, { hasText: target });
  await expect(option).toBeVisible();
  await option.click();
  await page.waitForURL(/\/[a-z]{2}/);
  // Wait for content to settle after navigation
  await page.waitForTimeout(1000);
}

// --- Test suites ---

test.describe("Switcher button shows correct current locale", () => {
  for (const locale of ["en", "de", "fr", "zh"] as const) {
    test(`on /${locale}/ homepage the switcher shows ${locale.toUpperCase()}`, async ({ page }) => {
      await page.goto(`/${locale}/`);
      const btn = await getSwitcherButton(page);
      await expect(btn).toHaveText(new RegExp(`^${locale.toUpperCase()}`));
    });
  }

  for (const locale of ["en", "de", "fr", "zh"] as const) {
    test(`on /${locale}/blog the switcher shows ${locale.toUpperCase()}`, async ({ page }) => {
      await page.goto(`/${locale}/blog`);
      const btn = await getSwitcherButton(page);
      await expect(btn).toHaveText(new RegExp(`^${locale.toUpperCase()}`));
    });
  }

  test("on /de/architecture/overview the switcher shows DE", async ({ page }) => {
    await page.goto("/de/architecture/overview");
    const btn = await getSwitcherButton(page);
    await expect(btn).toHaveText(/^DE/);
  });
});

test.describe("Dropdown contains correct locales (excludes current)", () => {
  test("on /en/ the dropdown has DE, FR, ZH (no EN)", async ({ page }) => {
    await page.goto("/en/");
    await openDropdown(page);
    await expect(page.locator('[role="option"]:has-text("DE")')).toBeVisible();
    await expect(page.locator('[role="option"]:has-text("FR")')).toBeVisible();
    await expect(page.locator('[role="option"]:has-text("ZH")')).toBeVisible();
    await expect(page.locator('[role="option"]:has-text("EN")')).not.toBeAttached();
  });

  test("on /de/ the dropdown has EN, FR, ZH (no DE)", async ({ page }) => {
    await page.goto("/de/");
    await openDropdown(page);
    await expect(page.locator('[role="option"]:has-text("EN")')).toBeVisible();
    await expect(page.locator('[role="option"]:has-text("FR")')).toBeVisible();
    await expect(page.locator('[role="option"]:has-text("ZH")')).toBeVisible();
    await expect(page.locator('[role="option"]:has-text("DE")')).not.toBeAttached();
  });

  test("on /fr/ the dropdown has EN, DE, ZH (no FR)", async ({ page }) => {
    await page.goto("/fr/");
    await openDropdown(page);
    await expect(page.locator('[role="option"]:has-text("EN")')).toBeVisible();
    await expect(page.locator('[role="option"]:has-text("DE")')).toBeVisible();
    await expect(page.locator('[role="option"]:has-text("ZH")')).toBeVisible();
    await expect(page.locator('[role="option"]:has-text("FR")')).not.toBeAttached();
  });

  test("on /zh/ the dropdown has EN, DE, FR (no ZH)", async ({ page }) => {
    await page.goto("/zh/");
    await openDropdown(page);
    await expect(page.locator('[role="option"]:has-text("EN")')).toBeVisible();
    await expect(page.locator('[role="option"]:has-text("DE")')).toBeVisible();
    await expect(page.locator('[role="option"]:has-text("FR")')).toBeVisible();
    await expect(page.locator('[role="option"]:has-text("ZH")')).not.toBeAttached();
  });
});

test.describe("Switching from non-English locale works", () => {
  test("DE homepage → EN: navigates to /en/", async ({ page }) => {
    await page.goto("/de/");
    await switchLocale(page, "EN");
    await expect(page).toHaveURL(/\/en$/);
    const btn = await getSwitcherButton(page);
    await expect(btn).toHaveText(/^EN/);
  });

  test("FR homepage → DE: navigates to /de/", async ({ page }) => {
    await page.goto("/fr/");
    await switchLocale(page, "DE");
    await expect(page).toHaveURL(/\/de$/);
    const btn = await getSwitcherButton(page);
    await expect(btn).toHaveText(/^DE/);
  });

  test("ZH homepage → FR: navigates to /fr/", async ({ page }) => {
    await page.goto("/zh/");
    await switchLocale(page, "FR");
    await expect(page).toHaveURL(/\/fr$/);
    const btn = await getSwitcherButton(page);
    await expect(btn).toHaveText(/^FR/);
  });

  test("DE article → EN: preserves article path", async ({ page }) => {
    await page.goto("/de/architecture/overview");
    await switchLocale(page, "EN");
    await expect(page).toHaveURL(/\/en\/architecture\/overview$/);
    const btn = await getSwitcherButton(page);
    await expect(btn).toHaveText(/^EN/);
  });

  test("FR article → DE: preserves article path", async ({ page }) => {
    await page.goto("/fr/architecture/identity-authentication");
    await switchLocale(page, "DE");
    await expect(page).toHaveURL(/\/de\/architecture\/identity-authentication$/);
    const btn = await getSwitcherButton(page);
    await expect(btn).toHaveText(/^DE/);
  });

  test("DE tag page → EN: preserves tag path", async ({ page }) => {
    await page.goto("/de/blog/tag/architecture");
    await switchLocale(page, "EN");
    await expect(page).toHaveURL(/\/en\/blog\/tag\/architecture$/);
    const btn = await getSwitcherButton(page);
    await expect(btn).toHaveText(/^EN/);
  });

  test("ZH blog listing → EN: navigates to /en/blog", async ({ page }) => {
    await page.goto("/zh/blog");
    await switchLocale(page, "EN");
    await expect(page).toHaveURL(/\/en\/blog$/);
    const btn = await getSwitcherButton(page);
    await expect(btn).toHaveText(/^EN/);
  });
});

test.describe("Localized pathname mapping", () => {
  test("/en/about → DE: navigates to /de/ueber-uns", async ({ page }) => {
    await page.goto("/en/about");
    await switchLocale(page, "DE");
    await expect(page).toHaveURL(/\/de\/ueber-uns$/);
  });

  test("/de/ueber-uns → EN: navigates to /en/about", async ({ page }) => {
    await page.goto("/de/ueber-uns");
    await switchLocale(page, "EN");
    await expect(page).toHaveURL(/\/en\/about$/);
  });

  test("/en/imprint → DE: navigates to /de/impressum", async ({ page }) => {
    await page.goto("/en/imprint");
    await switchLocale(page, "DE");
    await expect(page).toHaveURL(/\/de\/impressum$/);
  });

  test("/de/impressum → EN: navigates to /en/imprint", async ({ page }) => {
    await page.goto("/de/impressum");
    await switchLocale(page, "EN");
    await expect(page).toHaveURL(/\/en\/imprint$/);
  });

  test("/en/privacy → DE: navigates to /de/datenschutz", async ({ page }) => {
    await page.goto("/en/privacy");
    await switchLocale(page, "DE");
    await expect(page).toHaveURL(/\/de\/datenschutz$/);
  });

  test("/fr/about → EN: navigates to /en/about", async ({ page }) => {
    await page.goto("/fr/about");
    await switchLocale(page, "EN");
    await expect(page).toHaveURL(/\/en\/about$/);
  });
});

test.describe("Server-rendered UI chrome uses correct locale", () => {
  test("/de/ homepage has German nav label for architecture section", async ({ page }) => {
    await page.goto("/de/");
    const archLink = page.locator('header nav a[href*="architecture"], header nav a[href*="architektur"]');
    await expect(archLink.first()).toBeVisible();
    const text = await archLink.first().textContent();
    expect(text).toBe("Architektur");
  });

  test("/fr/ homepage has French nav label for architecture section", async ({ page }) => {
    await page.goto("/fr/");
    const archLink = page.locator('header nav a[href*="architecture"]');
    await expect(archLink.first()).toBeVisible();
    const text = await archLink.first().textContent();
    expect(text).toBe("Architecture"); // French word for architecture
  });

  test("/de/impressum has German page title (Impressum)", async ({ page }) => {
    const resp = await page.goto("/de/impressum");
    expect(resp?.status()).toBe(200);
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    const title = await h1.textContent();
    expect(title).toBe("Impressum");
  });

  test("/de/about has German page title", async ({ page }) => {
    const resp = await page.goto("/de/ueber-uns");
    expect(resp?.status()).toBe(200);
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    const title = await h1.textContent();
    expect(title).toBe("Über openDesk Edu");
  });

  test("/fr/about has French page title (À propos)", async ({ page }) => {
    const resp = await page.goto("/fr/about");
    expect(resp?.status()).toBe(200);
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    const title = await h1.textContent();
    expect(title).toContain("À propos");
  });

  test("/zh/about has Chinese page title", async ({ page }) => {
    const resp = await page.goto("/zh/about");
    expect(resp?.status()).toBe(200);
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
    const title = await h1.textContent();
    expect(title).toBe("关于 openDesk Edu");
  });
});

test.describe("Footer locale-dependent links", () => {
  test("footer RSS link on /de/ points to /de/rss", async ({ page }) => {
    await page.goto("/de/");
    const rssLinks = page.locator('footer a[href*="/"][href$="/rss"]');
    const count = await rssLinks.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const href = await rssLinks.nth(i).getAttribute("href");
      expect(href).toBe("/de/rss");
    }
  });

  test("footer RSS link on /fr/ points to /fr/rss", async ({ page }) => {
    await page.goto("/fr/");
    const rssLinks = page.locator('footer a[href*="/"][href$="/rss"]');
    const count = await rssLinks.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const href = await rssLinks.nth(i).getAttribute("href");
      expect(href).toBe("/fr/rss");
    }
  });
});

test.describe("French-specific localized paths (all 4 pathname mappings)", () => {
  test("/fr/a-propos → DE: navigates to /de/ueber-uns", async ({ page }) => {
    await page.goto("/fr/a-propos");
    await switchLocale(page, "DE");
    await expect(page).toHaveURL(/\/de\/ueber-uns$/);
  });

  test("/fr/mentions-legales → EN: navigates to /en/imprint", async ({ page }) => {
    await page.goto("/fr/mentions-legales");
    await switchLocale(page, "EN");
    await expect(page).toHaveURL(/\/en\/imprint$/);
  });

  test("/fr/politique-de-confidentialite → DE: navigates to /de/datenschutz", async ({ page }) => {
    await page.goto("/fr/politique-de-confidentialite");
    await switchLocale(page, "DE");
    await expect(page).toHaveURL(/\/de\/datenschutz$/);
  });

  test("/fr/declaration-ia → EN: navigates to /en/ai-statement", async ({ page }) => {
    await page.goto("/fr/declaration-ia");
    await switchLocale(page, "EN");
    await expect(page).toHaveURL(/\/en\/ai-statement$/);
  });
});

test.describe("AI-statement localized path mapping (all locale pairs)", () => {
  const pairs: [string, string, string][] = [
    ["/en/ai-statement", "DE", "/de/ki-erklaerung"],
    ["/de/ki-erklaerung", "EN", "/en/ai-statement"],
    ["/de/ki-erklaerung", "FR", "/fr/declaration-ia"],
    ["/fr/declaration-ia", "ZH", "/zh/ai-statement"],
    ["/zh/ai-statement", "DE", "/de/ki-erklaerung"],
  ];
  for (const [from, target, expectedUrl] of pairs) {
    test(`${from} → ${target}: navigates to ${expectedUrl}`, async ({ page }) => {
      await page.goto(from);
      await switchLocale(page, target);
      await expect(page).toHaveURL(new RegExp(expectedUrl.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$"));
    });
  }
});

test.describe("Section landing pages preserve path", () => {
  test("/en/architecture → DE → FR → ZH round-trip", async ({ page }) => {
    await page.goto("/en/architecture");
    await switchLocale(page, "DE");
    await expect(page).toHaveURL(/\/de\/architecture$/);
    await switchLocale(page, "FR");
    await expect(page).toHaveURL(/\/fr\/architecture$/);
    await switchLocale(page, "ZH");
    await expect(page).toHaveURL(/\/zh\/architecture$/);
  });

  test("/de/blog → EN → ZH round-trip", async ({ page }) => {
    await page.goto("/de/blog");
    await switchLocale(page, "EN");
    await expect(page).toHaveURL(/\/en\/blog$/);
    await switchLocale(page, "ZH");
    await expect(page).toHaveURL(/\/zh\/blog$/);
  });
});

test.describe("Blog article with hyphens in slug", () => {
  test("/en/blog/federated-student-email-architecture → DE preserves full slug", async ({ page }) => {
    await page.goto("/en/blog/federated-student-email-architecture");
    await switchLocale(page, "DE");
    await expect(page).toHaveURL(/\/de\/blog\/federated-student-email-architecture$/);
  });

  test("/de/blog/federated-student-email-architecture → ZH preserves full slug", async ({ page }) => {
    await page.goto("/de/blog/federated-student-email-architecture");
    await switchLocale(page, "ZH");
    await expect(page).toHaveURL(/\/zh\/blog\/federated-student-email-architecture$/);
  });
});

test.describe("html lang attribute after switching", () => {
  test("/de/ → EN: html lang changes from de to en", async ({ page }) => {
    await page.goto("/de/");
    await expect(page.locator("html")).toHaveAttribute("lang", "de");
    await switchLocale(page, "EN");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("/en/architecture/overview → FR: html lang changes to fr", async ({ page }) => {
    await page.goto("/en/architecture/overview");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await switchLocale(page, "FR");
    await expect(page.locator("html")).toHaveAttribute("lang", "fr");
  });
});

test.describe("Keyboard accessibility", () => {
  test("Escape closes the open dropdown", async ({ page }) => {
    await page.goto("/en/");
    const btn = await getSwitcherButton(page);
    await btn.click();
    await expect(page.locator('[role="listbox"]')).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator('[role="listbox"]')).not.toBeVisible();
  });

  test("Tab does not open the dropdown", async ({ page }) => {
    await page.goto("/en/");
    await page.keyboard.press("Tab"); // Tab to the switcher button
    await page.keyboard.press("Tab"); // Tab past it
    await expect(page.locator('[role="listbox"]')).not.toBeVisible();
  });
});

test.describe("ZH locale shares paths with EN for about/imprint/privacy/ai-statement", () => {
  test("/zh/about → DE: navigates to /de/ueber-uns (ZH uses /about, DE uses /ueber-uns)", async ({ page }) => {
    await page.goto("/zh/about");
    await switchLocale(page, "DE");
    await expect(page).toHaveURL(/\/de\/ueber-uns$/);
  });

  test("/zh/imprint → FR: navigates to /fr/mentions-legales", async ({ page }) => {
    await page.goto("/zh/imprint");
    await switchLocale(page, "FR");
    await expect(page).toHaveURL(/\/fr\/mentions-legales$/);
  });
});

test.describe("Landscape page (external link, same path in all locales)", () => {
  test("/de/landscape → EN: navigates to /en/landscape", async ({ page }) => {
    await page.goto("/de/landscape");
    await switchLocale(page, "EN");
    await expect(page).toHaveURL(/\/en\/landscape$/);
    const btn = await getSwitcherButton(page);
    await expect(btn).toHaveText(/^EN/);
  });
});

test.describe("Round-trip locale switching", () => {
  test("EN → DE → EN on homepage returns to original URL", async ({ page }) => {
    await page.goto("/en/");
    await switchLocale(page, "DE");
    await expect(page).toHaveURL(/\/de$/);
    await switchLocale(page, "EN");
    await expect(page).toHaveURL(/\/en$/);
  });

  test("EN → DE → FR → EN on article page returns to original URL", async ({ page }) => {
    await page.goto("/en/architecture/overview");
    await switchLocale(page, "DE");
    await expect(page).toHaveURL(/\/de\/architecture\/overview$/);
    await switchLocale(page, "FR");
    await expect(page).toHaveURL(/\/fr\/architecture\/overview$/);
    await switchLocale(page, "EN");
    await expect(page).toHaveURL(/\/en\/architecture\/overview$/);
  });

  test("EN → DE → EN on localized path (about) returns correctly", async ({ page }) => {
    await page.goto("/en/about");
    await switchLocale(page, "DE");
    await expect(page).toHaveURL(/\/de\/ueber-uns$/);
    await switchLocale(page, "EN");
    await expect(page).toHaveURL(/\/en\/about$/);
  });
});

test.describe("Not-found page returns real 404 status", () => {
  for (const locale of ["de", "fr", "zh"] as const) {
    test(`/${locale}/blog/nonexistent-slug returns 404`, async ({ page }) => {
      const resp = await page.goto(`/${locale}/blog/nonexistent-slug`);
      expect(resp?.status()).toBe(404);
    });
  }
});

test.describe("Privacy page all 4 locale mappings", () => {
  test("/en/privacy → DE: navigates to /de/datenschutz", async ({ page }) => {
    await page.goto("/en/privacy");
    await switchLocale(page, "DE");
    await expect(page).toHaveURL(/\/de\/datenschutz$/);
  });
  test("/de/datenschutz → FR: navigates to /fr/politique-de-confidentialite", async ({ page }) => {
    await page.goto("/de/datenschutz");
    await switchLocale(page, "FR");
    await expect(page).toHaveURL(/\/fr\/politique-de-confidentialite$/);
  });
  test("/fr/politique-de-confidentialite → ZH: navigates to /zh/privacy", async ({ page }) => {
    await page.goto("/fr/politique-de-confidentialite");
    await switchLocale(page, "ZH");
    await expect(page).toHaveURL(/\/zh\/privacy$/);
  });
  test("/zh/privacy → EN: navigates to /en/privacy", async ({ page }) => {
    await page.goto("/zh/privacy");
      await switchLocale(page, "EN");
      await expect(page).toHaveURL(/\/en\/privacy$/);
  });
});

test.describe("Article body content is in the correct language after switch", () => {
  test("EN article → DE: body paragraph is in German", async ({ page }) => {
    await page.goto("/en/blog/federated-student-email-architecture");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await switchLocale(page, "DE");
    await expect(page).toHaveURL(/\/de\/blog\/federated-student-email-architecture$/);
    const p = page.locator('article p').first();
    await expect(p).toContainText("Studierende");
  });

  test("DE article → EN: body paragraph is in English", async ({ page }) => {
    await page.goto("/de/blog/federated-student-email-architecture");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const deP = page.locator('article p').first();
    await expect(deP).toContainText("Studierende");
    await switchLocale(page, "EN");
    await expect(page).toHaveURL(/\/en\/blog\/federated-student-email-architecture$/);
    const enP = page.locator('article p').first();
    await expect(enP).toContainText("students");
    await expect(enP).not.toContainText("Studierende");
  });
});

test.describe("Cookie consent banner uses correct locale", () => {
  test("/de/ shows German cookie consent with decline button", async ({ page }) => {
    await page.goto("/de/");
    const banner = page.locator('.fixed.bottom-0');
    await expect(banner).toBeVisible();
    // Verify the decline button shows German text
    await expect(banner.locator('button').first()).toHaveText("Ablehnen");
    // Dismiss it
    await banner.locator('button').first().click();
    await expect(banner).not.toBeVisible();
  });

  test("/fr/ shows French cookie consent with decline button", async ({ page }) => {
    await page.goto("/fr/");
    const banner = page.locator('.fixed.bottom-0');
    await expect(banner).toBeVisible();
    await expect(banner.locator('button').first()).toContainText("Refuser");
    await banner.locator('button').first().click();
    await expect(banner).not.toBeVisible();
  });
});

test.describe("Page <title> updates after locale switch", () => {
  test("EN about → DE: title changes to German", async ({ page }) => {
    await page.goto("/en/about");
    let t = await page.title();
    expect(t).toContain("About");
    await switchLocale(page, "DE");
    t = await page.title();
    expect(t).toContain("Über openDesk Edu");
    expect(t).not.toContain("About");
  });

  test("DE impressum → EN: title changes to English", async ({ page }) => {
    await page.goto("/de/impressum");
    let t = await page.title();
    expect(t).toContain("Impressum");
    await switchLocale(page, "EN");
    t = await page.title();
    expect(t).toContain("Imprint");
    expect(t).not.toContain("Impressum");
  });
  test("FR a-propos → EN: title changes to English", async ({ page }) => {
    await page.goto("/fr/a-propos");
    let t = await page.title();
    expect(t).toContain("À propos");
    await switchLocale(page, "EN");
    t = await page.title();
    expect(t).toContain("About");
    expect(t).not.toContain("À propos");
  });
});
