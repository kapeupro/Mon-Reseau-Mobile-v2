from django.shortcuts import redirect, render
from django.views import View

from back_mrm.scripts import delete_table


class RemoveTableView(View):
    def get(self, request, table):

        if not request.user.is_authenticated:
            return redirect("login")

        return self.delete_table_db(request, table)

    def delete_table_db(self, request, table):
        if table == "couvertures":
            try:
                delete_table.run("couverture_theorique")
                return render(
                    request,
                    "success.html",
                    {"data_type": table, "file_name": "table " + table, "message": " effacé avec succès"},
                )
            except Exception as e:
                return render(
                    request,
                    "success.html",
                    {"data_type": table, "file_name": "table " + table, "message": " non effacé car " + e},
                )
            # return render(request, 'success.html', {'data_type': table, 'file_name': 'table '+table, 'message': ' effacé avec succès'})
        elif table == "stat_communes":
            try:
                delete_table.run("stats_couv_communes")
                return render(
                    request,
                    "success.html",
                    {"data_type": table, "file_name": "table " + table, "message": " effacé avec succès"},
                )
            except Exception as e:
                return render(
                    request,
                    "success.html",
                    {"data_type": table, "file_name": "table " + table, "message": " non effacé car " + e},
                )
        elif table == "stat_departements":
            try:
                delete_table.run("stats_couv_departements")
                return render(
                    request,
                    "success.html",
                    {"data_type": table, "file_name": "table " + table, "message": " effacé avec succès"},
                )
            except Exception as e:
                return render(
                    request,
                    "success.html",
                    {"data_type": table, "file_name": "table " + table, "message": " non effacé car " + e},
                )
        elif table == "stat_regions":
            try:
                delete_table.run("stats_couv_regions")
                return render(
                    request,
                    "success.html",
                    {"data_type": table, "file_name": "table " + table, "message": " effacé avec succès"},
                )
            except Exception as e:
                return render(
                    request,
                    "success.html",
                    {"data_type": table, "file_name": "table " + table, "message": " non effacé car " + e},
                )
        elif table == "stat_territoires":
            try:
                delete_table.run("stats_couv_territoires")
                return render(
                    request,
                    "success.html",
                    {"data_type": table, "file_name": "table " + table, "message": " effacé avec succès"},
                )
            except Exception as e:
                return render(
                    request,
                    "success.html",
                    {"data_type": table, "file_name": "table " + table, "message": " non effacé car " + e},
                )
        elif table == "sites":
            try:
                delete_table.run("site")
                return render(
                    request,
                    "success.html",
                    {"data_type": table, "file_name": "table " + table, "message": " effacé avec succès"},
                )
            except Exception as e:
                return render(
                    request,
                    "success.html",
                    {"data_type": table, "file_name": "table " + table, "message": " non effacé car " + e},
                )
        elif table == "qos" or table == "stations" or table == "antennes" or table == "supports":
            return render(
                request,
                "success.html",
                {"data_type": table, "file_name": "table " + table, "message": " effacé avec succès"},
            )
        elif table == "emetteurs":
            try:
                delete_table.run("emetteurs_link")
                return render(
                    request,
                    "success.html",
                    {"data_type": table, "file_name": "table " + table, "message": " effacé avec succès"},
                )
            except Exception as e:
                return render(
                    request,
                    "success.html",
                    {"data_type": table, "file_name": "table " + table, "message": " non effacé car " + e},
                )
