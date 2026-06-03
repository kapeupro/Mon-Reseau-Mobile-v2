from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import redirect
from django.views import View
from psycopg import sql

from back_mrm.utils.data import Data
from back_mrm.utils.db import Db

SCHEMA = settings.DATABASE_SCHEMA


class RemoveFileInDBView(View):
    def delete(self, request, data_type, file_name):
        if not request.user.is_authenticated:
            return redirect("login")

        odata = Data()
        table_name = odata.gettablename(data_type)

        odb = Db()
        res = odb.deletewherefile(table_name, file_name)

        if res:
            sequence_name = odata.get_sequence_name_by_type(data_type)
            self.reset_sequence(odb, sequence_name, table_name)

            data = {
                "message": "data deleted",
                "success": True,
            }
            return JsonResponse(data, safe=False)
        data = {
            "message": "data not deleted",
            "success": False,
        }
        return JsonResponse(data, safe=False)

    def reset_sequence(self, odb, sequence_name, table_name):
        query = sql.SQL("""
            SELECT setval(
                {sequence},
                COALESCE((SELECT max(odb.get_table_id({table})) + 1 FROM {table}), 1),
                false
            );
        """).format(
            sequence=sql.Literal(sequence_name),
            table=sql.Identifier(table_name),
        )
        odb.query(query)
