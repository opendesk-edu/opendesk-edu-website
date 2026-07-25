import { describe, it, expect } from "vitest";
import { BLUR_TEASER } from "@/lib/blur";

/**
 * Tests for src/lib/blur.ts
 * Generic blurDataURL for teaser images.
 */

describe("BLUR_TEASER", () => {
  it("should be a valid data URL", () => {
    expect(BLUR_TEASER).toMatch(/^data:image\/svg\+xml;base64,/);
  });

  it("should contain base64 encoded SVG", () => {
    const base64Part = BLUR_TEASER.split(",")[1];
    expect(base64Part).toBeDefined();
    // Base64 should only contain valid characters
    expect(base64Part).toMatch(/^[A-Za-z0-9+/=]+$/);
  });

  it("should decode to a valid SVG", () => {
    const base64Part = BLUR_TEASER.split(",")[1];
    const decoded = Buffer.from(base64Part, "base64").toString("utf-8");
    
    expect(decoded).toContain("<svg");
    expect(decoded).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(decoded).toContain('width="4"');
    expect(decoded).toContain('height="4"');
    expect(decoded).toContain("</svg>");
  });

  it("should contain brand accent color #571EFA", () => {
    const base64Part = BLUR_TEASER.split(",")[1];
    const decoded = Buffer.from(base64Part, "base64").toString("utf-8");
    
    expect(decoded).toContain("#571EFA");
  });

  it("should have 4x4 dimensions", () => {
    const base64Part = BLUR_TEASER.split(",")[1];
    const decoded = Buffer.from(base64Part, "base64").toString("utf-8");
    
    expect(decoded).toContain('width="4"');
    expect(decoded).toContain('height="4"');
  });

  it("should have two rectangle elements with different opacities", () => {
    const base64Part = BLUR_TEASER.split(",")[1];
    const decoded = Buffer.from(base64Part, "base64").toString("utf-8");
    
    expect(decoded).toContain('<rect width="4" height="4" fill="#571EFA" opacity="0.15"/>');
    expect(decoded).toContain('<rect width="2" height="4" fill="#571EFA" opacity="0.1"/>');
  });

  it("should be a non-empty string", () => {
    expect(BLUR_TEASER).toBeTruthy();
    expect(typeof BLUR_TEASER).toBe("string");
    expect(BLUR_TEASER.length).toBeGreaterThan(100);
  });
});
