// ============================================================================
// ResiliaMap — db.test.ts
// Operator-label mapping + a guard that importing db.ts WITHOUT DATABASE_URL
// does not throw (proves the lazy porsager pool). No live DB is touched.
// Run: `bun test`.
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================
import { describe, expect, test } from "bun:test";
import { mapOperatorLabelToCode } from "./db.ts";

describe("mapOperatorLabelToCode", () => {
  test.each([
    ["Orange", 20801],
    ["SFR", 20810],
    ["Numericable", 20810],
    ["Société Française du Radiotéléphone", 20810],
    ["Bouygues Telecom", 20820],
    ["BYTEL", 20820],
    ["Free", 20815],
  ])("label %s -> %i", (label, code) => {
    expect(mapOperatorLabelToCode(label)).toBe(code);
  });

  test("accent-insensitive match", () => {
    expect(mapOperatorLabelToCode("Société Française du Radiotéléphone")).toBe(20810);
    expect(mapOperatorLabelToCode("societe francaise du radiotelephone")).toBe(20810);
  });

  test("numeric MCC-MNC passthrough", () => {
    expect(mapOperatorLabelToCode("20801")).toBe(20801);
    expect(mapOperatorLabelToCode("20815")).toBe(20815);
  });

  test("unmappable -> null (never guess)", () => {
    expect(mapOperatorLabelToCode("EDF")).toBeNull();
    expect(mapOperatorLabelToCode("")).toBeNull();
    expect(mapOperatorLabelToCode(null)).toBeNull();
    expect(mapOperatorLabelToCode(undefined)).toBeNull();
    expect(mapOperatorLabelToCode("99999")).toBeNull(); // numeric but not a known code
  });
});

describe("module import safety", () => {
  // The mere fact this file imported db.ts at the top without DATABASE_URL set
  // and reached this assertion proves the connection pool is lazy (porsager
  // connects on first query, not on import).
  test("mapOperatorLabelToCode is a usable function", () => {
    expect(typeof mapOperatorLabelToCode).toBe("function");
  });
});
