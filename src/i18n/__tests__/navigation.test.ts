import { describe, it, expect, vi } from "vitest";

vi.mock("next-intl/navigation", () => ({
  createNavigation: (_routing: unknown) => ({
    Link: {},
    redirect: vi.fn(),
    usePathname: vi.fn(),
    useRouter: vi.fn(),
    getPathname: vi.fn(),
  }),
}));

import { Link, redirect, usePathname, useRouter, getPathname } from "@/i18n/navigation";

describe("i18n/navigation", () => {
  it("exports Link component", () => {
    expect(Link).toBeDefined();
  });

  it("exports redirect function", () => {
    expect(redirect).toBeDefined();
    expect(typeof redirect).toBe("function");
  });

  it("exports usePathname function", () => {
    expect(usePathname).toBeDefined();
    expect(typeof usePathname).toBe("function");
  });

  it("exports useRouter function", () => {
    expect(useRouter).toBeDefined();
    expect(typeof useRouter).toBe("function");
  });

  it("exports getPathname function", () => {
    expect(getPathname).toBeDefined();
    expect(typeof getPathname).toBe("function");
  });
});
