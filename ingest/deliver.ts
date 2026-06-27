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
import { sql } from "./db.ts";

/** Stop retrying a webhook after this many failed attempts (avoids runaway). */
const MAX_ATTEMPTS = Number(process.env.ALERT_MAX_ATTEMPTS ?? 5);
const GLOBAL_SECRET = process.env.WEBHOOK_SIGNING_SECRET ?? "";

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
      const res = await fetch(ev.target, { method: "POST", headers, body });
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
