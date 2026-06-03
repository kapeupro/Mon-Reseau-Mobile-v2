import csv
import os
import pathlib
import re

import pandas as pd
import psycopg
from django.conf import settings
from psycopg import sql

from back_mrm.utils.datapusher import Datapusher
from back_mrm.utils.db import Db

DECIMAL = "."
BATCH_SIZE = 10000


class PusherCSV(Datapusher):
    def __init__(self, file, table, db=False):
        super().__init__()
        if not db:
            self.db = Db()
        else:
            self.db = db
        self.setfiletopush(file)
        self.settable(table)
        self.init_count = self.get_count()
        self.number_total_line = 0

    def set_file(self, filename):
        self.file = filename

    def get_file(self):
        return self.file

    def get_table_id(self):

        query = sql.SQL("""
            SELECT 
                a.attname AS column_id
            FROM pg_index i
            JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
            WHERE i.indrelid = '{schema}.{table}'::regclass
            AND i.indisprimary;
        """).format(
            schema=sql.Identifier(self.getschema()),
            table=sql.Identifier(self.gettable()),
        )

        res = self.db.selectasarray(query)
        if not res:
            id = 1
        else:
            id = res[0]["column_id"]

        return id

    def get_count(self):
        query = sql.SQL("""
            SELECT count({id_col}) AS total
            FROM {schema}.{table}
        """).format(
            id_col=sql.Identifier(self.get_table_id()),
            schema=sql.Identifier(self.getschema()),
            table=sql.Identifier(self.gettable()),
        )

        res = self.db.selectasarray(query)
        if not res or len(res) == 0:
            init_count = 0
        else:
            init_count = res[0]["total"]
        return init_count

    def iscsvfile(self):
        if not os.path.exists(self.getfiletopush()):
            return False

        file_extension = pathlib.Path(self.getfiletopush()).suffix
        return file_extension == ".csv"

    def is_data_was_added_on_table(self):
        init_count = self.init_count
        final_count = self.get_count()
        if final_count > init_count:
            return True
        return False

    def get_delimiter(self):
        with open(self.getfiletopush()) as file:
            headers = next(csv.reader(file))

        if len(headers) == 1:
            return ";"
        return ","

    def is_number(self, value):
        motif = re.compile(r"^(?!0\d)\d+[,.]?\d*$")
        return bool(motif.match(value))

    def convert_empty_to_none(self, value):
        if value == "":
            return None
        if self.is_number(value):
            return value.replace(",", ".")
        return value

    def set_number_line_in_file(self, number_total_line):
        self.number_total_line = number_total_line

    def get_number_line_in_file(self):
        return self.number_total_line

    def insert_data_sql(self):
        dbcon = psycopg.connect(settings.DATABASE_URL)
        dbcur = dbcon.cursor()

        columns = pd.read_csv(
            self.getfiletopush(),
            low_memory=False,
            decimal=DECIMAL,
            encoding="utf-8",
            delimiter=self.get_delimiter(),
            index_col=None,
            nrows=None,
        ).columns.tolist()

        with open(self.getfiletopush(), encoding="utf-8") as f:
            reader = csv.reader(f, delimiter=self.get_delimiter())
            next(reader)  # Skip the header row.

            count = 0
            for i, row in enumerate(reader, start=2):
                if len(row) != len(columns):
                    continue

                row = [self.convert_empty_to_none(value) for value in row]
                schema = self.getschema()
                table = self.gettable()

                query = sql.SQL("INSERT INTO {}.{} ({}) VALUES ({})").format(
                    sql.Identifier(schema),
                    sql.Identifier(table),
                    sql.SQL(", ").join(sql.Identifier(col.lower()) for col in columns),
                    sql.SQL(", ").join(sql.Placeholder() for _ in columns),
                )

                try:
                    dbcur.execute(query, row)
                except Exception as e:
                    aError = str(e).split("\n")
                    self.seterror(str(aError[0]) + " fichier ligne " + str(i))
                    return False

                count += 1
                if count % BATCH_SIZE == 0:
                    dbcon.commit()

            dbcon.commit()

        dbcur.close()
        dbcon.close()
        return True

    def run(self):

        if not self.iscsvfile():
            self.seterror("Not CSV File")
            return False

        res = self.insert_data_sql()
        if not res:
            return False

        if res and self.is_data_was_added_on_table():
            return True

        self.seterror("No data was added for file " + self.get_file())
        return False
