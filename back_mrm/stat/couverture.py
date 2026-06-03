from django.conf import settings
from django.http import JsonResponse
from psycopg import sql
from rest_framework.views import APIView

from back_mrm.utils.db import Db


class StatCouverture(APIView):
    def get(self, request):
        if self.iscorrectparams(request):
            ostatcouvertureoperation = StatCouvertureOperation(request)
            try:
                response = ostatcouvertureoperation.getstatfromcouverture()
            except Exception as e:
                response = {"success": False, "message": f"Erreur survenue : {e!s}"}
        else:
            response = {"success": False, "message": "Paramètres incomplets"}

        return JsonResponse(response, safe=False)

    def iscorrectparams(self, request):
        if (
            "id" not in request.GET
            and "operators" not in request.GET
            and "service" not in request.GET
            and "entite" not in request.GET
        ):
            return False

        return True


class StatCouvertureOperation:
    def __init__(self, request):
        self.initparams(request)

    def initparams(self, request):
        self.odb = Db()
        self.id = self.formatid(request.GET["id"])
        self.operator = request.GET["operators"]
        self.service = request.GET["service"]
        self.entite = request.GET["entite"]
        self.x = request.GET["x"] if "x" in request.GET else ""
        self.y = request.GET["y"] if "y" in request.GET else ""

    def formatid(self, id):
        if id == "metropole":
            return "METRO"
        return id

    def getstatfromcouverture(self):
        dataStat = self.getdatastats()

        if not dataStat:
            data = {"success": False, "message": "Aucune donnée stat couverture"}
        else:
            data = {
                "success": True,
                "tauxCover": self.gettauxcover(),
                "tauxCoverByOperator": self.gettauxcoverbyoperator(),
                "stat": dataStat,
            }

        return data

    def gettauxcoverbyoperator(self):
        if self.entite == "adresse":
            return 0

        query = sql.SQL("""
            SELECT {fields} AS tauxoperator
            FROM {schema}.stats_nbope_couverture
            WHERE type = %s
            AND code = %s
            AND niveau = 'CL'
            AND techno = '4G'
        """).format(fields=sql.Identifier(self.getchamp()), schema=sql.Identifier(self.getschema()))
        params = (self.getfieldfilter(), self.id)
        res = self.odb.selectasarray(query, params)

        if not res or len(res) == 0:
            return 0

        return float(res[0]["tauxoperator"])

    def gettauxcover(self):
        if self.entite == "adresse":
            return 0

        where_taux, params_taux = self.getandconditiontauxcover()
        query = sql.SQL("""
            SELECT 
                CASE 
                    WHEN MIN(couv_bc + couv_tbc) = ROUND(MIN(couv_bc + couv_tbc), 0) 
                    THEN ROUND(MIN(couv_bc + couv_tbc), 0)::INT::TEXT
                ELSE ROUND(MIN(couv_bc + couv_tbc), 2)::TEXT
            END AS tauxcover
            FROM {schema}.{table}
            WHERE techno = '4G'
            {where_taux}
        """).format(
            schema=sql.Identifier(self.getschema()), table=sql.Identifier(self.gettable()), where_taux=where_taux
        )

        res = self.odb.selectasarray(query, params_taux)

        if not res or len(res) == 0:
            return 0

        return float(res[0]["tauxcover"])

    def getchamp(self):
        pop_max = "pop_4"

        if self.id == "978":
            pop_max = "pop_5"

        return pop_max

    def getandconditiontauxcover(self):
        params = (self.id,)
        if self.entite == "region":
            and_condition = sql.SQL("""
                AND region = %s
            """)
        elif self.entite == "departement":
            and_condition = sql.SQL("""
                AND departement = %s
            """)
        elif self.entite == "commune":
            and_condition = sql.SQL("""
                AND commune = %s
            """)
        elif self.entite == "territoire":
            and_condition = sql.SQL("""
                AND territoire = %s
            """)
        else:
            and_condition = sql.SQL("")
            params = ()

        return and_condition, params

    def getoperateur(self):
        aoperateur = self.operator.split(",")
        if len(aoperateur) == 0:
            return False
        return aoperateur

    def getschema(self):
        return settings.DATABASE_SCHEMA

    def gettable(self):
        if self.entite == "region":
            return "stats_couv_regions"
        if self.entite == "departement":
            return "stats_couv_departements"
        if self.entite == "commune":
            return "stats_couv_communes"
        if self.entite == "territoire":
            return "stats_couv_territoires"
        if self.entite == "adresse":
            return "couverture_theorique"

        return False

    def getfieldfilter(self):
        return self.entite

    def isdata(self):
        return self.service == "internet"

    def addfilter(self):
        if self.isdata():
            return sql.SQL(" AND techno not like ('%%2G%%') AND techno <> '3G' ")
        return sql.SQL(" AND techno like ('%%2G%%') ")

    def get_condition_techno(self):

        if self.entite == "adresse":
            condition = sql.SQL("""
                WHERE st_contains(geom, st_transform(ST_Point(%s, %s, 4326), 3857))
                {filter}
            """).format(filter=self.addfilter())
            params = (self.x, self.y)
        else:
            condition = sql.SQL("""
                WHERE {column} = %s {filter}
            """).format(column=sql.Identifier(self.getfieldfilter()), filter=self.addfilter())
            params = (self.id,)

        return condition, params

    def gettechno(self):
        table = self.gettable()

        if not table:
            return False

        where_techno, params_techno = self.get_condition_techno()

        query = sql.SQL("""
            SELECT distinct 
                CASE 
                    WHEN techno = '2G3G' THEN '2G/3G' 
                    ELSE techno 
                END AS techno
            FROM {schema}.{table} 
            {where_clause}
            ORDER BY techno
        """).format(schema=sql.Identifier(self.getschema()), table=sql.Identifier(table), where_clause=where_techno)

        res = self.odb.selectasarray(query, params_techno)

        if not res or len(res) == 0:
            return False
        result = []

        for data in res:
            result.append(data["techno"])

        return result

    def get_value_by_operator_and_techno_for_adresse(self, idoperateur, idtechno):
        params = (self.x, self.y, idtechno, idoperateur)
        query = sql.SQL("""
            SELECT DISTINCT
                CASE 
                    WHEN trim(niveau) = '' THEN 'CL' 
                    ELSE upper(niveau) 
                END AS niveau 
            FROM {schema}.{table} 
            LEFT JOIN {schema}.operateurs op ON operateur = op.identifiant
            WHERE st_contains(geom, st_transform(ST_Point(%s, %s, 4326), 3857))
            AND techno = %s AND  operateur = %s
        """).format(schema=sql.Identifier(self.getschema()), table=sql.Identifier(self.gettable()))

        res = self.odb.selectasarray(query, params)
        if not res or len(res) == 0:
            return 0

        final_result = self.get_final_result(res[0]["niveau"])

        return float(final_result)

    def get_final_result(self, label):
        label_lower = label.lower()

        res = 0
        if label_lower == "tbc":
            res = 100
        elif label_lower == "bc":
            res = 90
        elif label_lower == "cl":
            res = 25
        else:
            res = 0  # case ZNC

        return res

    def format_techno(self, id_techno):
        if id_techno.lower() == "2g/3g":
            return "2G3G"

        return id_techno

    def getvaluebyoperatorandtechno(self, idoperateur, idtechno):

        params = (self.id, idtechno, idoperateur)
        query = sql.SQL("""
            SELECT pop_tbc FROM {schema}.{table} 
            WHERE {column} = %s AND techno = %s AND  mcc_mnc = %s
            ORDER BY techno """).format(
            schema=sql.Identifier(self.getschema()),
            table=sql.Identifier(self.gettable()),
            column=sql.Identifier(self.getfieldfilter()),
        )

        res = self.odb.selectasarray(query, params)
        if not res or len(res) == 0:
            return 0

        return float(res[0]["pop_tbc"])

    def getdatavalues(self, aoperateur, atechno):
        avalues = []
        for idoperateur in aoperateur:
            aresulttechno = []
            for idtechno in atechno:
                formatted_techno = self.format_techno(idtechno)
                if self.entite == "adresse":
                    value = self.get_value_by_operator_and_techno_for_adresse(idoperateur, formatted_techno)
                else:
                    value = self.getvaluebyoperatorandtechno(idoperateur, formatted_techno)
                aresulttechno.append(value)

            avalues.append(aresulttechno)
        return avalues

    def getdatavalues4gforadresse(self, aoperateur):
        avalues = []
        for idoperateur in aoperateur:
            if self.entite == "adresse":
                value = self.get_value_by_operator_and_techno_for_adresse(idoperateur, "4G")
            else:
                value = self.getvaluebyoperatorandtechno(idoperateur, "4G")

            avalues.append(value)

        return avalues

    def getdatastats(self):

        aoperateur = self.getoperateur()
        if not aoperateur:
            return False

        atechno = self.gettechno()
        if not atechno:
            return False

        value = self.getdatavalues(aoperateur, atechno)

        values_4g = self.getdatavalues4gforadresse(aoperateur)

        data = {"operator": aoperateur, "value": value, "techno": atechno, "values_4g": values_4g}

        return data
