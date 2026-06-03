from pathlib import Path

from django.conf import settings
from django.shortcuts import redirect, render
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from back_mrm.utils.data import Data
from back_mrm.utils.db import Db
from back_mrm.utils.folderfilter import FolderFilter


class ImportCourverturesView(APIView):
    permission_classes = (IsAuthenticated,)
    FOLDER_COUVERTURE = Path(settings.IMPORT_FILE) / "couverture"
    FOLDER_STAT_NBOPE = Path(settings.IMPORT_FILE) / "couverture" / "stats_nbope"
    FOLDER_STAT_COMMUNE = Path(settings.IMPORT_FILE) / "couverture" / "stat_commune"
    FOLDER_STAT_DEPARTEMENT = Path(settings.IMPORT_FILE) / "couverture" / "stat_departement"
    FOLDER_STAT_REGION = Path(settings.IMPORT_FILE) / "couverture" / "stat_region"
    FOLDER_STAT_TERRITOIRE = Path(settings.IMPORT_FILE) / "couverture" / "stat_territoire"
    FOLDER_SIGNALEMENTS = Path(settings.IMPORT_FILE) / "signalements"

    def get(self, request):

        if not request.user.is_authenticated:
            return redirect("login")

        context = self.getcontext()

        return render(request, "couvertures.html", context=context)

    def getcontext(self):
        odata = Data()
        lst_files = odata.getlistfiles(self.FOLDER_COUVERTURE, True)
        lst_files_couverture = self.getgpkgfiles(lst_files)
        lst_files_stat_nbope = odata.getlistfiles(self.FOLDER_STAT_NBOPE)
        lst_files_stat_commune = odata.getlistfiles(self.FOLDER_STAT_COMMUNE)
        lst_files_stat_departement = odata.getlistfiles(self.FOLDER_STAT_DEPARTEMENT)
        lst_files_stat_region = odata.getlistfiles(self.FOLDER_STAT_REGION)
        lst_files_stat_territoire = odata.getlistfiles(self.FOLDER_STAT_TERRITOIRE)

        table_name_couverture = odata.gettablename("couvertures")
        table_name_stat_nbope = odata.gettablename("stats_nbope")
        table_name_stat_commune = odata.gettablename("stat_communes")
        table_name_stat_departement = odata.gettablename("stat_departements")
        table_name_stat_region = odata.gettablename("stat_regions")
        table_name_stat_territoire = odata.gettablename("stat_territoires")

        odb = Db()
        lst_files_couverture_db = odb.getlistfiledb(table_name_couverture)
        lst_files_stat_nbope_db = odb.getlistfiledb(table_name_stat_nbope)
        lst_files_stat_commune_db = odb.getlistfiledb(table_name_stat_commune)
        lst_files_stat_departement_db = odb.getlistfiledb(table_name_stat_departement)
        lst_files_stat_region_db = odb.getlistfiledb(table_name_stat_region)
        lst_files_stat_territoire_db = odb.getlistfiledb(table_name_stat_territoire)

        data = self.getdata(lst_files_couverture, lst_files_couverture_db)
        data_stat_nbope = self.getdata(lst_files_stat_nbope, lst_files_stat_nbope_db)
        data_stat_commune = self.getdata(lst_files_stat_commune, lst_files_stat_commune_db)
        data_stat_departement = self.getdata(lst_files_stat_departement, lst_files_stat_departement_db)
        data_stat_region = self.getdata(lst_files_stat_region, lst_files_stat_region_db)
        data_stat_territoire = self.getdata(lst_files_stat_territoire, lst_files_stat_territoire_db)

        return {
            "data": data,
            "data_stat_nbope": data_stat_nbope,
            "data_stat_commune": data_stat_commune,
            "data_stat_departement": data_stat_departement,
            "data_stat_region": data_stat_region,
            "data_stat_territoire": data_stat_territoire,
            "data_db": lst_files_couverture_db,
            "data_stat_nbope_db": lst_files_stat_nbope_db,
            "data_db_stat_commune": lst_files_stat_commune_db,
            "data_db_stat_departement": lst_files_stat_departement_db,
            "data_db_stat_region": lst_files_stat_region_db,
            "data_db_stat_territoire": lst_files_stat_territoire_db,
            "folder": self.FOLDER_COUVERTURE,
            "folder_stat_nbope": self.FOLDER_STAT_NBOPE,
            "folder_stat_commune": self.FOLDER_STAT_COMMUNE,
            "folder_stat_departement": self.FOLDER_STAT_DEPARTEMENT,
            "folder_stat_region": self.FOLDER_STAT_REGION,
            "folder_stat_territoire": self.FOLDER_STAT_TERRITOIRE,
            "folder_signalements": self.FOLDER_SIGNALEMENTS,
            "table_name": odata.gettablename("couvertures"),
            "table_name_stat_nbope": odata.gettablename("stats_nbope"),
            "table_name_stat_commune": odata.gettablename("stat_communes"),
            "table_name_stat_departement": odata.gettablename("stat_departements"),
            "table_name_stat_region": odata.gettablename("stat_regions"),
            "table_name_stat_territoire": odata.gettablename("stat_territoires"),
        }

    def getdata(self, lst_files, lst_files_db):
        ofolderfilter = FolderFilter()
        ofolderfilter.setdatafolderbrut(lst_files)
        ofolderfilter.setdatatable(lst_files_db)

        return ofolderfilter.getlistfiles()

    def getgpkgfiles(self, lst_files):
        lst_file_gpkg = []
        for file in lst_files:
            extension = file.split(".")[-1]
            if extension == "gpkg":
                lst_file_gpkg.append(file)

        return lst_file_gpkg
