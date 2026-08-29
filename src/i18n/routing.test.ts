import { describe, it, expect } from "vitest";
import { routing } from "./routing";

describe("i18n routing config", () => {
  it("defines the four supported locales", () => {
    expect(routing.locales).toEqual(["en", "de", "fr", "zh"]);
  });

  it("uses English as the default locale", () => {
    expect(routing.defaultLocale).toBe("en");
  });

  it("always prefixes URLs with the locale", () => {
    expect(routing.localePrefix).toBe("always");
  });

  it("defaultLocale is part of locales", () => {
    expect(routing.locales).toContain(routing.defaultLocale);
  });

  it("defines pathnames without trailing slashes (except root)", () => {
    for (const path of Object.keys(routing.pathnames)) {
      expect(path.startsWith("/")).toBe(true);
      if (path !== "/") {
        expect(path.endsWith("/")).toBe(false);
      }
    }
  });

  describe("localized pathnames mapping", () => {
    it("maps /about to all four locales", () => {
      const map = routing.pathnames["/about"] as Record<string, string>;
      expect(map.en).toBe("/about");
      expect(map.de).toBe("/ueber-uns");
      expect(map.fr).toBe("/a-propos");
      expect(map.zh).toBe("/about");
    });

    it("maps /imprint to localized German/French paths", () => {
      const map = routing.pathnames["/imprint"] as Record<string, string>;
      expect(map.en).toBe("/imprint");
      expect(map.de).toBe("/impressum");
      expect(map.fr).toBe("/mentions-legales");
      expect(map.zh).toBe("/imprint");
    });

    it("maps /privacy to localized German/French paths", () => {
      const map = routing.pathnames["/privacy"] as Record<string, string>;
      expect(map.en).toBe("/privacy");
      expect(map.de).toBe("/datenschutz");
      expect(map.fr).toBe("/politique-de-confidentialite");
      expect(map.zh).toBe("/privacy");
    });

    it("maps /ai-statement to localized German/French paths", () => {
      const map = routing.pathnames["/ai-statement"] as Record<string, string>;
      expect(map.en).toBe("/ai-statement");
      expect(map.de).toBe("/ki-erklaerung");
      expect(map.fr).toBe("/declaration-ia");
      expect(map.zh).toBe("/ai-statement");
    });
  });

  describe("shared (locale-independent) pathnames", () => {
    it("keeps /blog shared across locales", () => {
      expect(routing.pathnames["/blog"]).toBe("/blog");
    });

    it("keeps /components shared across locales", () => {
      expect(routing.pathnames["/components"]).toBe("/components");
    });

    it("keeps /blog/tag/[tag] parametrized path shared", () => {
      expect(routing.pathnames["/blog/tag/[tag]"]).toBe("/blog/tag/[tag]");
    });

    it("keeps catch-all /[...slug] shared", () => {
      expect(routing.pathnames["/[...slug]"]).toBe("/[...slug]");
    });

    it("keeps root / shared", () => {
      expect(routing.pathnames["/"]).toBe("/");
    });
  });

  describe("pathname parameter completeness", () => {
    it("every localized pathname defines all four locales", () => {
      for (const [path, config] of Object.entries(routing.pathnames)) {
        if (typeof config === "object" && config !== null) {
          for (const locale of routing.locales) {
            expect(
              config[locale as keyof typeof config],
              `pathname ${path} is missing locale ${locale}`
            ).toBeDefined();
          }
        }
      }
    });

    it("localized paths start with a slash", () => {
      for (const config of Object.values(routing.pathnames)) {
        if (typeof config === "object" && config !== null) {
          for (const path of Object.values(config)) {
            expect(path.startsWith("/")).toBe(true);
          }
        }
      }
    });

    it("localized paths do not include the locale prefix themselves", () => {
      // The locale prefix is added by next-intl; the pathname config stores
      // the locale-agnostic inner path only.
      for (const config of Object.values(routing.pathnames)) {
        if (typeof config === "object" && config !== null) {
          for (const locale of routing.locales) {
            const path = config[locale as keyof typeof config];
            expect(path.startsWith(`/${locale}`)).toBe(false);
          }
        }
      }
    });
  });
});
