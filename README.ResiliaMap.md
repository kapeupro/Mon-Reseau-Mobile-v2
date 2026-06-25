# ResiliaMap

**A civic-tech map scoring the NETWORK RESILIENCE (0–100) of critical places —
hospitals, gendarmeries, police stations — from real Arcep / data.gouv layers.**

> ⚠️ **Disclaimer (mandatory, shown everywhere).**
> La couverture mobile affichée est **simulée / indicative, non contractuelle**
> (Arcep). The resilience score is a **non-validated indicator** built on
> arbitrary default thresholds. It must be **calibrated on a pilot department**
> before any operational use. *Coverage is simulated/indicative, non-contractual.*

---

## What it is, and why

When a hospital, gendarmerie or police station loses mobile connectivity, the
question "how fragile is this place's network?" has no public answer. Arcep
publishes a **daily list of unavailable sites** (`sites-indisponibles`) — but
**nobody archives it**: each day overwrites the last.

ResiliaMap's core value-add is to **historise that daily feed** and combine it
with antenna locations to compute, per critical place, a transparent
**resilience score**:

- **Operator redundancy** — how many *distinct* operators have an active 4G site
  nearby. More operators = more resilient.
- **Single point of failure (SPOF)** — a malus if only *one* site serves the place.
- **Recent outages** — a time-decayed malus for nearby `sites-indisponibles`
  events over the last 90 days.

It lives **inside** an existing fork of the Arcep app *Mon-Reseau-Mobile-v2*, as
a strictly **additive** layer.

### The 3 layers

| Layer | Table | Source | Role |
|-------|-------|--------|------|
| 1. Critical places | `critical_poi` | FINESS (hospitals), police, gendarmerie | the things we score |
| 2. Network sites | `network_site` | ANFR / existing Arcep `site` table | redundancy + SPOF |
| 3. Outages (archived daily) | `site_outage` | Arcep `sites-indisponibles` daily GeoJSON | recency penalty |

A 4th **optional / pluggable** layer (`operator_coverage`, theoretical coverage
`.gpkg`) refines per-operator coverage by point-in-polygon **if loaded**. The
score works fully **without** it.

---

## ⚖️ License notice (AGPL-3.0)

All **new ResiliaMap code** in the top-level directories `api/`, `web/`,
`ingest/`, `db/`, `tileserv/` and the new root files
(`docker-compose.resiliamap.yml`, `Makefile`, `*.resiliamap*`,
`README.ResiliaMap.md`, `CONTRIBUTING.ResiliaMap.md`) is licensed under the
**GNU Affero General Public License v3.0 or later (AGPL-3.0-or-later)**.

- **Why AGPL.** Transparency for a public-interest tool: anyone running a
  network-accessible instance must offer users the corresponding source. AGPL-3.0
  is one-way compatible with the **GPLv3** of the upstream Arcep fork, so the
  combined work remains distributable.
- **Upstream code is untouched.** The existing Arcep application — everything
  under `back_mrm/` (Django) and `front_mrm/` (Next.js), plus `docs/`, the root
  `Dockerfile`, `cron_*.py` and the repo root `README.md` — keeps **its own
  license** (see the repo root `LICENSE`) and is **REFERENCE ONLY**: ResiliaMap
  never modifies, moves or deletes any of it.
- **This file does not replace the root `LICENSE`.** It adds a license *notice*
  for the new code. See the root `LICENSE` for the upstream terms.

```
ResiliaMap — civic-tech network resilience map.
Copyright (C) 2026 ResiliaMap contributors.

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU Affero General Public License as published by the Free
Software Foundation, either version 3 of the License, or (at your option) any
later version. This program is distributed WITHOUT ANY WARRANTY. See the GNU
AGPL for more details: https://www.gnu.org/licenses/agpl-3.0.html
```

---

## Stack (imposed)

- **PostgreSQL 16 + PostGIS** (`postgis/postgis:16-3.4`)
- **pg_tileserv** (`pramsey/pg_tileserv`) for MVT vector tiles
- **Backend**: **Bun + Elysia** (TypeScript), read-only over the DB
- **Frontend**: **React + Vite + MapLibre GL JS + TanStack Query**
- **Basemap**: **key-free OpenStreetMap raster tiles** (no paid API keys)
- Everything **dockerised** via `docker-compose.resiliamap.yml`

---

## 🌍 Geo law (non-negotiable)

> The project is **wrong** if these are violated.

- **ALL metric computation is in Lambert 93 = EPSG:2154** (metres). **Never**
  compute distances/lengths in EPSG:4326.
- **WGS84 (4326) inputs are reprojected at ingestion:**
  `ST_Transform(ST_SetSRID(ST_MakePoint(lon,lat),4326),2154)`.
- The existing Arcep `site` table stores geometry in **EPSG:3857**; when read it
  is reprojected with `ST_Transform(geometry,2154)`.
- Large coverage polygons are **`ST_Subdivide`'d + GIST-indexed** at ingestion,
  or `ST_Intersects` is unusably slow.
- Every `geom` column is fixed to a **typed SRID 2154**, so a forgotten
  `ST_Transform` fails LOUD at insert time.
- The map renders in **3857** (Web Mercator) and the API/tiles emit **4326**;
  frontend distances **never** feed back into scoring. Metric truth stays
  server-side in 2154.

---

## Architecture

```
                          data.gouv / Arcep (Licence Ouverte, ODbL)
   ┌───────────────┐  ┌───────────────┐  ┌──────────────────────────┐  ┌────────────────────┐
   │ FINESS / police│  │ ANFR sites    │  │ sites-indisponibles      │  │ couverture .gpkg   │
   │ / gendarmerie  │  │ + Arcep `site`│  │ DAILY GeoJSON (4326)      │  │ (OPTIONAL)         │
   │ CSV (4326)     │  │ (3857/4326)   │  │ {YYYY-MM-DD}/raw...geojson │  │ operateur_commercial│
   └──────┬─────────┘  └──────┬────────┘  └───────────┬──────────────┘  └─────────┬──────────┘
          │  ingest/ (Bun + TS)  reproject EVERYTHING -> EPSG:2154 at load        │ ogr2ogr
          ▼                     ▼                      ▼ (historised by date)     ▼ ST_Subdivide
   ┌────────────────────────────────────────────────────────────────────────────────────────┐
   │  PostgreSQL 16 + PostGIS                                                                 │
   │   critical_poi(2154)  network_site(2154)  site_outage(observed_date,2154)  operator_*(opt)│
   │   score_constants  ──►  mv_resilience_score (score 0..100, ST_DWithin in 2154 metres)    │
   │                          └─► v_poi_tiles (geom emitted as 4326)                          │
   └───────────────┬───────────────────────────────────────────────┬─────────────────────────┘
                   │ read-only                                       │ read-only
        ┌──────────▼───────────┐                        ┌────────────▼─────────────┐
        │ api/ (Bun + Elysia)  │                        │ pg_tileserv (MVT tiles)  │
        │ /api/poi /poi/:id    │                        │ v_poi_tiles, coverage    │
        │ /api/stats /health   │                        └────────────┬─────────────┘
        └──────────┬───────────┘                                     │
                   │ JSON / GeoJSON (4326)                            │ vector tiles (3857)
        ┌──────────▼─────────────────────────────────────────────────▼─────────────┐
        │ web/ React + Vite + MapLibre GL JS + TanStack Query                       │
        │ OSM raster basemap (key-free) · score color ramp · operator legend        │
        │ disclaimer banner: "Couverture simulée/indicative, non contractuelle"     │
        └──────────────────────────────────────────────────────────────────────────┘
```

---

## How to run

Prerequisites: Docker + Docker Compose; for local dev servers, [Bun](https://bun.sh).

```bash
# 0. One-time: create your env file and (optionally) activate gitignore rules
cp .env.resiliamap.example .env.resiliamap        # then edit secrets
cat .gitignore.resiliamap >> .gitignore           # optional, documented

# 1. Start the dockerised stack (PostGIS + tileserv + api + web)
docker compose -f docker-compose.resiliamap.yml --env-file .env.resiliamap up -d

# 2. Apply the schema (idempotent). On a FRESH volume the compose entrypoint
#    already applied db/resilience.sql; run this to (re)apply against any DB:
make db-init

# 3. Load data (sites + POI + today's outages) and refresh the score MV.
#    Read ingest/README.md FIRST — several dataset slugs / CSV columns are
#    TODO-marked and need a one-time real-file inspection before production.
make ingest-all

# 4. Local dev servers (alternative to the dockerised api/web)
make api-dev      # Bun + Elysia, hot reload  -> http://localhost:3801
make web-dev      # Vite dev server           -> http://localhost:5173

# 5. Refresh the score on demand (also run daily after the outages load)
make refresh-score
```

Default host ports (shifted off the Arcep `:8000` to avoid collisions): DB
`5440`, pg_tileserv `7801`, API `3801`, web (nginx) `8081`. All overridable in
`.env.resiliamap`.

`make help` lists every target.

---

## Score methodology & constants

Per critical POI, computed **entirely in EPSG:2154 metres**:

```
score = clamp(0..100, 100 * ( W_REDUNDANCY * redundancy_norm
                            - W_SPOF_MALUS  * spof_flag
                            - W_OUTAGE      * outage_norm ))
```

| Component | Rule | Default weight |
|-----------|------|----------------|
| `redundancy_norm` | `LEAST(distinct_active_4g_operators_within_R / REDUNDANCY_FULL_OPERATORS, 1)` | **W_REDUNDANCY = 1.0** |
| `spof_flag` (SPOF malus) | `1` when exactly one serving site within R, else `0` | **W_SPOF_MALUS = 0.25** |
| `outage_norm` (recent-outage malus) | `LEAST(decayed_outages / OUTAGE_SATURATION, 1)` where `decayed_outages = Σ 0.5^((today−observed_date)/OUTAGE_DECAY_HALFLIFE_DAYS)` over outages within R in the last `OUTAGE_WINDOW_DAYS` | **W_OUTAGE = 0.35** |
| clamp + uncovered | `n_sites = 0` ⇒ `score = 0`, `is_uncovered = true` | — |

### Documented named constants (`score_constants` table)

| key | default | rationale |
|-----|---------|-----------|
| `R_METERS` | `3000` | service/neighbourhood radius (m, EPSG:2154) for serving sites & nearby outages |
| `OUTAGE_WINDOW_DAYS` | `90` | look-back window for recent outages |
| `REDUNDANCY_FULL_OPERATORS` | `4` | distinct operators at which redundancy saturates (the four métropole MNOs) |
| `W_REDUNDANCY` | `1.0` | weight of the positive redundancy term (dominates) |
| `W_SPOF_MALUS` | `0.25` | penalty for a single serving site |
| `W_OUTAGE` | `0.35` | weight of recent-outage penalty |
| `OUTAGE_DECAY_HALFLIFE_DAYS` | `30` | half-life of outage time-decay |
| `OUTAGE_SATURATION` | `3.0` | `decayed_outages` at which the outage malus saturates to 1 |

Because `W_SPOF_MALUS + W_OUTAGE = 0.60 < W_REDUNDANCY = 1.0`, a fully-redundant
POI can never be driven negative by malus alone.

**Calibration.** All thresholds are **ARBITRARY defaults**. They are stored as
rows in `score_constants` and read by the materialized view via scalar
subqueries, so recalibration is a simple `UPDATE` + `make refresh-score` — **no
MV redefinition needed**. The score is **NOT a validated reliability metric**
until calibrated on a **pilot department** (urban density strongly affects `R`).

### Graceful degradation

- No coverage polygons loaded → uses **sites only** (the default).
- No outages loaded → the outage term is **0**.
- A POI with zero serving sites → **score 0**, `is_uncovered = true`.
- Operator coverage loaded → an operator can ALSO count as "serving" when its
  `ST_Subdivide`'d polygon `ST_Intersects` the POI (documented refinement).

---

## Operators (PK = MCC-MNC)

Colors are taken **exactly** from `back_mrm/data/operateurs.json` (verified).
Note **Free Mobile is `#4be1bb` (a teal), NOT red.**

| code (MCC-MNC) | name | color |
|----------------|------|-------|
| `20801` | Orange | `#ff8700` |
| `20810` | SFR | `#b54241` |
| `20820` | Bouygues | `#3dd0ff` |
| `20815` | Free | `#4be1bb` |

---

## Data sources & licenses

| Layer | Source | Format | License | Notes |
|-------|--------|--------|---------|-------|
| `site_outage` (CORE, archived daily) | Arcep `sites-indisponibles` (data.gouv object storage) | dated GeoJSON (4326) | Licence Ouverte / Etalab | URL `…/sites-indisponibles/all/{YYYY-MM-DD}/raw{YYYY-MM-DD}.geojson`, confirmed in `cron_update_site.py`. Date is Europe/Paris. |
| `network_site` | ANFR *donnees-sur-les-installations-radioelectriques-de-plus-de-5-watts-1* **and/or** existing Arcep `site` table | CSV `;` ANSI / `site` geom 3857 | Licence Ouverte / Etalab | reproject 3857→2154 or 4326→2154; only `has_4g` sites count. CSV column names **TODO**. |
| `critical_poi` santé | FINESS / `t_finess` (Atlasanté) | CSV | Licence Ouverte / Etalab | **MUST** filter to hospital/emergency categories or ~100k rows load. Category codes **TODO**. |
| `critical_poi` police | Min. Intérieur *services de police accueillant du public avec géolocalisation* | CSV | Licence Ouverte / Etalab | GPS column names + slug **TODO**. |
| `critical_poi` gendarmerie | *unités de gendarmerie accueillant du public* | CSV | Licence Ouverte / Etalab | `geocodage_x_gps` (lon) / `geocodage_y_gps` (lat). Slug **TODO**. |
| `operator_coverage` (OPTIONAL) | Arcep couverture théorique | GeoPackage `.gpkg`, table `couverture_theorique`, col `operateur_commercial` | Arcep / Etalab (indicative, non-contractual) | pluggable local file in `ingest/data/raw/`. Score works without it. |
| basemap | OpenStreetMap raster tiles | XYZ raster | **ODbL** (attribution required) | `https://tile.openstreetmap.org/{z}/{x}/{y}.png`, key-free. |

> ⚠️ Public CSV column names (FINESS, police, gendarmerie) and data.gouv dataset
> slugs are **unstable / undocumented**. Loaders use a defensive `pick()` over
> candidate column names and **fail loud (WARN + TODO log)** rather than silently
> guess. See `ingest/README.md` for the full list of one-time inspections to do
> before a production load.

---

## What is NOT touched (hard rule)

Nothing under `back_mrm/` or `front_mrm/` — nor `docs/`, the root `Dockerfile`,
`cron_*.py`, root `README.md` or root `LICENSE` — is modified, moved or deleted.
ResiliaMap reads the existing `site` table **read-only** and copies/reprojects
into `network_site`; it never alters the source table or Django migrations.

---

## Repository map (new ResiliaMap dirs only)

```
db/         SQL schema, materialized view, refresh helper, migration runner
ingest/     Bun + TS loaders (reproject to 2154; defensive column picking)
api/        Bun + Elysia read-only API (GeoJSON / JSON)
web/        React + Vite + MapLibre + TanStack Query frontend
tileserv/   pg_tileserv config
docker-compose.resiliamap.yml   Makefile   .env.resiliamap.example
.gitignore.resiliamap           README.ResiliaMap.md   CONTRIBUTING.ResiliaMap.md
```

See `CONTRIBUTING.ResiliaMap.md` for the contributor guide.
