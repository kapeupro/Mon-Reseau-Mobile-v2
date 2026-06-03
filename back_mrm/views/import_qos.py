from pathlib import Path

from django.conf import settings
from django.shortcuts import redirect, render
from django.views import View
from psycopg import sql

from back_mrm.utils.data import Data
from back_mrm.utils.db import Db
from back_mrm.utils.folderfilter import FolderFilter


class ImportQosView(View):
    FOLDER = Path(settings.IMPORT_FILE) / "qualite"
    FOLDER_STAT_DEPARTEMENT = Path(settings.IMPORT_FILE) / "qualite" / "stats_qos_departements"
    FOLDER_QOS_DENSITY = Path(settings.IMPORT_FILE) / "qualite" / "qos_density"
    FOLDER_INSEE_DENSITY = Path(settings.IMPORT_FILE) / "qualite" / "insee_density"
    FOLDER_QOS_STAT = Path(settings.IMPORT_FILE) / "qualite" / "qos_stat"
    FOLDER_SIGNALEMENTS = Path(settings.IMPORT_FILE) / "signalements"
    FOLDER_STAT_REGION = Path(settings.IMPORT_FILE) / "qualite" / "stats_qos_regions"
    FOLDER_STAT_METROPOLE = Path(settings.IMPORT_FILE) / "qualite" / "stats_qos_metropole"
    SCHEMA = settings.DATABASE_SCHEMA
    odb = Db()

    def get(self, request):
        if request.user.is_authenticated:
            odata = Data()
            lst_files = odata.getlistfiles(self.FOLDER)
            lst_files_stat_departement = odata.getlistfiles(self.FOLDER_STAT_DEPARTEMENT)
            lst_files_qos_density = odata.getlistfiles(self.FOLDER_QOS_DENSITY)
            lst_files_insee_density = odata.getlistfiles(self.FOLDER_INSEE_DENSITY)
            lst_files_qos_stat = odata.getlistfiles(self.FOLDER_QOS_STAT)
            lst_files_stat_region = odata.getlistfiles(self.FOLDER_STAT_REGION)
            lst_files_stat_metropole = odata.getlistfiles(self.FOLDER_STAT_METROPOLE)

            table_name = odata.gettablename("qos")
            table_name_stat_departement = odata.gettablename("stats_qos_departements")
            table_name_qos_density = odata.gettablename("qos_density")
            table_name_insee_density = odata.gettablename("insee_density")
            table_name_qos_stat = odata.gettablename("qos_stat")
            table_name_stat_region = odata.gettablename("stats_qos_regions")
            table_name_stat_metropole = odata.gettablename("stats_qos_metropole")

            lst_files_db = self.getlistfile(table_name)
            lst_files_db_stat_departement = self.getlistfile(table_name_stat_departement)
            lst_files_db_qos_density = self.getlistfile(table_name_qos_density)
            lst_files_db_insee_density = self.getlistfile(table_name_insee_density)
            lst_files_db_qos_stat = self.getlistfile(table_name_qos_stat)
            lst_files_db_stat_region = self.getlistfile(table_name_stat_region)
            lst_files_db_stat_metropole = self.getlistfile(table_name_stat_metropole)

            data = self.getdata(lst_files, lst_files_db)
            data_stat_departement = self.getdata(lst_files_stat_departement, lst_files_db_stat_departement)
            data_qos_density = self.getdata(lst_files_qos_density, lst_files_db_qos_density)
            data_insee_density = self.getdata(lst_files_insee_density, lst_files_db_insee_density)
            data_qos_stat = self.getdata(lst_files_qos_stat, lst_files_db_qos_stat)
            data_stat_region = self.getdata(lst_files_stat_region, lst_files_db_stat_region)
            data_stat_metropole = self.getdata(lst_files_stat_metropole, lst_files_db_stat_metropole)

            data_source = self.getoptionimport()

            return render(
                request,
                "qos.html",
                context={
                    "data": data,
                    "data_stats_qos_departements": data_stat_departement,
                    "data_qos_density": data_qos_density,
                    "data_insee_density": data_insee_density,
                    "data_qos_stat": data_qos_stat,
                    "data_stats_qos_regions": data_stat_region,
                    "data_stats_qos_metropole": data_stat_metropole,
                    "data_db": lst_files_db,
                    "data_stats_qos_departements_db": lst_files_db_stat_departement,
                    "data_qos_density_db": lst_files_db_qos_density,
                    "data_insee_density_db": lst_files_db_insee_density,
                    "data_qos_stat_db": lst_files_db_qos_stat,
                    "data_stats_qos_regions_db": lst_files_db_stat_region,
                    "data_stats_qos_metropole_db": lst_files_db_stat_metropole,
                    "folder": self.FOLDER,
                    "folder_stats_qos_departements": self.FOLDER_STAT_DEPARTEMENT,
                    "folder_qos_density": self.FOLDER_QOS_DENSITY,
                    "folder_insee_density": self.FOLDER_INSEE_DENSITY,
                    "folder_qos_stat": self.FOLDER_QOS_STAT,
                    "folder_signalements": self.FOLDER_SIGNALEMENTS,
                    "folder_stats_qos_regions": self.FOLDER_STAT_REGION,
                    "folder_stats_qos_metropole": self.FOLDER_STAT_METROPOLE,
                    "table_name": odata.gettablename("qos"),
                    "table_name_stats_qos_departements": odata.gettablename("stats_qos_departements"),
                    "table_name_qos_density": odata.gettablename("qos_density"),
                    "table_name_insee_density": odata.gettablename("insee_density"),
                    "table_name_qos_stat": odata.gettablename("qos_stat"),
                    "table_name_stats_qos_regions": odata.gettablename("stats_qos_regions"),
                    "table_name_stats_qos_metropole": odata.gettablename("stats_qos_metropole"),
                    "data_source": data_source,
                },
            )
        return redirect("login")

    def getdata(self, lst_files, lst_files_db):
        ofolderfilter = FolderFilter()
        ofolderfilter.setdatafolderbrut(lst_files)
        ofolderfilter.setdatatable(lst_files_db)

        return ofolderfilter.getlistfiles()

    def getoptionimport(self):
        query = sql.SQL("""
            SELECT id, title
            FROM {}.qos_data_source_list
        """).format(sql.Identifier(self.SCHEMA))

        results = self.odb.selectasarray(query)

        return results if results or len(results) != 0 else []

    def getlistfile(self, table_name):
        res = self.odb.getlistfiledb(table_name)

        return res if res and len(res) != 0 else False
