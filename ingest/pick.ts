// ============================================================================
// ResiliaMap — ingest/pick.ts
// ----------------------------------------------------------------------------
// Defensive column picking for UNSTABLE public CSV/GeoJSON schemas.
//
// The column names of the FINESS, police, gendarmerie and ANFR public files
// are unstable and undocumented. This helper tries a list of CANDIDATE names
// and returns the first present + non-empty value. When NONE match it WARNS
// loudly (with a TODO marker) and returns undefined — it NEVER silently guesses.
//
// Rule from the blueprint risks: "Loaders MUST use defensive pick() over
// candidate names and FAIL LOUD (WARN + TODO log) rather than silently guess."
//
// License: AGPL-3.0-or-later (ResiliaMap new code). See README.ResiliaMap.md.
// ============================================================================

export type Row = Record<string, unknown>;

/** Normalise a header for tolerant matching: lowercase, strip accents/spaces/punct. */
function normKey(k: string): string {
  return k
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[\s._-]+/g, "")
    .trim();
}

/** Build a normalised-key -> original-key index for a row (memoised per call). */
function buildIndex(row: Row): Map<string, string> {
  const idx = new Map<string, string>();
  for (const key of Object.keys(row)) {
    const nk = normKey(key);
    if (!idx.has(nk)) idx.set(nk, key);
  }
  return idx;
}

// De-dupe WARN spam: only warn once per (context, candidate-set) combination.
const warnedOnce = new Set<string>();

export interface PickOptions {
  /** Human label for logs, e.g. "FINESS lat". */
  context?: string;
  /** When true, an unmatched pick logs an explicit TODO (column needs inspection). */
  todo?: boolean;
  /** When true, throw instead of returning undefined (use for hard-required fields). */
  required?: boolean;
}

/**
 * Return the first present, non-empty value among `candidates` (matched
 * case/accent/separator-insensitively). Logs a WARN + TODO once when nothing
 * matches. Never guesses.
 */
export function pick(
  row: Row,
  candidates: string[],
  opts: PickOptions = {},
): string | undefined {
  const idx = buildIndex(row);
  for (const cand of candidates) {
    const origKey = idx.get(normKey(cand));
    if (origKey === undefined) continue;
    const raw = row[origKey];
    if (raw === null || raw === undefined) continue;
    const val = String(raw).trim();
    if (val === "" || val.toLowerCase() === "null" || val.toLowerCase() === "nan") continue;
    return val;
  }

  const ctx = opts.context ?? candidates[0] ?? "?";
  const warnKey = `${ctx}::${candidates.join(",")}`;
  if (!warnedOnce.has(warnKey)) {
    warnedOnce.add(warnKey);
    const todoTag = opts.todo === false ? "" : " TODO(one-time real-file inspection required)";
    console.warn(
      `[pick] WARN: no column matched for "${ctx}". Tried [${candidates.join(", ")}]. ` +
        `Available headers: [${Object.keys(row).join(", ")}].${todoTag}`,
    );
  }

  if (opts.required) {
    throw new Error(
      `[pick] REQUIRED column "${ctx}" not found. Tried [${candidates.join(", ")}]. ` +
        `Inspect the real file headers and update the candidate list.`,
    );
  }
  return undefined;
}

/**
 * Decode bytes with an explicit encoding label (e.g. "latin1"/"utf-8").
 * The ANFR/FINESS originals are ANSI/latin1; mislabelled UTF-8 decoding would
 * corrupt accented operator/establishment names. `@types/bun`'s TextDecoder
 * types the label too narrowly, so we widen to string here (the runtime label
 * set is much larger and includes "latin1"/"windows-1252").
 */
export function decodeBytes(bytes: Uint8Array, encoding: string): string {
  // `label` is a runtime-validated WHATWG encoding name; widen the type only.
  return new TextDecoder(encoding as unknown as "utf-8").decode(bytes);
}

/**
 * Parse a French/European coordinate string to a JS number.
 * Handles comma decimal separators ("48,85") and thousands spaces. Returns
 * undefined for empty / unparseable / out-of-range values. Does NOT clamp —
 * callers validate the WGS84 range.
 */
export function toNumber(value: string | undefined): number | undefined {
  if (value === undefined) return undefined;
  const cleaned = value.replace(/\s/g, "").replace(",", ".");
  // Guard empty/whitespace-only: Number("") is 0, which would silently become a
  // bogus 0°-meridian coordinate. The contract is empty -> undefined.
  if (cleaned === "") return undefined;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * Widen a JSON-serialisable array of typed rows to the loose `JSONValue` type
 * that porsager's `sql.json(...)` expects.
 *
 * Our loader row interfaces (OutageRow / SiteRow / PoiRow) are concrete shapes
 * and therefore lack the structural string index signature porsager's
 * `JSONValue` requires, so `sql.json(rows)` does NOT typecheck even though the
 * RUNTIME value is plain JSON (objects of string/number/null/jsonb). This helper
 * makes that soundness explicit in ONE place instead of scattering `as any`
 * casts across the loaders. We bind the batch as a single jsonb value and
 * expand it server-side with jsonb_to_recordset.
 *
 * It returns a `{ toJSON() }` wrapper: porsager serialises params via
 * JSON.stringify, which honours toJSON(), and `{ toJSON(): any }` is one of the
 * accepted shapes of porsager's `JSONValue` — so this typechecks WITHOUT
 * importing the postgres types here and WITHOUT any `as any`.
 */
export function jsonParam<T extends object>(
  rows: ReadonlyArray<T>,
): { toJSON(): ReadonlyArray<T> } {
  return { toJSON: () => rows };
}

/** True when (lon,lat) is a plausible WGS84 coordinate for metropolitan + DOM France. */
export function isPlausibleLonLat(lon: number | undefined, lat: number | undefined): boolean {
  if (lon === undefined || lat === undefined) return false;
  // Generous bbox covering métropole + overseas. Score works in métropole (2154)
  // but we don't drop DOM rows at the pick layer; the SRID-2154 insert is the
  // last guard. Reject the classic 0/0 null-island and obvious swaps elsewhere.
  if (lon === 0 && lat === 0) return false;
  return lon >= -65 && lon <= 56 && lat >= -25 && lat <= 52;
}
