import csv
import os
import shutil
import time
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import psycopg
from django.conf import settings
from psycopg import sql

from back_mrm.utils.cmdprocess import execcmd
from back_mrm.utils.data import Data
from back_mrm.utils.db import Db
from back_mrm.utils.file_analysis import FileAnalysis
from back_mrm.utils.pusher.csv import PusherCSV

SCHEMA = settings.DATABASE_SCHEMA
CREATE_AT = datetime.now(tz=ZoneInfo("Europe/Paris"))


class InsertCsv:
    def __init__(self, file, data_type):
        self.setfile(file)
        self.setfolder(data_type)
        self.settypeimport(data_type)
        self.setfoldercopy(data_type)

    def setfile(self, file):
        self.file = file

    def getfile(self):
        return self.file

    def settypeimport(self, data_type):
        odata = Data()
        self.type_import = odata.gettypeimport(data_type)

    def gettypeimport(self):
        return self.type_import

    def setfiles(self, files):
        self.lst_file = files

    def setfolder(self, data_type):
        odata = Data()
        self.folder = odata.getfolderdata(data_type)

    def getfolder(self):
        return self.folder

    def setfoldercopy(self, data_type):
        odata = Data()
        folderCopy = odata.getfoldercopy(data_type)
        timestr = time.strftime("%Y%m%d-%H%M%S")
        self.folder_copy = Path(folderCopy) / timestr

    def getfoldercopy(self):
        return self.folder_copy

    def copyfile(self, lst_file):
        if not os.path.exists(self.folder_copy):
            os.makedirs(self.folder_copy)

        for file in lst_file:
            src = Path(self.folder) / file
            if os.path.isfile(src):
                if shutil.copy(src, self.folder_copy):
                    os.remove(src)

    def settable(self, table):
        self.table = table

    def gettable(self):
        return self.table

    def settablefields(self, fields):
        self.table_fields = fields

    def checkcsvfile(self):
        path_file = Path(self.getfolder()) / self.getfile()

        converted_file = self.run_file_analysis(path_file)
        print(f"Résultat de l'analyse du fichier {self.getfile()} : {converted_file}")

        if os.path.isfile(path_file) and converted_file:
            extension = self.getfile().split(".")[-1]
            if extension == "csv":
                return True

        return False

    def run_file_analysis(self, filepath):
        o_file_analysis = FileAnalysis(filepath)
        res = o_file_analysis.writeConversion()

        return res

    def insertfiledata(self):
        odb = Db()
        path_file = Path(self.getfolder()) / self.getfile()
        opushercsv = PusherCSV(path_file, self.gettable(), odb)
        opushercsv.set_file(self.getfile())
        res = opushercsv.run()

        if res:
            filename = self.getfile().split(".")[0]
            self.setfilename(filename)

            odb.insertlog(CREATE_AT, self.gettypeimport(), True, "Fichier importé avec succès")
            odb.update_data_date("antennes-deploiements")

            data = {"success": True, "message": "Fichier importé avec succès"}
        else:
            odb.insertlog(CREATE_AT, self.gettypeimport(), False, opushercsv.geterror())

            data = {"success": False, "message": opushercsv.geterror()}

        return data

    def readfile(self):
        file_not_csv = []
        file_not_found = []

        for file in self.lst_file:
            path_file = Path(self.folder) / file
            if os.path.isfile(path_file):
                extension = file.split(".")[-1]
                if extension != "csv":
                    file_not_csv.append(file)
            else:
                file_not_found.append(file)

        return file_not_csv, file_not_found

    def readcsvfile(self):
        file_not_correct = []
        file_copy = []

        for file in self.lst_file:
            if self.checkcorrectdatafile(file):
                filename = file.split(".")[0]
                path_file = Path(self.folder) / file
                if os.path.exists(path_file):
                    self.insertdata(path_file, filename)
                    file_copy.append(file)
            else:
                file_not_correct.append(file)

        if file_not_correct:
            message = "Fichier ne correspond pas au colonne de la table : {} ".format(", ".join(file_not_correct))
            response = {"message": message, "success": False}
            return response, file_copy

        response = {"message": "Import statistique", "success": True}
        return response, file_copy

    def insertdata(self, path_file, filename):
        self.runcmdwithcreatetable(path_file)
        self.setfilename(filename)

    def execcmd(self, command):
        return execcmd(command)

    def runcmdwithcreatetable(self, filePath):
        cmdOptions = f""" -f PostgreSQL PG:"dbname='{settings.DATABASE_NAME}' host='{settings.DATABASE_HOST}' port='{settings.DATABASE_PORT}' user='{settings.DATABASE_USER}' password='{settings.DATABASE_PASSWORD}'"  {os.path.realpath(filePath)} -nln {SCHEMA}.{self.table} -append"""
        cmd = [settings.OGR_LIBRARY_PATH, cmdOptions]
        self.execcmd(cmd)

    def setfilename(self, filename):
        if self.checkcolumnexists("filename") or self.addcolumn("filename", "text"):
            self.updatecolumn("filename", filename)

    def checkcolumnexists(self, column):
        dbcon = psycopg.connect(settings.DATABASE_URL)
        dbcur = dbcon.cursor()
        query = sql.SQL("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_name = %s
            AND column_name = %s
        """)

        params = (self.gettable(), column)
        dbcur.execute(query, params)

        exists = dbcur.fetchone() is not None
        dbcur.close()

        return exists

    def addcolumn(self, column_name, type_column):
        dbcon = psycopg.connect(settings.DATABASE_URL)
        dbcur = dbcon.cursor()
        query = sql.SQL("""
            ALTER TABLE IF EXISTS {schema}.{table}
            ADD COLUMN {column} {type_col};
        """).format(
            schema=sql.Identifier(SCHEMA),
            table=sql.Identifier(self.gettable()),
            column=sql.Identifier(column_name),
            type_col=sql.Identifier(type_column),
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
            SET {col} = %s
            WHERE {col} is null;
        """).format(
            table=sql.Identifier(self.gettable()),
            col=sql.Identifier(column),
            schema=sql.Identifier(SCHEMA),
        )
        try:
            dbcur.execute(query, (value,))
            dbcon.commit()
            return True
        except psycopg.Error:
            return False
        finally:
            dbcur.close()

    def checkcorrectdatafile(self, file):
        try:
            file_path = Path(self.folder) / file
            with open(file_path) as csv_file:
                csv_reader = csv.reader(csv_file, delimiter=",")
                data_headers = next(csv_reader)

                if data_headers == self.table_fields:
                    return True
                return False
        except Exception:
            return False
