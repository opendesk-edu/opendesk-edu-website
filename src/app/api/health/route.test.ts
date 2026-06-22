import { describe, it, expect } from "vitest";
import { GET } from "./route";

describe("Health check API", () => {
  it("returns 200 with status ok", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.status).toBe("ok");
  });

  it("includes app name", async () => {
    const response = await GET();
    const body = await response.json();
    expect(body.app).toBeTruthy();
  });

  it("includes timestamp as ISO string", async () => {
    const response = await GET();
    const body = await response.json();
    expect(body.timestamp).toBeTruthy();
    expect(() => new Date(body.timestamp)).not.toThrow();
  });

  it("includes uptime as string", async () => {
    const response = await GET();
    const body = await response.json();
    expect(typeof body.uptime).toBe("string");
    expect(body.uptime.length).toBeGreaterThan(0);
  });

  it("includes node version", async () => {
    const response = await GET();
    const body = await response.json();
    expect(body.node).toBeTruthy();
    expect(body.node).toContain("v");
  });

  it("includes version info", async () => {
    const response = await GET();
    const body = await response.json();
    expect(body.version).toBeTruthy();
  });
});
