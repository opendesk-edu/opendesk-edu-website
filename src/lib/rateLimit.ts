// Simple in-memory sliding-window rate limiter keyed by client IP.
// Counts only "validated" submissions (those that would actually send mail)
// so abuse is throttled without penalising plain validation failures.
//
// IMPORTANT: this is per-process state. In a serverless/multi-instance deploy
// it is not a hard guarantee — consider a shared store (Redis) if strict
// global limits are required. It still meaningfully raises the cost of spam
// in the common single-instance / long-lived server case.
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

const buckets = new Map<string, number[]>();

/**
 * Returns true if the given ip has exceeded the limit for the current window.
 * Each call records an attempt, including when the caller is blocked.
 */
export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const recent = (buckets.get(ip) ?? []).filter((t) => t > windowStart);
  const blocked = recent.length >= MAX_PER_WINDOW;
  recent.push(now);
  buckets.set(ip, recent);
  return blocked;
}

/** Test helper: clears all recorded requests. */
export function resetRateLimit(): void {
  buckets.clear();
}
