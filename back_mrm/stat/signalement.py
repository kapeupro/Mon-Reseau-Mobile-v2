import re

from django.conf import settings
from django.http import JsonResponse
from psycopg import sql
from rest_framework.views import APIView

from back_mrm.stat.signalementmodule.detail import SignalementDetail
from back_mrm.utils.db import Db


class StatSignalement(APIView):
    def get(self, request):
        if self.iscorrectparams(request):
            self.odb = Db()
            if self.get_type_stat(request) == "recap":
                data = self.get_data_recap(request)
                response = {"success": True, "data": data}
            elif self.get_type_stat(request) == "detail":
                detail = SignalementDetail(self.odb)
                detail.setid(request.GET["id"])
                detail.setentite(self.get_entite(request))
                data = detail.get()

                if not data:
                    response = {"success": False, "message": "no-data"}

                else:
                    response = {"success": True, "data": data}
            else:
                data = self.get_data_by_zone(request)
                response = {"success": True, "value": data}
        else:
            response = {"success": False, "message": "Paramètres incomplets"}

        return JsonResponse(response, safe=False)

    def get_entite(self, request):
        if "entite" not in request.GET:
            return "metropole"

        return request.GET["entite"]

    def get_data_recap_outremer(self, request):
        query = sql.SQL("""
            SELECT count(1) as total
            FROM {schema}.signalement s
            INNER JOIN {schema}.operateurs op ON op.identifiant = s.operateur
            where perimetre_metro is not null and not perimetre_metro
        """).format(schema=sql.Identifier(self.getschema()))

        res = self.odb.selectasarray(query)
        if not res or len(res) == 0:
            return 0

        return res[0]["total"]

    def get_data_recap_metropole(self, request):
        query = sql.SQL("""
            SELECT count(1) as total
            FROM {schema}.signalement s
            INNER JOIN {schema}.operateurs op ON op.identifiant = s.operateur
            where perimetre_metro is not null and perimetre_metro
        """).format(schema=sql.Identifier(self.getschema()))

        res = self.odb.selectasarray(query)
        if not res or len(res) == 0:
            return 0

        return res[0]["total"]

    def get_data_recap(self, request):
        result = {
            "metropole": self.get_data_recap_metropole(request),
            "outremer": self.get_data_recap_outremer(request),
        }

        return result

    def get_value(self, list, key):
        if key in list.keys():
            return list[key]
        return 0

    def getschema(self):
        return settings.DATABASE_SCHEMA

    def get_type_stat(self, request):
        return request.GET["type"]

    def get_zone(self, request):
        return request.GET["entite"]

    def get_operator(self, request):
        return request.GET["operators"]

    def iscorrectparams(self, request):
        if "type" not in request.GET:
            return False

        if request.GET["type"] == "recap":
            if "operators" not in request.GET:
                return False

        if request.GET["type"] == "detail":
            if "id" not in request.GET:
                return False

        if "operators" in request.GET:
            if not self.is_valid_operators(request):
                return False
        return True

    def is_valid_operators(self, request):
        operator = self.get_operator(request)
        pattern = r"^[\d,]+$"
        return bool(re.match(pattern, operator))

    def get_data_by_zone(self, request):

        if self.get_zone(request) == "territoire":
            o_stat_territoire = StatTerritoire(request)
            o_stat_territoire.set_db(self.odb)
            return o_stat_territoire.get_result()

        if self.get_zone(request) == "region":
            o_stat_region = StatRegion(request)
            o_stat_region.set_db(self.odb)
            return o_stat_region.get_result()

        if self.get_zone(request) == "departement":
            o_stat_dept = StatDepartement(request)
            o_stat_dept.set_db(self.odb)
            return o_stat_dept.get_result()

        return False


class StatTerritoire:
    def __init__(self, request):
        self.initparams(request)

    def initparams(self, request):
        self.id = request.GET["id"]
        self.request = request

    def set_db(self, db):
        self.db = db

    def getschema(self):
        return settings.DATABASE_SCHEMA

    def get_result(self):
        if self.id != "metropole":
            o_stat_dept = StatDepartement(self.request)
            o_stat_dept.set_db(self.db)
            return o_stat_dept.get_result()

        query = sql.SQL("""
            select count(1) as total from {schema}.signalement s
            INNER JOIN {schema}.operateurs op ON op.identifiant = s.operateur
            where perimetre_metro
        """).format(schema=sql.Identifier(self.getschema()))

        res = self.db.selectasarray(query)
        if not res or len(res) == 0:
            return 0

        return res[0]["total"]


class StatDepartement:
    def __init__(self, request):
        self.initparams(request)

    def initparams(self, request):
        self.id = request.GET["id"]

    def getschema(self):
        return settings.DATABASE_SCHEMA

    def set_db(self, db):
        self.db = db

    def get_result(self):
        query = sql.SQL("""
            select count(1) as total from {schema}.signalement
            where insee_com in (
                select insee_com from {schema}.commune
                where insee_dep = %s
            )
        """).format(schema=sql.Identifier(self.getschema()))

        params = (self.id,)

        res = self.db.selectasarray(query, params)
        if not res or len(res) == 0:
            return 0

        return res[0]["total"]


class StatRegion:
    def __init__(self, request):
        self.initparams(request)

    def initparams(self, request):
        self.id = request.GET["id"]

    def getschema(self):
        return settings.DATABASE_SCHEMA

    def set_db(self, db):
        self.db = db

    def get_result(self):
        query = sql.SQL("""
            select count(1) as total from {schema}.signalement
            where insee_com in (
                select insee_com from {schema}.commune
                where insee_reg = %s
            )
        """).format(schema=sql.Identifier(self.getschema()))
        params = (self.id,)
        res = self.db.selectasarray(query, params)

        if not res or len(res) == 0:
            return 0

        return res[0]["total"]
