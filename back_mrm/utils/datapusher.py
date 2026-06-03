import json
import os
from pathlib import Path

import psycopg
from django.conf import settings
from psycopg import sql

from back_mrm.utils.cmdprocess import execcmd


class Datapusher:
    def __init__(self):
        self.CONF_SRID_PATH = settings.BASE_DIR / "back_mrm/data"
        self.defaultsrid = 2154
        self.SCHEMA = settings.DATABASE_SCHEMA
        self.outputsrid = 3857
        self.error = None

    def getschema(self):
        return self.SCHEMA

    def setfiletopush(self, filetopush):
        self.filetopush = filetopush

    def getfiletopush(self):
        return self.filetopush

    def gettable(self):
        return self.table

    def settable(self, table):
        self.table = table

    def getsridconfig(self):
        return "srid.json"

    def getoutputsrid(self):
        return self.outputsrid

    def getdctsrid(self):
        file_conf_path = Path(self.CONF_SRID_PATH) / self.getsridconfig()

        if not os.path.exists(file_conf_path):
            return False

        try:
            with open(file_conf_path) as f:
                dctData = json.load(f)
        except Exception:
            return False

        return dctData

    def getsrid(self):
        dctsrid = self.getdctsrid()

        if not dctsrid:
            return self.defaultsrid  # case default

        lstfilename = self.getfiletopush().split("_")
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
        return self.defaultsrid

    def str_connect(self):
        conn_info = (
            f"PG:dbname='{settings.DATABASE_NAME}' "
            f"host='{settings.DATABASE_HOST}' "
            f"port='{settings.DATABASE_PORT}' "
            f"user='{settings.DATABASE_USER}' "
            f"password='{settings.DATABASE_PASSWORD}'"
        )

        return conn_info

    def getconnectorpg(self):
        strconnector = f"dbname='{settings.DATABASE_NAME}' host='{settings.DATABASE_HOST}' port='{settings.DATABASE_PORT}' user='{settings.DATABASE_USER}' password='{settings.DATABASE_PASSWORD}'"
        return strconnector

    def seterror(self, error):
        self.error = error

    def geterror(self):
        return self.error

    def execcmd(self, command):
        return execcmd(command)

    def checkcolumnexists(self, column):
        dbcon = psycopg.connect(settings.DATABASE_URL)
        dbcur = dbcon.cursor()

        query = """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = %s
            AND column_name = %s
        """
        params = (self.gettable(), column)
        dbcur.execute(query, params)

        exists = dbcur.fetchone() is not None
        dbcur.close()

        return exists

    def addcolumn(self, column_name, type_column):
        dbcon = psycopg.connect(settings.DATABASE_URL)
        dbcur = dbcon.cursor()
        try:
            dbcur.execute(f"""
                ALTER TABLE IF EXISTS {self.getschema()}.{self.gettable()}
                ADD COLUMN {column_name} {type_column};
                """)
            dbcon.commit()
            return True
        except psycopg.Error:
            return False
        finally:
            dbcur.close()

    def updatecolumn(self, column, value):
        dbcon = psycopg.connect(settings.DATABASE_URL)
        dbcur = dbcon.cursor()
        schema = self.getschema()
        table = self.gettable()

        query = sql.SQL("""
            UPDATE {}.{}
            SET {} = %s
            WHERE {} IS NULL
        """).format(
            sql.Identifier(schema),
            sql.Identifier(table),
            sql.Identifier(column),
            sql.Identifier(column),
        )
        params = (value,)
        try:
            dbcur.execute(query, params)
            dbcon.commit()
            return True
        except psycopg.Error:
            return False
        finally:
            dbcur.close()
