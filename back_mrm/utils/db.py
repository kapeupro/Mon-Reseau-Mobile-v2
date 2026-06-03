from django.conf import settings
from django.db import DatabaseError, connection
from psycopg import sql


class Db:
    dateversion = "fr"

    def getschema(self):
        return settings.DATABASE_SCHEMA

    def fetchrow(self, strSql):
        cursor = self.query(strSql)
        if not cursor:
            return False
        rows = cursor.fetchone()
        if not rows:
            return False

        resultdict = {}
        aField = self.getfield(cursor)

        for index in range(len(aField)):
            resultdict[aField[index]] = rows[index]

        return resultdict

    def getfield(self, cursor):
        columnname = []
        for elt in cursor.description:
            columnname.append(elt[0])
        return columnname

    def queryparams(self, strsql, params):
        try:
            cursor = connection.cursor()
            cursor.execute(strsql, params)
        except DatabaseError:
            # print(type(e))
            # print(e.args)
            # print(e)
            return False
        return cursor

    def select_with_params(self, strsql, params):
        cursor = self.queryparams(strsql, params)
        if not cursor:
            return []
        rows = cursor.fetchall()
        if not rows:
            return []

        resultlist = []
        afield = self.getfield(cursor)

        for data_out in rows:
            tmp = {}
            for index in range(len(afield)):
                tmp[afield[index]] = data_out[index]

            resultlist.append(tmp)
        return resultlist

    def selectasarray(self, strsql, params=None):

        if params is not None:
            return self.select_with_params(strsql, params)

        cursor = self.query(strsql)
        if not cursor:
            return []

        field_names = [desc[0] for desc in cursor.description]
        return [dict(zip(field_names, row)) for row in cursor.fetchall()]

    def query(self, strSql):
        try:
            cursor = connection.cursor()
            cursor.execute(strSql)
        except:
            return False
        return cursor

    def convertdouble(row):
        if row:
            return str(float(row.replace(",", ".")))
        return "NULL"

    def testboolean(row):
        if row:
            return f"'{row}'"
        return "NULL"

    def formatstr(row):
        if row:
            return f"'{row}'"
        return "NULL"

    def getlistfiledb(self, table_name):
        query = sql.SQL("""
            SELECT
                count(1) as nb, filename
            FROM {schema}.{table}
            GROUP BY filename;
        """).format(schema=sql.Identifier(self.getschema()), table=sql.Identifier(table_name))

        data = self.selectasarray(query)

        return data

    def deletewherefile(self, table_name, file_name):
        query = sql.SQL("""
            DELETE FROM {schema}.{table}
            WHERE filename = %s
        """).format(schema=sql.Identifier(self.getschema()), table=sql.Identifier(table_name))
        params = (file_name,)

        res = self.queryparams(query, params)

        return res

    def insertlog(self, date, type_import, success, observation):
        query = sql.SQL("""
            INSERT INTO {schema}.import_log (
                date, type, success, observation
            ) VALUES (
                %s, %s, %s, %s
            )
        """).format(
            schema=sql.Identifier(self.getschema()),
        )

        params = (date, type_import, self.asbool(success), observation)
        res = self.queryparams(query, params)

        return res

    def update_data_date(self, page_name):
        return True

    def asstring(self, strvalue):
        if strvalue == None or strvalue == "":
            return "null"

        try:
            strvalue = str(strvalue)
        except:
            strvalue = str(strvalue.encode("utf-8"))

        strvalue = strvalue.replace("'", "''")
        return "'" + strvalue + "'"

    def asdate(self, strvalue):
        if strvalue == None or strvalue == "":
            return "null"

        if self.dateversion == "fr":
            return "'" + strvalue + "'"

        strvalue = strvalue.replace("-", "/")
        strvalue = strvalue.replace(".", "/")

        adate = strvalue.split("/")

        d = adate[0]
        m = adate[1]
        y = adate[2]

        newvalue = m + "/" + d + "/" + y

        return "'" + newvalue + "'"

    def astimesstamp(self, strvalue):
        if strvalue == None or strvalue == "":
            return "null"

        if self.dateversion == "fr":
            return "'" + strvalue + "'"

        strvalue = strvalue.replace("-", "/")
        strvalue = strvalue.replace(".", "/")

        adate = strvalue.split("/")

        d = adate[0]
        m = adate[1]
        y = adate[2]

        newvalue = m + "/" + d + "/" + y

        return "'" + newvalue + "'"

    def asbool(self, strvalue):
        if strvalue:
            return "true"
        return "false"

    def asbooltristate(self, strvalue):
        if strvalue == True or str(strvalue).lower() in ["true", "t", "oui", "o"]:
            return "true"
        if strvalue == False or str(strvalue).lower() in ["false", "f", "non", "n"]:
            return "false"
        return "null"

    def asint(self, strvalue):
        if strvalue == None or strvalue == "":
            return "null"

        try:
            return str(int(strvalue))
        except ValueError:
            return "null"

    def asfloat(self, strvalue):
        if strvalue == None or strvalue == "":
            return "null"

        try:
            return str(float(strvalue))
        except ValueError:
            return "null"

    def get_table_id(self, table_name_with_schema):
        sql = query = sql.SQL("""
            SELECT 
                a.attname AS column_id
            FROM pg_index i
            JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
            WHERE i.indrelid = {}::regclass
            AND i.indisprimary;
        """).format(sql.Identifier(table_name_with_schema))
        res = self.selectasarray(query)
        if not res:
            id = "fid"
        else:
            id = res[0]["column_id"]

        return id
