import os
import shutil
import time
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import geopandas as gpd
import pandas as pd
import psycopg
from django.conf import settings
from sqlalchemy import create_engine

from back_mrm.utils.db import Db

FOLDER = Path(settings.IMPORT_FILE) / "site" / "site"
COPY_DESTINATION = Path(settings.IMPORT_FILE_COPY) / "site" / "site" / time.strftime("%Y%m%d-%H%M%S")
TYPE_IMPORT = "import site"
CREATE_AT = datetime.now(tz=ZoneInfo("Europe/Paris"))

BOOL_COLS = {
    "Metropole": [
        "site_2g",
        "site_3g",
        "site_4g",
        "site_5g",
        "mes_4g_trim",
        "site_ZB",
        "site_DCC",
        "site_strategique",
        "site_capa_240mbps",
        "site_5g_700_m_hz",
        "site_5g_800_m_hz",
        "site_5g_1800_m_hz",
        "site_5g_2100_m_hz",
        "site_5g_3500_m_hz",
    ],
    "Outremer": [
        "site_2g",
        "site_3g",
        "site_4g",
        "site_5g",
        "site_5g_700_m_hz",
        "site_5g_800_m_hz",
        "site_5g_1800_m_hz",
        "site_5g_2100_m_hz",
        "site_5g_3500_m_hz",
    ],
    "5G": [],
}

DELIMITER = {"Metropole": ";", "Outremer": ";", "5G": ","}
ENCODING = {"Metropole": "utf-8", "Outremer": "utf-8", "5G": "utf-8"}
DECIMAL = {"Metropole": ",", "Outremer": ",", "5G": "."}


def fix_mixed_encoding_error(file_path):
    with open(file_path, "rb") as fi:
        data = fi.read()

    data = data.replace(b"\xef", "ï".encode())
    data = data.replace(b"\xe9", "é".encode())

    with open(file_path, "wb") as fo:
        fo.write(data)


def find_ftype(file):
    ftype = ""
    if "Metropole" in file:
        ftype = "Metropole"
    elif "Outremer" in file:
        ftype = "Outremer"
    elif "5G" in file:
        ftype = "5G"

    return ftype


def get_dfs_from_files(folder, files, year, semester):
    dfs = {}

    for file in files:
        file_path = folder / file
        ftype = find_ftype(file)
        filename = file.split(".")[0]

        if ftype:
            df = pd.read_csv(
                file_path,
                delimiter=DELIMITER[ftype],
                header=0,
                encoding=ENCODING[ftype],
                decimal=DECIMAL[ftype],
            )
            df["filename"] = filename

            for cols in BOOL_COLS[ftype]:
                df = df.replace({cols: {1: True, 0: False}})

            dfs[ftype] = df

    dfs["full"] = pd.concat([dfs["Outremer"], dfs["Metropole"]], ignore_index=True)

    dfs["full"]["annee_donnee"] = year
    dfs["full"]["trimestre_donnee"] = semester

    return dfs


def get_gdf_from_df(df, epsg=None):
    gdf = gpd.GeoDataFrame(
        df,
        geometry=gpd.points_from_xy(df["longitude"], df["latitude"]),
        crs="EPSG:4326",
    )

    if epsg:
        gdf = gdf.to_crs(epsg=epsg)

    return gdf


def run():
    files = os.listdir(FOLDER)
    file_splitted = files[0].split("_")
    year = file_splitted[0]
    semester = file_splitted[1]
    dfs = get_dfs_from_files(FOLDER, files, year, semester)
    gdf = get_gdf_from_df(dfs["full"], epsg="3857")
    key_label = "fid"
    table_name = "site"
    engine = create_engine(settings.DATABASE_URL)
    gdf.to_postgis(
        name=table_name,
        con=engine,
        if_exists="replace",
        schema=settings.DATABASE_SCHEMA,
        index=True,
        index_label=key_label,
    )

    conn = psycopg.connect(settings.DATABASE_URL)
    with conn.cursor() as cursor:
        cursor.execute(
            f'ALTER TABLE {settings.DATABASE_SCHEMA}."{table_name}" ADD CONSTRAINT "{table_name}_pk" PRIMARY KEY ({key_label});'
        )
    conn.commit()
    conn.close()

    response = {"message": "Sites importés avec succès", "success": True}

    return response


def runselected(lst_file):
    if len(lst_file) > 2:
        response_data = run()
        copyfile(lst_file)
    else:
        message = "Les trois fichiers 5G, Metropole, Outremer ne sont pas tous présents"
        response_data = {"message": message, "success": False}

    odb = Db()
    odb.insertlog(CREATE_AT, TYPE_IMPORT, response_data["success"], response_data["message"])

    return response_data


def copyfile(lst_file):
    if not os.path.exists(COPY_DESTINATION):
        os.makedirs(COPY_DESTINATION)

    for file in lst_file:
        src = Path(FOLDER) / file
        if os.path.isfile(src):
            if shutil.copy(src, COPY_DESTINATION):
                os.remove(src)
            else:
                pass
