# ResiliaMap API (Bun + Elysia)

Read-only JSON/GeoJSON API over the ResiliaMap PostGIS schema (`db/resilience.sql`).
It serves the per-POI **resilience score** (0..100) and its breakdown from the
materialized view `mv_resilience_score`, plus per-POI detail and national stats.

> **License:** AGPL-3.0-or-later (ResiliaMap new code). It is additive to the
> GPLv3 Arcep fork; nothing under `back_mrm/` or `front_mrm/` is touched.
>
> **Arcep disclaimer (shown in every data response):** *Couverture
> simulée/indicative, non contractuelle (Arcep).* The score uses **arbitrary
> default constants** and is **not a validated reliability metric** until
> calibrated on a pilot department.

## SRID contract (the load-bearing rule)

- **Input** `bbox` is **EPSG:4326** (`minLon,minLat,maxLon,maxLat`).
- The server transforms the bbox to **EPSG:2154** (Lambert 93) and does the
  spatial filter (`ST_Intersects`) and all distance math (`ST_DWithin`,
  `ST_Distance`) **in metres in 2154** — never in degrees.
- **Output** geometry is re-projected back to **EPSG:4326** for MapLibre / the
  key-free OSM basemap.
- The neighbourhood radius `R_METERS` and the outage window `OUTAGE_WINDOW_DAYS`
  are read from the DB `score_constants` table so the API always agrees with the
  thresholds that produced `mv_resilience_score`.

## Run

```bash
# from api/
bun install
DATABASE_URL=postgres://resiliamap:changeme_local_only@localhost:5440/resiliamap \
  API_PORT=3010 bun run dev      # watch mode
# or
bun run start
```

Env vars:

| var | default | meaning |
|---|---|---|
| `DATABASE_URL` | `postgres://resiliamap:changeme_local_only@localhost:5440/resiliamap` | postgres (porsager) connection string |
| `API_PORT` | `3010` (compose passes `3801`) | listen port |
| `NODE_ENV` | `development` | `production` makes CORS fail-safe (see below) |
| `CORS_ORIGIN` | deny in prod / reflect in dev | comma-separated allowed origins; `*` is **ignored in production** |
| `API_VERSION` | `0.1.0` | reported by `/api/health` |
| `R_METERS` / `OUTAGE_WINDOW_DAYS` | `3000` / `90` | display fallback if `score_constants` is unavailable |

In Docker: `docker compose -f docker-compose.resiliamap.yml up -d api`.

## Endpoints

### `GET /api/health`
Liveness/readiness. `200` when DB is reachable, `503` otherwise.

```json
{
  "status": "ok",
  "ok": true,
  "db": true,
  "mv_resilience_score": { "rows": 1234, "last_refresh": "2026-06-25T04:00:00Z" },
  "outages": { "latest_observed_date": "2026-06-24", "days_in_archive": 87 },
  "coverage_layer_loaded": false,
  "version": "0.1.0"
}
```

### `GET /api/poi?bbox=minLon,minLat,maxLon,maxLat&category=sante|securite`
GeoJSON `FeatureCollection`. `bbox` required (4326); `category` optional.
`400` on missing/invalid bbox or bad category. Capped at 5000 features.

```bash
curl 'http://localhost:3010/api/poi?bbox=2.20,48.80,2.45,48.92&category=sante'
```

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "id": 42,
      "geometry": { "type": "Point", "coordinates": [2.3411, 48.8566] },
      "properties": {
        "id": 42,
        "name": "Hôpital Saint-Antoine",
        "category": "sante",
        "subcategory": "hopital",
        "score": 78,
        "is_uncovered": false,
        "breakdown": {
          "redundancy": 100, "spof_malus": 0, "outage_malus": 12,
          "n_operators": 4, "n_sites": 11, "n_outages_90d": 1
        }
      }
    }
  ],
  "meta": {
    "count": 1,
    "constants": { "R_METERS": 3000, "OUTAGE_WINDOW_DAYS": 90 },
    "disclaimer": "Couverture simulée/indicative, non contractuelle (Arcep). ..."
  }
}
```

### `GET /api/poi/:id`
Full detail for one POI. `404` if not found, `400` if id is not a positive int.

```bash
curl 'http://localhost:3010/api/poi/42'
```

```json
{
  "id": 42,
  "name": "Hôpital Saint-Antoine",
  "category": "sante",
  "subcategory": "hopital",
  "address": "184 Rue du Faubourg Saint-Antoine",
  "insee_com": "75112",
  "location": { "lon": 2.3411, "lat": 48.8566 },
  "score": 78,
  "is_uncovered": false,
  "breakdown": {
    "redundancy": 100, "spof_malus": 0, "outage_malus": 12,
    "n_operators": 4, "n_sites": 11, "n_outages_90d": 1
  },
  "serving_operators": [
    { "code": 20801, "name": "Orange", "color": "#ff8700", "n_sites_within_R": 4, "nearest_site_m": 210 },
    { "code": 20815, "name": "Free",   "color": "#4be1bb", "n_sites_within_R": 2, "nearest_site_m": 540 }
  ],
  "nearby_outages": [
    { "observed_date": "2026-05-30", "operator_code": 20810, "operator_name": "SFR", "distance_m": 1200 }
  ],
  "constants": { "R_METERS": 3000, "OUTAGE_WINDOW_DAYS": 90 },
  "disclaimer": "Couverture simulée/indicative, non contractuelle (Arcep). ..."
}
```

### `GET /api/stats?category=sante|securite`
National aggregates for shareable numbers. `category` optional.

```bash
curl 'http://localhost:3010/api/stats'
```

```json
{
  "poi_total": 1234,
  "by_category": { "sante": 800, "securite": 434 },
  "score": { "mean": 64.2, "median": 67, "min": 0, "max": 100 },
  "score_distribution": [
    { "bucket": "0-19", "count": 40 },
    { "bucket": "20-39", "count": 95 },
    { "bucket": "40-59", "count": 210 },
    { "bucket": "60-79", "count": 560 },
    { "bucket": "80-100", "count": 329 }
  ],
  "uncovered_poi": 12,
  "spof_poi": 58,
  "outages_90d_total": 4321,
  "coverage_layer_loaded": false,
  "constants": {
    "R_METERS": 3000, "OUTAGE_WINDOW_DAYS": 90, "REDUNDANCY_FULL_OPERATORS": 4,
    "W_REDUNDANCY": 1, "W_SPOF_MALUS": 0.25, "W_OUTAGE": 0.35,
    "OUTAGE_DECAY_HALFLIFE_DAYS": 30
  },
  "disclaimer": "Couverture simulée/indicative, non contractuelle (Arcep). ..."
}
```

## Safety

- **Read-only.** No write paths. Never touches the Arcep `site` table or any
  `back_mrm/` / `front_mrm/` code.
- **Parameterised SQL only.** All user input flows through porsager
  (`postgres`) tagged templates → bound parameters. No string concatenation.
- Query params are validated in `src/schema.ts` (bbox arity/range, category
  enum, positive-int id) and mapped to `400` before any SQL runs.
