from django.conf import settings
from psycopg import sql

from back_mrm.scripts.insert_csv import InsertCsv
from back_mrm.utils.db import Db


class ImportSite(InsertCsv):
    def __init__(self, file, table, data_type):
        InsertCsv.__init__(self, file, data_type)
        self.settable(table)

    def run(self):
        if self.checkcsvfile():
            response = self.insertfiledata()
            self.consolide_data()
        else:
            response = {
                "message": "Encodage du fichier incorrect ou fichier non csv",
                "success": False,
            }

        return response

    def get_schema(self):
        return settings.DATABASE_SCHEMA

    def site_consolide_geom(self, odb):
        query = sql.SQL("""
            update {schema}.site_a_venir 
            set geometry = ST_ReducePrecision(st_transform(ST_Point(longitude, latitude, 4326), 3857),0.01) 
            where geometry is null
        """).format(schema=sql.Identifier(self.get_schema()))

        res = odb.query(query)
        return res

    def site_consolide_sup_id(self, odb):
        query = sql.SQL("""
            update {schema}.site_a_venir s set sup_id = ss.sup_id
            FROM {schema}.anfr_sup_support ss
            WHERE ss.sta_nm_anfr = s.id_station_anfr
            AND s.sup_id is null
        """).format(schema=sql.Identifier(self.get_schema()))

        res = odb.query(query)
        return res

    def consolide_data(self):
        if self.table != "site_a_venir":
            return True

        odb = Db()
        self.site_consolide_geom(odb)
        self.site_consolide_sup_id(odb)
