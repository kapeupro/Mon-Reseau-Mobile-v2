from django.conf import settings
from django.http import JsonResponse
from psycopg import sql
from rest_framework.views import APIView

from back_mrm.utils.db import Db

ORDERED_LEVEL_LIST = ["TBC", "BC", "CL"]


class StatNbope(APIView):
    def get(self, request):
        if self.isparamscorrect(request):
            self.odb = Db()
            self.data_filter = request.GET["filter_by"]
            self.insee = request.GET["insee"]
            self.techno = request.GET["techno"]
            self.nb_op = request.GET["nb_op"]
            self.entite = request.GET["entite"]

            data = self.getstatsnbope()
        else:
            no_response = self.getnoresponse()

            data = {"message": "Paramètres incomplets!", "success": False, "stats_nbope": no_response}

        return JsonResponse(data, safe=False)

    def getstatsnbope(self):
        data_stats = self.getdatastats()
        if not data_stats:
            no_response = self.getnoresponse()

            return {"message": "Aucune donnée!", "success": False, "stats_nbope": no_response}

        data_json = self.getjsonresponse(data_stats)

        return data_json

    def getstatvaluesbynbop(self):
        data_type = self.gettypedata()

        stat_query_parts = []
        for nb_op in range(int(self.nb_op) + 1):
            field_name = f"{data_type}_{nb_op}"
            alias_name = f"op{nb_op}"

            part = sql.SQL("""
                CASE 
                    WHEN {field} = {field}::integer 
                    THEN {field}
                    ELSE ROUND({field}::numeric, 2)
                END AS {alias}
            """).format(field=sql.Identifier(field_name), alias=sql.Identifier(alias_name))

            stat_query_parts.append(part)
        stat_query = sql.SQL(",\n").join(stat_query_parts)
        return stat_query

    def getdatastats(self):
        active_techno = self.gettechnology()
        stat_values_query = self.getstatvaluesbynbop()
        type = self.gettype()

        insee = "METRO" if self.insee == "metropole" else self.insee

        query = sql.SQL("""
            SELECT 
                niveau,
                {fields}
            FROM {schema}.stats_nbope_couverture 
            WHERE techno = %s
            AND code = %s
            AND type = %s
        """).format(fields=stat_values_query, schema=sql.Identifier(settings.DATABASE_SCHEMA))

        params = (active_techno, insee, type)
        results = self.odb.selectasarray(query, params)

        return results if results or len(results) != 0 else False

    def manageNoneValue(self, val):
        if val is None:
            return 0
        return float(val)

    def getjsonresponse(self, results):
        data = {"message": "Données récupérées!", "success": True, "stats_nbope": []}

        for niveau in ORDERED_LEVEL_LIST:
            niveau_found = False
            for result in results:
                if result["niveau"] == niveau:
                    niveau_result = {
                        "niveau": self.getniveau(niveau),
                        "pourcentage": [
                            self.manageNoneValue(result[f"op{nb_op}"]) for nb_op in reversed(range(int(self.nb_op) + 1))
                        ],
                    }
                    data["stats_nbope"].append(niveau_result)
                    niveau_found = True
                    break
            if not niveau_found:
                data["stats_nbope"].append(
                    {"niveau": self.getniveau(niveau), "pourcentage": [0 for nb_op in range(int(self.nb_op) + 1)]}
                )

        return data

    def getnoresponse(self):
        noresponse = [
            {"niveau": self.getniveau(niveau), "pourcentage": [0 for nb_op in range(int(self.nb_op) + 1)]}
            for niveau in ORDERED_LEVEL_LIST
        ]

        return noresponse

    def getniveau(self, niveau):
        if niveau.lower() == "tbc":
            niveau_label = "Très bonne couverture"
        if niveau.lower() == "bc":
            niveau_label = "Bonne couverture"
        if niveau.lower() == "cl":
            niveau_label = "Couverture limitée"

        return niveau_label

    def gettype(self):
        return self.entite

    def gettechnology(self):
        return self.techno.upper()

    def gettypedata(self):
        data_type = "pop"

        if self.data_filter == "surface":
            data_type = "couv"

        return data_type

    def isparamscorrect(self, request):
        if (
            "filter_by" not in request.GET
            or "insee" not in request.GET
            or "techno" not in request.GET
            or "entite" not in request.GET
        ):
            return False

        return True
