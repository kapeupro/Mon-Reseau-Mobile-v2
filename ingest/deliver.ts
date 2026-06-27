// ============================================================================
// ResiliaMap — ingest/deliver.ts (E3)
// ----------------------------------------------------------------------------
// Delivery pass for fired alert_event rows. Kept separate from evaluation so the
// DB step (alerts.ts) never blocks on network I/O.
//
// WEBHOOK channel: POST the event payload as JSON with an HMAC-SHA256 signature
//   header (X-ResiliaMap-Signature: sha256=<hex>) so the receiver can verify
//   authenticity. Secret = subscription.signing_secret, else env
//   WEBHOOK_SIGNING_SECRET. On 2xx -> delivered_at set; otherwise attempts++ and
//   last_error recorded (a later run retries; cap stops runaway retries).
//
// EMAIL channel: DEFERRED — no SMTP provider is configured yet (a product
//   decision). Email events are left undelivered and counted, not dropped, so
//   wiring SMTP later delivers the backlog.
//
// License: AGPL-3.0-or-later (ResiliaMap new code). See README.ResiliaMap.md.
// ============================================================================
import { createHmac } from "node:crypto";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { sql } from "./db.ts";

/** Stop retrying a webhook after this many failed attempts (avoids runaway). */
const MAX_ATTEMPTS = Number(process.env.ALERT_MAX_ATTEMPTS ?? 5);
const GLOBAL_SECRET = process.env.WEBHOOK_SIGNING_SECRET ?? "";
/** Max redirect hops to follow, re-validating each (avoids redirect-based SSRF). */
const MAX_REDIRECTS = 3;
/** Dev/test escape hatch: allow private/loopback webhook targets when explicitly set. */
const ALLOW_PRIVATE = process.env.ALERT_WEBHOOK_ALLOW_PRIVATE === "true";

// ----------------------------------------------------------------------------
// SSRF defense. A webhook target is attacker-influenced (it will be user-supplied
// once the public subscribe API lands), so before EVERY hop we require http(s),
// resolve the host, and reject any address that lands on loopback / link-local /
// private / CGNAT / cloud-metadata ranges — the classic SSRF pivot targets.
// ----------------------------------------------------------------------------

/** True if an IPv4 dotted address is in a blocked (private/loopback/meta) range. */
function ipv4Blocked(ip: string): boolean {
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) {
    return true; // malformed -> block
  }
  const [a, b] = p as [number, number, number, number];
  if (a === 0 || a === 10 || a === 127) return true;     // this-net, private, loopback
  if (a === 169 && b === 254) return true;               // link-local + 169.254.169.254 metadata
  if (a === 172 && b >= 16 && b <= 31) return true;      // private
  if (a === 192 && b === 168) return true;               // private
  if (a === 100 && b >= 64 && b <= 127) return true;     // CGNAT 100.64/10
  return false;
}

/** True if an IPv6 address is in a blocked range (loopback/ULA/link-local/mapped). */
function ipv6Blocked(ip: string): boolean {
  const s = ip.toLowerCase().split("%")[0]!; // drop any zone id
  if (s === "::1" || s === "::") return true;            // loopback / unspecified
  const mapped = s.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/); // IPv4-mapped
  if (mapped) return ipv4Blocked(mapped[1]!);
  if (s.startsWith("fc") || s.startsWith("fd")) return true; // ULA fc00::/7
  if (/^fe[89ab]/.test(s)) return true;                  // link-local fe80::/10
  return false;
}

function addressBlocked(ip: string): boolean {
  const fam = isIP(ip);
  return fam === 6 ? ipv6Blocked(ip) : ipv4Blocked(ip);
}

/**
 * Validate a webhook URL against SSRF: http(s) only, and EVERY resolved address
 * must be public. Throws on rejection. Returns the validated URL string.
 */
async function assertSafeWebhookUrl(raw: string): Promise<void> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`invalid webhook URL`);
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error(`blocked scheme ${url.protocol}`);
  }
  if (ALLOW_PRIVATE) return; // explicit dev/test opt-in
  const host = url.hostname.replace(/^\[|\]$/g, ""); // strip IPv6 brackets
  // Resolve ALL addresses (a host may have several A/AAAA records); reject if any
  // is private — defends against DNS rebinding to a single bad record.
  const results = isIP(host)
    ? [{ address: host }]
    : await lookup(host, { all: true });
  if (results.length === 0) throw new Error(`host did not resolve`);
  for (const r of results) {
    if (addressBlocked(r.address)) {
      throw new Error(`blocked private/loopback target ${r.address}`);
    }
  }
}

/**
 * fetch() with SSRF-safe redirect handling: manual redirects, re-validating the
 * Location host at every hop so a public URL can't 30x-bounce to an internal one.
 */
async function safeFetch(
  target: string,
  init: RequestInit,
): Promise<Response> {
  let current = target;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    await assertSafeWebhookUrl(current);
    const res = await fetch(current, { ...init, redirect: "manual" });
    if (res.status >= 300 && res.status < 400) {
      const loc = res.headers.get("location");
      if (!loc) return res;
      current = new URL(loc, current).toString(); // resolve relative, re-validate next loop
      continue;
    }
    return res;
  }
  throw new Error(`too many redirects (> ${MAX_REDIRECTS})`);
}

interface PendingEvent {
  id: number;
  subscription_id: number;
  kind: string;
  payload: unknown;
  channel: string;
  target: string;
  signing_secret: string | null;
}

export interface DeliverResult {
  delivered: number;
  failed: number;
  skipped_email: number;
}

/** Deliver all undelivered, retryable events. Webhook now; email deferred. */
export async function deliverAlerts(): Promise<DeliverResult> {
  const pending = await sql<PendingEvent[]>`
    SELECT e.id, e.subscription_id, e.kind, e.payload,
           s.channel, s.target, s.signing_secret
    FROM alert_event e
    JOIN alert_subscription s ON s.id = e.subscription_id
    WHERE e.delivered_at IS NULL
      AND e.attempts < ${MAX_ATTEMPTS}
      AND s.active
    ORDER BY e.created_at
  `;

  let delivered = 0;
  let failed = 0;
  let skippedEmail = 0;

  for (const ev of pending) {
    if (ev.channel === "email") {
      skippedEmail += 1;
      continue; // DEFERRED: no SMTP configured. Left undelivered for later.
    }
    try {
      const body = JSON.stringify({
        kind: ev.kind,
        event_id: ev.id,
        ...(typeof ev.payload === "object" && ev.payload ? ev.payload : {}),
      });
      const secret = ev.signing_secret || GLOBAL_SECRET;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "User-Agent": "ResiliaMap-Alerts/1",
      };
      if (secret) {
        const sig = createHmac("sha256", secret).update(body).digest("hex");
        headers["X-ResiliaMap-Signature"] = `sha256=${sig}`;
      }
      // SSRF-safe: validates scheme + resolved IP (and every redirect hop).
      const res = await safeFetch(ev.target, { method: "POST", headers, body });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      await sql`
        UPDATE alert_event
           SET delivered_at = now(), attempts = attempts + 1, last_error = NULL
         WHERE id = ${ev.id}`;
      await sql`
        UPDATE alert_subscription
           SET last_notified_at = now()
         WHERE id = ${ev.subscription_id}`;
      delivered += 1;
    } catch (err) {
      failed += 1;
      const msg = String(err instanceof Error ? err.message : err);
      await sql`
        UPDATE alert_event
           SET attempts = attempts + 1, last_error = ${msg}
         WHERE id = ${ev.id}`;
      console.warn(`[alerts] webhook delivery failed for event ${ev.id}: ${msg}`);
    }
  }

  const result: DeliverResult = { delivered, failed, skipped_email: skippedEmail };
  console.log(
    `[alerts] delivery: ${delivered} delivered, ${failed} failed, ` +
      `${skippedEmail} email skipped (SMTP not configured).`
  );
  return result;
}
