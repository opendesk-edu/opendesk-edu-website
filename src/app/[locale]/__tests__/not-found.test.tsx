import { describe, it, expect, vi } from "vitest";

vi.mock("next-intl/server", () => ({ getTranslations: vi.fn() }));
vi.mock("@/i18n/navigation", () => ({ Link: vi.fn() }));
vi.mock("@/lib/content", () => ({ getAllPosts: vi.fn(), SECTION_INFO: [] }));
vi.mock("@/components/PostCard", () => ({ default: vi.fn() }));

describe("NotFound page module", () => {
  it("exports a default async function", async () => {
    const mod = await import("@/app/[locale]/not-found");
    expect(typeof mod.default).toBe("function");
  });

  it("has NotFound as function name", async () => {
    const mod = await import("@/app/[locale]/not-found");
    expect(mod.default.name).toBe("NotFound");
  });
});
