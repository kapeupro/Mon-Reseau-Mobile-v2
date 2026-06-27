// ============================================================================
// ResiliaMap API — src/ratelimit.ts
// ----------------------------------------------------------------------------
// Small in-memory, per-IP fixed-window rate limiter for the public read-only
// API. Single-instance deploy (one api container) => an in-process Map is
// sufficient; horizontal scaling would need a shared store (Redis) — documented.
//
// Emits the IETF draft RateLimit-* headers and a 429 + Retry-After on overflow.
// Liveness (/api/health) and the docs (/openapi*) are EXEMPT so monitoring and
// the spec stay reachable under load.
//
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================
import { Elysia } from "elysia";

/** Requests allowed per IP per window. Override via env for ops tuning. */
const LIMIT = Number(process.env.RATE_LIMIT_MAX ?? 600);
/** Window length in seconds (default 60s => 600 req/min ≈ 10 req/s sustained). */
const WINDOW_S = Number(process.env.RATE_LIMIT_WINDOW_S ?? 60);

interface Bucket {
  count: number;
  resetAt: number; // epoch ms when the window rolls over
}

const buckets = new Map<string, Bucket>();

/** Paths that must never be rate-limited (monitoring + API docs). */
function isExempt(path: string): boolean {
  return path === "/api/health" || path === "/openapi" || path.startsWith("/openapi");
}

/**
 * Best-effort client key. Behind the nginx proxy the real client is the first
 * hop of X-Forwarded-For; fall back to X-Real-IP, then a constant so a missing
 * header degrades to a single shared bucket rather than bypassing the limit.
 */
function clientKey(headers: Record<string, string | undefined>): string {
  const xff = headers["x-forwarded-for"];
  if (xff) return xff.split(",")[0]!.trim();
  return headers["x-real-ip"] ?? "unknown";
}

export const rateLimit = new Elysia({ name: "resiliamap-ratelimit" }).onRequest(
  ({ request, set }) => {
    const url = new URL(request.url);
    if (isExempt(url.pathname)) return;

    const now = Date.now();
    const key = clientKey(
      Object.fromEntries(request.headers) as Record<string, string | undefined>
    );

    let b = buckets.get(key);
    if (!b || b.resetAt <= now) {
      b = { count: 0, resetAt: now + WINDOW_S * 1000 };
      buckets.set(key, b);
    }
    b.count += 1;

    const remaining = Math.max(0, LIMIT - b.count);
    const resetSecs = Math.max(0, Math.ceil((b.resetAt - now) / 1000));
    // IETF draft RateLimit headers (RFC 9239-style) on every response.
    set.headers["RateLimit-Limit"] = String(LIMIT);
    set.headers["RateLimit-Remaining"] = String(remaining);
    set.headers["RateLimit-Reset"] = String(resetSecs);

    if (b.count > LIMIT) {
      set.headers["Retry-After"] = String(resetSecs);
      set.status = 429;
      return { error: "rate_limited" };
    }
  }
);

/** Periodically evict expired buckets so the Map can't grow unbounded. */
const sweep = setInterval(() => {
  const now = Date.now();
  for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
}, 60_000);
// Don't keep the process alive solely for the sweep timer.
if (typeof sweep === "object" && "unref" in sweep) (sweep as { unref: () => void }).unref();
