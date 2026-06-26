// ============================================================================
// ResiliaMap API — src/index.ts
// ----------------------------------------------------------------------------
// Elysia app bootstrap: CORS, route mounting, listen on a configurable PORT
// (default 3010 to avoid collisions with the Arcep stack on :8000; compose
// passes API_PORT=3801 explicitly).
//
// Read-only API over the PostGIS resilience schema. Endpoints:
//   GET /            small index describing the API
//   GET /api/health  liveness/readiness
//   GET /api/poi     GeoJSON FeatureCollection (bbox + optional category)
//   GET /api/poi/:id POI detail (serving operators, nearby outages, breakdown)
//   GET /api/stats   national aggregates
//
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { healthRoutes } from "./routes/health.ts";
import { poiRoutes } from "./routes/poi.ts";
import { statsRoutes } from "./routes/stats.ts";
import { departmentsRoutes } from "./routes/departments.ts";
import { closeDb } from "./db.ts";
import { API_PORT, API_VERSION, ARCEP_DISCLAIMER } from "./constants.ts";

// CORS: in compose the browser hits the same origin via the nginx proxy (no CORS
// needed), but in local dev the Vite app (e.g. :8081) calls the API cross-origin.
// Fail-safe: an explicit allowlist always wins; otherwise we reflect any origin
// in dev for convenience but DENY cross-origin in production, where the real data
// path is same-origin through nginx — so denying breaks nothing legitimate.
const NODE_ENV = process.env.NODE_ENV ?? "development";
const rawCors = process.env.CORS_ORIGIN?.trim();

function resolveCorsOrigin(): boolean | string[] {
  // Explicit allowlist (comma-separated, e.g. "https://resiliamap.fr") wins.
  if (rawCors && rawCors !== "*") {
    return rawCors.split(",").map((s) => s.trim()).filter(Boolean);
  }
  if (NODE_ENV === "production") {
    console.warn(
      rawCors === "*"
        ? "[api] CORS_ORIGIN='*' ignored in production — set an explicit allowlist to enable cross-origin"
        : "[api] CORS_ORIGIN unset in production — cross-origin requests are denied (web is served same-origin via nginx)"
    );
    return false; // no reflection; same-origin requests are unaffected
  }
  // Dev convenience: reflect any origin so the Vite app can call the API directly.
  return true;
}

const app = new Elysia()
  .use(
    cors({
      origin: resolveCorsOrigin(),
      methods: ["GET", "OPTIONS"],
    })
  )
  // Tiny self-describing index so a bare GET / is useful (and not a 404).
  .get("/", () => ({
    name: "ResiliaMap API",
    version: API_VERSION,
    description:
      "Read-only resilience scoring API for critical POI. All metric math in EPSG:2154; geometry emitted in EPSG:4326.",
    endpoints: [
      "GET /api/health",
      "GET /api/poi?bbox=minLon,minLat,maxLon,maxLat&category=sante|securite&operator=20801|20810|20820|20815",
      "GET /api/poi/:id",
      "GET /api/stats?category=sante|securite",
      "GET /api/departments",
    ],
    disclaimer: ARCEP_DISCLAIMER,
  }))
  .use(healthRoutes)
  .use(poiRoutes)
  .use(statsRoutes)
  .use(departmentsRoutes)
  // Uniform 404 for unknown paths.
  .onError(({ code, set, error }) => {
    if (code === "NOT_FOUND") {
      set.status = 404;
      return { error: "not_found" };
    }
    if (code === "VALIDATION") {
      set.status = 400;
      return { error: "validation_error" };
    }
    // Log the real error server-side for observability; the client only ever
    // gets a generic code (no internal/DB details leaked).
    console.error("[api] unhandled error:", error);
    set.status = 500;
    return { error: "internal_error" };
  })
  .listen(API_PORT);

// eslint-disable-next-line no-console
console.log(
  `[resiliamap-api] listening on http://${app.server?.hostname ?? "0.0.0.0"}:${API_PORT}`
);

// Graceful shutdown: drain the pg pool on signals so connections close cleanly.
for (const sig of ["SIGINT", "SIGTERM"] as const) {
  process.on(sig, async () => {
    // eslint-disable-next-line no-console
    console.log(`[resiliamap-api] ${sig} received, shutting down`);
    try {
      await app.stop();
    } finally {
      await closeDb();
      process.exit(0);
    }
  });
}

export type App = typeof app;
