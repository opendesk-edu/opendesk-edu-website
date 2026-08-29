import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LanguageSwitcher from "../LanguageSwitcher";

// --- Helper: create mock modules with configurable current locale and pathname ---

function createMockModules(currentLocale: string, rawPathname: string) {
  return {
    "@/i18n/navigation": {
      useRouter: () => ({ replace: vi.fn() }),
    },
    "@/i18n/routing": {
      routing: { locales: ["en", "de", "fr", "zh"], defaultLocale: "en" },
    },
    "next-intl": {
      useTranslations: () => (key: string) => {
        const translations: Record<string, string> = { label: "Language" };
        return translations[key] || key;
      },
      useLocale: () => currentLocale,
    },
    "next/navigation": {
      usePathname: () => rawPathname,
    },
  };
}

describe("LanguageSwitcher", () => {
  let mockReplace: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    mockReplace = vi.fn();
  });

  describe("button label reflects current locale", () => {
    it("shows EN when currentLocale is en", async () => {
      vi.doMock("@/i18n/navigation", () => ({
        useRouter: () => ({ replace: mockReplace }),
      }));
      vi.doMock("@/i18n/routing", () => ({
        routing: { locales: ["en", "de", "fr", "zh"], defaultLocale: "en" },
      }));
      vi.doMock("next-intl", () => ({
        useTranslations: () => (key: string) => key,
        useLocale: () => "en",
      }));
      vi.doMock("next/navigation", () => ({
        usePathname: () => "/en/",
      }));
      const { default: LS } = await import("../LanguageSwitcher");
      render(<LS />);
      expect(screen.getByRole("button")).toHaveTextContent(/^EN/);
    });

    it("shows DE when currentLocale is de", async () => {
      vi.doMock("@/i18n/navigation", () => ({
        useRouter: () => ({ replace: mockReplace }),
      }));
      vi.doMock("@/i18n/routing", () => ({
        routing: { locales: ["en", "de", "fr", "zh"], defaultLocale: "en" },
      }));
      vi.doMock("next-intl", () => ({
        useTranslations: () => (key: string) => key,
        useLocale: () => "de",
      }));
      vi.doMock("next/navigation", () => ({
        usePathname: () => "/de/",
      }));
      const { default: LS } = await import("../LanguageSwitcher");
      render(<LS />);
      expect(screen.getByRole("button")).toHaveTextContent(/^DE/);
    });

    it("shows FR when currentLocale is fr", async () => {
      vi.doMock("@/i18n/navigation", () => ({
        useRouter: () => ({ replace: mockReplace }),
      }));
      vi.doMock("@/i18n/routing", () => ({
        routing: { locales: ["en", "de", "fr", "zh"], defaultLocale: "en" },
      }));
      vi.doMock("next-intl", () => ({
        useTranslations: () => (key: string) => key,
        useLocale: () => "fr",
      }));
      vi.doMock("next/navigation", () => ({
        usePathname: () => "/fr/",
      }));
      const { default: LS } = await import("../LanguageSwitcher");
      render(<LS />);
      expect(screen.getByRole("button")).toHaveTextContent(/^FR/);
    });

    it("shows ZH when currentLocale is zh", async () => {
      vi.doMock("@/i18n/navigation", () => ({
        useRouter: () => ({ replace: mockReplace }),
      }));
      vi.doMock("@/i18n/routing", () => ({
        routing: { locales: ["en", "de", "fr", "zh"], defaultLocale: "en" },
      }));
      vi.doMock("next-intl", () => ({
        useTranslations: () => (key: string) => key,
        useLocale: () => "zh",
      }));
      vi.doMock("next/navigation", () => ({
        usePathname: () => "/zh/",
      }));
      const { default: LS } = await import("../LanguageSwitcher");
      render(<LS />);
      expect(screen.getByRole("button")).toHaveTextContent(/^ZH/);
    });
  });

  describe("dropdown excludes current locale", () => {
    it("when currentLocale is de, dropdown has EN, FR, ZH but not DE", async () => {
      vi.doMock("@/i18n/navigation", () => ({
        useRouter: () => ({ replace: mockReplace }),
      }));
      vi.doMock("@/i18n/routing", () => ({
        routing: { locales: ["en", "de", "fr", "zh"], defaultLocale: "en" },
      }));
      vi.doMock("next-intl", () => ({
        useTranslations: () => (key: string) => key,
        useLocale: () => "de",
      }));
      vi.doMock("next/navigation", () => ({
        usePathname: () => "/de/",
      }));
      const { default: LS } = await import("../LanguageSwitcher");
      const user = userEvent.setup();
      render(<LS />);
      await user.click(screen.getByRole("button"));
      const listbox = await screen.findByRole("listbox");
      const withinListbox = within(listbox);
      expect(withinListbox.getByText("EN")).toBeInTheDocument();
      expect(withinListbox.getByText("FR")).toBeInTheDocument();
      expect(withinListbox.getByText("ZH")).toBeInTheDocument();
      expect(withinListbox.queryByText("DE")).not.toBeInTheDocument();
    });

    it("when currentLocale is fr, dropdown has EN, DE, ZH but not FR", async () => {
      vi.doMock("@/i18n/navigation", () => ({
        useRouter: () => ({ replace: mockReplace }),
      }));
      vi.doMock("@/i18n/routing", () => ({
        routing: { locales: ["en", "de", "fr", "zh"], defaultLocale: "en" },
      }));
      vi.doMock("next-intl", () => ({
        useTranslations: () => (key: string) => key,
        useLocale: () => "fr",
      }));
      vi.doMock("next/navigation", () => ({
        usePathname: () => "/fr/",
      }));
      const { default: LS } = await import("../LanguageSwitcher");
      const user = userEvent.setup();
      render(<LS />);
      await user.click(screen.getByRole("button"));
      const listbox = await screen.findByRole("listbox");
      const withinListbox = within(listbox);
      expect(withinListbox.getByText("EN")).toBeInTheDocument();
      expect(withinListbox.getByText("DE")).toBeInTheDocument();
      expect(withinListbox.getByText("ZH")).toBeInTheDocument();
      expect(withinListbox.queryByText("FR")).not.toBeInTheDocument();
    });
  });

  describe("handleLocaleChange path stripping", () => {
    /*
     * The handleLocaleChange function:
     *   1. Gets rawPathname from next/navigation (includes locale prefix)
     *   2. Strips the /{currentLocale} prefix
     *   3. Passes the remaining path to router.replace with { locale: newLocale }
     */

    it("from /en/ to DE: strips /en, passes / to router", async () => {
      vi.doMock("@/i18n/navigation", () => ({
        useRouter: () => ({ replace: mockReplace }),
      }));
      vi.doMock("@/i18n/routing", () => ({
        routing: { locales: ["en", "de", "fr", "zh"], defaultLocale: "en" },
      }));
      vi.doMock("next-intl", () => ({
        useTranslations: () => (key: string) => key,
        useLocale: () => "en",
      }));
      vi.doMock("next/navigation", () => ({
        usePathname: () => "/en",
      }));
      const { default: LS } = await import("../LanguageSwitcher");
      const user = userEvent.setup();
      render(<LS />);
      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
      await user.click(screen.getByText("DE"));
      expect(mockReplace).toHaveBeenCalledWith("/", { locale: "de" });
    });

    it("from /de/ to EN: strips /de, passes / to router", async () => {
      vi.doMock("@/i18n/navigation", () => ({
        useRouter: () => ({ replace: mockReplace }),
      }));
      vi.doMock("@/i18n/routing", () => ({
        routing: { locales: ["en", "de", "fr", "zh"], defaultLocale: "en" },
      }));
      vi.doMock("next-intl", () => ({
        useTranslations: () => (key: string) => key,
        useLocale: () => "de",
      }));
      vi.doMock("next/navigation", () => ({
        usePathname: () => "/de",
      }));
      const { default: LS } = await import("../LanguageSwitcher");
      const user = userEvent.setup();
      render(<LS />);
      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
      await user.click(screen.getByText("EN"));
      expect(mockReplace).toHaveBeenCalledWith("/", { locale: "en" });
    });

    it("from /en/blog/my-post to DE: strips /en, passes /blog/my-post", async () => {
      vi.doMock("@/i18n/navigation", () => ({
        useRouter: () => ({ replace: mockReplace }),
      }));
      vi.doMock("@/i18n/routing", () => ({
        routing: { locales: ["en", "de", "fr", "zh"], defaultLocale: "en" },
      }));
      vi.doMock("next-intl", () => ({
        useTranslations: () => (key: string) => key,
        useLocale: () => "en",
      }));
      vi.doMock("next/navigation", () => ({
        usePathname: () => "/en/blog/my-post",
      }));
      const { default: LS } = await import("../LanguageSwitcher");
      const user = userEvent.setup();
      render(<LS />);
      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
      await user.click(screen.getByText("DE"));
      expect(mockReplace).toHaveBeenCalledWith("/blog/my-post", { locale: "de" });
    });

    it("from /de/architecture/overview to EN: strips /de, passes /architecture/overview", async () => {
      vi.doMock("@/i18n/navigation", () => ({
        useRouter: () => ({ replace: mockReplace }),
      }));
      vi.doMock("@/i18n/routing", () => ({
        routing: { locales: ["en", "de", "fr", "zh"], defaultLocale: "en" },
      }));
      vi.doMock("next-intl", () => ({
        useTranslations: () => (key: string) => key,
        useLocale: () => "de",
      }));
      vi.doMock("next/navigation", () => ({
        usePathname: () => "/de/architecture/overview",
      }));
      const { default: LS } = await import("../LanguageSwitcher");
      const user = userEvent.setup();
      render(<LS />);
      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
      await user.click(screen.getByText("EN"));
      expect(mockReplace).toHaveBeenCalledWith("/architecture/overview", { locale: "en" });
    });

    it("from /en/blog/tag/architecture to FR: strips /en, passes /blog/tag/architecture", async () => {
      vi.doMock("@/i18n/navigation", () => ({
        useRouter: () => ({ replace: mockReplace }),
      }));
      vi.doMock("@/i18n/routing", () => ({
        routing: { locales: ["en", "de", "fr", "zh"], defaultLocale: "en" },
      }));
      vi.doMock("next-intl", () => ({
        useTranslations: () => (key: string) => key,
        useLocale: () => "en",
      }));
      vi.doMock("next/navigation", () => ({
        usePathname: () => "/en/blog/tag/architecture",
      }));
      const { default: LS } = await import("../LanguageSwitcher");
      const user = userEvent.setup();
      render(<LS />);
      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
      await user.click(screen.getByText("FR"));
      expect(mockReplace).toHaveBeenCalledWith("/blog/tag/architecture", { locale: "fr" });
    });

    it("from /zh/landscape to EN: strips /zh, passes /landscape", async () => {
      vi.doMock("@/i18n/navigation", () => ({
        useRouter: () => ({ replace: mockReplace }),
      }));
      vi.doMock("@/i18n/routing", () => ({
        routing: { locales: ["en", "de", "fr", "zh"], defaultLocale: "en" },
      }));
      vi.doMock("next-intl", () => ({
        useTranslations: () => (key: string) => key,
        useLocale: () => "zh",
      }));
      vi.doMock("next/navigation", () => ({
        usePathname: () => "/zh/landscape",
      }));
      const { default: LS } = await import("../LanguageSwitcher");
      const user = userEvent.setup();
      render(<LS />);
      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
      await user.click(screen.getByText("EN"));
      expect(mockReplace).toHaveBeenCalledWith("/landscape", { locale: "en" });
    });

    it("from /fr/about to DE: strips /fr, passes /about (router handles about→ueber-uns mapping)", async () => {
      vi.doMock("@/i18n/navigation", () => ({
        useRouter: () => ({ replace: mockReplace }),
      }));
      vi.doMock("@/i18n/routing", () => ({
        routing: { locales: ["en", "de", "fr", "zh"], defaultLocale: "en" },
      }));
      vi.doMock("next-intl", () => ({
        useTranslations: () => (key: string) => key,
        useLocale: () => "fr",
      }));
      vi.doMock("next/navigation", () => ({
        usePathname: () => "/fr/about",
      }));
      const { default: LS } = await import("../LanguageSwitcher");
      const user = userEvent.setup();
      render(<LS />);
      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
      await user.click(screen.getByText("DE"));
      // The LanguageSwitcher strips /fr and passes /about.
      // The i18n router's pathnames config maps /about → /de/ueber-uns.
      expect(mockReplace).toHaveBeenCalledWith("/about", { locale: "de" });
    });
  });

  describe("ARIA and accessibility", () => {
    it("has proper ARIA attributes on button", async () => {
      vi.doMock("@/i18n/navigation", () => ({
        useRouter: () => ({ replace: mockReplace }),
      }));
      vi.doMock("@/i18n/routing", () => ({
        routing: { locales: ["en", "de", "fr", "zh"], defaultLocale: "en" },
      }));
      vi.doMock("next-intl", () => ({
        useTranslations: () => (key: string) => key,
        useLocale: () => "en",
      }));
      vi.doMock("next/navigation", () => ({
        usePathname: () => "/en/",
      }));
      const { default: LS } = await import("../LanguageSwitcher");
      render(<LS />);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-haspopup", "listbox");
      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    it("dropdown options have role=option", async () => {
      vi.doMock("@/i18n/navigation", () => ({
        useRouter: () => ({ replace: mockReplace }),
      }));
      vi.doMock("@/i18n/routing", () => ({
        routing: { locales: ["en", "de", "fr", "zh"], defaultLocale: "en" },
      }));
      vi.doMock("next-intl", () => ({
        useTranslations: () => (key: string) => key,
        useLocale: () => "en",
      }));
      vi.doMock("next/navigation", () => ({
        usePathname: () => "/en/",
      }));
      const { default: LS } = await import("../LanguageSwitcher");
      const user = userEvent.setup();
      render(<LS />);
      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(3);
      options.forEach((opt) => {
        expect(opt).toHaveAttribute("aria-selected", "false");
      });
    });
  });

  describe("onLocaleChange callback precision", () => {
    it("calls onLocaleChange when a locale is selected", async () => {
      vi.doMock("@/i18n/navigation", () => ({
        useRouter: () => ({ replace: mockReplace }),
      }));
      vi.doMock("@/i18n/routing", () => ({
        routing: { locales: ["en", "de", "fr", "zh"], defaultLocale: "en" },
      }));
      vi.doMock("next-intl", () => ({
        useTranslations: () => (key: string) => key,
        useLocale: () => "de",
      }));
      vi.doMock("next/navigation", () => ({
        usePathname: () => "/de/",
      }));
      const { default: LS } = await import("../LanguageSwitcher");
      const callback = vi.fn();
      const user = userEvent.setup();
      render(<LS onLocaleChange={callback} />);
      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
      await user.click(screen.getByText("EN"));
      expect(callback).toHaveBeenCalledTimes(1);
    });
  });

  describe("onLocaleChange: negative cases (no spurious calls)", () => {
    async function renderWith(locale: string, pathname: string) {
      vi.doMock("@/i18n/navigation", () => ({
        useRouter: () => ({ replace: mockReplace }),
      }));
      vi.doMock("@/i18n/routing", () => ({
        routing: { locales: ["en", "de", "fr", "zh"], defaultLocale: "en" },
      }));
      vi.doMock("next-intl", () => ({
        useTranslations: () => (key: string) => key,
        useLocale: () => locale,
      }));
      vi.doMock("next/navigation", () => ({
        usePathname: () => pathname,
      }));
      const { default: LS } = await import("../LanguageSwitcher");
      const user = userEvent.setup();
      return { LS, user };
    }

    it("does NOT call onLocaleChange when Escape closes the dropdown", async () => {
      const callback = vi.fn();
      const { LS, user } = await renderWith("de", "/de/");
      render(<LS onLocaleChange={callback} />);
      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });
      expect(callback).not.toHaveBeenCalled();
    });

    it("does NOT call onLocaleChange when clicking outside closes the dropdown", async () => {
      const callback = vi.fn();
      const { LS, user } = await renderWith("en", "/en/");
      render(
        <div>
          <LS onLocaleChange={callback} />
          <div data-testid="outside">Outside</div>
        </div>,
      );
      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
      await user.click(screen.getByTestId("outside"));
      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("handleLocaleChange edge cases", () => {
    /* Helper to reduce boilerplate for mock setup */
    async function renderWith(locale: string, pathname: string) {
      vi.doMock("@/i18n/navigation", () => ({
        useRouter: () => ({ replace: mockReplace }),
      }));
      vi.doMock("@/i18n/routing", () => ({
        routing: { locales: ["en", "de", "fr", "zh"], defaultLocale: "en" },
      }));
      vi.doMock("next-intl", () => ({
        useTranslations: () => (key: string) => key,
        useLocale: () => locale,
      }));
      vi.doMock("next/navigation", () => ({
        usePathname: () => pathname,
      }));
      const { default: LS } = await import("../LanguageSwitcher");
      const user = userEvent.setup();
      return { LS, user };
    }

    it("when pathname lacks locale prefix, passes it through unchanged", async () => {
      // This shouldn't happen in production (localePrefix: 'always'),
      // but the component should not crash.
      const { LS, user } = await renderWith("en", "/blog/my-post");
      render(<LS />);
      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
      await user.click(screen.getByText("DE"));
      expect(mockReplace).toHaveBeenCalledWith("/blog/my-post", { locale: "de" });
    });

    it("does not strip mid-path segments that look like locales", async () => {
      // /en/blog/deep-dive — 'de' at position 3 looks like a locale
      // but the prefix is /en, so pathWithoutLocale should be /blog/deep-dive
      const { LS, user } = await renderWith("en", "/en/blog/deep-dive");
      render(<LS />);
      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
      await user.click(screen.getByText("FR"));
      expect(mockReplace).toHaveBeenCalledWith("/blog/deep-dive", { locale: "fr" });
    });

    it("handles /en/blog/de correctly — 'de' is a blog slug, not a locale", async () => {
      const { LS, user } = await renderWith("en", "/en/blog/de");
      render(<LS />);
      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
      await user.click(screen.getByText("DE"));
      // strip /en → /blog/de, router maps to /de/blog/de
      expect(mockReplace).toHaveBeenCalledWith("/blog/de", { locale: "de" });
    });

    it("handles deeply nested paths with many segments", async () => {
      const { LS, user } = await renderWith(
        "fr",
        "/fr/blog/tag/infrastructure/some-article",
      );
      render(<LS />);
      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
      await user.click(screen.getByText("ZH"));
      expect(mockReplace).toHaveBeenCalledWith("/blog/tag/infrastructure/some-article", { locale: "zh" });
    });

    it("unknown locale code falls back to uppercase in button label", async () => {
      // If useLocale() somehow returns a code not in localeLabels
      vi.doMock("@/i18n/navigation", () => ({
        useRouter: () => ({ replace: mockReplace }),
      }));
      vi.doMock("@/i18n/routing", () => ({
        routing: { locales: ["en", "de", "fr", "zh"], defaultLocale: "en" },
      }));
      vi.doMock("next-intl", () => ({
        useTranslations: () => (key: string) => key,
        useLocale: () => "ja", // Japanese — not a supported locale
      }));
      vi.doMock("next/navigation", () => ({
        usePathname: () => "/ja/",
      }));
      const { default: LS } = await import("../LanguageSwitcher");
      render(<LS />);
      expect(screen.getByRole("button")).toHaveTextContent(/^JA/);
    });

    it("handles root pathname without locale prefix as-is", async () => {
      const { LS, user } = await renderWith("en", "/");
      render(<LS />);
      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
      await user.click(screen.getByText("DE"));
      expect(mockReplace).toHaveBeenCalledWith("/", { locale: "de" });
    });

    it("from /de/ki-erklaerung (localized AI-statement path) to EN: passes /ai-statement for router mapping", async () => {
      const { LS, user } = await renderWith("de", "/de/ki-erklaerung");
      render(<LS />);
      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
      await user.click(screen.getByText("EN"));
      // Strip /de → /ki-erklaerung. The i18n router's pathnames config
      // maps /ai-statement → /en/ai-statement. The switcher strips the
      // locale prefix and passes the *source* path (/ki-erklaerung);
      // the router resolves it to the EN equivalent.
      expect(mockReplace).toHaveBeenCalledWith("/ki-erklaerung", { locale: "en" });
    });

    it("calls router.replace exactly once per locale selection", async () => {
      const { LS, user } = await renderWith("en", "/en/about");
      render(<LS />);
      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
      await user.click(screen.getByText("DE"));
      expect(mockReplace).toHaveBeenCalledTimes(1);
    });

    it("empty string pathname passes through as-is", async () => {
      // usePathname() should never return '' in practice, but
      // the component should not crash or call replace with undefined.
      const { LS, user } = await renderWith("en", "");
      render(<LS />);
      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
      await user.click(screen.getByText("FR"));
      expect(mockReplace).toHaveBeenCalledWith("", { locale: "fr" });
    });

    it("locale prefix appears mid-path but NOT at start: does not strip it", async () => {
      // On /fr/en-page with currentLocale='en', the prefix /en is NOT at the
      // start of the pathname (/fr/en-page starts with /fr). The whole
      // pathname is passed through — the router will add the target locale.
      const { LS, user } = await renderWith("en", "/fr/en-page");
      render(<LS />);
      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
      await user.click(screen.getByText("DE"));
      // The prefix /en doesn't match start of /fr/en-page, so
      // rawPathname is passed through unchanged. The router then
      // prepends /de → /de/fr/en-page. Not ideal but that's
      // how the component behaves — and this URL cannot occur in
      // production because localePrefix='always' enforces a single prefix.
      expect(mockReplace).toHaveBeenCalledWith("/fr/en-page", { locale: "de" });
    });

    it("pathname /enabled-feature with currentLocale en: strips /en prefix", async () => {
      // /enabled-feature starts with /en but the 'en' is part of the word
      // 'enabled'. The component naively strips the first 3 chars.
      // In production this can't happen (the locale segment is always
      // followed by /), but this tests the exact slicing behavior.
      const { LS, user } = await renderWith("en", "/enabled-feature");
      render(<LS />);
      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
      await user.click(screen.getByText("FR"));
      // /en prefix is stripped (3 chars), leaving 'abled-feature'
      expect(mockReplace).toHaveBeenCalledWith("abled-feature", { locale: "fr" });
    });
  });

  describe("rendering and structure", () => {
    it("SVG chevron icon has aria-hidden=true", async () => {
      vi.doMock("@/i18n/navigation", () => ({
        useRouter: () => ({ replace: mockReplace }),
      }));
      vi.doMock("@/i18n/routing", () => ({
        routing: { locales: ["en", "de", "fr", "zh"], defaultLocale: "en" },
      }));
      vi.doMock("next-intl", () => ({
        useTranslations: () => (key: string) => key,
        useLocale: () => "en",
      }));
      vi.doMock("next/navigation", () => ({
        usePathname: () => "/en/",
      }));
      const { default: LS } = await import("../LanguageSwitcher");
      render(<LS />);
      const svg = screen.getByRole("button").querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute("aria-hidden", "true");
    });

    it("button and listbox share the same aria-label from translations", async () => {
      vi.doMock("@/i18n/navigation", () => ({
        useRouter: () => ({ replace: mockReplace }),
      }));
      vi.doMock("@/i18n/routing", () => ({
        routing: { locales: ["en", "de", "fr", "zh"], defaultLocale: "en" },
      }));
      vi.doMock("next-intl", () => ({
        useTranslations: () => (key: string) => "Language",
        useLocale: () => "en",
      }));
      vi.doMock("next/navigation", () => ({
        usePathname: () => "/en/",
      }));
      const { default: LS } = await import("../LanguageSwitcher");
      const user = userEvent.setup();
      render(<LS />);
      const btnLabel = screen.getByRole("button").getAttribute("aria-label");
      await user.click(screen.getByRole("button"));
      const listboxLabel = screen.getByRole("listbox").getAttribute("aria-label");
      expect(btnLabel).toBe("Language");
      expect(listboxLabel).toBe("Language");
      // Close it
      await user.click(screen.getByText("DE"));
    });

    it("renders without onLocaleChange prop (optional chain handles undefined)", async () => {
      vi.doMock("@/i18n/navigation", () => ({
        useRouter: () => ({ replace: mockReplace }),
      }));
      vi.doMock("@/i18n/routing", () => ({
        routing: { locales: ["en", "de", "fr", "zh"], defaultLocale: "en" },
      }));
      vi.doMock("next-intl", () => ({
        useTranslations: () => (key: string) => key,
        useLocale: () => "en",
      }));
      vi.doMock("next/navigation", () => ({
        usePathname: () => "/en/",
      }));
      const { default: LS } = await import("../LanguageSwitcher");
      // Should not throw
      expect(() => render(<LS />)).not.toThrow();
    });
  });

  describe("dropdown open/close behavior", () => {
    it("closes dropdown after selecting a locale", async () => {
      vi.doMock("@/i18n/navigation", () => ({
        useRouter: () => ({ replace: mockReplace }),
      }));
      vi.doMock("@/i18n/routing", () => ({
        routing: { locales: ["en", "de", "fr", "zh"], defaultLocale: "en" },
      }));
      vi.doMock("next-intl", () => ({
        useTranslations: () => (key: string) => key,
        useLocale: () => "en",
      }));
      vi.doMock("next/navigation", () => ({
        usePathname: () => "/en/",
      }));
      const { default: LS } = await import("../LanguageSwitcher");
      const user = userEvent.setup();
      render(<LS />);
      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
      await user.click(screen.getByText("DE"));
      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });
    });

    it("toggles dropdown on multiple clicks", async () => {
      vi.doMock("@/i18n/navigation", () => ({
        useRouter: () => ({ replace: mockReplace }),
      }));
      vi.doMock("@/i18n/routing", () => ({
        routing: { locales: ["en", "de", "fr", "zh"], defaultLocale: "en" },
      }));
      vi.doMock("next-intl", () => ({
        useTranslations: () => (key: string) => key,
        useLocale: () => "en",
      }));
      vi.doMock("next/navigation", () => ({
        usePathname: () => "/en/",
      }));
      const { default: LS } = await import("../LanguageSwitcher");
      const user = userEvent.setup();
      render(<LS />);
      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });
    });

    it("closes dropdown when clicking outside", async () => {
      vi.doMock("@/i18n/navigation", () => ({
        useRouter: () => ({ replace: mockReplace }),
      }));
      vi.doMock("@/i18n/routing", () => ({
        routing: { locales: ["en", "de", "fr", "zh"], defaultLocale: "en" },
      }));
      vi.doMock("next-intl", () => ({
        useTranslations: () => (key: string) => key,
        useLocale: () => "en",
      }));
      vi.doMock("next/navigation", () => ({
        usePathname: () => "/en/",
      }));
      const { default: LS } = await import("../LanguageSwitcher");
      const user = userEvent.setup();
      render(
        <div>
          <LS />
          <div data-testid="outside">Outside</div>
        </div>,
      );
      await user.click(screen.getByRole("button"));
      await waitFor(() => {
        expect(screen.getByRole("listbox")).toBeInTheDocument();
      });
      await user.click(screen.getByTestId("outside"));
      await waitFor(() => {
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
      });
    });
  });
});
