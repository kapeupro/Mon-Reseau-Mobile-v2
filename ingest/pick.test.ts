// ============================================================================
// ResiliaMap — pick.test.ts
// Defensive column picking + coordinate parsing (no DB, no network).
// Run: `bun test`.
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================
import { describe, expect, test } from "bun:test";
import { pick, toNumber, isPlausibleLonLat } from "./pick.ts";

describe("pick", () => {
  test("matches accent/case/separator-insensitively", () => {
    const row = { "Coordonnées Latitude": "48.85" };
    expect(pick(row, ["coordonnees_latitude"])).toBe("48.85");
  });
  test("returns the first non-empty candidate", () => {
    const row = { a: "", b: "  ", c: "value" };
    expect(pick(row, ["a", "b", "c"])).toBe("value");
  });
  test("skips empty / 'null' / 'nan' sentinels", () => {
    expect(pick({ x: "null" }, ["x"])).toBeUndefined();
    expect(pick({ x: "NaN" }, ["x"])).toBeUndefined();
    expect(pick({ x: "" }, ["x"])).toBeUndefined();
  });
  test("returns undefined when nothing matches (non-required)", () => {
    expect(pick({ a: "1" }, ["zzz"], { todo: false })).toBeUndefined();
  });
  test("throws when required and unmatched", () => {
    expect(() => pick({ a: "1" }, ["zzz"], { required: true, todo: false })).toThrow();
  });
  test("trims surrounding whitespace of the matched value", () => {
    expect(pick({ a: "  42 " }, ["a"])).toBe("42");
  });
});

describe("toNumber", () => {
  test("comma decimal", () => expect(toNumber("48,85")).toBe(48.85));
  test("thousands space", () => expect(toNumber("1 234,5")).toBe(1234.5));
  test("plain number", () => expect(toNumber("2.35")).toBe(2.35));
  test("empty -> undefined", () => expect(toNumber("")).toBeUndefined());
  test("junk -> undefined", () => expect(toNumber("abc")).toBeUndefined());
  test("undefined -> undefined", () => expect(toNumber(undefined)).toBeUndefined());
});

describe("isPlausibleLonLat", () => {
  test("Paris -> true", () => expect(isPlausibleLonLat(2.35, 48.85)).toBe(true));
  test("null-island 0/0 -> false", () => expect(isPlausibleLonLat(0, 0)).toBe(false));
  test("undefined -> false", () => {
    expect(isPlausibleLonLat(undefined, 48.85)).toBe(false);
    expect(isPlausibleLonLat(2.35, undefined)).toBe(false);
  });
  test("out-of-bbox lon -> false", () => expect(isPlausibleLonLat(200, 48.85)).toBe(false));
  test("DOM kept — Réunion -> true", () => expect(isPlausibleLonLat(55.5, -21)).toBe(true));
});
