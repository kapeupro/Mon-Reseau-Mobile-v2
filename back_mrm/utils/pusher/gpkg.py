import os
import pathlib
import shutil
import time
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import geopandas as gpd
from django.conf import settings
from psycopg import sql

from back_mrm.utils.data import Data
from back_mrm.utils.datapusher import Datapusher
from back_mrm.utils.db import Db

TYPE_IMPORT = "import couverture"
CREATE_AT = datetime.now(tz=ZoneInfo("Europe/Paris"))


class PusherGPKG(Datapusher):
    def __init__(self, file, table, data_type):
        super().__init__()
        self.setfiletopush(file)
        self.settable(table)
        self.setfolder(data_type)
        self.odb = Db()

    def setfolder(self, data_type):
        odata = Data()
        self.folder = odata.getfolderdata(data_type)

    def getfolder(self):
        return self.folder

    def setfoldercopy(self, data_type):
        odata = Data()
        foldercopy = odata.getfoldercopy(data_type)
        timestr = time.strftime("%Y%m%d-%H%M%S")
        self.folder_copy = Path(foldercopy) / timestr

    def getfoldercopy(self):
        return self.folder_copy

    def copyfile(self):
        if not os.path.exists(self.getfoldercopy()):
            os.makedirs(self.getfoldercopy())

        src = Path(self.getfolder()) / self.getfiletopush()
        if os.path.isfile(src):
            if shutil.copy(src, self.getfoldercopy()):
                os.remove(src)

    def setfilename(self, filename):
        if self.checkcolumnexists("filename") or self.addcolumn("filename", "text"):
            self.updatecolumn("filename", filename)

    def checkfileextension(self):
        path_file = Path(self.getfolder()) / self.getfiletopush()
        if os.path.isfile(path_file):
            extension = self.getfiletopush().split(".")[-1]
            if extension == "gpkg":
                return True

        return False

    def checkifsupportedfile(self):
        path_file = Path(self.getfolder()) / self.getfiletopush()
        datas = gpd.read_file(path_file, rows=0)
        columns_name = datas.columns.tolist()

        if "operateur_infra" in columns_name and "operateur_commercial" in columns_name:
            return True

        message = "Fichier non importé, manques colonnes operateur_infra et operateur_commercial"
        self.odb.insertlog(CREATE_AT, TYPE_IMPORT, False, message)
        return False

    def check_coherent_fields(self, type_import):
        path_file = Path(self.getfolder()) / self.getfiletopush()
        datas = gpd.read_file(path_file, rows=0)
        columns_name = datas.columns.tolist()

        table_fields = self.gettablefields()

        for field in columns_name:
            if field.lower() not in table_fields:
                self.odb.insertlog(
                    CREATE_AT, type_import, False, "Champs table et gpkg incohérents " + self.getfiletopush()
                )
                return False

        return True

    def gettablefields(self):
        query = sql.SQL("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = %s
            AND table_name = %s
        """)

        params = (settings.DATABASE_SCHEMA, self.gettable())

        results = self.odb.selectasarray(query, params)

        if results and len(results) != 0:
            column_names = [result["column_name"] for result in results]
            column_names = [name for name in column_names if name]
            return column_names
        return False

    def run(self, type_import):
        filePath = os.path.realpath(Path(self.getfolder()) / self.getfiletopush())
        file_path = pathlib.Path(os.path.realpath(filePath)).as_posix()
        cmd = [
            settings.OGR_LIBRARY_PATH,
            "-f",
            "PostgreSQL",
            self.str_connect(),
            "-s_srs",
            f"EPSG:{self.getsrid()}",
            "-t_srs",
            f"EPSG:{self.getoutputsrid()}",
            file_path,
            "-nlt",
            "PROMOTE_TO_MULTI",
            "-nln",
            f"{self.getschema()}.{self.gettable()}",
            "-append",
        ]

        res = self.execcmd(cmd)
        if not res:
            self.odb.insertlog(CREATE_AT, type_import, False, self.geterror())
            return False

        filename = self.getfiletopush().split(".")[0]
        self.setfilename(filename)
        self.odb.insertlog(CREATE_AT, type_import, True, "Fichier importé avec succès")

        table_name = self.gettable()
        if table_name == "couverture_theorique":
            self.odb.update_data_date("couverture-theorique")
        else:
            self.odb.update_data_date("zones-a-couvrir")

        return True
