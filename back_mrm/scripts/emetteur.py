import argparse
import os
import shutil
import time
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import geopandas as gpd
import psycopg
from django.conf import settings
from psycopg import sql

from back_mrm.utils.db import Db

TYPE_IMPORT = "import emetteur link"
CREATE_AT = datetime.now(tz=ZoneInfo("Europe/Paris"))

FOLDER = Path(settings.IMPORT_FILE) / "site" / "emetteur"

COPY_DESTINATION = Path(settings.IMPORT_FILE_COPY) / "site" / "emetteur" / time.strftime("%Y%m%d-%H%M%S")

TABLE = "emetteurs_link"

SCHEMA = settings.DATABASE_SCHEMA

CONN = psycopg.connect(settings.DATABASE_URL)

CURSOR = CONN.cursor()


def executesql(sql):
    CURSOR.execute(sql)


def commitsql():
    CONN.commit()


def close():
    CURSOR.close()
    CONN.close()


def sqlcreatetable():
    sql = f"""
        CREATE TABLE IF NOT EXISTS {SCHEMA}.{TABLE}
        (
            id integer NOT NULL,
            emr_lb_systeme character varying COLLATE pg_catalog."default",
            a_conserver boolean,
            affichage character varying COLLATE pg_catalog."default",
            technologie character varying COLLATE pg_catalog."default",
            CONSTRAINT {TABLE}_pk PRIMARY KEY (id)
        )
        TABLESPACE pg_default;
        ALTER TABLE IF EXISTS {SCHEMA}.{TABLE} OWNER to postgres;
    """

    return sql


def createindex():
    sql = f"""
        CREATE INDEX IF NOT EXISTS {TABLE}_idx
        ON {SCHEMA}.{TABLE} USING btree
        (id ASC NULLS LAST)
        TABLESPACE pg_default;
    """

    return sql


def runselected(lst_file):
    lst_path_file = []
    for file in lst_file:
        path_file = Path(FOLDER) / file
        if os.path.isfile(path_file):
            lst_path_file.append(path_file)

    if lst_path_file:
        executesql(sqlcreatetable())
        executesql(createindex())
        readfile(lst_path_file)
        commitsql()
        copyfile(lst_path_file)
        response = {"message": "Emetteur link importés avec succès", "success": True}
    else:
        response = {"message": "Aucun fichier trouvé", "success": False}

    odb = Db()
    odb.insertlog(CREATE_AT, TYPE_IMPORT, response["success"], response["message"])

    return response


def copyfile(lst_path_file):
    if not os.path.exists(COPY_DESTINATION):
        os.makedirs(COPY_DESTINATION)

    for path_file in lst_path_file:
        if os.path.isfile(path_file):
            if shutil.copy(path_file, COPY_DESTINATION):
                os.remove(path_file)
            else:
                pass


def run():
    lst_path_file = []
    for file in os.listdir(FOLDER):
        path_file = Path(FOLDER) / file
        if os.path.isfile(path_file):
            lst_path_file.append(path_file)

    if lst_path_file:
        executesql(sqlcreatetable())
        executesql(createindex())
        readfile(lst_path_file)
        commitsql()
        close()


def readfile(lst_path_file):
    for path_file in lst_path_file:
        datas = gpd.read_file(path_file)
        insertsqldata(datas)


def insertsqldata(datas):
    for index, row in datas.iterrows():
        data = (index, row["EMR_LB_SYSTEME"], row["a_conserver"], row["affichage"], row["technologie"])

        query = sql.SQL("""
            INSERT INTO {schema}.{table}
            (id, emr_lb_systeme, a_conserver, affichage, technologie)
            VALUES
            (%s, %s, %s, %s, %s)
        """).format(schema=sql.Identifier(SCHEMA), table=sql.Identifier(TABLE))
        CURSOR.execute(query, data)


def main():
    parser = argparse.ArgumentParser(description="Exécute une fonction spécifique.")
    parser.add_argument("--function", type=str, help="Nom de la fonction à appeler")

    args = parser.parse_args()

    if args.function == "run":
        run()
    # Ajoutez ici d'autres conditions pour appeler différentes fonctions basées sur les arguments passés


if __name__ == "__main__":
    main()
