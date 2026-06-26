// ============================================================================
// ResiliaMap API — constants.test.ts
// Operator enrichment + category guard. Run: `bun test`.
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================
import { describe, expect, test } from "bun:test";
import {
  OPERATORS,
  UNKNOWN_OPERATOR_COLOR,
  operatorName,
  operatorColor,
  isCategory,
} from "./constants.ts";

describe("operatorName", () => {
  test("known code -> name", () => expect(operatorName(20801)).toBe("Orange"));
  test("null -> null", () => expect(operatorName(null)).toBeNull());
  test("unknown code -> 'MNO <code>'", () => expect(operatorName(99999)).toBe("MNO 99999"));
});

describe("operatorColor", () => {
  // Free is teal #4be1bb, NOT red — guards the back_mrm/data/operateurs.json fidelity.
  test("Free color is the verified teal", () => expect(operatorColor(20815)).toBe("#4be1bb"));
  test("null -> unknown color", () => expect(operatorColor(null)).toBe(UNKNOWN_OPERATOR_COLOR));
  test("unknown code -> unknown color", () => expect(operatorColor(99999)).toBe(UNKNOWN_OPERATOR_COLOR));
});

describe("OPERATORS map fidelity", () => {
  test("exactly the 4 métropole MNOs", () => {
    expect(Object.keys(OPERATORS).map(Number).sort()).toEqual([20801, 20810, 20815, 20820]);
  });
  test("each entry's key matches its .code", () => {
    for (const [k, info] of Object.entries(OPERATORS)) expect(info.code).toBe(Number(k));
  });
  test("verified colors", () => {
    expect(OPERATORS[20801]?.color).toBe("#ff8700");
    expect(OPERATORS[20810]?.color).toBe("#b54241");
    expect(OPERATORS[20820]?.color).toBe("#3dd0ff");
    expect(OPERATORS[20815]?.color).toBe("#4be1bb");
  });
});

describe("isCategory", () => {
  test("true for valid categories", () => {
    expect(isCategory("sante")).toBe(true);
    expect(isCategory("securite")).toBe(true);
  });
  test("false for junk / non-strings", () => {
    expect(isCategory("foo")).toBe(false);
    expect(isCategory(null)).toBe(false);
    expect(isCategory(42)).toBe(false);
  });
});
