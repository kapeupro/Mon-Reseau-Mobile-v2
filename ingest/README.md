# ResiliaMap — Ingestion layer (`ingest/`)

Bun + TypeScript loaders that pull real Arcep / data.gouv layers into the
PostgreSQL 16 + PostGIS schema (`db/resilience.sql`) and refresh the resilience
score materialized view.

> **License:** AGPL-3.0-or-later (ResiliaMap new code). Additive to the GPLv3
> Arcep fork. Nothing under `back_mrm/` or `front_mrm/` is modified — the
> existing Arcep `site` table, if read, is **read-only reference**.

---

## GEO LAW (non-negotiable)

- **All** metric computation is in **Lambert 93 = EPSG:2154** (metres).
- WGS84 (4326) inputs are reprojected **at insert**:
  `ST_Transform(ST_SetSRID(ST_MakePoint(lon,lat),4326),2154)`.
- The existing Arcep `site` table is EPSG:**3857** — if you ever copy from it,
  `ST_Transform(geometry,2154)`. (Not wired by default; see "Sites" below.)
- Every `geom` column is a typed `geometry(..., 2154)` so a missing transform
  **fails loud at insert time** instead of producing silently-wrong distances.

---

## Scripts

| Command (in `ingest/`)        | What it does |
|-------------------------------|--------------|
| `bun run ingest:pannes`       | Download **today's** dated `sites-indisponibles` GeoJSON and historise it into `site_outage` (the archival core). |
| `bun run ingest:sites`        | Resolve the latest ANFR ">5W" CSV via the data.gouv API and load active **4G** sites into `network_site`. |
| `bun run ingest:poi`          | Load **FINESS** (hospitals, filtered) + **police** + **gendarmerie** into `critical_poi`. |
| `bun run ingest:all` / `bun run all` | sites → poi → pannes (today), then **one** MV refresh. |
| `bun run src/cron_outages.ts` | Daily cron: today's outages only, then refresh (used by `make ingest-outages`). |

All loaders accept `--no-refresh` to skip the MV refresh (used internally by
`ingest:all`, which refreshes once at the end).

### Examples

```bash
# from repo root: load env (DATABASE_URL etc.) then run a loader
set -a && source .env.resiliamap && set +a
cd ingest && bun install

bun run ingest:all                                  # full run
bun run pannes.ts                                   # today's outages
bun run pannes.ts --date 2026-06-20                 # one specific day
bun run pannes.ts --from 2026-06-01 --to 2026-06-20 # BACKFILL a range
bun run poi.ts finess                               # just FINESS hospitals
bun run sites.ts --file data/raw/anfr.csv           # load a locally-downloaded CSV
bun run poi.ts --file finess=data/raw/finess.csv    # local file per source
```

Or via the repo `Makefile`: `make ingest-all`, `make ingest-outages`.

Or dockerised (from repo root):

```bash
docker compose -f docker-compose.resiliamap.yml run --rm ingest                 # ingest:all
docker compose -f docker-compose.resiliamap.yml run --rm ingest bun run src/cron_outages.ts
```

---

## ⚠️ COLUMN-MAPPING CAVEAT (read before first production run)

The column names of the public FINESS / police / gendarmerie / ANFR files are
**unstable and undocumented**. Every field is read through a defensive
`pick(row, [candidates…])` (see `pick.ts`) that:

- tries several likely names (case/accent/separator-insensitive),
- returns the first present + non-empty value,
- and when **nothing** matches, logs a **`WARN … TODO`** once and returns
  `undefined` — it **never silently guesses**.

So the loaders are **runnable today**, but before trusting the output you MUST
do a one-time inspection of a real downloaded file and confirm/extend the
candidate lists. Search the code for `TODO(one-time` to find every spot.

### Open one-time inspections (the `TODO` list)

| File | What to confirm |
|------|-----------------|
| `pannes.ts` | site-id property name; operator label property name in `raw{date}.geojson`. |
| `sites.ts`  | ANFR dataset slug resolves to the full national export; operator column; the **4G flag / techno** column; whether coordinates are **decimal WGS84** or **DMS** (a DMS parser is needed if only DMS exists). |
| `poi.ts` (FINESS) | dataset slug; **hospital/emergency category codes** (`FINESS_HOSPITAL_CATEGORY_CODES`) — mandatory filter, else ~100k rows; coordinate columns (FINESS often ships **Lambert** `coordxet/coordyet`, **not** WGS84 — branch on the projection code if so). |
| `poi.ts` (police) | dataset slug; GPS column names; stable id column. |
| `poi.ts` (gendarmerie) | dataset slug; uses `geocodage_x_gps` (lon) / `geocodage_y_gps` (lat) per the documented schema. |

Override slugs / codes via env without editing code:
`ANFR_DATASET_SLUG`, `FINESS_DATASET_SLUG`, `POLICE_DATASET_SLUG`,
`GENDARMERIE_DATASET_SLUG`, `FINESS_HOSPITAL_CODES`.

---

## Operator label → MCC-MNC

Free-text operator names in the feeds are mapped to the four métropole MNO codes
in `db.ts` (`mapOperatorLabelToCode`): `20801` Orange, `20810` SFR,
`20820` Bouygues, `20815` Free. **Unmappable** outage rows are kept with
`operator_code = NULL` + full `raw_props` for audit (never dropped); unmappable
**site** rows are skipped (a site with no operator cannot contribute to
per-operator redundancy).

---

## Sites: ANFR CSV vs the existing Arcep `site` table

`sites.ts` loads the **ANFR ">5W"** CSV by default (semicolon, latin1/ANSI).

The existing Arcep `site` table (geom **3857**, columns `code_op`, `nom_op`,
`site_4g`, `latitude`, `longitude`) is an **alternative read-only source**. It is
**not wired** here so we never touch `back_mrm/`. If you ever want it, run this
**by hand** against the same DB (it only reads the source and writes our table):

```sql
-- READ-ONLY copy from the Arcep 'site' table into network_site, reprojecting
-- 3857 -> 2154. Never ALTER the source table or its Django migrations.
INSERT INTO network_site (source_site_id, operator_code, has_4g, is_active, geom)
SELECT s.id::text, s.code_op, COALESCE(s.site_4g, true), true,
       ST_Transform(s.geometry, 2154)   -- 3857 -> 2154
FROM site s
WHERE s.code_op IN (20801, 20810, 20820, 20815)
ON CONFLICT (operator_code, source_site_id) DO UPDATE
  SET has_4g = EXCLUDED.has_4g, geom = EXCLUDED.geom, loaded_at = now();
```

---

## Optional theoretical-coverage `.gpkg` loader (pluggable)

The resilience score **works without** coverage polygons and degrades
gracefully. If you obtain the Arcep `couverture_theorique` GeoPackage (operator
column `operateur_commercial`), load it once with GDAL (`ogr2ogr` is installed
in the ingest image):

```bash
# 1) import the .gpkg layer to a 4326 staging table
ogr2ogr -f PostgreSQL "PG:$DATABASE_URL" data/raw/couverture.gpkg \
  couverture_theorique -nln _cov_stage -t_srs EPSG:4326 -overwrite -lco GEOMETRY_NAME=geom

# 2) reproject -> 2154, ST_Subdivide (else ST_Intersects is unusably slow),
#    map operateur_commercial -> MCC-MNC, fill operator_coverage:
psql "$DATABASE_URL" <<'SQL'
INSERT INTO operator_coverage (operator_code, techno, geom)
SELECT
  CASE lower(operateur_commercial)
    WHEN 'orange' THEN 20801 WHEN 'sfr' THEN 20810
    WHEN 'bouygues telecom' THEN 20820 WHEN 'free mobile' THEN 20815
  END,
  '4g',
  ST_Subdivide(ST_Transform(ST_Multi(geom), 2154), 256)   -- 4326 -> 2154, subdivided
FROM _cov_stage
WHERE operateur_commercial IS NOT NULL;
DROP TABLE _cov_stage;
SQL
psql "$DATABASE_URL" -c "SELECT refresh_resilience_score();"
```

When `operator_coverage` is non-empty you can enable the point-in-polygon
refinement documented in `db/resilience.sql` (an operator also counts as
"serving" when its coverage polygon `ST_Intersects` the POI).

---

## Disclaimer (mandatory)

Coverage is **simulated / indicative, non-contractual** (Arcep). All score
thresholds (`R_METERS=3000`, `OUTAGE_WINDOW_DAYS=90`, weights, decay) are
**arbitrary defaults** stored in `score_constants` and **must be calibrated on a
pilot department** before the score is treated as a validated reliability metric.
