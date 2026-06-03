from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import redirect
from psycopg import sql
from rest_framework.views import APIView

from back_mrm.utils.db import Db


class GetCrowdFromSource(APIView):
    def get(self, request, id_data_source):
        if not request.user.is_authenticated:
            return redirect("login")

        ocrowdoperation = GetCrowdOperation()

        data = ocrowdoperation.getcrowddata(id_data_source)
        if not data:
            return JsonResponse({"success": False, "message": "No data"}, safe=False)

        return JsonResponse(data, safe=False)


class GetCrowdOperation:
    def getcrowddata(self, id_data_source):
        query = sql.SQL("""
            SELECT id as id_source_desc, title AS title_source_desc
            FROM {}.qos_data_source_desc
            WHERE id_data_source = %s
            order by title_source_desc asc 
        """).format(sql.Identifier(settings.DATABASE_SCHEMA))

        params = (id_data_source,)
        odb = Db()
        results = odb.select_with_params(query, params)

        return results if results or len(results) != 0 else False
