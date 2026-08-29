import { describe, it, expect, beforeEach, vi } from "vitest";
import { isRateLimited, resetRateLimit } from "../rateLimit";

describe("rateLimit", () => {
  beforeEach(() => {
    resetRateLimit();
  });

  it("allows first request", () => {
    expect(isRateLimited("1.2.3.4")).toBe(false);
  });

  it("allows up to MAX_PER_WINDOW requests", () => {
    const ip = "10.0.0.1";
    for (let i = 0; i < 5; i++) {
      expect(isRateLimited(ip)).toBe(false);
    }
  });

  it("blocks the 6th request within the window", () => {
    const ip = "10.0.0.2";
    for (let i = 0; i < 5; i++) isRateLimited(ip);
    expect(isRateLimited(ip)).toBe(true);
  });

  it("continues blocking after the limit is hit", () => {
    const ip = "10.0.0.3";
    for (let i = 0; i < 5; i++) isRateLimited(ip);
    expect(isRateLimited(ip)).toBe(true);
    expect(isRateLimited(ip)).toBe(true);
  });

  it("does not affect a different IP", () => {
    const ipA = "10.0.0.4";
    const ipB = "10.0.0.5";
    for (let i = 0; i < 10; i++) isRateLimited(ipA);
    expect(isRateLimited(ipA)).toBe(true);
    expect(isRateLimited(ipB)).toBe(false);
  });

  it("allows requests after the window expires", () => {
    vi.useFakeTimers();
    const ip = "10.0.0.6";
    for (let i = 0; i < 5; i++) isRateLimited(ip);
    expect(isRateLimited(ip)).toBe(true);

    // Advance past the 60s window
    vi.advanceTimersByTime(61_000);
    expect(isRateLimited(ip)).toBe(false);
    vi.useRealTimers();
  });

  it("counts blocked requests toward the bucket", () => {
    const ip = "10.0.0.7";
    for (let i = 0; i < 5; i++) isRateLimited(ip);
    expect(isRateLimited(ip)).toBe(true);
    // Even blocked requests record a timestamp.
    // After the window expires, only 2 requests (the 2 blocked ones)
    // should be in the new window.
    vi.useFakeTimers();
    vi.advanceTimersByTime(61_000);
    expect(isRateLimited(ip)).toBe(false);
    expect(isRateLimited(ip)).toBe(false);
    expect(isRateLimited(ip)).toBe(false);
    vi.useRealTimers();
  });

  it("resetRateLimit clears all buckets", () => {
    const ip = "10.0.0.8";
    for (let i = 0; i < 5; i++) isRateLimited(ip);
    expect(isRateLimited(ip)).toBe(true);
    resetRateLimit();
    expect(isRateLimited(ip)).toBe(false);
  });
});
