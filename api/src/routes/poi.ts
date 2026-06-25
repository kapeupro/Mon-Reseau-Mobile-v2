// ============================================================================
// ResiliaMap API — src/routes/poi.ts
// ----------------------------------------------------------------------------
// GET /api/poi?bbox=minLon,minLat,maxLon,maxLat&category=sante|securite
//   -> GeoJSON FeatureCollection of critical POI in the bbox, each with its
//      resilience score + component breakdown from mv_resilience_score.
//
// GET /api/poi/:id
//   -> Full detail: score breakdown, serving operators (distinct operators with
//      an active 4G site within R, with nearest-site distance), and nearby
//      outages over the last OUTAGE_WINDOW_DAYS.
//
// GEO LAW:
//   * bbox arrives in 4326 -> ST_MakeEnvelope(...,4326) -> ST_Transform(...,2154)
//     -> ST_Intersects(poi.geom /*2154*/, env2154). Spatial filter is metric in
//     Lambert 93, never in degrees.
//   * R (radius) for serving/outage neighbourhood is read from the DB
//     score_constants table (single source of truth) so the API agrees with the
//     materialized view's own R. All ST_DWithin tests are in 2154 metres.
//   * Emitted geometry is ST_Transform(geom,4326) for MapLibre / OSM basemap.
//
// SECURITY: all user input flows through porsager tagged templates -> bound
//   parameters. No string concatenation of user input into SQL.
//
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================
import { Elysia } from "elysia";
import { sql } from "../db.ts";
import {
  ARCEP_DISCLAIMER,
  operatorColor,
  operatorName,
  R_METERS_DEFAULT,
  OUTAGE_WINDOW_DAYS_DEFAULT,
} from "../constants.ts";
import {
  parseBbox,
  parseCategory,
  parseId,
  type PoiFeature,
  type PoiFeatureCollection,
  type PoiDetail,
  type ServingOperator,
  type NearbyOutage,
  type CategoryValue,
} from "../schema.ts";

// ---------------------------------------------------------------------------
// Helper: read R_METERS and OUTAGE_WINDOW_DAYS from the DB score_constants
// table so the API uses the SAME radius/window as mv_resilience_score. Falls
// back to env-derived defaults if the table is somehow unavailable.
// ---------------------------------------------------------------------------
async function readConstants(): Promise<{ rMeters: number; windowDays: number }> {
  try {
    const rows = await sql<{ key: string; value: string }[]>`
      SELECT key, value::text AS value
      FROM score_constants
      WHERE key IN ('R_METERS', 'OUTAGE_WINDOW_DAYS')
    `;
    const map = new Map(rows.map((r) => [r.key, Number(r.value)]));
    return {
      rMeters: map.get("R_METERS") ?? R_METERS_DEFAULT,
      windowDays: map.get("OUTAGE_WINDOW_DAYS") ?? OUTAGE_WINDOW_DAYS_DEFAULT,
    };
  } catch {
    return { rMeters: R_METERS_DEFAULT, windowDays: OUTAGE_WINDOW_DAYS_DEFAULT };
  }
}

// ---------------------------------------------------------------------------
// Row shapes returned by the SQL below.
// ---------------------------------------------------------------------------
interface PoiListRow {
  id: number;
  name: string;
  category: CategoryValue;
  subcategory: string | null;
  lon: number;
  lat: number;
  score: number;
  is_uncovered: boolean;
  comp_redundancy: number;
  comp_spof_malus: number;
  comp_outage_malus: number;
  n_operators: number;
  n_sites: number;
  n_outages_90d: number;
}

export const poiRoutes = new Elysia()
  // -------------------------------------------------------------------------
  // GET /api/poi  (list within bbox)
  // -------------------------------------------------------------------------
  .get("/api/poi", async ({ query, set }) => {
    const bboxParsed = parseBbox(query.bbox as string | undefined);
    if (!bboxParsed.ok) {
      set.status = 400;
      return { error: bboxParsed.error };
    }
    const catParsed = parseCategory(query.category as string | undefined);
    if (!catParsed.ok) {
      set.status = 400;
      return { error: catParsed.error };
    }

    const { minLon, minLat, maxLon, maxLat } = bboxParsed.value;
    const category = catParsed.value; // CategoryValue | null
    const { rMeters, windowDays } = await readConstants();

    try {
      // Build the 2154 envelope from a 4326 bbox, filter critical_poi.geom (2154)
      // with ST_Intersects, and emit geometry back in 4326 for MapLibre.
      // n_outages_90d is recomputed against the window so the list matches the
      // mv breakdown semantics; the mv already stores n_outages within window.
      const rows = await sql<PoiListRow[]>`
        WITH env AS (
          SELECT ST_Transform(
                   ST_MakeEnvelope(${minLon}, ${minLat}, ${maxLon}, ${maxLat}, 4326),
                   2154
                 ) AS g
        )
        SELECT
          p.id,
          p.name,
          p.category,
          p.subcategory,
          ST_X(ST_Transform(p.geom, 4326)) AS lon,
          ST_Y(ST_Transform(p.geom, 4326)) AS lat,
          m.score,
          m.is_uncovered,
          m.comp_redundancy,
          m.comp_spof_malus,
          m.comp_outage_malus,
          m.n_operators,
          m.n_sites,
          m.n_outages AS n_outages_90d
        FROM critical_poi p
        JOIN mv_resilience_score m ON m.poi_id = p.id
        CROSS JOIN env
        WHERE ST_Intersects(p.geom, env.g)
          AND (${category}::text IS NULL OR p.category = ${category})
        ORDER BY m.score ASC, p.id ASC
        LIMIT 5000
      `;

      const features: PoiFeature[] = rows.map((r) => ({
        type: "Feature",
        id: Number(r.id),
        geometry: { type: "Point", coordinates: [r.lon, r.lat] },
        properties: {
          id: Number(r.id),
          name: r.name,
          category: r.category,
          subcategory: r.subcategory,
          score: Number(r.score),
          is_uncovered: r.is_uncovered,
          breakdown: {
            redundancy: Number(r.comp_redundancy),
            spof_malus: Number(r.comp_spof_malus),
            outage_malus: Number(r.comp_outage_malus),
            n_operators: Number(r.n_operators),
            n_sites: Number(r.n_sites),
            n_outages_90d: Number(r.n_outages_90d),
          },
        },
      }));

      const body: PoiFeatureCollection = {
        type: "FeatureCollection",
        features,
        meta: {
          count: features.length,
          constants: { R_METERS: rMeters, OUTAGE_WINDOW_DAYS: windowDays },
          disclaimer: ARCEP_DISCLAIMER,
        },
      };
      set.headers["content-type"] = "application/geo+json; charset=utf-8";
      return body;
    } catch (err) {
      set.status = 500;
      return { error: "internal_error", detail: String(err instanceof Error ? err.message : err) };
    }
  })

  // -------------------------------------------------------------------------
  // GET /api/poi/:id  (detail)
  // -------------------------------------------------------------------------
  .get("/api/poi/:id", async ({ params, set }) => {
    const idParsed = parseId(params.id);
    if (!idParsed.ok) {
      set.status = 400;
      return { error: idParsed.error };
    }
    const id = idParsed.value;
    const { rMeters, windowDays } = await readConstants();

    try {
      // 1) Base POI + score breakdown. 404 if not found.
      const baseRows = await sql<
        {
          id: number;
          name: string;
          category: CategoryValue;
          subcategory: string | null;
          address: string | null;
          insee_com: string | null;
          lon: number;
          lat: number;
          score: number;
          is_uncovered: boolean;
          comp_redundancy: number;
          comp_spof_malus: number;
          comp_outage_malus: number;
          n_operators: number;
          n_sites: number;
          n_outages_90d: number;
        }[]
      >`
        SELECT
          p.id,
          p.name,
          p.category,
          p.subcategory,
          p.address,
          p.insee_com,
          ST_X(ST_Transform(p.geom, 4326)) AS lon,
          ST_Y(ST_Transform(p.geom, 4326)) AS lat,
          m.score,
          m.is_uncovered,
          m.comp_redundancy,
          m.comp_spof_malus,
          m.comp_outage_malus,
          m.n_operators,
          m.n_sites,
          m.n_outages AS n_outages_90d
        FROM critical_poi p
        JOIN mv_resilience_score m ON m.poi_id = p.id
        WHERE p.id = ${id}
      `;

      const base = baseRows[0];
      if (!base) {
        set.status = 404;
        return { error: "poi_not_found", id };
      }

      // 2) Serving operators: distinct operators with an ACTIVE 4G site within R.
      //    All distance math in 2154 metres (ST_DWithin + ST_Distance).
      const servingRows = await sql<
        {
          operator_code: number;
          n_sites_within_r: number;
          nearest_site_m: number;
        }[]
      >`
        SELECT
          s.operator_code,
          count(*)::int                                  AS n_sites_within_r,
          round(min(ST_Distance(p.geom, s.geom)))::int   AS nearest_site_m
        FROM critical_poi p
        JOIN network_site s
          ON s.has_4g
         AND s.is_active
         AND ST_DWithin(p.geom, s.geom, ${rMeters})
        WHERE p.id = ${id}
        GROUP BY s.operator_code
        ORDER BY n_sites_within_r DESC, s.operator_code ASC
      `;

      const serving_operators: ServingOperator[] = servingRows.map((r) => {
        const code = Number(r.operator_code);
        return {
          code,
          name: operatorName(code) ?? `MNO ${code}`,
          color: operatorColor(code),
          n_sites_within_R: Number(r.n_sites_within_r),
          nearest_site_m: Number(r.nearest_site_m),
        };
      });

      // 3) Nearby outages over the window. Distance in 2154 metres.
      const outageRows = await sql<
        {
          observed_date: string;
          operator_code: number | null;
          distance_m: number;
        }[]
      >`
        SELECT
          to_char(o.observed_date, 'YYYY-MM-DD')         AS observed_date,
          o.operator_code,
          round(ST_Distance(p.geom, o.geom))::int        AS distance_m
        FROM critical_poi p
        JOIN site_outage o
          ON o.observed_date >= CURRENT_DATE - (${windowDays}::int || ' days')::interval
         AND ST_DWithin(p.geom, o.geom, ${rMeters})
        WHERE p.id = ${id}
        ORDER BY o.observed_date DESC, distance_m ASC
        LIMIT 500
      `;

      const nearby_outages: NearbyOutage[] = outageRows.map((r) => {
        const code = r.operator_code == null ? null : Number(r.operator_code);
        return {
          observed_date: r.observed_date,
          operator_code: code,
          operator_name: operatorName(code),
          distance_m: Number(r.distance_m),
        };
      });

      const body: PoiDetail = {
        id: Number(base.id),
        name: base.name,
        category: base.category,
        subcategory: base.subcategory,
        address: base.address,
        insee_com: base.insee_com,
        location: { lon: base.lon, lat: base.lat },
        score: Number(base.score),
        is_uncovered: base.is_uncovered,
        breakdown: {
          redundancy: Number(base.comp_redundancy),
          spof_malus: Number(base.comp_spof_malus),
          outage_malus: Number(base.comp_outage_malus),
          n_operators: Number(base.n_operators),
          n_sites: Number(base.n_sites),
          n_outages_90d: Number(base.n_outages_90d),
        },
        serving_operators,
        nearby_outages,
        constants: { R_METERS: rMeters, OUTAGE_WINDOW_DAYS: windowDays },
        disclaimer: ARCEP_DISCLAIMER,
      };
      return body;
    } catch (err) {
      set.status = 500;
      return { error: "internal_error", detail: String(err instanceof Error ? err.message : err) };
    }
  });
