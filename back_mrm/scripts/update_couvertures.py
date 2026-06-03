from datetime import datetime
from zoneinfo import ZoneInfo

import psycopg
from django.conf import settings
from psycopg import sql

from back_mrm.utils.db import Db

TABLE = "couverture_theorique"
SCHEMA = settings.DATABASE_SCHEMA
COLUMN_WHERE = "operateur_commercial"
TYPE_IMPORT = "update import couverture"


class UpdateCouverture:
    def __init__(self):
        pass

    def updateoperateurcouverture(self):
        dbcon = psycopg.connect(settings.DATABASE_URL)
        dbcur = dbcon.cursor()

        query = sql.SQL("""
            update {schema}.{table} ct set operateur = (
                select identifiant from {schema}.operateurs op 
                where op.code = ct.{column_where} 
                        and 
                case 
                    when ct.dept = '971' then perimetre_971 = true 
                    when ct.dept = '972' then perimetre_972 = true
                    when ct.dept = '973' then perimetre_973 = true
                    when ct.dept = '974' then perimetre_974 = true
                    when ct.dept = '976' then perimetre_976 = true
                    when ct.dept = '977' then perimetre_977 = true
                    when ct.dept = '978' then perimetre_978 = true
                    else perimetre_metro = true
                end
                limit 1
            )
            """).format(
            schema=sql.Identifier(SCHEMA), table=sql.Identifier(TABLE), column_where=sql.Identifier(COLUMN_WHERE)
        )
        try:
            dbcur.execute(query)
            dbcon.commit()
            return True
        except psycopg.Error:
            return False
        finally:
            dbcur.close()

    def generatetiles(self):
        dbcon = psycopg.connect(settings.DATABASE_URL)
        dbcur = dbcon.cursor()
        query = sql.SQL("SELECT {schema}.lunch_generate_tiles_couverture();").format(schema=sql.Identifier(SCHEMA))
        try:
            dbcur.execute(query)
            dbcon.commit()
            return True
        except psycopg.Error as e:
            odb = Db()
            odb.insertlog(datetime.now(tz=ZoneInfo("Europe/Paris")), TYPE_IMPORT, False, {e})
            return False
        finally:
            dbcur.close()
            dbcon.close()

    def run(self):
        message = ""

        if not self.updateoperateurcouverture():
            message = message + "Erreur lors de la mise à jour de la colonne operateur"

        if not self.generatetiles():
            message = message + "Erreur lors de l'execution de la fonction generation tiles"

        if message != "":
            response = {"message": message, "success": False}
        else:
            response = {"message": "Couverture mis à jour avec succès", "success": True}
        return response
