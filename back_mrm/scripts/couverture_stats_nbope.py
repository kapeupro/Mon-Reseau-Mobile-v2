import csv
import os
import shutil
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from django.conf import settings
from psycopg import sql

from back_mrm.utils.db import Db

TYPE_IMPORT = "Import statistiques nombre opérateurs"
TABLE_FIELDS = [
    "techno",
    "niveau",
    "code",
    "pop_0",
    "pop_1",
    "pop_2",
    "pop_3",
    "pop_4",
    "pop_5",
    "couv_0",
    "couv_1",
    "couv_2",
    "couv_3",
    "couv_4",
    "couv_5",
]
SOURCE_FOLDER = Path(settings.IMPORT_FILE) / "couverture" / "stats_nbope"
DESTINATION_FOLDER = Path(settings.IMPORT_FILE_COPY) / "couverture" / "stats_nbope"


class CouvertureStatsNbope:
    def __init__(self, file):
        self.lst_file = file
        self.odb = Db()

    def importdatastodb(self):
        nb_error = 0
        for file in self.lst_file:
            is_data_file_correct = self.checkcorrectdatafile(file)

            if is_data_file_correct:
                is_data_inserted = self.insertdatastotable(file)

                if is_data_inserted:
                    log_response = {"message": f"Données insérées avec succès pour {file}", "success": True}
                    self.copyfiletodestination(file)
                else:
                    nb_error += 1
                    log_response = {"message": f"Erreur lors de l'insertion des données pour {file}", "success": False}
            else:
                nb_error += 1
                log_response = {"message": f"Données du fichier {file} incorrectes", "success": False}

            self.odb.insertlog(
                datetime.now(tz=ZoneInfo("Europe/Paris")), TYPE_IMPORT, log_response["success"], log_response["message"]
            )

        return {
            "message": "Processus d'importation terminée sans erreur"
            if nb_error == 0
            else f"Processus d'importation terminée avec {nb_error} erreur(s)",
            "success": True,
        }

    def checkcorrectdatafile(self, file):
        data_headers = self.getfileheaders(file)
        if not data_headers:
            return False

        fields_departement = self.getcorrecttablefields("departement")
        fields_commune = self.getcorrecttablefields("commune")
        fields_region = self.getcorrecttablefields("region")
        fields_territoire = self.getcorrecttablefields("territoire")

        if (
            data_headers == fields_departement
            or data_headers == fields_commune
            or data_headers == fields_region
            or data_headers == fields_territoire
        ):
            return True
        return False

    def getfileheaders(self, file):
        file_path = Path(SOURCE_FOLDER) / file
        if not os.path.exists(file_path):
            return False

        if not file.endswith(".csv"):
            return False

        with open(file_path) as csv_file:
            csv_reader = csv.reader(csv_file)
            data_headers = next(csv_reader)

        return data_headers

    def getcorrecttablefields(self, type):
        correct_fields = [
            "techno",
            "niveau",
            type,
            "pop_0",
            "pop_1",
            "pop_2",
            "pop_3",
            "pop_4",
            "pop_5",
            "couv_0",
            "couv_1",
            "couv_2",
            "couv_3",
            "couv_4",
            "couv_5",
        ]

        return correct_fields

    def gettypedata(self, file):
        data_headers = self.getfileheaders(file)
        if not data_headers:
            return False

        if "departement" in data_headers:
            type_data = "departement"
        if "commune" in data_headers:
            type_data = "commune"
        if "region" in data_headers:
            type_data = "region"
        if "territoire" in data_headers:
            type_data = "territoire"

        return type_data

    def insertdatastotable(self, file):
        try:
            file_path = Path(SOURCE_FOLDER) / file
            with open(file_path) as csv_file:
                csv_datas = csv.DictReader(csv_file)

                type_data = self.gettypedata(file)
                fields = ["filename", "type"] + TABLE_FIELDS

                for row in csv_datas:
                    # Construction des valeurs avec gestion des types
                    values = [file, type_data]  # filename et type

                    # Traitement des champs TABLE_FIELDS
                    for field in TABLE_FIELDS:
                        if field == "code":
                            # Le champ code correspond au type_data (departement/commune/region/territoire)
                            value = row.get(type_data, "")
                        else:
                            value = row.get(field, "")

                        values.append(value)

                    # Construction de la requête sécurisée
                    query = sql.SQL("""
                        INSERT INTO {schema}.stats_nbope_couverture ({columns})
                        VALUES ({values})
                    """).format(
                        schema=sql.Identifier(settings.DATABASE_SCHEMA),
                        columns=sql.SQL(", ").join(map(sql.Identifier, fields)),
                        values=sql.SQL(", ").join(map(sql.Literal, values)),
                    )

                    self.odb.query(query)
            return True
        except Exception:
            return False

    def copyfiletodestination(self, file):
        if not Path.exists(DESTINATION_FOLDER):
            os.makedirs(DESTINATION_FOLDER)

        src = Path(SOURCE_FOLDER) / file
        if Path.is_file(src):
            if shutil.copy(src, DESTINATION_FOLDER):
                os.remove(src)
