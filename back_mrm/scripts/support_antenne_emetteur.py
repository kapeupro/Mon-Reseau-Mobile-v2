import os
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from django.conf import settings
from psycopg import sql

from back_mrm.utils.data import Data
from back_mrm.utils.db import Db
from back_mrm.utils.pusher.csv import PusherCSV

SCHEMA = settings.DATABASE_SCHEMA
CREATE_AT = datetime.now(tz=ZoneInfo("Europe/Paris"))


class SupportAntenneEmetteur:
    def __init__(self, file, data_type, file_sabes):
        odata = Data()
        self.file = file
        self.file_sabes = file_sabes
        self.data_type = data_type
        self.folder = odata.getfolderdata(data_type)
        self.path_file = Path(self.folder) / self.file

    def insert_file_data(self):
        table_name = self.get_tablename()

        opushercsv = PusherCSV(self.path_file, table_name)
        opushercsv.set_file(self.file)
        res = opushercsv.run()
        odb = Db()

        if res:
            self.updatetablefilename(table_name)
            self.delete_file()
            odb.update_data_date("antennes-deploiements")
            data = {"success": True, "message": "Fichier importé avec succès"}
        else:
            data = {"success": False, "message": opushercsv.geterror()}

        odb.insertlog(CREATE_AT, self.get_type_import(), data["success"], data["message"])

        return data

    def updatetablefilename(self, tablename):
        odb = Db()

        query = sql.SQL("""
            UPDATE {schema}.{table}
            SET filename = %s
            WHERE filename is null
        """).format(
            schema=sql.Identifier(SCHEMA),
            table=sql.Identifier(tablename),
        )

        params = (self.file_sabes,)
        res = odb.queryparams(query, params)

        return res

    def get_type_import(self):
        filename = self.file.split(".")[0].lower()

        return f"Import {filename}"

    def get_tablename(self):
        filename = self.file.split(".")[0].lower()

        table_name = f"anfr_{filename}"

        return table_name

    def delete_file(self):
        if os.path.isfile(self.path_file):
            os.remove(self.path_file)
