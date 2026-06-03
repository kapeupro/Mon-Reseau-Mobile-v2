import csv
import os
import shutil
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import pandas as pd
from django.conf import settings
from psycopg import sql

from back_mrm.utils.data import Data
from back_mrm.utils.db import Db
from back_mrm.utils.file_analysis import FileAnalysis
from back_mrm.utils.pusher.csv import PusherCSV

DECIMAL = "."
CURRENTFILE = "current_tmp.csv"


class ImportScript:
    ALLOWED_TABLES = [
        "stats_nbope",
        "stat_communes",
        "stat_departements",
        "stat_regions",
        "stat_territoires",
        "stats_nbope_couverture",
        "stats_couv_communes",
        "stats_couv_departements",
        "stats_couv_regions",
        "stats_couv_territoires",
        "emetteurs_link",
        "natures",
        "stats_qos_departements",
        "qos_density",
        "insee_density",
        "qos_stat",
        "zac_poi",
        "zac_site",
        "signalements",
        "qos",
        "anfr_sup_nature",
        "zac_poi_operateurs",
        "zac_site_operateurs",
        "signalement",
        "departement",
    ]

    TABLE_PAGE_MAPPING = {
        "stats_nbope": "couverture-theorique",
        "stat_communes": "couverture-theorique",
        "stat_departements": "couverture-theorique",
        "stat_regions": "couverture-theorique",
        "stat_territoires": "couverture-theorique",
        "emetteurs_link": "antennes-deploiements",
        "natures": "antennes-deploiements",
        "stats_qos_departements": "qualite-reseau",
        "qos_density": "qualite-reseau",
        "insee_density": "qualite-reseau",
        "zac_poi": "zones-a-couvrir",
        "zac_site": "zones-a-couvrir",
        "signalements": "signalements",
    }

    def __init__(self, filename, table, db=False):
        if not db:
            self.odb = Db()
        else:
            self.odb = db

        self.odata = Data()
        self.filename = filename
        self.table = self._validate_table(table)
        self.typeimport = self.odata.gettypeimport(self.table)
        self.filepath = Path(self.odata.getfolderdata(self.table)) / filename
        self.errormessage = ""
        self.number_total_line = 0

    def _validate_table(self, table_name):
        """Valide le nom de table contre la whitelist"""
        if table_name not in self.ALLOWED_TABLES:
            raise ValueError(f"Table non autorisée : {table_name}")
        return table_name

    def _get_schema_identifier(self):
        """Retourne l'identifiant de schéma sécurisé"""
        return sql.Identifier(settings.DATABASE_SCHEMA)

    def _get_table_identifier(self, tablename=None):
        """Retourne l'identifiant de table sécurisé"""
        if tablename is None:
            tablename = self.odata.gettablename(self.table)
        self._validate_table(tablename)
        return sql.Identifier(tablename)

    def set_number_line_in_file(self, number_total_line):
        self.number_total_line = number_total_line

    def get_number_line_in_file(self):
        return self.number_total_line

    def runimport(self):
        try:
            res = self.beforeimport()
            if not res:
                data = {"success": False, "message": "Erreur lors du traitement beforeImport"}
            elif not os.path.exists(self.filepath):
                data = {"success": False, "message": f"Fichier {self.filename} inexistant"}
            elif not self.run_file_analysis():
                data = {"success": False, "message": f"Erreur lors du réencodage du fichier {self.filename}"}
            else:
                tablename = self.odata.gettablename(self.table)

                table_fields = self.gettablefields(tablename)
                if not table_fields:
                    data = {"success": False, "message": f"Table {tablename} inexistante"}
                else:
                    is_csv_correct = self.checkcsvfields(table_fields, tablename)
                    if not is_csv_correct:
                        data = {"success": False, "message": "Champs table et csv incohérents : " + self.errormessage}
                    else:
                        opushercsv = PusherCSV(self.filepath, tablename, self.odb)
                        opushercsv.set_file(self.filename)
                        res = opushercsv.run()
                        self.set_number_line_in_file(opushercsv.get_number_line_in_file())
                        if not res:
                            if self.table == "zac_poi" or self.table == "zac_site":
                                self.remove_tmp_files()
                            data = {
                                "success": False,
                                "message": f"Erreur import pour {self.filename} : {opushercsv.geterror()}",
                            }
                        else:
                            is_table_updated = self.updatetablefilename()
                            if not is_table_updated:
                                data = {"success": False, "message": "Erreur lors de la mise à jour du nom du fichier"}
                                self.deletetablefilenamenull()
                            else:
                                data = {"success": True, "message": f"Fichier {self.filename} importé avec succès"}

                                res = self.afterimport()
                                if not res:
                                    data = {"success": False, "message": "Erreur lors du traitement afterImport"}
                                    self.deletetableonerror()
                                else:
                                    self.update_data_date()
        except Exception as e:
            data = {"success": False, "message": f"Erreur survenue : {e!s}"}

        self.odb.insertlog(datetime.now(tz=ZoneInfo("Europe/Paris")), self.typeimport, data["success"], data["message"])

        return data

    def update_data_date(self):
        page = self.TABLE_PAGE_MAPPING.get(self.table)
        if page:
            self.odb.update_data_date(page)

    def updatetablefilename(self):
        if self.table == "natures":
            self.return_file_to_normal()

        schema = self._get_schema_identifier()
        table = self._get_table_identifier()
        filename_value = self.filename

        query = sql.SQL("""
            UPDATE {schema}.{table}
            SET filename = %s
            WHERE filename IS NULL
        """).format(schema=schema, table=table)

        res = self.odb.queryparams(query, [filename_value])
        return res

    def deletetablefilenamenull(self):
        schema = self._get_schema_identifier()
        table = self._get_table_identifier()

        query = sql.SQL("""
            DELETE FROM {schema}.{table}
            WHERE filename IS NULL
        """).format(schema=schema, table=table)

        res = self.odb.query(query)
        return res

    def deletetableonerror(self):
        schema = self._get_schema_identifier()
        table = self._get_table_identifier()
        filename_value = self.filename

        query = sql.SQL("""
            DELETE FROM {schema}.{table}
            WHERE filename = %s
        """).format(schema=schema, table=table)

        res = self.odb.queryparams(query, [filename_value])
        return res

    def gettablefields(self, tablename):
        schema = settings.DATABASE_SCHEMA
        table_name = tablename

        # Validation de la table
        self._validate_table(table_name)

        params = [schema, table_name]

        query = sql.SQL("""
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = %s
            AND table_name = %s
        """)

        results = self.odb.selectasarray(query, params)

        if results:
            column_names = [result["column_name"] for result in results if result["column_name"]]
            return column_names
        return False

    def rename_csv_header(self):
        csv_header = pd.read_csv(
            self.filepath,
            low_memory=False,
            decimal=DECIMAL,
            encoding="utf-8",
            delimiter=self.get_delimiter(),
            index_col=None,
            nrows=None,
        ).columns.tolist()

        columns = {}
        columns_delete = []
        save = False

        if "service" in csv_header:
            columns["service"] = "protocole"
        if "id_mesure" in csv_header:
            columns["id_mesure"] = "id_measure"
        if "average_mos" in csv_header:
            columns_delete.append("average_mos")

        data = pd.read_csv(self.filepath, delimiter=self.get_delimiter(), low_memory=False)

        if columns:
            data.rename(columns=columns, inplace=True)
            save = True

        if columns_delete:
            data.drop(columns=columns_delete, inplace=True)
            save = True

        if save:
            data.to_csv(self.filepath, sep=";", index=False)

    def checkcsvfields(self, table_fields, tablename):
        if tablename == "qos":
            self.rename_csv_header()

        csv_header = pd.read_csv(
            self.filepath,
            low_memory=False,
            decimal=DECIMAL,
            encoding="utf-8",
            delimiter=self.get_delimiter(),
            index_col=None,
            nrows=None,
        ).columns.tolist()
        retour = True
        for field in csv_header:
            if field.lower() not in table_fields:
                self.errormessage += field + " "
                retour = False

        return retour

    def ischampadministratifexist(self, header_names):
        administrative_fields = ["region", "departement", "commune", "territoire"]
        for field in administrative_fields:
            if field in header_names:
                return True
        return False

    def get_delimiter(self):
        with open(self.filepath) as file:
            headers = next(csv.reader(file))

        if len(headers) == 1:
            return ";"
        return ","

    def beforeimport(self):
        if self.table == "stats_nbope":
            self.filetmppath = Path(self.odata.getfolderdata(self.table)) / CURRENTFILE

            header_names = pd.read_csv(
                self.filepath,
                low_memory=False,
                decimal=DECIMAL,
                encoding="utf-8",
                delimiter=self.get_delimiter(),
                index_col=None,
                nrows=None,
            ).columns.tolist()
            if not self.ischampadministratifexist(header_names):
                return False

            new_header = []
            for header_name in header_names:
                if header_name in ["region", "departement", "commune", "territoire"]:
                    new_header.append("code")
                    self.typeStat = header_name
                else:
                    new_header.append(header_name)

            df = pd.read_csv(
                self.filepath,
                delimiter=self.get_delimiter(),
                header=0,
                names=new_header,
                encoding="utf-8",
                decimal=DECIMAL,
                low_memory=False,
            )

            df.to_csv(
                self.filetmppath,
                sep=self.get_delimiter(),
                header=new_header,
                encoding="utf-8",
                decimal=DECIMAL,
                index=False,
            )
            tmpfile = self.filetmppath
            file = self.filepath
            self.filetmppath = file
            self.filepath = tmpfile
        elif self.table == "natures":
            self.create_temporary_csv_copy()
            self.empty_table_sup_nature()
        elif self.table == "zac_poi" or self.table == "zac_site":
            creation_file_success = self.create_temporary_file_copy()
            if not creation_file_success:
                return False

        return True

    def convert_numeric_columns(self, df):
        for col in df.columns:
            try:
                mask = df[col].notna()
                if df[col][mask].dtype == "float64" and (df[col][mask] % 1 == 0).all():
                    df[col] = df[col].astype("Int64")
            except:
                continue
        return df

    def create_temporary_file_copy(self):
        df = pd.read_csv(self.filepath, delimiter=self.get_delimiter(), on_bad_lines="skip")
        df = self.convert_numeric_columns(df)

        cols_to_keep = ["20801", "20810", "20815", "20820"]

        if not all(col in df.columns for col in cols_to_keep):
            return False

        df_no_ops = df.drop(columns=cols_to_keep)
        tmp_no_ops_filename = f"tmp_no_ops_{self.filename}"
        tmp_no_ops_filepath = Path(self.odata.getfolderdata(self.table)) / tmp_no_ops_filename
        df_no_ops.to_csv(tmp_no_ops_filepath, sep=";", index=False)

        self.filepath = tmp_no_ops_filepath

        additional_column = self.get_additional_column()
        if additional_column not in df.columns:
            return False

        cols_to_keep.append(additional_column)

        df_ops = df[cols_to_keep]
        tmp_ops_filename = f"tmp_ops_{self.filename}"
        tmp_ops_filepath = Path(self.odata.getfolderdata(self.table)) / tmp_ops_filename
        df_ops.to_csv(tmp_ops_filepath, index=False)

        self.filepath_zac_poi_ops = self.get_formatted_op_file(tmp_ops_filepath)

        return True

    def create_temporary_csv_copy(self):
        original_folder = self.odata.getfolderdata(self.table)
        created_tmp_folder = Path(original_folder) / "tmp"

        if not os.path.exists(created_tmp_folder):
            os.makedirs(created_tmp_folder)

        original_file_path = Path(original_folder) / self.filename

        shutil.copy(original_file_path, created_tmp_folder)

        temp_file_path = Path(created_tmp_folder) / self.filename

        csv_filename = self.filename.replace(".txt", ".csv")
        temp_csv_file_path = Path(created_tmp_folder) / csv_filename

        os.rename(temp_file_path, temp_csv_file_path)

        self.filename = csv_filename
        self.filepath = temp_csv_file_path

    def return_file_to_normal(self):
        self.filename = self.filename.replace(".csv", ".txt")
        original_folder = self.odata.getfolderdata(self.table)
        self.filepath = Path(original_folder) / self.filename
        self.empty_tmp_folder()

    def empty_tmp_folder(self):
        original_folder = self.odata.getfolderdata(self.table)
        tmp_folder = Path(original_folder) / "tmp"
        shutil.rmtree(tmp_folder)

    def empty_table_sup_nature(self):
        schema = self._get_schema_identifier()
        table = self._get_table_identifier()

        query = sql.SQL("""
            DELETE FROM {schema}.{table}
        """).format(schema=schema, table=table)

        self.odb.query(query)

    def correct_codegeo(self):
        schema = self._get_schema_identifier()
        table = self._get_table_identifier()

        query = sql.SQL("""
            UPDATE {schema}.{table}
            SET codegeo = CASE
                WHEN LENGTH(codegeo::TEXT) = 4 THEN CONCAT('0', codegeo::TEXT)
                ELSE codegeo::TEXT
            END
        """).format(schema=schema, table=table)

        self.odb.query(query)

    def correct_insee_dep(self):
        schema = self._get_schema_identifier()
        table = self._get_table_identifier()

        query = sql.SQL("""
            UPDATE {schema}.{table}
            SET insee_dep = CASE
                WHEN LENGTH(insee_dep::TEXT) = 1 THEN CONCAT('0', insee_dep::TEXT)
                ELSE insee_dep::TEXT
            END
        """).format(schema=schema, table=table)

        self.odb.query(query)

    def update_geometry_for_table_zac(self):
        schema = self._get_schema_identifier()
        table = self._get_table_identifier()
        filename_value = self.filename

        query = sql.SQL("""
            UPDATE {schema}.{table}
            SET geom = ST_Transform(
                    ST_SetSRID(ST_GeomFromText('POINT(' || x_lambert_93 || ' ' || y_lambert_93|| ')'), 2154), 3857
                )
            WHERE filename = %s
        """).format(schema=schema, table=table)

        self.odb.queryparams(query, [filename_value])

    def afterimport(self):
        if self.table == "stats_nbope":
            tmpfile = self.filetmppath
            file = self.filepath
            self.filetmppath = file
            self.filepath = tmpfile
            os.remove(self.filetmppath)

            schema = self._get_schema_identifier()
            table = self._get_table_identifier()
            filename_value = self.filename
            type_stat_value = self.typeStat

            query = sql.SQL("""
                UPDATE {schema}.{table}
                SET type = %s
                WHERE filename = %s
            """).format(schema=schema, table=table)

            res = self.odb.queryparams(query, [type_stat_value, filename_value])
            return res

        if self.table == "stats_qos_departements":
            self.correct_insee_dep()
        if self.table == "insee_density":
            self.correct_codegeo()
        if self.table == "zac_poi" or self.table == "zac_site":
            self.update_geometry_for_table_zac()
            insert_success = self.insert_into_zac_operateurs()
            if not insert_success:
                return False
            self.remove_tmp_files()

        if self.table == "signalements":
            self.run_consolidation_signalements()

        return True

    def get_additional_column(self):
        if self.table == "zac_poi":
            return "id_point"
        if self.table == "zac_site":
            return "numero_site"
        return ""

    def get_formatted_op_file(self, file):
        df = pd.read_csv(file, delimiter=",")

        formatted_rows = []
        additional_column = self.get_additional_column()

        for _, row in df.iterrows():
            id_value = row[additional_column]
            for col in ["20801", "20810", "20815", "20820"]:
                if row[col] == 1:
                    formatted_rows.append({additional_column: id_value, "id_operateur": col})

        formatted_df = pd.DataFrame(formatted_rows)
        formatted_df.to_csv(file, index=False, sep=";")

        return file

    def get_zac_operateur_tablename(self):
        if self.table == "zac_poi":
            return "zac_poi_operateurs"
        if self.table == "zac_site":
            return "zac_site_operateurs"
        return ""

    def insert_into_zac_operateurs(self):
        tablename = self.get_zac_operateur_tablename()
        if not tablename:
            return False

        opushercsv = PusherCSV(self.filepath_zac_poi_ops, tablename)
        res = opushercsv.run()

        if not res:
            return False

        schema = self._get_schema_identifier()
        table = sql.Identifier(tablename)
        filename_value = self.filename

        query = sql.SQL("""
            UPDATE {schema}.{table}
            SET filename = %s
            WHERE filename IS NULL
        """).format(schema=schema, table=table)

        self.odb.queryparams(query, [filename_value])

        return True

    def remove_tmp_files(self):
        if hasattr(self, "filepath"):
            if os.path.exists(self.filepath):
                os.remove(self.filepath)

        if hasattr(self, "filepath_zac_poi_ops"):
            if os.path.exists(self.filepath_zac_poi_ops):
                os.remove(self.filepath_zac_poi_ops)

        if hasattr(self, "filetmppath"):
            if os.path.exists(self.filetmppath):
                os.remove(self.filetmppath)

    def run_file_analysis(self):
        o_file_analysis = FileAnalysis(self.filepath)
        res = o_file_analysis.writeConversion()
        return res

    def signalement_consolide_geom(self):
        schema = self._get_schema_identifier()

        query = sql.SQL("""
            UPDATE {schema}.signalement
            SET geometry = ST_ReducePrecision(st_transform(ST_Point(longitude, latitude, 4326), 3857), 0.01)
            WHERE geometry IS NULL
        """).format(schema=schema)

        res = self.odb.query(query)
        return res

    def signalement_consolide_is_metropole(self):
        schema = self._get_schema_identifier()

        query = sql.SQL("""
            UPDATE {schema}.signalement s 
            SET is_metropole = (
                SELECT NOT insee_dep = ANY(ARRAY['971','972','973','974','975','976','977','978'])
                FROM {schema}.departement d
                WHERE st_contains(d.geom, s.geometry)
            )
        """).format(schema=schema)

        res = self.odb.query(query)
        return res

    def signalement_consolide_generate_hexa(self):
        schema = self._get_schema_identifier()

        query = sql.SQL("""
            SELECT {schema}.lunch_generate_hexa_signalement(20000)
        """).format(schema=schema)

        res = self.odb.query(query)
        return res

    def signalement_delete_unsed_data(self, table_fields):
        """Supprime les données inutilisées de manière sécurisée"""
        schema = self._get_schema_identifier()

        # Validation stricte des noms de colonnes
        valid_fields = []
        for field in table_fields:
            if field and field.replace("_", "").isalnum():
                valid_fields.append(field)

        if not valid_fields:
            return False

        # Construction de la condition IS NULL pour chaque champ
        conditions = [sql.SQL("{field} IS NULL").format(field=sql.Identifier(f)) for f in valid_fields]
        where_clause = sql.SQL(" OR ").join(conditions)

        query = sql.SQL("""
            DELETE FROM {schema}.signalement WHERE {where_clause}
        """).format(schema=schema, where_clause=where_clause)

        res = self.odb.query(query)
        return res

    def run_consolidation_signalements(self):
        self.signalement_consolide_geom()
        self.signalement_consolide_is_metropole()
        self.signalement_consolide_generate_hexa()

    def build_where_delete_signalements(self, table_fields):
        """Legacy - utiliser signalement_delete_unsed_data à la place"""
        return ""
