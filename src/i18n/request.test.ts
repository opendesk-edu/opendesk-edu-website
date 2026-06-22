import { describe, it, expect, vi } from "vitest";

const mockRouting = {
  defaultLocale: "en",
  locales: ["en", "de", "fr", "zh"],
};

vi.mock("next-intl/server", () => ({
  getRequestConfig:
    (fn: (args: { requestLocale: Promise<string | undefined> }) => unknown) =>
    (args: { requestLocale: Promise<string | undefined> }) =>
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
    const result = await mod.default({
      requestLocale: Promise.resolve("en"),
    });
    expect(result.locale).toBe("en");
    expect(result.messages).toBeDefined();
  });

  it("returns de locale for valid de locale", async () => {
    const mod = await import("./request");
    const result = await mod.default({
      requestLocale: Promise.resolve("de"),
    });
    expect(result.locale).toBe("de");
  });

  it("falls back to default locale for invalid locale", async () => {
    const mod = await import("./request");
    const result = await mod.default({
      requestLocale: Promise.resolve("invalid"),
    });
    expect(result.locale).toBe("en");
  });

  it("falls back to default locale for undefined locale", async () => {
    const mod = await import("./request");
    const result = await mod.default({
      requestLocale: Promise.resolve(undefined),
    });
    expect(result.locale).toBe("en");
  });
});
