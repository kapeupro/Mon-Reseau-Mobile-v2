#!/usr/bin/env python3
# ============================================================================
# ResiliaMap — ingest/anfr_sites.py
# ----------------------------------------------------------------------------
# Build the per-operator 4G `network_site` layer from the REAL ANFR open data
# ("Données sur les installations radioélectriques de plus de 5 watts").
#
# Why Python (not the Bun ingest): ANFR ships a multi-table ZIP (SUP_SUPPORT,
# SUP_STATION, SUP_EMETTEUR, …, hundreds of MB unzipped), not a flat CSV. This
# streams the big emitter file and joins in memory — trivial in Python, awkward
# in Bun. Output is a clean CSV (operator_code, source_site_id, lon, lat WGS84)
# that loads straight into network_site (see Makefile target `sites-anfr`).
#
# Join (VERIFIED 2026-06-25 on the 2026-05-31 export):
#   SUP_EMETTEUR.EMR_LB_SYSTEME LIKE '%LTE%'      -> stations that have 4G
#   SUP_STATION.ADM_ID in {23,137,6,240}          -> operator (Orange/SFR/Byg/Free)
#   SUP_SUPPORT (DMS coords -> WGS84)              -> site location
#
# Data source (data.gouv, Licence Ouverte):
#   dataset slug: donnees-sur-les-installations-radioelectriques-de-plus-de-5-watts-1
#   We pick the latest "*-export-etalab-data.zip" (supports/stations/emitters).
#   The operator-name table SUP_EXPLOITANT lives in the "*-ref.zip" but the four
#   métropole MNO ADM_IDs are stable, so the ref zip is not strictly required.
#
# Usage:
#   python3 ingest/anfr_sites.py                 # download latest zip + emit CSV
#   python3 ingest/anfr_sites.py --zip path.zip  # use a local data zip
#   ANFR_OUT=/path/network_sites.csv python3 ingest/anfr_sites.py
#
# License: AGPL-3.0-or-later. See README.ResiliaMap.md.
# ============================================================================
import csv
import io
import os
import sys
import urllib.request
import zipfile

DATAGOUV = "https://www.data.gouv.fr/api/1"
SLUG = os.environ.get(
    "ANFR_DATASET_SLUG",
    "donnees-sur-les-installations-radioelectriques-de-plus-de-5-watts-1",
)
OUT = os.environ.get("ANFR_OUT", "ingest/data/raw/network_sites.csv")

# ANFR exploitant ADM_ID -> MCC-MNC (the four métropole MNOs). Stable identifiers.
ADM_TO_CODE = {"23": 20801, "137": 20810, "6": 20820, "240": 20815}


def latest_data_zip_url() -> str:
    url = f"{DATAGOUV}/datasets/{SLUG}/"
    with urllib.request.urlopen(url, timeout=60) as r:
        import json

        ds = json.load(r)
    zips = [
        res
        for res in ds.get("resources", [])
        if res.get("format") == "zip"
        and "data" in res.get("url", "").lower()
        and "etalab" in res.get("url", "").lower()
    ]
    zips.sort(key=lambda r: r.get("last_modified") or r.get("created_at") or "", reverse=True)
    if not zips:
        sys.exit("[anfr] no '*-export-etalab-data.zip' resource found on the dataset")
    return zips[0]["url"]


def get_zip(path_arg: str | None) -> str:
    if path_arg:
        return path_arg
    dest = "ingest/data/raw/anfr_data.zip"
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    if not os.path.exists(dest):
        u = latest_data_zip_url()
        print(f"[anfr] downloading {u}", file=sys.stderr)
        urllib.request.urlretrieve(u, dest)
    return dest


def rows(zf: zipfile.ZipFile, name: str):
    with zf.open(name) as fh:
        for line in io.TextIOWrapper(fh, encoding="latin1"):
            yield line.rstrip("\n").rstrip("\r").split(";")


def dms(dg: str, mn: str, sc: str, hemi: str):
    try:
        v = float(dg) + float(mn) / 60.0 + float(sc) / 3600.0
    except ValueError:
        return None
    return -v if hemi in ("S", "W") else v


def main() -> None:
    zip_arg = None
    if "--zip" in sys.argv:
        zip_arg = sys.argv[sys.argv.index("--zip") + 1]
    zpath = get_zip(zip_arg)
    zf = zipfile.ZipFile(zpath)

    # 1) stations with at least one LTE (4G) emitter
    g = rows(zf, "SUP_EMETTEUR.txt"); next(g)
    sta_4g = {f[2] for f in g if len(f) > 2 and "LTE" in f[1]}
    print(f"[anfr] 4G (LTE) stations: {len(sta_4g):,}", file=sys.stderr)

    # 2) station -> operator code (only the 4 métropole MNOs)
    g = rows(zf, "SUP_STATION.txt"); next(g)
    sta_op = {f[0]: ADM_TO_CODE[f[1]] for f in g if len(f) > 1 and f[1] in ADM_TO_CODE}
    print(f"[anfr] MNO stations: {len(sta_op):,}", file=sys.stderr)

    # 3) supports -> emit (operator_code, station, lon, lat) for 4G MNO stations
    g = rows(zf, "SUP_SUPPORT.txt"); next(g)
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    seen = set()
    emitted = 0
    with open(OUT, "w", newline="") as out:
        w = csv.writer(out)
        for f in g:
            if len(f) < 11:
                continue
            sta = f[1]
            op = sta_op.get(sta)
            if op is None or sta not in sta_4g:
                continue
            key = (op, sta)
            if key in seen:
                continue
            lat = dms(f[3], f[4], f[5], f[6])
            lon = dms(f[7], f[8], f[9], f[10])
            if lat is None or lon is None:
                continue
            # métropole plausibility (drop DOM/TOM + junk; calibrate per pilot)
            if not (-5.5 < lon < 9.8 and 41.0 < lat < 51.5):
                continue
            seen.add(key)
            w.writerow([op, sta, f"{lon:.6f}", f"{lat:.6f}"])
            emitted += 1

    print(f"[anfr] wrote {emitted:,} 4G MNO sites -> {OUT}", file=sys.stderr)


if __name__ == "__main__":
    main()
