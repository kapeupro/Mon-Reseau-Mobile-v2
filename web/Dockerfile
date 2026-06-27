# ============================================================================
# ResiliaMap web — Dockerfile (multi-stage: Bun build -> nginx static serve)
# ----------------------------------------------------------------------------
# Build the Vite SPA, then serve it from nginx which ALSO reverse-proxies
# /api -> the api service and /tiles -> pg_tileserv (see nginx.conf.template).
#
# VITE_API_URL is baked at build time. In the compose stack it is "" (empty) so
# the browser makes same-origin /api/... requests that nginx proxies — no CORS,
# no hardcoded host. See docker-compose.resiliamap.yml.
#
# License: AGPL-3.0-or-later. See README.ResiliaMap.md.
# ============================================================================
FROM oven/bun:1-alpine AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
# Optional licensed/self-hosted basemap style for production (D2). Empty -> the
# key-free OSM raster fallback (dev only).
ARG VITE_BASEMAP_STYLE_URL=""
ENV VITE_BASEMAP_STYLE_URL=$VITE_BASEMAP_STYLE_URL
RUN bun run build

FROM nginx:1.27-alpine
# The official nginx entrypoint runs envsubst on *.template at startup, filling
# ${API_UPSTREAM} / ${TILESERV_UPSTREAM} from the container env (set by compose).
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
