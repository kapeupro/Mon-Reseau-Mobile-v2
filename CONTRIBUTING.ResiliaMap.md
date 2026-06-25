# Contributing to ResiliaMap

Thanks for helping build a transparent, public-interest map of network
resilience. This guide is intentionally short.

## Golden rules

1. **Never touch upstream Arcep code.** Everything under `back_mrm/` and
   `front_mrm/` (plus `docs/`, the root `Dockerfile`, `cron_*.py`, the root
   `README.md` and root `LICENSE`) is **REFERENCE ONLY**. Read it, never edit it.
   ResiliaMap lives only in `api/ web/ ingest/ db/ tileserv/` and clearly
   prefixed root files (`*.resiliamap*`, `README.ResiliaMap.md`, `Makefile`).
2. **Respect the geo law.** All metric math in **EPSG:2154** (metres). Reproject
   every WGS84 (4326) or Web-Mercator (3857) input at ingestion with
   `ST_Transform(...)`. Never compute distances in 4326. Every `geom` column is
   typed to SRID 2154 — keep it that way.
3. **Never silently guess public column names.** Public CSVs (FINESS, police,
   gendarmerie, ANFR) have unstable headers. Use the `pick()` helper over
   candidate names; when it falls through, **WARN + leave a `TODO`** — do not
   invent a value.
4. **Keep the score honest.** Thresholds live in the `score_constants` table, not
   in code or DDL literals. Document any new constant with a `rationale`. Always
   surface the Arcep disclaimer (simulated / indicative / non-contractual).
5. **License.** New code is **AGPL-3.0-or-later**. Add the SPDX header
   `// SPDX-License-Identifier: AGPL-3.0-or-later` to new source files. By
   contributing you agree your work is licensed under AGPL-3.0-or-later.

## Branch & workflow

- Work on `feature/resiliamap` or a topic branch off it.
- Conventional-ish commits: `db: …`, `ingest: …`, `api: …`, `web: …`, `docs: …`.
- Open a PR; describe data-source assumptions and any TODO you resolved (e.g. a
  confirmed FINESS category code or dataset slug).

## Local setup

```bash
cp .env.resiliamap.example .env.resiliamap
make db-up && make db-init        # PostGIS + schema
make ingest-all                   # load data (read ingest/README.md first)
make api-dev                      # or `make web-dev`
```

## Definition of done for a data loader

- Reprojects to 2154 (no 4326 distance math).
- Uses `pick()` for every unstable source column; logs WARN + TODO on fallthrough.
- Idempotent (safe to re-run; respects the table's UNIQUE constraint).
- Refreshes `mv_resilience_score` afterwards (`make refresh-score`).
- For FINESS specifically: **filters to hospital/emergency categories** (never
  loads the full ~100k structures).

## Reporting issues

Open an issue with the dataset URL/date, the offending column names, and a small
sample row (anonymised). For score questions, include the POI id and the
`score_constants` values in effect.
