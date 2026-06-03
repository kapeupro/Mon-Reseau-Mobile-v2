from pathlib import Path

from django.conf import settings
from django.shortcuts import redirect, render
from rest_framework.views import APIView

from back_mrm.utils.data import Data
from back_mrm.utils.db import Db
from back_mrm.utils.folderfilter import FolderFilter


class ImportZacView(APIView):
    FOLDER_ZAC_POI = Path(settings.IMPORT_FILE) / "zac" / "poi"
    FOLDER_ZAC_SITE = Path(settings.IMPORT_FILE) / "zac" / "site"
    FOLDER_ZAC_RFR = Path(settings.IMPORT_FILE) / "zac" / "rfr"
    FOLDER_ZAC_ARP = Path(settings.IMPORT_FILE) / "zac" / "arp"
    FOLDER_ZAC_ARP_5G = Path(settings.IMPORT_FILE) / "zac" / "arp_5g"
    FOLDER_SIGNALEMENTS = Path(settings.IMPORT_FILE) / "signalements"
    SCHEMA = settings.DATABASE_SCHEMA
    odb = Db()

    def get(self, request):
        if request.user.is_authenticated:
            odata = Data()
            lst_files_zac_poi = odata.getlistfiles(self.FOLDER_ZAC_POI)
            lst_files_zac_site = odata.getlistfiles(self.FOLDER_ZAC_SITE)

            all_files_zac_rfr = odata.getlistfiles(self.FOLDER_ZAC_RFR, is_other_extension=True)
            all_files_zac_arp = odata.getlistfiles(self.FOLDER_ZAC_ARP, is_other_extension=True)
            all_files_zac_arp_5g = odata.getlistfiles(self.FOLDER_ZAC_ARP_5G, is_other_extension=True)

            lst_files_zac_rfr = self.getgpkgfiles(all_files_zac_rfr)
            lst_files_zac_arp = self.getgpkgfiles(all_files_zac_arp)
            lst_files_zac_arp_5g = self.getgpkgfiles(all_files_zac_arp_5g)

            table_name_zac_poi = odata.gettablename("zac_poi")
            table_name_zac_site = odata.gettablename("zac_site")
            table_name_zac_rfr = odata.gettablename("zac_rfr")
            table_name_zac_arp = odata.gettablename("zac_arp")
            table_name_zac_arp_5g = odata.gettablename("zac_arp_5g")

            lst_files_zac_poi_db = self.getlistfile(table_name_zac_poi)
            lst_files_zac_site_db = self.getlistfile(table_name_zac_site)
            lst_files_zac_rfr_db = self.getlistfile(table_name_zac_rfr)
            lst_files_zac_arp_db = self.getlistfile(table_name_zac_arp)
            lst_files_zac_arp_5g_db = self.getlistfile(table_name_zac_arp_5g)

            data_zac_poi = self.getdata(lst_files_zac_poi, lst_files_zac_poi_db)
            data_zac_site = self.getdata(lst_files_zac_site, lst_files_zac_site_db)
            data_zac_rfr = self.getdata(lst_files_zac_rfr, lst_files_zac_rfr_db)
            data_zac_arp = self.getdata(lst_files_zac_arp, lst_files_zac_arp_db)
            data_zac_arp_5g = self.getdata(lst_files_zac_arp_5g, lst_files_zac_arp_5g_db)

            return render(
                request,
                "zac.html",
                context={
                    "data_zac_poi": data_zac_poi,
                    "data_zac_site": data_zac_site,
                    "data_zac_axe_ferre": data_zac_rfr,
                    "data_zac_axe_routier_prioritaire": data_zac_arp,
                    "data_zac_axe_routier_prioritaire_5g": data_zac_arp_5g,
                    "lst_files_zac_poi_db": lst_files_zac_poi_db,
                    "lst_files_zac_site_db": lst_files_zac_site_db,
                    "lst_files_zac_axe_ferre_db": lst_files_zac_rfr_db,
                    "lst_files_zac_axe_routier_prioritaire_db": lst_files_zac_arp_db,
                    "lst_files_zac_axe_routier_prioritaire_5g_db": lst_files_zac_arp_5g_db,
                    "folder_zac_poi": self.FOLDER_ZAC_POI,
                    "folder_zac_site": self.FOLDER_ZAC_SITE,
                    "folder_zac_axe_ferre": self.FOLDER_ZAC_RFR,
                    "folder_zac_axe_routier_prioritaire": self.FOLDER_ZAC_ARP,
                    "folder_zac_axe_routier_prioritaire_5g": self.FOLDER_ZAC_ARP_5G,
                    "folder_signalements": self.FOLDER_SIGNALEMENTS,
                    "table_name_zac_poi": odata.gettablename("zac_poi"),
                    "table_name_zac_poi_operateurs": odata.gettablename("zac_poi_operateurs"),
                    "table_name_zac_site_operateurs": odata.gettablename("zac_site_operateurs"),
                    "table_name_zac_site": odata.gettablename("zac_site"),
                    "table_name_zac_axe_ferre": odata.gettablename("zac_rfr"),
                    "table_name_zac_axe_routier_prioritaire": odata.gettablename("zac_arp"),
                    "table_name_zac_axe_routier_prioritaire_5g": odata.gettablename("zac_arp_5g"),
                },
            )
        return redirect("login")

    def getdata(self, lst_files, lst_files_db):
        ofolderfilter = FolderFilter()
        ofolderfilter.setdatafolderbrut(lst_files)
        ofolderfilter.setdatatable(lst_files_db)

        return ofolderfilter.getlistfiles()

    def getlistfile(self, table_name):
        res = self.odb.getlistfiledb(table_name)

        return res if res and len(res) != 0 else False

    def getgpkgfiles(self, lst_files):
        lst_file_gpkg = []
        for file in lst_files:
            extension = file.split(".")[-1]
            if extension == "gpkg":
                lst_file_gpkg.append(file)

        return lst_file_gpkg
