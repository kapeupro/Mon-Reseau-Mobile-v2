// ============================================================================
// ResiliaMap API — schema.test.ts
// Pure query-param validators (no DB, no network). Run: `bun test`.
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================
import { describe, expect, test } from "bun:test";
import { parseBbox, parseCategory, parseId, parseOperator } from "./schema.ts";

describe("parseBbox", () => {
  test("valid Paris bbox", () => {
    expect(parseBbox("2.2,48.8,2.4,48.9")).toEqual({
      ok: true,
      value: { minLon: 2.2, minLat: 48.8, maxLon: 2.4, maxLat: 48.9 },
    });
  });
  test("trims whitespace around numbers", () => {
    expect(parseBbox(" 2.2 , 48.8 , 2.4 , 48.9 ").ok).toBe(true);
  });
  test("rejects wrong arity (3 parts)", () => expect(parseBbox("1,2,3").ok).toBe(false));
  test("rejects wrong arity (5 parts)", () => expect(parseBbox("1,2,3,4,5").ok).toBe(false));
  test("rejects non-finite", () => expect(parseBbox("a,b,c,d").ok).toBe(false));
  test("rejects out-of-WGS84-range lon", () => expect(parseBbox("0,0,200,10").ok).toBe(false));
  test("rejects out-of-WGS84-range lat", () => expect(parseBbox("0,0,10,95").ok).toBe(false));
  test("rejects inverted lon (min>=max)", () => expect(parseBbox("3,0,2,1").ok).toBe(false));
  test("rejects inverted lat (min>=max)", () => expect(parseBbox("0,3,1,2").ok).toBe(false));
  test("requires a value (undefined)", () => expect(parseBbox(undefined).ok).toBe(false));
  test("requires a value (empty)", () => expect(parseBbox("").ok).toBe(false));
});

describe("parseCategory", () => {
  test("empty -> null (no filter)", () => expect(parseCategory("")).toEqual({ ok: true, value: null }));
  test("undefined -> null", () => expect(parseCategory(undefined)).toEqual({ ok: true, value: null }));
  test("sante ok", () => expect(parseCategory("sante")).toEqual({ ok: true, value: "sante" }));
  test("securite ok", () => expect(parseCategory("securite")).toEqual({ ok: true, value: "securite" }));
  test("unknown -> 400", () => expect(parseCategory("foo").ok).toBe(false));
});

describe("parseId", () => {
  test("positive int", () => expect(parseId("42")).toEqual({ ok: true, value: 42 }));
  test("leading zeros accepted -> numeric value", () => expect(parseId("007")).toEqual({ ok: true, value: 7 }));
  test("zero rejected", () => expect(parseId("0").ok).toBe(false));
  test("negative rejected", () => expect(parseId("-1").ok).toBe(false));
  test("decimal rejected", () => expect(parseId("1.5").ok).toBe(false));
  test("non-numeric rejected", () => expect(parseId("abc").ok).toBe(false));
  test("empty/undefined required", () => {
    expect(parseId("").ok).toBe(false);
    expect(parseId(undefined).ok).toBe(false);
  });
  test("beyond safe-int rejected", () => expect(parseId("99999999999999999999").ok).toBe(false));
});

describe("parseOperator", () => {
  test("empty -> null", () => expect(parseOperator("")).toEqual({ ok: true, value: null }));
  test("undefined -> null", () => expect(parseOperator(undefined)).toEqual({ ok: true, value: null }));
  test.each([20801, 20810, 20820, 20815])("known code %i", (code) => {
    expect(parseOperator(String(code))).toEqual({ ok: true, value: code });
  });
  test("unknown numeric code -> 400", () => expect(parseOperator("99999").ok).toBe(false));
  test("non-numeric -> 400", () => expect(parseOperator("orange").ok).toBe(false));
});
