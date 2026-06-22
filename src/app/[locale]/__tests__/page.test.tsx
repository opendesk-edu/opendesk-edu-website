import { describe, it, expect, vi } from "vitest";

vi.mock("next-intl/server", () => ({ getTranslations: vi.fn() }));
vi.mock("@/i18n/navigation", () => ({ Link: vi.fn() }));
vi.mock("@/lib/content", () => ({ getAllPosts: vi.fn(), SECTION_INFO: [] }));
vi.mock("@/lib/config", () => ({ SITE_NAME: "openDesk Edu" }));
vi.mock("@/components/PostCard", () => ({ default: vi.fn() }));
vi.mock("@/components/CategorySection", () => ({ default: vi.fn() }));

describe("Home page module", () => {
  it("exports a default function and generateMetadata", async () => {
    const mod = await import("@/app/[locale]/page");
    expect(typeof mod.default).toBe("function");
    expect(typeof mod.generateMetadata).toBe("function");
  });

  it("has revalidate export", async () => {
    const mod = await import("@/app/[locale]/page");
    expect(mod.revalidate).toBe(3600);
  });
});
