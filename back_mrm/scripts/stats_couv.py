import os

import pandas as pd
import psycopg
from django.conf import settings

# from django.utils.text import slugify
from sqlalchemy import create_engine

# import geopandas as gpd


BOOL_COLS = {}

COMA_DELIM_COLS = {}

DELIMITER = ","
ENCODING = {}

DECIMAL = "."


def get_dfs_from_files(folder, files):
    dfs = {}
    for file in files:
        filename = file.split(".")[0]
        file_path = folder / file
        df = pd.read_csv(
            file_path,
            delimiter=DELIMITER,
            header=0,
            encoding="utf-8",
            decimal=DECIMAL,
            low_memory=False,
        )
        dfs[filename] = df

    return dfs


def run():
    folder = settings.BASE_DIR / "data_test/stats_couvertures"
    files = os.listdir(folder)
    files = [file for file in files if file.split(".")[-1] == "csv"]

    dfs = get_dfs_from_files(folder, files)

    for table_name, df in dfs.items():
        key_label = "fid"
        engine = create_engine(settings.DATABASE_URL)
        df.to_sql(
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
