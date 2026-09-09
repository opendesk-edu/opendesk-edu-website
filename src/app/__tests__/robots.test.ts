import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/config", () => ({
  SITE_URL: "https://opendesk-edu.org",
}));

import robots from "@/app/robots";

describe("robots.ts", () => {
  it("exports a default function", () => {
    expect(typeof robots).toBe("function");
  });

  it("allows all user agents", () => {
    const result = robots();
    const rules = result.rules as Array<{
      userAgent?: string | string[];
      allow?: string | string[];
      disallow?: string | string[];
    }>;
    expect(rules).toHaveLength(1);
    expect(rules[0].userAgent).toBe("*");
    expect(rules[0].allow).toBe("/");
  });

  it("disallows /api/ path", () => {
    const result = robots();
    expect((result.rules as Array<{ disallow?: string | string[] }>)[0].disallow).toEqual(["/api/"]);
  });

  it("includes sitemap URL", () => {
    const result = robots();
    expect(result.sitemap).toBe("https://opendesk-edu.org/sitemap.xml");
  });
});
