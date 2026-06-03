import os
from pathlib import Path

from django.conf import settings

SCHEMA = settings.DATABASE_SCHEMA


class Data:
    def getlistfiles(self, folder, is_other_extension=False):
        if not os.path.exists(folder):
            return []

        if is_other_extension:
            return [file for file in os.listdir(folder) if os.path.isfile(Path(folder) / file)]

        return [
            file
            for file in os.listdir(folder)
            if os.path.isfile(Path(folder) / file) and self.checkcsvfile(folder, file)
        ]

    def checkcsvfile(self, folder, file):
        path_file = Path(folder) / file
        if os.path.isfile(path_file):
            extension = file.split(".")[-1]
            if extension == "csv":
                return True

        return False

    def getfolderdata(self, data_type):
        if data_type == "couvertures":
            folder = Path(settings.IMPORT_FILE) / "couverture"
        elif data_type == "stats_nbope":
            folder = Path(settings.IMPORT_FILE) / "couverture" / "stats_nbope"
        elif data_type == "stat_communes":
            folder = Path(settings.IMPORT_FILE) / "couverture" / "stat_commune"
        elif data_type == "stat_departements":
            folder = Path(settings.IMPORT_FILE) / "couverture" / "stat_departement"
        elif data_type == "stat_regions":
            folder = Path(settings.IMPORT_FILE) / "couverture" / "stat_region"
        elif data_type == "stat_territoires":
            folder = Path(settings.IMPORT_FILE) / "couverture" / "stat_territoire"
        elif data_type == "sites":
            folder = Path(settings.IMPORT_FILE) / "site" / "site"
        elif data_type == "a_venir" or data_type == "site_a_venir":
            folder = Path(settings.IMPORT_FILE) / "site" / "a_venir"
        elif data_type == "qos":
            folder = Path(settings.IMPORT_FILE) / "qualite"
        elif data_type == "stats_qos_departements":
            folder = Path(settings.IMPORT_FILE) / "qualite" / "stats_qos_departements"
        elif data_type == "qos_density":
            folder = Path(settings.IMPORT_FILE) / "qualite" / "qos_density"
        elif data_type == "insee_density":
            folder = Path(settings.IMPORT_FILE) / "qualite" / "insee_density"
        elif data_type == "qos_stat":
            folder = Path(settings.IMPORT_FILE) / "qualite" / "qos_stat"
        elif data_type == "stats_qos_regions":
            folder = Path(settings.IMPORT_FILE) / "qualite" / "stats_qos_regions"
        elif data_type == "stats_qos_metropole":
            folder = Path(settings.IMPORT_FILE) / "qualite" / "stats_qos_metropole"
        elif data_type == "natures":
            folder = Path(settings.IMPORT_FILE) / "site" / "nature"
        elif data_type == "stations":
            folder = Path(settings.IMPORT_FILE) / "site" / "station"
        elif data_type == "bandes":
            folder = Path(settings.IMPORT_FILE) / "site" / "bande"
        elif data_type == "antennes":
            folder = Path(settings.IMPORT_FILE) / "site" / "antenne"
        elif data_type == "supports":
            folder = Path(settings.IMPORT_FILE) / "site" / "support"
        elif data_type == "emetteurs":
            folder = Path(settings.IMPORT_FILE) / "site" / "emetteur"
        elif data_type == "emetteurs_link":
            folder = Path(settings.IMPORT_FILE) / "site" / "emetteur_link"
        elif data_type == "zac_poi":
            folder = Path(settings.IMPORT_FILE) / "zac" / "poi"
        elif data_type == "zac_site":
            folder = Path(settings.IMPORT_FILE) / "zac" / "site"
        elif data_type == "zac_rfr":
            folder = Path(settings.IMPORT_FILE) / "zac" / "rfr"
        elif data_type == "zac_arp":
            folder = Path(settings.IMPORT_FILE) / "zac" / "arp"
        elif data_type == "zac_arp_5g":
            folder = Path(settings.IMPORT_FILE) / "zac" / "arp_5g"
        elif data_type == "signalements":
            folder = Path(settings.IMPORT_FILE) / "signalements"

        return folder

    def gettablename(self, data_type):
        table_names = {
            "couvertures": "couverture_theorique",
            "stats_nbope": "stats_nbope_couverture",
            "stat_communes": "stats_couv_communes",
            "stat_departements": "stats_couv_departements",
            "stat_regions": "stats_couv_regions",
            "stat_territoires": "stats_couv_territoires",
            "sites": "site",
            "site_a_venir": "site_a_venir",
            "qos": "qos",
            "stats_qos_departements": "stats_qos_departements",
            "qos_density": "qos_density",
            "insee_density": "insee_density",
            "qos_stat": "qos_stat",
            "stats_qos_regions": "stats_qos_regions",
            "stats_qos_metropole": "stats_qos_metropole",
            "natures": "anfr_sup_nature",
            "stations": "anfr_sup_station",
            "bandes": "anfr_sup_bande",
            "antennes": "anfr_sup_antenne",
            "supports": "anfr_sup_support",
            "emetteurs": "anfr_sup_emetteur",
            "emetteurs_link": "emetteurs_link",
            "zac_poi": "zac_poi",
            "zac_poi_operateurs": "zac_poi_operateurs",
            "zac_site": "zac_site",
            "zac_site_operateurs": "zac_site_operateurs",
            "zac_rfr": "zac_axe_ferre",
            "zac_arp": "zac_axe_routier_prioritaire",
            "zac_arp_5g": "zac_axe_routier_prioritaire_5g",
            "signalements": "signalement",
        }

        return table_names[data_type]

    def get_sequence_name_by_type(self, data_type, with_schema=True):
        sequence_names = {
            "couvertures": "couverture_theorique_fid_seq",
            "stats_nbope": "stats_nbope_couverture_id_seq",
            "stat_communes": "stats_couv_communes_fid_seq",
            "stat_departements": "stats_couv_departements_fid_seq",
            "stat_regions": "stats_couv_regions_fid_seq",
            "stat_territoires": "stats_couv_territoires_fid_seq",
            "sites": "seq_site_fid",
            "a_venir": "seq_site_a_venir_fid",
            "site_a_venir": "seq_site_a_venir_fid",
            "qos": "qos_fid_seq",
            "stats_qos_departements": "stats_qos_departements_fid_seq",
            "qos_density": "qos_density_id_seq",
            "insee_density": "insee_density_id_seq",
            "qos_stat": "qos_stat_id_seq",
            "stats_qos_regions": "stats_qos_regions_fid_seq",
            "stats_qos_departements": "stats_qos_metropole_fid_seq",
            "natures": "anfr_sup_nature_ogc_fid_seq",
            "stations": "anfr_sup_station_fid_seq",
            "bandes": "anfr_sup_bande_fid_seq",
            "antennes": "anfr_sup_antenne_fid_seq",
            "supports": "anfr_sup_support_fid_seq",
            "emetteurs": "anfr_sup_emetteur_fid_seq",
            "emetteurs_link": "emetteurs_link_id_seq",
            "zac_poi": "zac_poi_id_seq",
            "zac_poi_operateurs": "zac_poi_operateurs_fid_seq",
            "zac_site": "zac_site_id_seq",
            "zac_site_operateurs": "zac_site_operateurs_fid_seq",
            "zac_rfr": "zac_axe_ferre_fid_seq",
            "zac_arp": "zac_axe_routier_prioritaire_fid_seq",
            "zac_arp_5g": "zac_axe_routier_principale_fid_seq",
            "signalements": "signalement_seq",
        }

        if with_schema:
            return f"{SCHEMA}.{sequence_names[data_type]}"
        return sequence_names[data_type]

    def getfoldercopy(self, data_type):
        if data_type == "couvertures":
            folder = Path(settings.IMPORT_FILE_COPY) / "couverture"
        elif data_type == "stats_nbope":
            folder = Path(settings.IMPORT_FILE_COPY) / "couverture" / "stats_nbope"
        elif data_type == "stat_communes":
            folder = Path(settings.IMPORT_FILE_COPY) / "couverture" / "stat_commune"
        elif data_type == "stat_departements":
            folder = Path(settings.IMPORT_FILE_COPY) / "couverture" / "stat_departement"
        elif data_type == "stat_regions":
            folder = Path(settings.IMPORT_FILE_COPY) / "couverture" / "stat_region"
        elif data_type == "stat_territoires":
            folder = Path(settings.IMPORT_FILE_COPY) / "couverture" / "stat_territoire"
        elif data_type == "sites":
            folder = Path(settings.IMPORT_FILE_COPY) / "site" / "site"
        elif data_type == "a_venir":
            folder = Path(settings.IMPORT_FILE_COPY) / "site" / "a_venir"
        elif data_type == "qos":
            folder = Path(settings.IMPORT_FILE_COPY) / "qualite"
        elif data_type == "stations":
            folder = Path(settings.IMPORT_FILE_COPY) / "site" / "station"
        elif data_type == "antennes":
            folder = Path(settings.IMPORT_FILE_COPY) / "site" / "antenne"
        elif data_type == "supports":
            folder = Path(settings.IMPORT_FILE_COPY) / "site" / "support"
        elif data_type == "emetteurs":
            folder = Path(settings.IMPORT_FILE_COPY) / "site" / "emetteur"
        elif data_type == "emetteurs_link":
            folder = Path(settings.IMPORT_FILE_COPY) / "site" / "emetteur_link"

        return folder

    def gettypeimport(self, data_type):
        type_imports = {
            "couvertures": "Import couverture",
            "stats_nbope": "Import statistiques nombre opérateurs",
            "stat_communes": "Import statistique couverture commune",
            "stat_departements": "Import statistique couverture departement",
            "stat_regions": "Import statistique couverture region",
            "stat_territoires": "Import statistique couverture territoire",
            "sites": "Import site",
            "a_venir": "Import site à venir",
            "qos": "Import qualité (QoS)",
            "stats_qos_departements": "Import statistique qualité (QoS)",
            "qos_density": "Import QoS density",
            "insee_density": "Import insee density (QoS)",
            "stats_qos_regions": "Import QoS regions",
            "stats_qos_metropole": "Import QoS metropole",
            "natures": "Import nature",
            "stations": "Import station",
            "bandes": "Import bande",
            "antennes": "Import antenne",
            "supports": "Import support",
            "emetteurs": "Import emetteurs",
            "emetteurs_link": "Import emetteurs link",
            "zac_poi": "Import POI (ZaC)",
            "zac_site": "Import Site (ZaC)",
            "zac_rfr": "Import axe ferrés (ZaC)",
            "zac_arp": "Import axe routier prioritaire (ZaC)",
            "zac_arp_5g": "Import axe routier prioritaire 5g (ZaC)",
            "signalements": "Import signalements",
        }

        return type_imports.get(data_type)
