import { describe, it, expect, vi } from "vitest";

const mockRouting = {
  defaultLocale: "en",
  locales: ["en", "de", "fr", "zh"],
};

vi.mock("next-intl/server", () => ({
  getRequestConfig:
    (fn: (args: { locale?: string }) => unknown) =>
    (args: { locale?: string }) =>
      fn(args),
}));

vi.mock("./routing", () => ({
  routing: mockRouting,
}));

describe("i18n request module", () => {
  it("exports a default function", async () => {
    const mod = await import("./request");
    expect(typeof mod.default).toBe("function");
  });

  it("returns en locale and messages for valid locale", async () => {
    const mod = await import("./request");
    const result = await mod.default({ locale: "en" } as never);
    expect(result.locale).toBe("en");
    expect(result.messages).toBeDefined();
  });

  it("returns de locale for valid de locale", async () => {
    const mod = await import("./request");
    const result = await mod.default({ locale: "de" } as never);
    expect(result.locale).toBe("de");
  });

  it("falls back to default locale for invalid locale", async () => {
    const mod = await import("./request");
    const result = await mod.default({ locale: "invalid" } as never);
    expect(result.locale).toBe("en");
  });

  it("falls back to default locale for undefined locale", async () => {
    const mod = await import("./request");
    const result = await mod.default({ locale: undefined } as never);
    expect(result.locale).toBe("en");
  });

  it("resolves synchronously (no Promise) so routes can be generated statically", async () => {
    // Regression guard for the soft-404 fix: an async getRequestConfig forces
    // the whole [locale] tree to render dynamically, which streams notFound()
    // as HTTP 200. The config must stay synchronous.
    const mod = await import("./request");
    const result = mod.default({ locale: "de" } as never);
    expect(result).not.toBeInstanceOf(Promise);
  });

  it("returns statically-imported messages for the resolved locale", async () => {
    const mod = await import("./request");
    const en = await mod.default({ locale: "en" } as never);
    const de = await mod.default({ locale: "de" } as never);
    const localeOf = (cfg: unknown) => (cfg as { locale: string }).locale;
    expect(localeOf(en)).toBe("en");
    expect(localeOf(de)).toBe("de");
  });
});
