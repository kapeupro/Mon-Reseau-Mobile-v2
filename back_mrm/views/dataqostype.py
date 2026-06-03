from django.conf import settings
from django.http import JsonResponse
from psycopg import sql
from rest_framework.views import APIView

from back_mrm.utils.db import Db


class DataQosType(APIView):
    def get(self, request):
        if self.isparamscorrect(request):
            odb = Db()
            datasource = request.GET.get("datasource")
            query = sql.SQL("""
                select distinct protocole from {}.qos 
                where id_data_source_desc = %s 
                and protocole is not null
            """).format(sql.Identifier(settings.DATABASE_SCHEMA))
            params = (datasource,)
            results = odb.selectasarray(query, params)
            if results:
                data = [item["protocole"] for item in results]
                response = {"success": True, "data": data}
            else:
                response = {"success": False, "message": "no data"}
        else:
            response = {"success": False, "message": "Paramètres incomplets!"}

        return JsonResponse(response, safe=False)

    def isparamscorrect(self, request):
        if "datasource" not in request.GET:
            return False

        return request.GET.get("datasource").isdigit()
