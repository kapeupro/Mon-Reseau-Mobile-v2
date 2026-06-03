from django.conf import settings
from django.http import JsonResponse
from psycopg import sql
from rest_framework.views import APIView

from back_mrm.utils.db import Db


class StatZone(APIView):
    def get(self, request):
        if self.iscorrectparams(request):
            ostatzoneoperation = StatZoneOperation(request)
            try:
                response = ostatzoneoperation.getstatfromzone()
            except Exception as e:
                response = {"success": False, "message": f"Erreur survenue : {e!s}"}
        else:
            response = {"success": False, "message": "Paramètres incomplets"}

        return JsonResponse(response, safe=False)

    def iscorrectparams(self, request):
        if "id" not in request.GET:
            return False

        if "entite" not in request.GET:
            return False

        return True


class StatZoneOperation:
    def __init__(self, request):
        self.initparams(request)

    def initparams(self, request):
        self.odb = Db()
        self.id = request.GET["id"]
        self.entite = request.GET["entite"]
        self.dept_outremer = request.GET.get("dept_outremer", "")

    def getstatfromzone(self):
        data = {
            "success": True,
            "nbrSiteDemande": self.get_nb_site("site_demande"),
            "nbrSitePutInService": self.get_nb_site("site_put_in_service"),
        }

        return data

    def get_nb_site(self, type):
        additional_query, params = self.get_additionnal_query_site(type)

        # Utilisation de psycopg.sql pour construire la requête de manière sécurisée
        query = sql.SQL("""
            SELECT COUNT(DISTINCT zs.id) as nb_site
            FROM {schema}.zac_site zs
            {additional_query}
        """).format(schema=sql.Identifier(settings.DATABASE_SCHEMA), additional_query=sql.SQL(additional_query))

        results = self.odb.selectasarray(query, params)

        return results[0]["nb_site"] if results and results[0]["nb_site"] != 0 else False

    def get_additionnal_query_site(self, type):
        """
        Retourne les conditions WHERE et les paramètres pour la requête paramétrée.
        Format retour: (clause_where, list_params)
        """
        add_condition = ""
        params = []

        if type == "site_demande":
            add_condition = ""
        else:
            add_condition = "AND zs.sites_mes = 1"

        if self.is_metropole():
            dept_list = self.get_dept_outremer_list()
            if dept_list:
                placeholders = ",".join(["%s"] * len(dept_list))
                query = f"WHERE zs.insee_dep NOT IN ({placeholders})"
                params.extend(dept_list)
            else:
                query = "WHERE 1=1"
        else:
            query = "WHERE zs.insee_dep LIKE %s"
            params.append(f"%{self.id}%")

        query += " AND zs.site_physique = 1 "
        query += add_condition

        if self.entite == "region":
            query = (
                sql.SQL("""
                LEFT JOIN {schema}.departement d ON zs.insee_dep LIKE '%' || d.insee_dep || '%'
                WHERE d.insee_reg = %s AND zs.site_physique = 1
                {add_condition}
            """)
                .format(schema=sql.Identifier(settings.DATABASE_SCHEMA), add_condition=sql.SQL(add_condition))
                .as_string(self.odb.connection)
            )
            params = [self.id]

        return query, params

    def is_metropole(self):
        return self.entite == "territoire" and self.id == "metropole"

    def get_dept_outremer_list(self):
        """Retourne une liste propre des départements sans formatage SQL"""
        if not self.dept_outremer:
            return []
        lst_dept_outremer = self.dept_outremer.split(",")
        # Nettoyage basique pour éviter les injections dans les valeurs
        return [dept.strip() for dept in lst_dept_outremer if dept.strip()]
