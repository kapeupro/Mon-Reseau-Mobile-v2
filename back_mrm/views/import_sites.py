from pathlib import Path

from django.conf import settings
from django.shortcuts import redirect, render
from django.views import View

from back_mrm.utils.data import Data
from back_mrm.utils.db import Db
from back_mrm.utils.folderfilter import FolderFilter


class ImportSitesView(View):
    FOLDER_SITE = Path(settings.IMPORT_FILE) / "site" / "site"
    FOLDER_NATURE = Path(settings.IMPORT_FILE) / "site" / "nature"
    FOLDER_ANTENNE = Path(settings.IMPORT_FILE) / "site" / "antenne"
    FOLDER_STATION = Path(settings.IMPORT_FILE) / "site" / "station"
    FOLDER_BANDE = Path(settings.IMPORT_FILE) / "site" / "bande"
    FOLDER_SUPPORT = Path(settings.IMPORT_FILE) / "site" / "support"
    FOLDER_EMETTEUR = Path(settings.IMPORT_FILE) / "site" / "emetteur"
    FOLDER_EMETTEUR_LINK = Path(settings.IMPORT_FILE) / "site" / "emetteur_link"
    FOLDER_SITE_A_VENIR = Path(settings.IMPORT_FILE) / "site" / "a_venir"
    FOLDER_SIGNALEMENTS = Path(settings.IMPORT_FILE) / "signalements"

    def get(self, request):
        if request.user.is_authenticated:
            context = self.getcontext()
            return render(request, "sites.html", context=context)
        return redirect("login")

    def getcontext(self):
        odata = Data()
        lst_sites = odata.getlistfiles(self.FOLDER_SITE)
        lst_sites_csv = self.getcsvfiles(lst_sites)

        lst_nature = odata.getlistfiles(self.FOLDER_NATURE, is_other_extension=True)
        lst_nature_txt = self.gettxtfiles(lst_nature)

        lst_stations = odata.getlistfiles(self.FOLDER_STATION, is_other_extension=True)
        lst_stations_zip = self.getzipfiles(lst_stations)

        lst_bandes = odata.getlistfiles(self.FOLDER_BANDE, is_other_extension=True)
        lst_bandes_zip = self.getzipfiles(lst_bandes)

        lst_antennes = odata.getlistfiles(self.FOLDER_ANTENNE, is_other_extension=True)
        lst_antennes_zip = self.getzipfiles(lst_antennes)

        lst_supports = odata.getlistfiles(self.FOLDER_SUPPORT, is_other_extension=True)
        lst_supports_zip = self.getzipfiles(lst_supports)

        lst_emetteurs = odata.getlistfiles(self.FOLDER_SUPPORT, is_other_extension=True)
        lst_emetteurs_zip = self.getzipfiles(lst_emetteurs)

        lst_emetteurs_link = odata.getlistfiles(self.FOLDER_EMETTEUR_LINK)
        lst_emetteurs_link_csv = self.getcsvfiles(lst_emetteurs_link)

        lst_sites_avenir = odata.getlistfiles(self.FOLDER_SITE_A_VENIR, is_other_extension=True)
        lst_sites_avernir_csv = self.getcsvfiles(lst_sites_avenir)

        odb = Db()
        table_site = odata.gettablename("sites")
        lst_files_sites = odb.getlistfiledb(table_site)

        table_site_avenir = odata.gettablename("site_a_venir")
        lst_files_sites_avenir = odb.getlistfiledb(table_site_avenir)

        table_nature = odata.gettablename("natures")
        lst_files_natures = odb.getlistfiledb(table_nature)

        table_station = odata.gettablename("stations")
        lst_files_stations = odb.getlistfiledb(table_station)

        table_bande = odata.gettablename("bandes")
        lst_files_bandes = odb.getlistfiledb(table_bande)

        table_antenne = odata.gettablename("antennes")
        lst_files_antennes = odb.getlistfiledb(table_antenne)

        table_support = odata.gettablename("supports")
        lst_files_supports = odb.getlistfiledb(table_support)

        table_emetteur = odata.gettablename("emetteurs")
        lst_files_emetteurs = odb.getlistfiledb(table_emetteur)

        table_emetteur_link = odata.gettablename("emetteurs_link")
        lst_files_emetteurs_link = odb.getlistfiledb(table_emetteur_link)

        data_site = self.getdata(lst_sites_csv, lst_files_sites)
        data_site_avenir = self.getdata(lst_sites_avernir_csv, lst_files_sites_avenir)

        data_nature = self.getdata(lst_nature_txt, lst_files_natures)
        data_station = self.getdata(lst_stations_zip, lst_files_stations)
        data_bande = self.getdata(lst_bandes_zip, lst_files_bandes)
        data_antenne = self.getdata(lst_antennes_zip, lst_files_antennes)
        data_support = self.getdata(lst_supports_zip, lst_files_supports)
        data_emetteur = self.getdata(lst_emetteurs_zip, lst_files_emetteurs)
        data_emetteur_link = self.getdata(lst_emetteurs_link_csv, lst_files_emetteurs_link)

        return {
            "data_site": data_site,
            "data_site_avenir": data_site_avenir,
            "data_nature": data_nature,
            "data_station": data_station,
            "data_bande": data_bande,
            "data_antenne": data_antenne,
            "data_support": data_support,
            "data_emetteur": data_emetteur,
            "data_emetteur_link": data_emetteur_link,
            "data_site_db": lst_files_sites,
            "data_site_avenir_db": lst_files_sites_avenir,
            "data_nature_db": lst_files_natures,
            "data_station_db": lst_files_stations,
            "data_bande_db": lst_files_bandes,
            "data_antenne_db": lst_files_antennes,
            "data_support_db": lst_files_supports,
            "data_emetteur_db": lst_files_emetteurs,
            "data_emetteur_link_db": lst_files_emetteurs_link,
            "folder_site": self.FOLDER_SITE,
            "folder_site_avenir": self.FOLDER_SITE_A_VENIR,
            "folder_nature": self.FOLDER_NATURE,
            "folder_station": self.FOLDER_STATION,
            "folder_bande": self.FOLDER_BANDE,
            "folder_antenne": self.FOLDER_ANTENNE,
            "folder_support": self.FOLDER_SUPPORT,
            "folder_emetteur": self.FOLDER_EMETTEUR,
            "folder_emetteur_link": self.FOLDER_EMETTEUR_LINK,
            "folder_signalements": self.FOLDER_SIGNALEMENTS,
            "table_name_site": odata.gettablename("sites"),
            "table_name_site_avenir": odata.gettablename("site_a_venir"),
            "table_name_nature": odata.gettablename("natures"),
            "table_name_station": odata.gettablename("stations"),
            "table_name_bande": odata.gettablename("bandes"),
            "table_name_antenne": odata.gettablename("antennes"),
            "table_name_support": odata.gettablename("supports"),
            "table_name_emetteur": odata.gettablename("emetteurs"),
            "table_name_emetteur_link": odata.gettablename("emetteurs_link"),
        }

    def getdata(self, lst_files, lst_files_db):
        ofolderfilter = FolderFilter()
        ofolderfilter.setdatafolderbrut(lst_files)
        ofolderfilter.setdatatable(lst_files_db)

        return ofolderfilter.getlistfiles()

    def getcsvfiles(self, lst_files):
        lst_file_csv = []
        for file in lst_files:
            extension = file.split(".")[-1]
            if extension == "csv":
                lst_file_csv.append(file)

        return lst_file_csv

    def getzipfiles(self, lst_files):
        lst_file_zip = []
        for file in lst_files:
            extension = file.split(".")[-1]
            if extension == "zip":
                lst_file_zip.append(file)

        return lst_file_zip

    def gettxtfiles(self, lst_files):
        lst_file_txt = []
        for file in lst_files:
            extension = file.split(".")[-1]
            if extension == "txt":
                lst_file_txt.append(file)

        return lst_file_txt
