from django.conf import settings
from django.http import JsonResponse
from psycopg import sql
from rest_framework.views import APIView

from back_mrm.utils.db import Db


class StatTest(APIView):
    def get(self, request):
        if self.iscorrectparams(request):
            ostattestoperation = StatTestOperation(request)
            try:
                response = ostattestoperation.getstatfromtest()
            except Exception as e:
                response = {"success": False, "message": f"Erreur survenue : {e!s}"}
        else:
            response = {"success": False, "message": "Paramètres incomplets"}

        return JsonResponse(response, safe=False)

    def iscorrectparams(self, request):
        required_params = ["id", "entite", "operators", "protocole", "datasource"]
        return all(param in request.GET for param in required_params)


class StatTestOperation:
    # Whitelist des protocoles autorisés pour éviter l'injection SQL
    ALLOWED_PROTOCOLS = ["UPLOAD", "DOWNLOAD", "WEB", "STREAM", "VOIX", "SMS"]

    def __init__(self, request):
        self.initparams(request)

    def initparams(self, request):
        self.odb = Db()
        self.schema = settings.DATABASE_SCHEMA
        self.id = request.GET["id"]
        self.entite = request.GET["entite"]
        self.list_op = self.splitparams(request.GET["operators"])
        self.protocole = request.GET["protocole"]
        self.datasource = request.GET["datasource"]
        self.request = request

    def build_sql_departement(self):
        protocole = self.get_params("protocole")

        # Validation du protocole contre la whitelist
        if protocole.upper() not in self.ALLOWED_PROTOCOLS:
            raise ValueError(f"Protocole non autorisé : {protocole}")

        # Condition protocole sécurisée
        if protocole.upper() == "UPLOAD":
            protocole_condition = sql.SQL("upper(service) = 'ULH'")
        else:
            protocole_condition = sql.SQL("upper(service) = upper(%s)")

        # Construction de la requête avec psycopg.sql
        query = sql.SQL("""
            WITH data_stat AS (
                SELECT
                    mccmnc::integer AS identifiant,
                    ROUND(resultat, 2) AS prct,
                    ROUND((nb_test * resultat) / 100) AS total_success,
                    nb_test::integer AS total
                FROM {schema}.qos_stat t
                LEFT JOIN {schema}.departement d ON d.insee_dep = t.insee_dep
                WHERE t.insee_dep = %s
                AND {protocole_condition}
            )
            SELECT o.identifiant, d.prct, d.total_success, d.total
            FROM {schema}.operateurs o
            LEFT JOIN data_stat d ON d.identifiant = o.identifiant
            WHERE o.identifiant IN ({operators_placeholders})
            ORDER BY array_position(ARRAY[{operators_placeholders}], o.identifiant)
        """).format(
            schema=sql.Identifier(self.schema),
            protocole_condition=protocole_condition,
            operators_placeholders=sql.SQL(",".join(["%s"] * len(self.list_op))),
        )

        # Paramètres : id + protocole (si nécessaire) + liste opérateurs (x2 pour IN et ARRAY)
        params = [self.id]
        if protocole.upper() != "UPLOAD":
            params.append(protocole)
        params.extend(self.list_op)
        params.extend(self.list_op)  # Pour le ARRAY[] dans ORDER BY

        return query, params

    def build_sql_region(self):
        protocole = self.get_params("protocole")

        if protocole.upper() not in self.ALLOWED_PROTOCOLS:
            raise ValueError(f"Protocole non autorisé : {protocole}")

        if protocole.upper() == "UPLOAD":
            protocole_condition = sql.SQL("upper(service) = 'ULH'")
        else:
            protocole_condition = sql.SQL("upper(service) = upper(%s)")

        query = sql.SQL("""
            WITH data_stat AS (
                SELECT mccmnc::integer AS identifiant,
                    SUM(ROUND((nb_test * resultat) / 100)) AS total_success,
                    SUM(nb_test::integer) AS total
                FROM {schema}.qos_stat t
                LEFT JOIN {schema}.departement d ON d.insee_dep = t.insee_dep
                WHERE d.insee_reg = %s
                AND {protocole_condition}
                GROUP BY mccmnc
            )
            SELECT o.identifiant,
                ROUND(d.total_success * 100 / d.total, 2) AS prct,
                d.total_success, d.total
            FROM {schema}.operateurs o
            LEFT JOIN data_stat d ON d.identifiant = o.identifiant
            WHERE o.identifiant IN ({operators_placeholders})
            ORDER BY array_position(ARRAY[{operators_placeholders}], o.identifiant)
        """).format(
            schema=sql.Identifier(self.schema),
            protocole_condition=protocole_condition,
            operators_placeholders=sql.SQL(",".join(["%s"] * len(self.list_op))),
        )

        params = [self.id]
        if protocole.upper() != "UPLOAD":
            params.append(protocole)
        params.extend(self.list_op)
        params.extend(self.list_op)

        return query, params

    def build_sql_metropole(self):
        protocole = self.get_params("protocole")

        if protocole.upper() not in self.ALLOWED_PROTOCOLS:
            raise ValueError(f"Protocole non autorisé : {protocole}")

        if protocole.upper() == "UPLOAD":
            protocole_condition = sql.SQL("upper(service) = 'ULH'")
        else:
            protocole_condition = sql.SQL("upper(service) = upper(%s)")

        query = sql.SQL("""
            WITH data_stat AS (
                SELECT
                    mccmnc::integer AS identifiant,
                    resultat,
                    nb_test::integer AS total
                FROM {schema}.qos_stat t
                WHERE trim(lower(unaccent(nom_region))) = 'metropole'
                AND {protocole_condition}
            )
            SELECT o.identifiant,
                ROUND(d.resultat, 2) AS prct,
                CAST((d.resultat * d.total) / 100 AS integer) AS total_success,
                d.total
            FROM {schema}.operateurs o
            LEFT JOIN data_stat d ON d.identifiant = o.identifiant
            WHERE o.identifiant IN ({operators_placeholders})
            ORDER BY array_position(ARRAY[{operators_placeholders}], o.identifiant)
        """).format(
            schema=sql.Identifier(self.schema),
            protocole_condition=protocole_condition,
            operators_placeholders=sql.SQL(",".join(["%s"] * len(self.list_op))),
        )

        params = []
        if protocole.upper() != "UPLOAD":
            params.append(protocole)
        params.extend(self.list_op)
        params.extend(self.list_op)

        return query, params

    def is_departement(self):
        return self.entite == "departement"

    def is_territoire(self):
        return self.entite == "territoire"

    def is_region(self):
        return self.entite == "region"

    def build_sql(self):
        if self.is_departement():
            return self.build_sql_departement()

        if self.is_region():
            return self.build_sql_region()

        if self.is_territoire():
            if self.id != "metropole":
                return self.build_sql_departement()

        return self.build_sql_metropole()

    def getstatfromtest(self):
        try:
            query, params = self.build_sql()
        except Exception as e:
            return self.display_error(f"Erreur construction SQL : {e!s}")

        if not query:
            return self.display_error("sql")

        results = self.odb.selectasarray(query, params)

        if not results:
            return self.display_error("no-data")

        return {"success": True, "data": [dct_data for dct_data in results]}

    def display_error(self, msg=""):
        return {"success": False, "message": msg}

    def gettablename(self):
        table_mapping = {
            "commune": "stats_qos_communes",
            "departement": "stats_qos_departements",
            "region": "stats_qos_regions",
        }
        return table_mapping.get(self.entite, "stats_qos_territoires")

    def getinseeentite(self):
        insee_mapping = {
            "commune": "insee_com",
            "departement": "insee_dep",
            "region": "insee_reg",
        }
        return insee_mapping.get(self.entite, "territoire")

    def getfield(self, status):
        return "nb_test" if status == "nb_test" else "resultat"

    def splitparams(self, data):
        """Parse la chaîne d'opérateurs en liste d'entiers validés"""
        sParams = []
        for valeur in data.split(","):
            valeur = valeur.strip()
            try:
                if valeur:
                    sParams.append(int(valeur))
            except ValueError:
                continue  # Ignore les valeurs incorrectes
        return sParams

    def get_params(self, key):
        return self.request.GET.get(key, "")

    def get_params_as_array(self, key):
        """Retourne une liste Python pour utilisation avec paramètres"""
        params = self.get_params(key)
        if not params:
            return []
        if params.lower() == "toutes":
            params = "OTHERS,ZONES RURALES,ZONES INTERMEDIAIRES,ZONES DENSES,ZONES TOURISTIQUES"
        return [p.strip() for p in params.split(",") if p.strip()]

    def build_sql_where(self):
        """Version sécurisée utilisant des paramètres pour la fonction"""
        protocole = self.get_params("protocole")
        datasource = self.get_params("datasource")
        ishabitation = "0"  # always 0 because it concerned habitation

        metropole = self.get_params("metropole")
        ismetrople = "1" if metropole and self.format_to_lower(metropole) == "1" else "0"

        operators = self.get_params("operators")
        operators_param = "all" if len(operators.split(",")) > 1 else operators

        situation = self.get_params_as_array("situation")
        zone = self.get_params_as_array("zone")

        # Construction sécurisée de l'appel de fonction
        query = sql.SQL("""
            SELECT {schema}.fc_qos_filterbuilder(%s, %s, %s, %s, %s, %s, %s) AS swhere
        """).format(schema=sql.Identifier(self.schema))

        # Conversion des listes en format PostgreSQL array
        situation_str = ",".join(situation) if situation else ""
        zone_str = ",".join(zone) if zone else ""

        params = [operators_param, protocole, situation_str, zone_str, datasource, ismetrople, ishabitation]

        results = self.odb.select_with_params(query, params)

        if not results:
            return False

        return results[0]["swhere"].replace(" WHERE ", "")

    def is_all_value_of_params(self, val_params):
        return self.format_to_lower(val_params) == "toutes"

    def format_to_lower(self, value):
        return str(value).lower().strip()

    def get_fields_by_protocol(self):
        protocole = self.format_to_lower(self.get_params("protocole"))

        dct_fields = {
            "web": """
                CASE
                    WHEN acess_duration < 5 THEN 1
                    ELSE 0
                END
            """,
            "stream": """
                CASE
                    WHEN quality_perfect THEN 1
                    ELSE 0
                END
            """,
            "upload": """
                CASE
                    WHEN upload_ok THEN 1
                    ELSE 0
                END
            """,
            "download": """
                CASE
                    WHEN bitrate_dl >= 30 THEN 1
                    ELSE 0
                END
            """,
            "voix": """
                CASE
                    WHEN crspa THEN 1
                    ELSE 0
                END
            """,
            "sms": """
                CASE
                    WHEN sms_delai <= 10 THEN 1
                    ELSE 0
                END
            """,
        }

        return dct_fields.get(protocole)

    def get_where_by_protocol(self):
        protocole = self.format_to_lower(self.get_params("protocole"))

        dct_fields = {
            "web": "acess_duration IS NOT NULL",
            "stream": "quality_perfect IS NOT NULL",
            "upload": "upload_ok IS NOT NULL",
            "download": "bitrate_dl IS NOT NULL",
            "voix": "crspa IS NOT NULL",
            "sms": "sms_delai IS NOT NULL",
        }

        return dct_fields.get(protocole)

    def build_join_table(self):
        entite = self.get_params("entite")
        if entite == "region":
            return sql.SQL("""
                INNER JOIN {schema}.departement dept ON dept.insee_dep = tbl.insee_dep
                INNER JOIN {schema}.region reg ON reg.insee_reg = dept.insee_reg
            """).format(schema=sql.Identifier(self.schema))
        return sql.SQL("")

    def add_where_entity(self, s_where):
        entite = self.get_params("entite")
        id_param = self.get_params("id")

        if entite == "region":
            s_where_entity = sql.SQL("reg.insee_reg = %s")
            params = [id_param]
        elif entite == "departement":
            s_where_entity = sql.SQL("tbl.insee_dep = %s")
            params = [id_param]
        else:
            return s_where, []

        if s_where:
            full_where = sql.SQL("{s_where} AND {s_where_entity}").format(
                s_where=sql.SQL(s_where), s_where_entity=s_where_entity
            )
        else:
            full_where = s_where_entity

        return full_where, params

    def format_data(self, dct_data):
        if dct_data.get("total", 0) == 0:
            dct_data["prct"] = 0
        else:
            dct_data["prct"] = int(dct_data.get("total_success", 0) * 100 / dct_data["total"])
        return dct_data
