// ============================================================================
// ResiliaMap — ingest/sites.ts   (ingest:sites)
// ----------------------------------------------------------------------------
// Loads ACTIVE 4G-capable mobile sites into network_site (geom EPSG:2154).
// These power the resilience score's operator-redundancy term: distinct
// operators with an active 4G site within R of a critical POI.
//
// PRIMARY SOURCE: ANFR open data
//   "donnees-sur-les-installations-radioelectriques-de-plus-de-5-watts-1"
//   Format: SEMICOLON-delimited CSV/TXT, ANSI (latin1) encoding in the original.
//   We resolve the latest CSV resource via the data.gouv API, then stream-parse.
//
// ALTERNATIVE SOURCE (documented, not wired by default): the existing Arcep
//   `site` table (geom SRID 3857, columns code_op/nom_op/site_4g/latitude/
//   longitude). It is READ-ONLY reference. If you ever read it, reproject with
//   ST_Transform(geometry, 2154) and copy into network_site — NEVER alter it.
//   See README for the exact (commented) SQL; we do not touch back_mrm/ here.
//
// GEO LAW: ANFR coordinates are WGS84 (lon/lat). Reproject to EPSG:2154 at
//   insert: ST_Transform(ST_SetSRID(ST_MakePoint(lon,lat),4326),2154).
//
// COLUMN NAMES ARE UNSTABLE — every field is read via defensive pick() with a
// TODO marker. Confirm the real headers on a downloaded file before production.
//
// USAGE:
//   bun run sites.ts                         # resolve latest ANFR CSV, load
//   bun run sites.ts --file data/raw/anfr.csv  # load a local file you downloaded
//   bun run sites.ts --no-refresh
//
// License: AGPL-3.0-or-later (ResiliaMap new code). See README.ResiliaMap.md.
// ============================================================================

import { parse } from "csv-parse/sync";
import { sql, closeDb, refreshScore, mapOperatorLabelToCode } from "./db.ts";
import { pick, toNumber, isPlausibleLonLat, decodeBytes, jsonParam, type Row } from "./pick.ts";

// data.gouv dataset slug for ANFR ">5W" installations.
// TODO(one-time inspection): confirm this slug resolves to the intended dataset
// and that its latest CSV resource is the full national export (not a sample).
const ANFR_DATASET_SLUG =
  process.env.ANFR_DATASET_SLUG ??
  "donnees-sur-les-installations-radioelectriques-de-plus-de-5-watts-1";

const DATAGOUV_API = "https://www.data.gouv.fr/api/1";

interface SiteRow {
  source_site_id: string | null;
  operator_code: number;
  has_4g: boolean;
  lon: number;
  lat: number;
}

// ---------------------------------------------------------------------------
// Resolve + download the latest CSV resource
// ---------------------------------------------------------------------------

/** Pick the most recently published CSV/TXT resource URL from a data.gouv dataset. */
async function resolveLatestCsvUrl(slug: string): Promise<{ url: string; title: string }> {
  // Direct-URL override: ANFR ships the national export as ZIP archives (see
  // below), so the simplest functional path is to point at an already-unzipped
  // CSV/TXT (your own object store, or a mirror). Verified: this dataset has no
  // direct CSV resource — auto-fetch needs either this override or --file.
  const override = process.env.ANFR_CSV_URL;
  if (override) {
    console.log(`[sites] using ANFR_CSV_URL override -> ${override}`);
    return { url: override, title: "anfr-csv-url-override" };
  }

  const api = `${DATAGOUV_API}/datasets/${slug}/`;
  console.log(`[sites] resolving latest ANFR CSV via ${api}`);
  const resp = await fetch(api, { headers: { Accept: "application/json" } });
  if (!resp.ok) {
    throw new Error(`[sites] data.gouv API ${resp.status} for slug "${slug}". Pin the slug/URL.`);
  }
  const ds = (await resp.json()) as {
    resources?: Array<{
      url: string;
      title?: string;
      format?: string;
      filetype?: string;
      last_modified?: string;
      created_at?: string;
    }>;
  };
  const resources = ds.resources ?? [];
  const candidates = resources
    .filter((r) => {
      const fmt = (r.format ?? "").toLowerCase();
      const url = r.url.toLowerCase();
      return (
        fmt === "csv" ||
        fmt === "txt" ||
        url.endsWith(".csv") ||
        url.endsWith(".txt")
      );
    })
    .sort((a, b) => {
      const da = Date.parse(a.last_modified ?? a.created_at ?? "") || 0;
      const db = Date.parse(b.last_modified ?? b.created_at ?? "") || 0;
      return db - da;
    });

  if (candidates.length === 0) {
    // VERIFIED (2026-06-25): the ANFR ">5W" dataset publishes ONLY ZIP archives
    // ("*-export-etalab-data.zip" / "*-ref.zip"), not a direct CSV. Give an
    // actionable error instead of a cryptic "no CSV found".
    const zips = resources.filter(
      (r) => (r.format ?? "").toLowerCase() === "zip" || r.url.toLowerCase().endsWith(".zip"),
    );
    if (zips.length > 0) {
      throw new Error(
        `[sites] ANFR ships the national export as ZIP archives, not a direct CSV ` +
          `(dataset "${slug}", ${zips.length} zip resources; latest e.g. "${zips[0]!.title ?? "?"}"). ` +
          `Do ONE of:\n` +
          `  1) download the latest "*-export-etalab-data.zip", unzip it, then run:\n` +
          `       bun run sites.ts --file data/raw/<table>.csv\n` +
          `  2) set ANFR_CSV_URL to a direct CSV/TXT URL of an already-unzipped export.\n` +
          `TODO(one-time inspection): identify which table file inside the zip holds the ` +
          `per-site coordinates (Lambert 93 X/Y) + 4G band flag, and confirm its columns.`,
      );
    }
    throw new Error(
      `[sites] No CSV/TXT resource found on dataset "${slug}". ` +
        `Resources: [${resources.map((r) => `${r.title}:${r.format}`).join(", ")}]. ` +
        `Set ANFR_CSV_URL or use --file. TODO: pin the exact resource URL.`,
    );
  }
  const chosen = candidates[0]!;
  console.log(`[sites] using resource "${chosen.title ?? "?"}" -> ${chosen.url}`);
  return { url: chosen.url, title: chosen.title ?? "anfr" };
}

/** Fetch CSV bytes and decode from latin1/ANSI (the ANFR original encoding). */
async function fetchCsvText(url: string): Promise<string> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`[sites] download failed: HTTP ${resp.status} ${url}`);
  const buf = new Uint8Array(await resp.arrayBuffer());
  // ANFR original is ANSI/latin1. Decode explicitly; mislabelled UTF-8 would
  // corrupt accented operator names otherwise.
  return decodeBytes(buf, "latin1");
}

// ---------------------------------------------------------------------------
// Parse + map rows
// ---------------------------------------------------------------------------

/** Heuristic: does this row represent a 4G-capable site? */
function is4g(row: Row): boolean {
  // TODO(one-time inspection): confirm the 4G flag column. ANFR exports vary:
  // a "site_4g" boolean, a "generation"/"technologie" text ("4G"/"LTE"), or a
  // per-band breakdown. We accept several encodings and DEFAULT to true only
  // when no technology column exists at all (so a CSV without the column does
  // not silently drop every site — but logs a WARN once via pick()).
  const flag = pick(row, ["site_4g", "is_4g", "g4", "has_4g"], {
    context: "sites has_4g flag",
    todo: false,
  });
  if (flag !== undefined) {
    const v = flag.toLowerCase();
    return v === "1" || v === "true" || v === "t" || v === "oui" || v === "y";
  }
  const techno = pick(row, ["generation", "technologie", "technology", "techno", "systeme"], {
    context: "sites 4G techno",
    todo: false,
  });
  if (techno !== undefined) {
    const v = techno.toLowerCase();
    return v.includes("4g") || v.includes("lte");
  }
  // No 4G/techno column found at all -> we cannot tell; keep the site as 4G but
  // pick() already WARNed. Calibrate after inspecting the real headers.
  return true;
}

function rowToSite(row: Row): SiteRow | null {
  // Operator: ANFR carries an operator NAME (admin_emetteur / exploitant) and/or
  // a numeric code. Map to MCC-MNC. Rows we cannot map are dropped (logged) —
  // a site with no operator is useless for per-operator redundancy.
  // TODO(one-time inspection): confirm the operator column name.
  const operatorLabel = pick(row, [
    "code_op",
    "operateur",
    "admin_emetteur",
    "exploitant",
    "nom_operateur",
    "proprietaire",
  ], { context: "sites operator" });
  const operatorCode = mapOperatorLabelToCode(operatorLabel);
  if (operatorCode === null) {
    // Not one of the 4 métropole MNOs (or unmappable). Skip silently-but-counted.
    return null;
  }

  // Coordinates. ANFR has historically shipped DMS columns
  // (coordonnees_..._lat/lon as degrees-minutes-seconds) AND/OR decimal columns.
  // TODO(one-time inspection): confirm whether the chosen resource exposes
  // decimal lon/lat directly. The candidates below target the decimal columns;
  // if only DMS is present this pick() will WARN and you must add a DMS parser.
  const lonStr = pick(row, [
    "longitude",
    "lon",
    "x_wgs84",
    "geo_longitude",
    "coordonnees_longitude",
    "long",
  ], { context: "sites lon" });
  const latStr = pick(row, [
    "latitude",
    "lat",
    "y_wgs84",
    "geo_latitude",
    "coordonnees_latitude",
  ], { context: "sites lat" });

  const lon = toNumber(lonStr);
  const lat = toNumber(latStr);
  if (!isPlausibleLonLat(lon, lat)) return null;

  const sourceSiteId =
    pick(row, ["id_station_anfr", "num_site", "id_site", "sta_nm_anfr", "id", "gid"], {
      context: "sites source_site_id",
      todo: false,
    }) ?? null;

  return {
    source_site_id: sourceSiteId,
    operator_code: operatorCode,
    has_4g: is4g(row),
    lon: lon!,
    lat: lat!,
  };
}

// ---------------------------------------------------------------------------
// Load
// ---------------------------------------------------------------------------

async function loadSites(csvText: string, refresh: boolean): Promise<number> {
  // Semicolon-delimited; tolerate BOM and ragged rows. columns:true -> objects.
  const records = parse(csvText, {
    delimiter: ";",
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    relax_quotes: true,
    bom: true,
    trim: true,
  }) as Row[];

  console.log(`[sites] parsed ${records.length} CSV rows.`);

  const rows: SiteRow[] = [];
  let skippedNoOpOrGeo = 0;
  let only4g = 0;
  for (const rec of records) {
    const site = rowToSite(rec);
    if (site === null) {
      skippedNoOpOrGeo++;
      continue;
    }
    // Only 4G-capable sites count for redundancy (blueprint rule). We still
    // store is_active=true; outage status lives in site_outage.
    if (!site.has_4g) continue;
    only4g++;
    rows.push(site);
  }
  console.log(
    `[sites] mappable 4G sites: ${only4g} (skipped no-operator/no-geo: ${skippedNoOpOrGeo}).`,
  );

  if (rows.length === 0) {
    console.warn("[sites] nothing to load. Check column mappings (TODO markers above).");
    return 0;
  }

  // Full refresh per source-load: ANFR is a full national snapshot. We do an
  // UPSERT keyed by UNIQUE(operator_code, source_site_id). We do NOT TRUNCATE
  // because the existing-`site`-table path could coexist; dedupe via the key.
  let upserted = 0;
  const BATCH = 1000;
  for (let i = 0; i < rows.length; i += BATCH) {
    const batch = rows.slice(i, i + BATCH);
    const res = await sql`
      INSERT INTO network_site
        (source_site_id, operator_code, has_4g, is_active, geom)
      SELECT
        x.source_site_id,
        x.operator_code,
        x.has_4g,
        true,
        -- GEO LAW: WGS84 -> Lambert 93 (EPSG:2154)
        ST_Transform(ST_SetSRID(ST_MakePoint(x.lon, x.lat), 4326), 2154)
      -- sql.json() binds the batch as one jsonb value (NOT pre-stringified +
      -- ::jsonb, which double-encodes and breaks jsonb_to_recordset).
      -- jsonParam() widens the typed array to porsager's JSONValue (see pick.ts).
      FROM jsonb_to_recordset(${sql.json(jsonParam(batch))})
        AS x(
          source_site_id text,
          operator_code  bigint,
          has_4g         boolean,
          lon            double precision,
          lat            double precision
        )
      ON CONFLICT (operator_code, COALESCE(source_site_id, '')) DO UPDATE
        SET has_4g    = EXCLUDED.has_4g,
            is_active = true,
            geom      = EXCLUDED.geom,
            loaded_at = now()
    `;
    upserted += res.count;
  }

  console.log(`[sites] upserted ${upserted} network_site rows.`);
  if (refresh) await refreshScore();
  return upserted;
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

export async function runSites(argv: string[] = process.argv.slice(2)): Promise<number> {
  const fileIdx = argv.indexOf("--file");
  const localFile = fileIdx >= 0 ? argv[fileIdx + 1] : undefined;
  const refresh = !argv.includes("--no-refresh");

  let csvText: string;
  if (localFile) {
    console.log(`[sites] reading local file ${localFile} (decoding latin1) …`);
    const buf = await Bun.file(localFile).arrayBuffer();
    csvText = decodeBytes(new Uint8Array(buf), "latin1");
  } else {
    const { url } = await resolveLatestCsvUrl(ANFR_DATASET_SLUG);
    csvText = await fetchCsvText(url);
  }

  return loadSites(csvText, refresh);
}

if (import.meta.main) {
  runSites()
    .then(() => closeDb().then(() => process.exit(0)))
    .catch(async (err) => {
      console.error("[sites] FATAL:", err);
      await closeDb().catch(() => {});
      process.exit(1);
    });
}
