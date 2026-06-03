import os

import geopandas as gpd
import pandas as pd
import psycopg
from django.conf import settings
from django.utils.text import slugify
from sqlalchemy import create_engine

BOOL_COLS = {
    "2023_QoS_Metropole_data_habitations.csv": (
        "page_chargee_moins_5s",
        "page_chargee_moins_10s",
        "video_en_qualite_parfaite",
        "video_en_qualite_correcte",
        "fichier_charge_en_moins_de_30s",
        "accroche_5g",
    ),
    "2023_QoS_Metropole_data_transports.csv": (
        "page_chargee_moins_5s",
        "page_chargee_moins_10s",
    ),
    "2023_QoS_Metropole_voix_habitations.csv": (
        "appel_2min",
        "sms_10s",
    ),
    "2023_QoS_Metropole_voix_transports.csv": (
        "appel_2min",
        "sms_10s",
    ),
}

COMA_DELIM_COLS = {
    "2023_QoS_Metropole_data_habitations.csv": (
        "rsrp",
        "debit_en_mbits",
        "temps_en_secondes",
        "delai_lancement_stream_s",
        "lag_stream_s",
        "latitude",
        "longitude",
    ),
    "2023_QoS_Metropole_data_transports.csv": (
        "rsrp",
        "temps_en_secondes",
        "latitude",
        "longitude",
    ),
    "2023_QoS_Metropole_voix_habitations.csv": (
        "latitude",
        "longitude",
        "delai_etablissement",
        "rsrp",
        "mos_1",
        "mos_2",
        "mos_3",
        "mos_4",
        "mos_5",
        "mos_6",
        "mos_7",
        "mos_8",
        "mos_dl_min",
        "mos_ul_min",
        "mos_dl_moy",
        "mos_ul_moy",
        "mosminglob",
        "mosmoyglob",
        "duree_sms",
        "temps_appel",
    ),
    "2023_QoS_Metropole_voix_transports.csv": (
        "latitude",
        "longitude",
        "delai_etablissement",
        "temps_appel",
        "rsrp",
        "mos_2",
        "mos_3",
        "mos_4",
        "mos_5",
        "mos_6",
        "mos_7",
        "mos_8",
        "mos_dl_min",
        "mos_ul_min",
        "mos_dl_moy",
        "mos_ul_moy",
        "mosminglob",
        "mosmoyglob",
        "mos_1",
        "duree_sms",
    ),
}

DELIMITER = ";"
ENCODING = {
    "2023_QoS_Metropole_data_habitations.csv": "ansi",
    "2023_QoS_Metropole_data_transports.csv": "ansi",
    "2023_QoS_Metropole_voix_habitations.csv": "ansi",
    "2023_QoS_Metropole_voix_transports.csv": "ansi",
}
DECIMAL = "."


def get_dfs_from_files(folder, files):
    dfs = {}

    for file in files:
        filename = file.split(".")[0]
        file_path = folder / file

        # read csv
        df = pd.read_csv(
            file_path,
            delimiter=DELIMITER,
            header=0,
            encoding=ENCODING[file],
            decimal=DECIMAL,
            low_memory=False,
        )

        # prepare column names for database insertion
        df.columns = [slugify(col).replace(" ", "").replace("-", "_") for col in df.columns]

        # create boolean fields
        for col in BOOL_COLS[file]:
            df[col] = df[col].replace({1: True, 0: False}).astype(bool)

        # add filename column
        df["filename"] = filename

        # fix coma delimiter errors
        for col in COMA_DELIM_COLS[file]:
            if df[col].dtype == "object":
                df[col] = df[col].str.replace(",", ".").replace("#VALEUR!", None).astype(float)

        dfs[filename] = df

    return dfs


def get_gdf_from_df(df, name, epsg=None):
    gdf = gpd.GeoDataFrame(
        df,
        geometry=gpd.points_from_xy(df["longitude"], df["latitude"]),
        crs="EPSG:4326",
    )

    if epsg:
        gdf = gdf.to_crs(epsg=epsg)

    return gdf


def run():
    folder = settings.BASE_DIR / "data_test/qualite/2023"
    files = os.listdir(folder)
    files = [file for file in files if file.split(".")[-1] == "csv"]

    dfs = get_dfs_from_files(folder, files)

    gdfs = {key: get_gdf_from_df(df, key, epsg="3857") for key, df in dfs.items()}

    for table_name, gdf in gdfs.items():
        table_name = table_name[5:]
        key_label = "fid"
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
            sql = 'ALTER TABLE {}."{}" ADD CONSTRAINT "{}_pk" PRIMARY KEY ({});'
            cursor.execute(
                sql.format(
                    settings.DATABASE_SCHEMA,
                    table_name,
                    table_name,
                    key_label,
                )
            )
        conn.commit()
        conn.close()
