import { describe, it, expect, vi } from "vitest";

const mockRouting = {
  defaultLocale: "en",
  locales: ["en", "de", "fr", "zh"],
};

vi.mock("next-intl/server", () => ({
  getRequestConfig:
    (fn: (args: { locale?: string; requestLocale?: Promise<string> }) => unknown) =>
    (args: { locale?: string; requestLocale?: Promise<string> }) =>
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

  it("falls back to default locale when both locale and requestLocale are undefined", async () => {
    const mod = await import("./request");
    const result = await mod.default({
      locale: undefined,
      requestLocale: Promise.resolve(undefined),
    } as never);
    expect(result.locale).toBe("en");
  });

  it("resolves to the correct locale when requestLocale is provided", async () => {
    // When setRequestLocale has been called (layout.tsx), requestLocale
    // carries the locale even though the locale param is undefined.
    const mod = await import("./request");
    const result = await mod.default({
      locale: undefined,
      requestLocale: Promise.resolve("de"),
    } as never);
    expect(result.locale).toBe("de");
  });

  it("locale param takes priority over requestLocale when both are provided", async () => {
    const mod = await import("./request");
    const result = await mod.default({
      locale: "en",
      requestLocale: Promise.resolve("de"),
    } as never);
    expect(result.locale).toBe("en");
  });

  it("invalid requestLocale falls back to defaultLocale", async () => {
    const mod = await import("./request");
    const result = await mod.default({
      locale: undefined,
      requestLocale: Promise.resolve("ja"),
    } as never);
    expect(result.locale).toBe("en");
  });

  it("requestLocale resolving to null/undefined falls back to defaultLocale", async () => {
    const mod = await import("./request");
    const result = await mod.default({
      locale: undefined,
      requestLocale: Promise.resolve(null as unknown as string),
    } as never);
    expect(result.locale).toBe("en");
  });

  it("returns correct messages for each locale via requestLocale", async () => {
    const mod = await import("./request");
    const de = await mod.default({
      locale: undefined,
      requestLocale: Promise.resolve("de"),
    } as never);
    const fr = await mod.default({
      locale: undefined,
      requestLocale: Promise.resolve("fr"),
    } as never);
    const zh = await mod.default({
      locale: undefined,
      requestLocale: Promise.resolve("zh"),
    } as never);
    const msgOf = (cfg: unknown) => (cfg as { messages: Record<string, unknown> }).messages;
    expect(msgOf(de).header.home).toBe("Startseite");
    expect(msgOf(fr).header.home).toBe("Accueil");
    expect(msgOf(zh).header.home).toBe("首页");
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
