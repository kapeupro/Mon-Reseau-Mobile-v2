# ============================================================================
# ResiliaMap — Makefile
# ----------------------------------------------------------------------------
# Convenience targets for the ResiliaMap stack ONLY. Does NOT build or run the
# existing Arcep app (back_mrm / front_mrm). All commands use the dedicated
# compose file and env file.
#
# Quick start:
#   cp .env.resiliamap.example .env.resiliamap        # then edit secrets
#   make db-up           # start PostGIS + pg_tileserv
#   make db-init         # apply db/resilience.sql (schema + MV + seed)
#   make ingest-all      # load sites + POI + today's outages, refresh MV
#   make api-dev         # run the Bun/Elysia API locally (hot reload)
#   make web-dev         # run the Vite dev server locally
#
# License: AGPL-3.0-or-later (ResiliaMap new code). See README.ResiliaMap.md.
# ============================================================================

# --- config -----------------------------------------------------------------
COMPOSE_FILE := docker-compose.resiliamap.yml
ENV_FILE     := .env.resiliamap
COMPOSE      := docker compose -f $(COMPOSE_FILE) --env-file $(ENV_FILE)

# Load env file (if present) so host-side tooling (psql) sees the vars.
ifneq (,$(wildcard ./$(ENV_FILE)))
include $(ENV_FILE)
export
endif

# Host-side DATABASE_URL for psql run OUTSIDE the compose network.
# Falls back to the compose-internal values mapped to the host port.
PSQL_URL ?= postgres://$(POSTGRES_USER):$(POSTGRES_PASSWORD)@localhost:$(DB_HOST_PORT)/$(POSTGRES_DB)

.DEFAULT_GOAL := help
.PHONY: help env db-up db-down db-logs db-init db-psql ingest-all ingest-outages \
        sites-anfr refresh-score api-dev web-dev test up down logs ps clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

env: ## Create .env.resiliamap from the example if missing
	@test -f $(ENV_FILE) || (cp .env.resiliamap.example $(ENV_FILE) && echo "Created $(ENV_FILE) — edit it.")

# --- database ---------------------------------------------------------------
# NOTE: if the FIRST run fails to pull pramsey/pg_tileserv with
#   "docker-credential-<helper> executable file not found in $PATH"
# your ~/.docker/config.json references a credsStore whose helper is missing
# (common when Docker Desktop was uninstalled but docker/compose come from
# Homebrew). The images are PUBLIC and need no auth — pull once with a throwaway,
# empty docker config so the broken helper is never invoked:
#   mkdir -p /tmp/rm-docker-cfg && printf '{}' > /tmp/rm-docker-cfg/config.json
#   DOCKER_CONFIG=/tmp/rm-docker-cfg docker pull pramsey/pg_tileserv:latest
# Then `make db-up` works normally (image is local). Permanent fix: remove the
# dead "credsStore" key from ~/.docker/config.json (leave "auths": {}).
db-up: ## Start db + tileserv containers (see note above if the tileserv pull fails)
	$(COMPOSE) up -d db tileserv

db-down: ## Stop db + tileserv
	$(COMPOSE) stop db tileserv

db-logs: ## Tail db logs
	$(COMPOSE) logs -f db

db-init: ## Apply db schema + v2 features + read-only role. Idempotent.
	@echo "Applying db/00_extensions.sql + resilience.sql + v2_features.sql + 30_roles.sql to $(PSQL_URL)"
	psql "$(PSQL_URL)" -v ON_ERROR_STOP=1 -f db/00_extensions.sql
	psql "$(PSQL_URL)" -v ON_ERROR_STOP=1 -f db/resilience.sql
	psql "$(PSQL_URL)" -v ON_ERROR_STOP=1 -f db/v2_features.sql
	psql "$(PSQL_URL)" -v ON_ERROR_STOP=1 -f db/30_roles.sql
	@echo "Schema applied."

db-psql: ## Open a psql shell against the ResiliaMap DB
	psql "$(PSQL_URL)"

# --- ingestion --------------------------------------------------------------
ingest-all: ## Run all loaders (sites + POI + today's outages) + refresh MV
	cd ingest && bun install && bun run all

ingest-outages: ## Run ONLY today's outages loader + refresh MV (daily cron)
	cd ingest && bun install && bun run src/cron_outages.ts

sites-anfr: ## Build (ANFR ZIP -> CSV) + load the REAL per-operator 4G sites, refresh MV
	python3 ingest/anfr_sites.py
	psql "$(PSQL_URL)" -v ON_ERROR_STOP=1 -f db/load_anfr_sites.sql
	psql "$(PSQL_URL)" -v ON_ERROR_STOP=1 -f db/refresh_score.sql
	@echo "ANFR 4G sites loaded + score refreshed."

refresh-score: ## REFRESH MATERIALIZED VIEW mv_resilience_score
	psql "$(PSQL_URL)" -v ON_ERROR_STOP=1 -f db/refresh_score.sql

# --- application dev servers -------------------------------------------------
api-dev: ## Run the Bun/Elysia API locally with hot reload
	cd api && bun install && bun run dev

web-dev: ## Run the Vite dev server locally
	cd web && bun install && bun run dev

test: ## Run the ResiliaMap unit tests (api/ + ingest/ pure logic, no DB needed)
	cd api && bun test
	cd ingest && bun test

# --- whole stack ------------------------------------------------------------
up: ## Start the full dockerised stack (db, tileserv, api, web)
	$(COMPOSE) up -d db tileserv api web

down: ## Stop the full stack (keeps the data volume)
	$(COMPOSE) down

logs: ## Tail all service logs
	$(COMPOSE) logs -f

ps: ## Show stack status
	$(COMPOSE) ps

clean: ## Stop the stack AND DELETE the data volume (destructive)
	$(COMPOSE) down -v
