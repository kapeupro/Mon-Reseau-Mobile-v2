# ============================================================================
# ResiliaMap — ingest/Dockerfile
# ----------------------------------------------------------------------------
# One-shot / cron ingestion container (Bun + TypeScript), with GDAL available
# for the OPTIONAL theoretical-coverage .gpkg loader (ogr2ogr). The core score
# does NOT need GDAL; it is only used by the pluggable coverage loader.
#
# Build context is ./ingest (see docker-compose.resiliamap.yml).
#
# Run examples (compose injects DATABASE_URL / OUTAGE_BASE_URL):
#   docker compose -f docker-compose.resiliamap.yml run --rm ingest                 # ingest:all
#   docker compose -f docker-compose.resiliamap.yml run --rm ingest bun run src/cron_outages.ts
#   docker compose -f docker-compose.resiliamap.yml run --rm ingest bun run pannes.ts --from 2026-06-01 --to 2026-06-20
#
# License: AGPL-3.0-or-later (ResiliaMap new code). See README.ResiliaMap.md.
# ============================================================================

FROM oven/bun:1-debian AS base

# GDAL (ogr2ogr) for the optional .gpkg coverage loader. Kept minimal.
# Remove this block if you never load theoretical coverage and want a leaner image.
RUN apt-get update \
 && apt-get install -y --no-install-recommends gdal-bin ca-certificates \
 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies first for better layer caching.
COPY package.json ./
# bun.lockb is optional; copy if present (no-op otherwise).
COPY bun.lock* ./
RUN bun install --no-save

# Copy the loaders.
COPY tsconfig.json ./
COPY *.ts ./
COPY src ./src

# Raw-download workdir (mounted as a volume in compose so files persist).
RUN mkdir -p /app/data/raw

# Default command: full ingestion run. Override per invocation as shown above.
CMD ["bun", "run", "index.ts"]
