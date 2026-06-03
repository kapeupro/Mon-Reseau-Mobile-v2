from datetime import datetime
from zoneinfo import ZoneInfo

import psycopg
from django.conf import settings
from psycopg import sql

from back_mrm.utils.db import Db

from .insert_csv import InsertCsv

CREATE_AT = datetime.now(tz=ZoneInfo("Europe/Paris"))
TYPE_IMPORT = "import statistique couverture region"
TABLE = "stats_couv_regions"
TABLE_FIELDS = [
    "techno",
    "operateur",
    "region",
    "couv_nc",
    "couv_cl",
    "couv_bc",
    "couv_tbc",
    "pop_nc",
    "pop_cl",
    "pop_bc",
    "pop_tbc",
]
SCHEMA = settings.DATABASE_SCHEMA


class CouvertureStatsRegion(InsertCsv):
    def __init__(self, files, data_type):
        InsertCsv.__init__(self, files, data_type)
        self.settable(TABLE)
        self.settablefields(TABLE_FIELDS)

    def readFile(self):
        return super().readfile()

    def readselected(self):
        file_not_csv, file_not_found = self.readfile()
        odb = Db()

        if file_not_csv:
            message = "Import a echoué. Fichier non csv trouvé : {}".format(",".join(file_not_csv))
            odb.insertlog(CREATE_AT, TYPE_IMPORT, False, message)

            return {"message": message, "success": False}

        if file_not_found:
            message = "Fichier(s) non trouvé(s) : {}".format(",".join(file_not_found))
            odb.insertlog(CREATE_AT, TYPE_IMPORT, False, message)

            return {"message": message, "success": False}

        self.createtablestatregion()
        response, file_copy = self.readcsvfile()

        if file_copy:
            self.copyfile(file_copy)

        self.updatestatcouvregion()

        message = response["message"] + " region importé avec succès"
        response["message"] = message

        odb.insertlog(CREATE_AT, TYPE_IMPORT, response["success"], response["message"])

        return response

    def updatestatcouvregion(self):
        if self.checkcolumnexists("code_operateur"):
            self.updatecodeoperateur()
        else:
            self.addcolumn("code_operateur", "text")
            self.updatecodeoperateur()

    def updatecodeoperateur(self):
        dbcon = psycopg.connect(settings.DATABASE_URL)
        dbcur = dbcon.cursor()
        query = sql.SQL("""
            update {schema}.{table} st 
            set code_operateur = {schema}.arcep_get_code_operateur(st.operateur, st.region)
        """).format(
            schema=sql.Identifier(SCHEMA),
            table=sql.Identifier(TABLE),
        )
        try:
            dbcur.execute(query)
            dbcon.commit()
            return True
        except psycopg.Error:
            return False
        finally:
            dbcur.close()

    def createtablestatregion(self):
        dbcon = psycopg.connect(settings.DATABASE_URL)
        dbcur = dbcon.cursor()
        query = sql.SQL("""
            CREATE TABLE IF NOT EXISTS {schema}.{table}
            (
                fid serial,
                techno character varying COLLATE pg_catalog."default",
                operateur character varying COLLATE pg_catalog."default",
                region character varying COLLATE pg_catalog."default",
                couv_nc numeric,
                couv_cl numeric,
                couv_bc numeric,
                couv_tbc numeric,
                pop_nc numeric,
                pop_cl numeric,
                pop_bc numeric,
                pop_tbc numeric,
                filename text COLLATE pg_catalog."default",
                code_operateur bigint,
                CONSTRAINT {table}_pkey PRIMARY KEY (fid)
            )

            TABLESPACE pg_default;

            ALTER TABLE IF EXISTS {schema}.{table}
                OWNER to postgres;
            
            """).format(
            schema=sql.Identifier(SCHEMA),
            table=sql.Identifier(self.table),
        )
        try:
            dbcur.execute(query)
            dbcon.commit()
            return True
        except psycopg.Error:
            return False
        finally:
            dbcur.close()
