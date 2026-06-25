# ============================================================================
# ResiliaMap API — Dockerfile (Bun + Elysia)
# ----------------------------------------------------------------------------
# Read-only JSON/GeoJSON API over the PostGIS resilience schema.
# License: AGPL-3.0-or-later. See README.ResiliaMap.md.
# ============================================================================
FROM oven/bun:1-alpine AS deps
WORKDIR /app
# Install dependencies first for better layer caching.
COPY package.json ./
# bun.lockb is optional; copy if present (no-op pattern via wildcard).
COPY bun.lock* ./
RUN bun install --production

FROM oven/bun:1-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
# API_PORT is provided by compose (.env.resiliamap). Default 3801 to match the
# compose mapping; code falls back to 3010 if API_PORT is unset entirely.
ENV API_PORT=3801
COPY --from=deps /app/node_modules ./node_modules
COPY package.json tsconfig.json ./
COPY src ./src

# Non-root for safety.
USER bun
EXPOSE 3801
CMD ["bun", "run", "src/index.ts"]
