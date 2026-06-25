// ============================================================================
// ResiliaMap — ingest/poi.ts   (ingest:poi)
// ----------------------------------------------------------------------------
// Loads the critical POINTS OF INTEREST scored by ResiliaMap into critical_poi
// (geom EPSG:2154). Three data.gouv (Licence Ouverte) sources:
//
//   1. FINESS / t_finess (Atlasanté) — HEALTH establishments.
//      MUST FILTER to hospital/emergency categories, else ~100k structures load
//      and wreck the score's meaning and performance.   category='sante'
//
//   2. "services de police accueillant du public avec géolocalisation"
//      (Ministère de l'Intérieur).   category='securite' subcategory='police'
//
//   3. "unités de gendarmerie accueillant du public".
//      Uses geocodage_x_gps (lon) / geocodage_y_gps (lat).
//      category='securite' subcategory='gendarmerie'
//
// GEO LAW: all sources are WGS84 lon/lat -> reprojected to EPSG:2154 at insert:
//   ST_Transform(ST_SetSRID(ST_MakePoint(lon,lat),4326),2154).
//
// REFRESH STRATEGY: FULL refresh per source — DELETE FROM critical_poi WHERE
//   source=<src> then re-insert. Keeps the table consistent with each fresh
//   national export and is idempotent.
//
// COLUMN NAMES ARE UNSTABLE: every field uses defensive pick() with a TODO.
// data.gouv slugs are TODO-marked, not invented; resolve the latest CSV via the
// data.gouv API.
//
// USAGE:
//   bun run poi.ts                 # all three sources
//   bun run poi.ts finess          # one source: finess | police | gendarmerie
//   bun run poi.ts --file finess=data/raw/finess.csv   # load a local file
//   bun run poi.ts --no-refresh
//
// License: AGPL-3.0-or-later (ResiliaMap new code). See README.ResiliaMap.md.
// ============================================================================

import { parse } from "csv-parse/sync";
import { sql, closeDb, refreshScore } from "./db.ts";
import { pick, toNumber, isPlausibleLonLat, decodeBytes, jsonParam, type Row } from "./pick.ts";

const DATAGOUV_API = "https://www.data.gouv.fr/api/1";

// ---------------------------------------------------------------------------
// data.gouv slugs. Police + gendarmerie slugs VERIFIED live (HTTP 200) on
// 2026-06-25. FINESS slug also resolves (200) but its resource + category codes
// still need a one-time real-file inspection (see FINESS_HOSPITAL_CATEGORY_CODES).
// Every slug is overridable via env for resilience to data.gouv renames.
// ---------------------------------------------------------------------------
const SLUGS = {
  // FINESS / Atlasanté health establishments. TODO(one-time inspection): confirm
  // the geolocated CSV resource + the hospital category codes below.
  finess: process.env.FINESS_DATASET_SLUG ?? "finess-extraction-du-fichier-des-etablissements",
  // Ministère de l'Intérieur — police services accueillant du public (verified).
  police:
    process.env.POLICE_DATASET_SLUG ??
    "liste-des-services-de-police-accueillant-du-public-avec-geolocalisation",
  // Gendarmerie units accueillant du public (verified). GPS cols geocodage_x_gps/_y_gps.
  gendarmerie:
    process.env.GENDARMERIE_DATASET_SLUG ??
    "liste-des-unites-de-gendarmerie-accueillant-du-public-comprenant-leur-geolocalisation-et-leurs-horaires-douverture",
} as const;

type SourceName = keyof typeof SLUGS;

interface PoiRow {
  source: SourceName;
  source_id: string;
  name: string;
  category: "sante" | "securite";
  subcategory: string | null;
  address: string | null;
  insee_com: string | null;
  lon: number;
  lat: number;
}

// ---------------------------------------------------------------------------
// data.gouv resource resolution + download
// ---------------------------------------------------------------------------

async function resolveLatestCsvUrl(slug: string): Promise<string> {
  const api = `${DATAGOUV_API}/datasets/${slug}/`;
  const resp = await fetch(api, { headers: { Accept: "application/json" } });
  if (!resp.ok) {
    throw new Error(
      `[poi] data.gouv API ${resp.status} for slug "${slug}". ` +
        `TODO: pin the correct slug/resource URL via one-time inspection.`,
    );
  }
  const ds = (await resp.json()) as {
    resources?: Array<{
      url: string;
      title?: string;
      format?: string;
      last_modified?: string;
      created_at?: string;
    }>;
  };
  const resources = ds.resources ?? [];
  const csv = resources
    .filter((r) => {
      const fmt = (r.format ?? "").toLowerCase();
      const u = r.url.toLowerCase();
      return fmt === "csv" || u.endsWith(".csv") || u.endsWith(".txt");
    })
    .sort((a, b) => {
      const da = Date.parse(a.last_modified ?? a.created_at ?? "") || 0;
      const db = Date.parse(b.last_modified ?? b.created_at ?? "") || 0;
      return db - da;
    });
  if (csv.length === 0) {
    throw new Error(
      `[poi] no CSV resource on "${slug}". Resources: ` +
        `[${resources.map((r) => `${r.title}:${r.format}`).join(", ")}]. TODO: pin URL.`,
    );
  }
  console.log(`[poi] ${slug}: using ${csv[0]!.url}`);
  return csv[0]!.url;
}

/** Fetch + decode. Police/gendarmerie are usually UTF-8; FINESS is often latin1. */
async function fetchCsvText(url: string, encoding: "utf-8" | "latin1"): Promise<string> {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`[poi] download failed HTTP ${resp.status}: ${url}`);
  const buf = new Uint8Array(await resp.arrayBuffer());
  return decodeBytes(buf, encoding);
}

function parseCsv(text: string, delimiter: string): Row[] {
  return parse(text, {
    delimiter,
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    relax_quotes: true,
    bom: true,
    trim: true,
  }) as Row[];
}

// ---------------------------------------------------------------------------
// FINESS (health) — MUST filter to hospital/emergency categories
// ---------------------------------------------------------------------------

// TODO(one-time inspection): confirm the FINESS category codes for
// hospital/emergency establishments. The "categorie d'établissement" (categetab
// / codecategetab) uses MCO/CH/CHU/CHR/urgences codes; the exact numeric codes
// MUST be verified on a real t_finess extract. The list below is a DEFENSIVE
// allow-list of well-known hospital category codes — VERIFY before production.
// Examples frequently seen: 355 (Centre Hospitalier), 101 (CHR/CHU), 106, 365,
// 362 (établissement de soins…). DO NOT trust these blindly.
const FINESS_HOSPITAL_CATEGORY_CODES = new Set<string>(
  (process.env.FINESS_HOSPITAL_CODES ?? "101,106,355,362,365,366,412,414,696,698")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
);

// Fallback / complement: keyword match on the category LABEL when the code
// column is absent or unrecognised. Also defensive — TODO verify labels.
const FINESS_HOSPITAL_LABEL_NEEDLES = [
  "centre hospitalier",
  "hopital",
  "hôpital",
  "chu",
  "chr",
  "urgence",
  "soins",
  "clinique",
];

function isFinessHospital(row: Row): boolean {
  const code = pick(row, ["codecategetab", "categetab", "code_categorie", "categorie"], {
    context: "FINESS category code",
    todo: false,
  });
  if (code !== undefined && FINESS_HOSPITAL_CATEGORY_CODES.has(code)) return true;

  const label = pick(row, ["libcategetab", "categorie_libelle", "libelle_categorie", "libcourtcategetab"], {
    context: "FINESS category label",
    todo: false,
  });
  if (label !== undefined) {
    const v = label.toLowerCase();
    if (FINESS_HOSPITAL_LABEL_NEEDLES.some((n) => v.includes(n))) return true;
  }
  return false;
}

function finessRowToPoi(row: Row): PoiRow | null {
  if (!isFinessHospital(row)) return null; // MANDATORY filter — avoids ~100k rows

  // TODO(one-time inspection): confirm FINESS coordinate columns. Atlasanté
  // t_finess often ships coordinates in Lambert (coordxet/coordyet) with a
  // projection code, NOT WGS84. If only Lambert columns exist you must branch
  // on the projection column and ST_SetSRID accordingly. Candidates below
  // target WGS84 decimal columns; pick() WARNs if none match.
  const lon = toNumber(
    pick(row, ["longitude", "lon", "coordonnees_gps_longitude", "x_wgs84", "geo_longitude"], {
      context: "FINESS lon",
    }),
  );
  const lat = toNumber(
    pick(row, ["latitude", "lat", "coordonnees_gps_latitude", "y_wgs84", "geo_latitude"], {
      context: "FINESS lat",
    }),
  );
  if (!isPlausibleLonLat(lon, lat)) return null;

  const sourceId = pick(row, ["nofinesset", "finesset", "nofinessej", "finess", "id"], {
    context: "FINESS source_id",
    required: false,
  });
  if (!sourceId) return null; // no stable id -> cannot upsert reliably

  const name =
    pick(row, ["rs", "raisonsociale", "rslongue", "nom", "raison_sociale", "libelle"], {
      context: "FINESS name",
    }) ?? `Etablissement ${sourceId}`;

  const address = pick(row, ["adresse", "numvoie", "libvoie", "ligneacheminement", "commune"], {
    context: "FINESS address",
    todo: false,
  }) ?? null;

  const insee = pick(row, ["depcom", "codecommune", "insee", "codeinsee", "com_code"], {
    context: "FINESS insee",
    todo: false,
  }) ?? null;

  return {
    source: "finess",
    source_id: sourceId,
    name,
    category: "sante",
    subcategory: "hopital",
    address,
    insee_com: insee,
    lon: lon!,
    lat: lat!,
  };
}

// ---------------------------------------------------------------------------
// Police
// ---------------------------------------------------------------------------

function policeRowToPoi(row: Row, index: number): PoiRow | null {
  // TODO(one-time inspection): confirm police GPS column names. Min. Intérieur
  // "géolocalisés" files typically expose decimal lon/lat or a combined
  // "geocodage" pair. Candidates are defensive.
  const lon = toNumber(
    pick(row, ["longitude", "lon", "x", "geocodage_x_gps", "coordonnees_x", "gps_lon"], {
      context: "police lon",
    }),
  );
  const lat = toNumber(
    pick(row, ["latitude", "lat", "y", "geocodage_y_gps", "coordonnees_y", "gps_lat"], {
      context: "police lat",
    }),
  );
  if (!isPlausibleLonLat(lon, lat)) return null;

  const sourceId =
    pick(row, ["identifiant", "id", "code", "service", "code_service"], {
      context: "police source_id",
      todo: false,
    }) ?? `police-${index}`; // synthesise a stable-within-file id if absent

  const name =
    pick(row, ["service", "nom", "libelle", "designation", "circonscription"], {
      context: "police name",
    }) ?? "Service de police";

  const address = pick(row, ["adresse", "voie", "adresse_complete", "rue"], {
    context: "police address",
    todo: false,
  }) ?? null;

  const insee = pick(row, ["code_commune_insee", "insee", "code_insee", "commune_code"], {
    context: "police insee",
    todo: false,
  }) ?? null;

  return {
    source: "police",
    source_id: sourceId,
    name,
    category: "securite",
    subcategory: "police",
    address,
    insee_com: insee,
    lon: lon!,
    lat: lat!,
  };
}

// ---------------------------------------------------------------------------
// Gendarmerie — uses geocodage_x_gps / geocodage_y_gps
// ---------------------------------------------------------------------------

function gendarmerieRowToPoi(row: Row, index: number): PoiRow | null {
  // The gendarmerie dataset documents geocodage_x_gps (lon) / geocodage_y_gps
  // (lat). Keep these FIRST; fall back defensively.
  const lon = toNumber(
    pick(row, ["geocodage_x_gps", "longitude", "lon", "x_gps", "x"], {
      context: "gendarmerie lon",
    }),
  );
  const lat = toNumber(
    pick(row, ["geocodage_y_gps", "latitude", "lat", "y_gps", "y"], {
      context: "gendarmerie lat",
    }),
  );
  if (!isPlausibleLonLat(lon, lat)) return null;

  const sourceId =
    pick(row, ["identifiant", "id", "code_unite", "code", "matricule"], {
      context: "gendarmerie source_id",
      todo: false,
    }) ?? `gendarmerie-${index}`;

  const name =
    pick(row, ["libelle_unite", "nom", "libelle", "unite", "designation"], {
      context: "gendarmerie name",
    }) ?? "Unité de gendarmerie";

  const address = pick(row, ["adresse_geographique", "adresse", "voie", "adresse_complete"], {
    context: "gendarmerie address",
    todo: false,
  }) ?? null;

  const insee = pick(row, ["code_commune_insee", "insee", "code_insee", "commune_code"], {
    context: "gendarmerie insee",
    todo: false,
  }) ?? null;

  return {
    source: "gendarmerie",
    source_id: sourceId,
    name,
    category: "securite",
    subcategory: "gendarmerie",
    address,
    insee_com: insee,
    lon: lon!,
    lat: lat!,
  };
}

// ---------------------------------------------------------------------------
// Per-source loader config
// ---------------------------------------------------------------------------

interface SourceConfig {
  delimiter: string;
  encoding: "utf-8" | "latin1";
  map: (row: Row, index: number) => PoiRow | null;
}

const SOURCE_CONFIG: Record<SourceName, SourceConfig> = {
  // FINESS is historically latin1 and semicolon-delimited.
  finess: { delimiter: ";", encoding: "latin1", map: (r) => finessRowToPoi(r) },
  // Min. Intérieur / gendarmerie are usually UTF-8 + semicolon. Confirm on file.
  police: { delimiter: ";", encoding: "utf-8", map: policeRowToPoi },
  gendarmerie: { delimiter: ";", encoding: "utf-8", map: gendarmerieRowToPoi },
};

// ---------------------------------------------------------------------------
// Load one source (FULL refresh of that source's rows)
// ---------------------------------------------------------------------------

async function loadSource(source: SourceName, csvText: string): Promise<number> {
  const cfg = SOURCE_CONFIG[source];
  const records = parseCsv(csvText, cfg.delimiter);
  console.log(`[poi] ${source}: parsed ${records.length} rows.`);

  const rows: PoiRow[] = [];
  let skipped = 0;
  records.forEach((rec, i) => {
    const poi = cfg.map(rec, i);
    if (poi === null) {
      skipped++;
      return;
    }
    rows.push(poi);
  });
  console.log(`[poi] ${source}: kept ${rows.length} (skipped/filtered ${skipped}).`);

  if (rows.length === 0) {
    console.warn(
      `[poi] ${source}: 0 rows kept. Check column mappings / category filter (TODO markers).`,
    );
    return 0;
  }

  // FULL refresh of this source inside a transaction: DELETE then bulk insert.
  // UNIQUE(source, source_id) also guards against in-file dupes via ON CONFLICT.
  return sql.begin(async (tx) => {
    await tx`DELETE FROM critical_poi WHERE source = ${source}`;

    let inserted = 0;
    const BATCH = 1000;
    for (let i = 0; i < rows.length; i += BATCH) {
      const batch = rows.slice(i, i + BATCH);
      const res = await tx`
        INSERT INTO critical_poi
          (source, source_id, name, category, subcategory, address, insee_com, geom)
        SELECT
          x.source, x.source_id, x.name, x.category, x.subcategory, x.address, x.insee_com,
          -- GEO LAW: WGS84 -> Lambert 93 (EPSG:2154)
          ST_Transform(ST_SetSRID(ST_MakePoint(x.lon, x.lat), 4326), 2154)
        -- tx.json() binds the batch as one jsonb value (NOT pre-stringified +
        -- ::jsonb, which double-encodes and breaks jsonb_to_recordset).
        -- jsonParam() widens the typed array to porsager's JSONValue (see pick.ts).
        FROM jsonb_to_recordset(${tx.json(jsonParam(batch))})
          AS x(
            source      text,
            source_id   text,
            name        text,
            category    text,
            subcategory text,
            address     text,
            insee_com   text,
            lon         double precision,
            lat         double precision
          )
        ON CONFLICT (source, source_id) DO UPDATE
          SET name        = EXCLUDED.name,
              subcategory = EXCLUDED.subcategory,
              address     = EXCLUDED.address,
              insee_com   = EXCLUDED.insee_com,
              geom        = EXCLUDED.geom
      `;
      inserted += res.count;
    }
    console.log(`[poi] ${source}: inserted/updated ${inserted} critical_poi rows.`);
    return inserted;
  });
}

async function obtainCsv(
  source: SourceName,
  localFiles: Map<SourceName, string>,
): Promise<string> {
  const cfg = SOURCE_CONFIG[source];
  const local = localFiles.get(source);
  if (local) {
    console.log(`[poi] ${source}: reading local file ${local} (${cfg.encoding}).`);
    const buf = await Bun.file(local).arrayBuffer();
    return decodeBytes(new Uint8Array(buf), cfg.encoding);
  }
  const url = await resolveLatestCsvUrl(SLUGS[source]);
  return fetchCsvText(url, cfg.encoding);
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

export async function runPoi(argv: string[] = process.argv.slice(2)): Promise<number> {
  const refresh = !argv.includes("--no-refresh");

  // --file source=path (repeatable)
  const localFiles = new Map<SourceName, string>();
  argv.forEach((a, i) => {
    if (a === "--file") {
      const spec = argv[i + 1] ?? "";
      const [src, ...rest] = spec.split("=");
      if (src && rest.length && src in SLUGS) {
        localFiles.set(src as SourceName, rest.join("="));
      } else {
        console.warn(`[poi] ignoring malformed --file "${spec}" (expected source=path).`);
      }
    }
  });

  // Positional source selector (finess|police|gendarmerie). Default: all three.
  const selected = (argv.filter((a) => a in SLUGS) as SourceName[]);
  const sources: SourceName[] =
    selected.length > 0 ? selected : (Object.keys(SLUGS) as SourceName[]);

  let total = 0;
  for (const source of sources) {
    try {
      const csv = await obtainCsv(source, localFiles);
      total += await loadSource(source, csv);
    } catch (err) {
      // Do not let one flaky source abort the others; log loudly and continue.
      console.error(`[poi] ${source}: FAILED — ${(err as Error).message}`);
    }
  }

  if (refresh) await refreshScore();
  return total;
}

if (import.meta.main) {
  runPoi()
    .then(() => closeDb().then(() => process.exit(0)))
    .catch(async (err) => {
      console.error("[poi] FATAL:", err);
      await closeDb().catch(() => {});
      process.exit(1);
    });
}
