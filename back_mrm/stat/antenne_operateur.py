from django.conf import settings
from django.http import JsonResponse
from psycopg import sql
from rest_framework.views import APIView

from back_mrm.utils.db import Db


class StatAntenneOperateur(APIView):
    # Whitelist des entités autorisées pour éviter l'injection SQL via le nom de table
    ALLOWED_ENTITES = {
        "commune": "stat_site_commune",
        "departement": "stat_site_departement",
        "region": "stat_site_region",
        "territoire": "stat_site_territoire",
    }

    # Mapping entité → champ INSEE
    ENTITE_INSEE_FIELD = {
        "commune": "insee_com",
        "departement": "insee_dep",
        "region": "insee_reg",
        "territoire": "insee_territoire",
    }

    def get(self, request):
        if self.is_params_correct(request):
            try:
                self.init_params(request)
                data = self.get_stats_operateur()
            except Exception as e:
                data = {
                    "success": False,
                    "message": f"Erreur survenue : {e!s}",
                }
        else:
            data = {
                "success": False,
                "message": "Paramètres incomplets",
            }

        return JsonResponse(data, safe=False)

    def init_params(self, request):
        self.odb = Db()
        self.insee = self.get_insee(request.GET["insee"])
        self.operateur_list = self._validate_operators(request.GET["operateurs"])
        self.entite = self._validate_entite(request.GET["entite"])

    def _validate_entite(self, entite):
        """Valide l'entité contre la whitelist"""
        entite_lower = entite.lower().strip()
        if entite_lower not in self.ALLOWED_ENTITES:
            raise ValueError(f"Entité non autorisée : {entite}")
        return entite_lower

    def _validate_operators(self, operators_str):
        """Valide et parse la liste des opérateurs comme entiers"""
        validated = []
        for operateur in operators_str.split(","):
            operateur = operateur.strip()
            if operateur:
                try:
                    validated.append(int(operateur))
                except (ValueError, TypeError):
                    continue  # Ignore les valeurs invalides
        if not validated:
            raise ValueError("Aucun opérateur valide fourni")
        return validated

    def get_insee(self, current_insee):
        if current_insee.lower() == "metropole":
            return "metro"
        return current_insee.strip()

    def is_params_correct(self, request):
        required_params = ["insee", "operateurs", "entite"]
        return all(param in request.GET for param in required_params)

    def get_stats_operateur(self):
        try:
            data_stats = self.get_data_stats()
            if not data_stats:
                return {
                    "success": False,
                    "message": "Aucune donnée",
                }

            return self.build_json(data_stats)
        except Exception as e:
            return {
                "success": False,
                "message": f"Erreur : {e!s}",
            }

    def get_data_stats(self):
        # Récupération du nom de table depuis la whitelist
        table_name = self.get_table_name()
        insee_field = self.ENTITE_INSEE_FIELD.get(self.entite, "insee_territoire")

        # Création des placeholders pour la clause IN (%s, %s, ...)
        operators_placeholders = ",".join(["%s"] * len(self.operateur_list))
        params = self.operateur_list + [self.insee]

        # Construction sécurisée de la requête avec psycopg.sql
        query = sql.SQL("""
            SELECT 
                nom_affichage, 
                couleur_niveau_1, 
                couleur_niveau_2, 
                couleur_niveau_3, 
                "2g3g4g", 
                "5g", 
                "5g_autres", 
                total_site
            FROM {schema}.{table}
            LEFT JOIN {schema}.operateurs ON code_op = identifiant
            WHERE code_op IN ({operators_placeholders})
            AND {insee_field} = %s
            ORDER BY nom_affichage
        """).format(
            schema=sql.Identifier(settings.DATABASE_SCHEMA),
            table=sql.Identifier(table_name),
            operators_placeholders=sql.SQL(operators_placeholders),
            insee_field=sql.Identifier(insee_field),
        )

        results = self.odb.selectasarray(query, params)

        return results or False

    def build_json(self, results):
        data = {
            "success": True,
            "stats_operateur": [
                {
                    "nom_affichage": result["nom_affichage"],
                    "total_site": int(result["total_site"]) if result["total_site"] else 0,
                    "valeur_stats": [
                        int(result["2g3g4g"]) if result["2g3g4g"] else 0,
                        int(result["5g_autres"]) if result["5g_autres"] else 0,
                        int(result["5g"]) if result["5g"] else 0,
                    ],
                    "couleur_niveaux": [
                        result["couleur_niveau_1"],
                        result["couleur_niveau_2"],
                        result["couleur_niveau_3"],
                    ],
                }
                for result in results
            ],
        }

        return data

    def get_table_name(self):
        """Retourne le nom de table depuis la whitelist"""
        return self.ALLOWED_ENTITES.get(self.entite, "stat_site_territoire")
