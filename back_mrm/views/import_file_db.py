import json

from django.http import JsonResponse
from django.shortcuts import redirect
from django.views import View

from back_mrm.scripts.couverture_theorique import Couverture
from back_mrm.scripts.import_script import ImportScript
from back_mrm.scripts.import_site import ImportSite
from back_mrm.scripts.support_antenne_emetteur import SupportAntenneEmetteur
from back_mrm.utils.data import Data
from back_mrm.utils.pusher.gpkg import PusherGPKG


class ImportFileDbView(View):
    def post(self, request, table):
        if not request.user.is_authenticated:
            return redirect("login")

        data = json.loads(request.body)
        files_to_import = data.get("files")

        if table == "couvertures":
            try:
                opushergpkg = PusherGPKG(files_to_import, "couverture_theorique", table)

                if opushergpkg.checkfileextension():
                    if opushergpkg.checkifsupportedfile():
                        res = opushergpkg.run("import couverture")
                        if res:
                            response = {"message": "Fichier importé avec succès", "success": True}
                        else:
                            response = {"message": opushergpkg.geterror(), "success": False}
                    else:
                        response = {
                            "message": "Fichier non importé, manques colonnes operateur_infra et operateur_commercial",
                            "success": False,
                        }
                else:
                    response = {"message": "Fichier non gpkg trouvé", "success": False}
                return JsonResponse(response)
            except Exception as e:
                response = {"message": "Erreur survenue " + str(e), "success": False}
                return JsonResponse(response)
        elif table == "consolidation_couvertures":
            try:
                ocouverture = Couverture("")
                ocouverture.updateoperateurcouverture()
                ocouverture.generatetiles()
                response = {"success": True}
                return JsonResponse(response)
            except Exception as e:
                response = {"message": "Erreur survenue " + str(e), "success": False}
                return JsonResponse(response)
        elif self.is_table_for_import_csv(table):
            response = self.runimportcsv(files_to_import, table)
            return JsonResponse(response)
        elif table == "sites":
            try:
                oimportsite = ImportSite(files_to_import, "site", table)
                response = oimportsite.run()
                return JsonResponse(response)
            except Exception as e:
                response = {"message": "Erreur survenue " + str(e), "success": False}
                return JsonResponse(response)
        elif table == "site_a_venir":
            try:
                oimportsite = ImportSite(files_to_import, "site_a_venir", "a_venir")
                response = oimportsite.run()
                return JsonResponse(response)
            except Exception as e:
                response = {"message": "Erreur survenue " + str(e), "success": False}
                return JsonResponse(response)
        elif table == "stations":
            try:
                file_sabes = data.get("file_sabes")
                osupportantenneemetteur = SupportAntenneEmetteur(files_to_import, table, file_sabes)
                response = osupportantenneemetteur.insert_file_data()
                return JsonResponse(response)
            except Exception as e:
                response = {"message": "Erreur survenue " + str(e), "success": False}
                return JsonResponse(response)
        elif table in ["zac_rfr", "zac_arp", "zac_arp_5g"]:
            try:
                response = self.run_import_gpkg(files_to_import, table)
            except Exception as e:
                response = {"message": "Erreur survenue " + str(e), "success": False}

            return JsonResponse(response)

    def runimportcsv(self, files_to_import, table):
        oimportscript = ImportScript(files_to_import, table)
        try:
            response = oimportscript.runimport()
        except Exception as e:
            response = {"success": False, "message": "Erreur survenue :" + str(e)}

        return response

    def is_table_for_import_csv(self, table):
        table_list = [
            "stats_nbope",
            "stat_communes",
            "stat_departements",
            "stat_regions",
            "stat_territoires",
            "emetteurs_link",
            "stats_qos_departements",
            "natures",
            "qos_density",
            "insee_density",
            "qos_stat",
            "stats_qos_regions",
            "stats_qos_metropole",
            "zac_poi",
            "zac_site",
            "signalements",
        ]

        if table not in table_list:
            return False

        return True

    def run_import_gpkg(self, files_to_import, table):
        o_data = Data()
        tablename = o_data.gettablename(table)
        type_import = o_data.gettypeimport(table)

        opushergpkg = PusherGPKG(files_to_import, tablename, table)

        if opushergpkg.check_coherent_fields(type_import):
            res = opushergpkg.run(type_import)
            if res:
                response = {"message": "Fichier importé avec succès", "success": True}
            else:
                response = {"message": opushergpkg.geterror(), "success": False}
        else:
            response = {"message": "Champs table et gpkg incohérents", "success": False}

        return response
