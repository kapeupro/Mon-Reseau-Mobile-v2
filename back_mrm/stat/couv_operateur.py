from django.conf import settings
from django.http import JsonResponse
from psycopg import sql
from rest_framework.views import APIView

from back_mrm.utils.db import Db


class StatCouvOperateur(APIView):
    def get(self, request):
        if self.isparamscorrect(request):
            self.odb = Db()
            self.data_filter = request.GET["filter_by"]
            self.insee = request.GET["insee"]
            self.techno = request.GET["techno"]
            self.operateur_list = [int(operateur) for operateur in request.GET["operateurs"].split(",")]
            self.entite = request.GET["entite"]

            data = self.getstatsoperateur()
        else:
            no_response = self.getnoresponse()

            data = {"message": "Paramètres incomplets!", "success": False, "stats_operateur": no_response}

        return JsonResponse(data, safe=False)

    def getstatsoperateur(self):
        data_stats = self.getdatastats()
        if not data_stats:
            no_response = self.getnoresponse()
            return {"message": "Aucune donnée!", "success": False, "stats_operateur": no_response}

        data_json = self.getjsonresponse(data_stats)

        return data_json

    def getdatastats(self):
        results = []

        data_type = self.gettypedata()
        table_name = self.gettablename()
        add_condition, params_condition = self.getadditionnalcondition()
        active_techno = self.gettechnology()

        column_tbc = f"{data_type}_tbc"
        column_bc = f"{data_type}_bc"
        column_cl = f"{data_type}_cl"
        column_nc = f"{data_type}_nc"

        print(self.operateur_list)
        placeholders = sql.SQL(", ").join(sql.Placeholder() for _ in self.operateur_list)

        query = sql.SQL("""
            SELECT
                op.nom_affichage,
                COALESCE(CASE WHEN t.{column_tbc}= t.{column_tbc}::integer THEN t.{column_tbc} ELSE ROUND(t.{column_tbc}::numeric,2) END, 0) AS tres_bonne_couverture,
                COALESCE(CASE WHEN t.{column_bc} = t.{column_bc}::integer THEN t.{column_bc} ELSE ROUND(t.{column_bc}::numeric,2) END, 0) AS bonne_couverture,
                COALESCE(CASE WHEN t.{column_cl} = t.{column_cl}::integer THEN t.{column_cl} ELSE ROUND(t.{column_cl}::numeric,2) END, 0) AS couverture_limitee,
                COALESCE(CASE WHEN t.{column_nc} = t.{column_nc}::integer THEN t.{column_nc} ELSE ROUND(t.{column_nc}::numeric,2) END, 0) AS non_couverte,
                op.couleur_niveau_1,
                op.couleur_niveau_2,
                op.couleur_niveau_3
            FROM
                (
                    SELECT unnest(ARRAY[{placeholders}]) AS mcc_mnc
                ) AS mcc_mnc_values
            LEFT JOIN {schema}.operateurs op ON op.identifiant = mcc_mnc_values.mcc_mnc
            LEFT JOIN {schema}.{table_name} t ON op.identifiant = t.mcc_mnc
            AND lower(t.techno) = lower(%s)
            {add_condition}
            ORDER BY op.nom_affichage
        """).format(
            column_tbc=sql.Identifier(column_tbc),
            column_bc=sql.Identifier(column_bc),
            column_cl=sql.Identifier(column_cl),
            column_nc=sql.Identifier(column_nc),
            schema=sql.Identifier(settings.DATABASE_SCHEMA),
            table_name=sql.Identifier(table_name),
            add_condition=add_condition,
            placeholders=placeholders,
        )

        final_params = self.operateur_list + [active_techno] + list(params_condition)
        results = self.odb.selectasarray(query, final_params)

        return results or False

    def getjsonresponse(self, results):
        data = {
            "message": "Données récupérées!",
            "success": True,
            "stats_operateur": [
                {
                    "nom_affichage": result["nom_affichage"],
                    "valeur_stats": [
                        float(result["tres_bonne_couverture"]),
                        float(result["bonne_couverture"]),
                        float(result["couverture_limitee"]),
                        float(result["non_couverte"]),
                    ],
                    "couleur_niveaux": [
                        result["couleur_niveau_3"],
                        result["couleur_niveau_2"],
                        result["couleur_niveau_1"],
                        "#F1EDE6",
                    ],
                }
                for result in results
            ],
        }

        return data

    def getnoresponse(self):
        noresponse = [
            {
                "nom_affichage": "Aucune donnée",
                "valeur_stats": [0, 0, 0, 100],
                "couleur_niveaux": ["#B54241", "#E47170", "#FFABAA", "#F1EDE6"],
            }
        ]

        return noresponse

    def gettechnology(self):
        return self.techno.upper()

    def gettypedata(self):
        data_type = "pop"

        if self.data_filter == "surface":
            data_type = "couv"

        return data_type

    def gettablename(self):
        table_name = "stats_couv_territoires"
        if self.entite == "commune":
            table_name = "stats_couv_communes"
        elif self.entite == "departement":
            table_name = "stats_couv_departements"
        elif self.entite == "region":
            table_name = "stats_couv_regions"

        return table_name

    def getadditionnalcondition(self):
        condition = sql.SQL("""
            AND t.territoire = 'METRO'
        """)
        params = ()

        if self.entite == "territoire" and self.insee != "metropole":
            condition = sql.SQL("""
                AND t.territoire = %s
            """)
            params = (self.insee,)

        elif self.entite == "departement":
            condition = sql.SQL("""
                AND t.departement = %s
            """)
            params = (self.insee,)

        elif self.entite == "commune":
            condition = sql.SQL("""
                AND t.commune = %s
            """)
            params = (self.insee,)

        elif self.entite == "region":
            condition = sql.SQL("""
                AND t.region = %s
            """)
            params = (self.insee,)

        return condition, params

    def isparamscorrect(self, request):
        if "filter_by" not in request.GET or "insee" not in request.GET or "operateurs" not in request.GET or "techno" not in request.GET or "entite" not in request.GET:
            return False

        return True
