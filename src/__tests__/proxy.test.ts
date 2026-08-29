import { describe, it, expect, vi } from "vitest";

vi.mock("next-intl/middleware", () => ({
  default: () => () => "middleware-response",
}));

vi.mock("@/i18n/routing", () => ({
  routing: { locales: ["en", "de", "fr", "zh"], defaultLocale: "en" },
}));

import proxyDefault, { config } from "@/proxy";

describe("proxy.ts (middleware)", () => {
  it("exports a default function", () => {
    expect(typeof proxyDefault).toBe("function");
  });

  it("exports config with matcher array", () => {
    expect(config).toBeDefined();
    expect(Array.isArray(config.matcher)).toBe(true);
    expect(config.matcher.length).toBeGreaterThan(0);
  });

  it("matcher excludes api, _next, _vercel, and static files", () => {
    const matcher = config.matcher[0];
    expect(matcher).toContain("api");
    expect(matcher).toContain("_next");
    expect(matcher).toContain("_vercel");
  });

  it("matcher includes root path", () => {
    expect(config.matcher).toContain("/");
  });
});
