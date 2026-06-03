from django.conf import settings
from django.http import JsonResponse
from psycopg import sql
from rest_framework.views import APIView

from back_mrm.utils.db import Db


class StatZacOperateur(APIView):
    def get(self, request):
        if self.is_correct_params(request):
            self.init_params(request)
            response = self.get_stat_zac_op()
        else:
            response = {"success": False, "message": "Paramètres incomplets"}

        return JsonResponse(response, safe=False)

    def get_stat_zac_op(self):
        data_ops = self.get_data_ops()
        if not data_ops:
            return {
                "success": False,
                "message": "Aucune donnée!",
            }

        data_json = self.get_json_response(data_ops)

        return data_json

    def get_data_ops(self):

        if len(self.operateur_list) == 0:
            return False

        placeholders = ",".join(["%s"] * len(self.operateur_list))
        params = self.operateur_list

        query = sql.SQL("""
            SELECT
                nom_affichage,
                COUNT(CASE WHEN zs.sites_mes = 1 THEN 1 ELSE NULL END) AS en_service,
                COUNT(CASE WHEN zs.sites_6_mois = 1 THEN 1 ELSE NULL END) AS sites_6_mois,
                COUNT(CASE WHEN zs.sites_6_24_mois = 1 THEN 1 ELSE NULL END) AS sites_6_24_mois,
                COUNT(CASE WHEN zs.sites_attente_deploiement = 1 THEN 1 ELSE NULL END) AS sites_attente_deploiement,
                couleur_niveau_1,
                couleur_niveau_2,
                couleur_niveau_3,
                couleur_niveau_4
            FROM {schema}.operateurs
            INNER JOIN {schema}.zac_site_operateurs zso ON zso.id_operateur = identifiant
            LEFT JOIN {schema}.zac_site zs ON zs.numero_site = zso.numero_site
            WHERE identifiant IN ({placeholders}) AND zs.site_physique = 1 
            GROUP BY nom_affichage, couleur_niveau_1, couleur_niveau_2, couleur_niveau_3, couleur_niveau_4
            ORDER BY nom_affichage
        """).format(schema=sql.Identifier(settings.DATABASE_SCHEMA), placeholders=sql.SQL(placeholders))

        results = self.odb.select_with_params(query, params)

        return results or False

    def get_json_response(self, results):
        data = {
            "success": True,
            "stats_operateur": [
                {
                    "nom_affichage": result["nom_affichage"],
                    "valeur_stats": [
                        result["en_service"],
                        result["sites_6_mois"],
                        result["sites_6_24_mois"],
                        result["sites_attente_deploiement"],
                    ],
                    "couleur_niveaux": [
                        result["couleur_niveau_4"],
                        result["couleur_niveau_3"],
                        result["couleur_niveau_2"],
                        result["couleur_niveau_1"],
                    ],
                }
                for result in results
            ],
        }

        return data

    def is_correct_params(self, request):
        if "operateurs" not in request.GET:
            return False

        return True

    def init_params(self, request):
        self.odb = Db()
        self.operateur_list = self._parse_operateur_list(request.GET["operateurs"])

    def _parse_operateur_list(self, operateurs_raw):
        if not operateurs_raw:
            return []

        result = []
        for op in operateurs_raw.split(","):
            op = op.strip()
            if op.isdigit():
                result.append(op)
        return result
