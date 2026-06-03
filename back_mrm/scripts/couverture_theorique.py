import json
import os
import pathlib
import shutil
import time
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import geopandas as gpd
import psycopg
from django.conf import settings
from django.contrib import messages
from psycopg import sql

from back_mrm.utils.cmdprocess import execcmd
from back_mrm.utils.db import Db

COLUMN_WHERE = "operateur_commercial"
FOLDER = Path(settings.IMPORT_FILE) / "couverture"
COPY_DESTINATION = Path(settings.IMPORT_FILE_COPY) / "couverture" / time.strftime("%Y%m%d-%H%M%S")
TABLE = "couverture_theorique"
SCHEMA = settings.DATABASE_SCHEMA
CONF_SRID_PATH = settings.BASE_DIR / "back_mrm/data"
TYPE_IMPORT = "import couverture"
CREATE_AT = datetime.now(tz=ZoneInfo("Europe/Paris"))


class Couverture:
    def __init__(self, file):
        self.lst_file = file

    def readallfile(self):
        lst_file_gpkg = []
        for file in os.listdir(FOLDER):
            extension = file.split(".")[-1]
            if extension == "gpkg":
                lst_file_gpkg.append(file)

        if lst_file_gpkg:
            response, file_copy = self.readgpkgfile(self.lst_file)

            if file_copy:
                self.copyfile(file_copy)

            messages.success("Fichier importé")

            return response
        return {"message": "Aucun fichier gpkg trouvé dans le dossier", "success": False}

    def readfile(self):
        not_file_gpkg = []
        not_file = []
        odb = Db()

        for file in self.lst_file:
            path_file = Path(FOLDER) / file
            if os.path.isfile(path_file):
                extension = file.split(".")[-1]
                if extension != "gpkg":
                    not_file_gpkg.append(file)
            else:
                not_file.append(file)

        if not_file_gpkg:
            message = "Import a echoué. Fichier non gpkg trouvé : {}".format(",".join(not_file_gpkg))
            odb.insertlog(CREATE_AT, TYPE_IMPORT, False, message)

            return {"message": message, "success": False}

        if not_file:
            message = "Fichier(s) non trouvé(s) : {}".format(",".join(not_file))
            odb.insertlog(CREATE_AT, TYPE_IMPORT, False, message)

            return {"message": message, "success": False}

        response, file_copy = self.readgpkgfile(self.lst_file)

        if file_copy:
            self.copyfile(file_copy)

        odb.insertlog(
            datetime.now(tz=ZoneInfo("Europe/Paris")), TYPE_IMPORT, response["success"], response["message_db"]
        )

        return response

    def copyfile(self, lst_file):
        if not os.path.exists(COPY_DESTINATION):
            os.makedirs(COPY_DESTINATION)

        for file in lst_file:
            src = Path(FOLDER) / file
            if Path.is_file(src):
                if shutil.copy(src, COPY_DESTINATION):
                    os.remove(src)

    def readgpkgfile(self, lst_file_gpkg):
        odb = Db()
        file_not_supported = []
        file_copy = []

        for file in lst_file_gpkg:
            filename = file.split(".")[0]
            input_file = Path(FOLDER) / file
            datas = gpd.read_file(input_file, rows=0)
            columns_name = datas.columns.tolist()

            if "operateur_infra" in columns_name and "operateur_commercial" in columns_name:
                self.insertData(input_file, filename)
                file_copy.append(file)
                message = f"Fichier {file} importé avec succès"
                odb.insertlog(CREATE_AT, TYPE_IMPORT, True, message)
            else:
                file_not_supported.append(file)
                message = f"Fichier {file} non importé, manques colonnes operateur_infra et operateur_commercial"
                odb.insertlog(CREATE_AT, TYPE_IMPORT, False, message)

        message = "Couvertures importés avec succès \n"
        message_db = "Couvertures importés avec succès"

        if file_not_supported:
            message = (
                message + " Fichier(s) non supporté(s), manques de colonnes : {}".format(" ,".join(file_not_supported)),
            )
            message_db = message_db + "Fichier manques colonnes operateur_infra et operateur_commercial : {}".format(
                " ,".join(file_not_supported)
            )
            response = {"message": message, "message_db": message_db, "success": False}
            return response, file_copy

        response = {"message": message, "message_db": message_db, "success": True}

        return response, file_copy

    def checktableexists(self):
        dbcon = psycopg.connect(settings.DATABASE_URL)
        dbcur = dbcon.cursor()

        query = sql.SQL("""
            SELECT COUNT(*)
            FROM information_schema.tables
            WHERE table_name = '{TABLE}'
        """)

        params = (TABLE,)
        dbcur.execute(query, params)

        if dbcur.fetchone()[0] == 1:
            dbcur.close()
            return True

        dbcur.close()
        return False

    def checkcolumnexists(self, column):
        dbcon = psycopg.connect(settings.DATABASE_URL)
        dbcur = dbcon.cursor()

        query = """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = %s
            AND column_name = %s
        """

        params = (TABLE, column)
        dbcur.execute(query, params)

        exists = dbcur.fetchone() is not None
        dbcur.close()

        return exists

    def execcmd(self, command):
        return execcmd(command)

    def str_connect(self):
        conn_info = (
            f"PG:dbname='{settings.DATABASE_NAME}' "
            f"host='{settings.DATABASE_HOST}' "
            f"port='{settings.DATABASE_PORT}' "
            f"user='{settings.DATABASE_USER}' "
            f"password='{settings.DATABASE_PASSWORD}'"
        )

        return conn_info

    def runcmdwithcreatetable(self, filePath, srid):
        file_path = pathlib.Path(os.path.realpath(filePath)).as_posix()
        cmd = [
            settings.OGR_LIBRARY_PATH,
            "-f",
            "PostgreSQL",
            self.str_connect(),
            "-s_srs",
            srid,
            "-t_srs",
            "EPSG:3857",
            file_path,
            "-nlt",
            "PROMOTE_TO_MULTI",
            "-nln",
            f"{SCHEMA}.{TABLE}",
            "-overwrite",
        ]
        self.execcmd(cmd)

    def runcmdwithoutcreatetable(self, filePath, srid):
        file_path = pathlib.Path(os.path.realpath(filePath)).as_posix()
        cmd = [
            settings.OGR_LIBRARY_PATH,
            "-f",
            "PostgreSQL",
            self.str_connect(),
            "-s_srs",
            srid,
            "-t_srs",
            "EPSG:3857",
            file_path,
            "-nlt",
            "PROMOTE_TO_MULTI",
            "-nln",
            f"{SCHEMA}.{TABLE}",
            "-append",
        ]

        self.execcmd(cmd)

    def addcolumn(self, column_name, type_column):
        dbcon = psycopg.connect(settings.DATABASE_URL)
        dbcur = dbcon.cursor()

        query = sql.SQL("""
            ALTER TABLE IF EXISTS {schema}.{table}
            ADD COLUMN {column} {type_column};
        """).format(
            schema=sql.Identifier(SCHEMA),
            table=sql.Identifier(TABLE),
            column=sql.Identifier(column_name),
            type_column=sql.Identifier(type_column),
        )
        try:
            dbcur.execute(query)
            dbcon.commit()
            return True
        except psycopg.Error:
            return False
        finally:
            dbcur.close()

    def updatecolumn(self, column, value):
        dbcon = psycopg.connect(settings.DATABASE_URL)
        dbcur = dbcon.cursor()
        query = sql.SQL("""
            UPDATE {schema}.{table}
            SET {column} = %s
            WHERE {column} is null;
        """).format(schema=sql.Identifier(SCHEMA), table=sql.Identifier(TABLE), column=sql.Identifier(column))
        params = (value,)
        try:
            dbcur.execute(query, params)
            dbcon.commit()
            return True
        except psycopg.Error:
            return False
        finally:
            dbcur.close()

    def getsridfile(self):
        return "srid.json"

    def getdctsrid(self):
        file_conf_path = Path(CONF_SRID_PATH) / self.getsridfile()

        if not os.path.exists(file_conf_path):
            return False

        try:
            with open(file_conf_path) as f:
                dctData = json.load(f)
        except Exception:
            return False

        return dctData

    def getsrid(self, filename):
        dctsrid = self.getdctsrid()
        lstfilename = filename.split("_")
        if "Metropole" in lstfilename:
            return dctsrid["metropole"]
        if "971" in lstfilename:
            return dctsrid["971"]
        if "972" in lstfilename:
            return dctsrid["972"]
        if "973" in lstfilename:
            return dctsrid["973"]
        if "974" in lstfilename:
            return dctsrid["974"]
        if "976" in lstfilename:
            return dctsrid["976"]
        if "977" in lstfilename:
            return dctsrid["977"]
        if "978" in lstfilename:
            return dctsrid["978"]

    def setfilename(self, filename):
        if self.checkcolumnexists("filename") or self.addcolumn("filename", "text"):
            self.updatecolumn("filename", filename)

    def insertdata(self, path_file, filename):
        srid = self.getsrid(filename)

        if self.checktableexists():
            self.runcmdwithoutcreatetable(path_file, srid)
            self.setfilename(filename)
        else:
            self.runcmdwithcreatetable(path_file, srid)
            self.setfilename(filename)

    def updateoperateurcouverture(self):
        dbcon = psycopg.connect(settings.DATABASE_URL)
        dbcur = dbcon.cursor()
        query = sql.SQL("""
            update {schema}.{table} ct set operateur = (
                select identifiant from {schema}.operateurs op where op.code = ct.{column} and 
                case 
                    when ct.dept = '971' then perimetre_971 = true 
                    when ct.dept = '972' then perimetre_972 = true
                    when ct.dept = '973' then perimetre_973 = true
                    when ct.dept = '974' then perimetre_974 = true
                    when ct.dept = '976' then perimetre_976 = true
                    when ct.dept = '977' then perimetre_977 = true
                    when ct.dept = '978' then perimetre_978 = true
                    else perimetre_metro = true
                end
                limit 1
            )
        """).format(schema=sql.Identifier(SCHEMA), table=sql.Identifier(TABLE), column=sql.Identifier(COLUMN_WHERE))
        try:
            dbcur.execute(query)
            dbcon.commit()
            return True
        except psycopg.Error:
            return False
        finally:
            dbcur.close()

    def generatetiles(self):
        dbcon = psycopg.connect(settings.DATABASE_URL)
        dbcur = dbcon.cursor()
        try:
            query = sql.SQL("""
                SELECT {schema}.lunch_generate_tiles_couverture();
                """).format(
                schema=sql.Identifier(SCHEMA),
            )

            dbcur.execute(query)

            query = sql.SQL("""
                SELECT {schema}.lunch_generate_tiles_couverture_tbc();
            """).format(
                schema=sql.Identifier(SCHEMA),
            )

            dbcur.execute(sql)
            dbcon.commit()
            return True

        except psycopg.Error as e:
            odb = Db()
            odb.insertlog(datetime.now(tz=ZoneInfo("Europe/Paris")), TYPE_IMPORT, False, {e})
            return False
        finally:
            dbcur.close()
            dbcon.close()
