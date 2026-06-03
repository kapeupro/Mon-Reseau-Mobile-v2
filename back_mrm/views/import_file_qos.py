from datetime import datetime
from zoneinfo import ZoneInfo

from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import redirect
from psycopg import sql
from rest_framework.views import APIView

from back_mrm.scripts.import_script import ImportScript
from back_mrm.utils.db import Db
from back_mrm.utils.params import getsrid

PROTOCOLE_LIST = ["WEB", "UPLOAD", "DOWNLOAD", "STREAM", "VOIX", "SMS"]


class ImportFileQos(APIView):
    def post(self, request):
        if not request.user.is_authenticated:
            return redirect("login")

        oimportfileoperation = ImportFileOperation(request)
        response = oimportfileoperation.runimport()
        return JsonResponse(response, safe=False)


class ImportFileOperation:
    def __init__(self, request):
        self.getparams(request)

    def getparams(self, request):
        self.odb = Db()
        self.schema = settings.DATABASE_SCHEMA
        self.file_to_import = request.data.get("file")
        self.id_data_source_list = request.data.get("id_data_source_list")
        self.label_data_source_desc = request.data.get("label_data_source_desc").strip()
        self.regionvalue = request.data.get("regionValue")

    def runimport(self):
        oimportscript = ImportScript(self.file_to_import, "qos")
        is_import_success = oimportscript.runimport()
        if not is_import_success["success"]:
            response = is_import_success
        else:
            response = self.update_datas()
            self.odb.update_data_date("qualite-reseau")

        self.odb.insertlog(
            datetime.now(tz=ZoneInfo("Europe/Paris")), "Import qualité (QoS)", response["success"], response["message"]
        )

        return response

    def update_datas(self):
        update_functions = [
            (self.upserttablesourcedesc(), "Erreur ajout nouvelle données source desc"),
            (self.updategeometryfortableqos(), "Erreur mise à jour geometry pour table qos"),
            (self.updateidhexafortableqos(), "Erreur mise à jour id_hexa pour table qos"),
            (self.updateismetropolefortableqos(), "Erreur mise à jour is_metropole pour table qos"),
            (self.updateistransportfortableqos(), "Erreur mise à jour is_transport pour table qos"),
            (self.updatesourcedescfortableqos(), "Erreur mise à jour id_data_source_desc pour table qos"),
            (self.updateinvalidinseedep(), "Erreur lors de la rectification des insee_dep"),
        ]

        for update_function, error_message in update_functions:
            if not update_function:
                self.deletefromtableqosiferror()
                return {"success": False, "message": error_message}

        return self.checkprotocoles()

    def checkprotocoles(self):
        is_data_protocoles_correct = self.isdataprotocolescorrect()
        if is_data_protocoles_correct:
            response = {
                "success": True,
                "message": "Import et mise à jour des nouvelles données qos effectués avec succès",
            }
        else:
            data_numbers = self.getdatanumbers()
            is_incorrect_protocole_deleted = self.deleteincorrectprotocoles()
            if not is_incorrect_protocole_deleted:
                response = {"success": False, "message": "Erreur lors de la supression des protocoles incorrects"}
            else:
                data_numbers_after_delete = self.getdatanumbers()
                deleted_data_number = data_numbers - data_numbers_after_delete
                response = {
                    "success": True,
                    "message": f"Import et mise à jour des nouvelles données qos effectués : {data_numbers_after_delete}/{data_numbers} insérées avec succès, {deleted_data_number} donnée(s) avec protocole(s) incorrect(s)",
                }

        return response

    def upserttablesourcedesc(self):
        label_data_source_desc = self.getlabeldatasourcedesc()

        query = sql.SQL("""
            INSERT INTO {}.qos_data_source_desc (id_data_source, title)
            VALUES (%s, %s)
            ON CONFLICT (title)
            DO UPDATE SET
                id_data_source = EXCLUDED.id_data_source,
                title = EXCLUDED.title
        """).format(sql.Identifier(self.schema))

        params = (self.id_data_source_list, label_data_source_desc)

        res = self.odb.queryparams(query, params)

        return res

    def updateidhexafortableqos(self):
        query = sql.SQL("""
            UPDATE {schema}.qos AS q
            SET id_hexa = h.fid
            FROM {schema}.hexa_30m AS h
            WHERE ST_Intersects(q.geometry, h.geometry)
            AND filename = %s
        """).format(schema=sql.Identifier(self.schema))
        params = (self.file_to_import,)
        res = self.odb.queryparams(query, params)

        return True

    def updateismetropolefortableqos(self):
        is_metropole = self.getismetropole()
        query = sql.SQL("""
            UPDATE {schema}.qos
            SET is_metropole=%s
            WHERE filename = %s
        """).format(schema=sql.Identifier(self.schema))

        params = (is_metropole, self.file_to_import)
        res = self.odb.queryparams(query, params)

        return res

    def updateistransportfortableqos(self):
        query = sql.SQL("""
            UPDATE {schema}.qos
            SET is_transport = (coalesce(trim(axis), '') <> '')
            WHERE filename = %s
        """).format(schema=sql.Identifier(self.schema))

        params = (self.file_to_import,)
        res = self.odb.queryparams(query, params)

        return res

    def updategeometryfortableqos(self):
        query = sql.SQL("""
            UPDATE {schema}.qos
            SET geometry =  ST_Transform(ST_SetSRID(ST_MakePoint(longitude_start, latitude_start), %s), %s)
            WHERE filename = %s
        """).format(schema=sql.Identifier(self.schema))

        params = (4326, getsrid(), self.file_to_import)
        res = self.odb.queryparams(query, params)
        return res

    def updatesourcedescfortableqos(self):
        id_data_source_desc = self.getiddatasourcedesc()
        if not id_data_source_desc:
            return False

        query = sql.SQL("""
            UPDATE {schema}.qos
            SET id_data_source_desc = %s
            WHERE filename = %s
        """).format(schema=sql.Identifier(self.schema))

        params = (id_data_source_desc, self.file_to_import)
        res = self.odb.queryparams(query, params)

        return res

    def updateinvalidinseedep(self):
        query = sql.SQL("""
            UPDATE {schema}.qos
            SET insee_dep = LPAD(insee_dep, 2, '0')
            WHERE LENGTH(insee_dep) = 1
        """).format(schema=sql.Identifier(self.schema))

        res = self.odb.query(query)

        return res

    def deleteincorrectprotocoles(self):
        query = sql.SQL("""
            DELETE FROM {schema}.qos
            WHERE filename = %s AND NOT (protocole = ANY(%s))
        """).format(schema=sql.Identifier(self.schema))

        params = (self.file_to_import, PROTOCOLE_LIST)
        res = self.odb.queryparams(query, params)

        return res

    def deletefromtableqosiferror(self):
        query = sql.SQL("""
            DELETE FROM {schema}.qos
            WHERE  filename = %s
        """).format(schema=sql.Identifier(self.schema))

        params = (self.file_to_import,)
        res = self.odb.queryparams(query, params)

        return res

    def getiddatasourcedesc(self):
        query = sql.SQL("""
            SELECT id
            FROM {schema}.qos_data_source_desc
            WHERE id_data_source = %s
            AND LOWER(unaccent(title)) = LOWER(unaccent(%s))
        """).format(schema=sql.Identifier(self.schema))

        params = (self.id_data_source_list, self.label_data_source_desc)
        res = self.odb.select_with_params(query, params)

        return res[0]["id"] if res and len(res) != 0 else False

    def getlabeldatasourcedesc(self):
        query = sql.SQL("""
            SELECT title
            FROM {schema}.qos_data_source_desc
            WHERE LOWER(unaccent(title)) = LOWER(unaccent(%s))
        """).format(schema=sql.Identifier(self.schema))

        params = (self.label_data_source_desc,)
        res = self.odb.select_with_params(query, params)

        return res[0]["title"] if res and len(res) != 0 else self.label_data_source_desc

    def getdatanumbers(self):
        query = sql.SQL("""
            SELECT count(filename) AS nb_data
            FROM {schema}.qos
            WHERE filename = %s
        """).format(schema=sql.Identifier(self.schema))

        params = (self.file_to_import,)
        results = self.odb.select_with_params(query, params)

        return results[0]["nb_data"] if results or len(results) != 0 else 0

    def isdataprotocolescorrect(self):

        query = sql.SQL("""
            SELECT count(protocole) AS nb_protocole_incorrect
            FROM {schema}.qos
            WHERE filename = %s
            AND NOT (protocole = ANY(%s))
        """).format(schema=sql.Identifier(self.schema))

        params = (self.file_to_import, PROTOCOLE_LIST)

        results = self.odb.select_with_params(query, params)

        return False if results[0]["nb_protocole_incorrect"] > 0 else True

    def getformattedlist(self, list):
        formatted_list = ", ".join([f"'{element}'" for element in list])

        return formatted_list

    def getismetropole(self):
        return self.regionvalue != "outremer"
