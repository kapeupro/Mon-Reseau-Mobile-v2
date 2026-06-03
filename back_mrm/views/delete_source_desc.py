from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import redirect
from psycopg import sql
from rest_framework.views import APIView

from back_mrm.utils.db import Db


class DeleteSourceDesc(APIView):
    def delete(self, request):
        if not request.user.is_authenticated:
            return redirect("login")

        odeletesourcedescoperation = DeleteSourceDescOperation(request)

        try:
            response = odeletesourcedescoperation.deletesourcedesc()
        except Exception as e:
            response = {"success": False, "message": f"Erreur survenue : {e!s}"}

        return JsonResponse(response, safe=False)


class DeleteSourceDescOperation:
    def __init__(self, request):
        self.odb = Db()
        self.schema = settings.DATABASE_SCHEMA
        self.id_data_source_desc = request.data.get("id_source_desc")

    def deletesourcedesc(self):
        is_source_desc_in_qos_table_deleted = self.deleteidsourcedescfromtableqos()
        if not is_source_desc_in_qos_table_deleted:
            response = {"success": False, "message": "Erreur suppression id_data_source_desc dans la table qos"}
        else:
            is_source_desc_deleted = self.deletesourcedescfromtable()
            if not is_source_desc_deleted:
                response = {"success": False, "message": "Erreur suppression source description"}
            else:
                response = {"success": True, "message": "Supression effectuée"}

        return response

    def deleteidsourcedescfromtableqos(self):
        query = sql.SQL("""
            DELETE FROM {}.qos
            WHERE id_data_source_desc = %s
        """).format(sql.Identifier(self.schema))
        params = (self.id_data_source_desc,)
        res = self.odb.queryparams(query, params)

        return res

    def deletesourcedescfromtable(self):
        query = sql.SQL("""
            DELETE FROM {}.qos_data_source_desc
            WHERE id = %s
        """).format(sql.Identifier(self.schema))
        params = (self.id_data_source_desc,)
        res = self.odb.queryparams(query, params)

        return res
