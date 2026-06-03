import os

import psycopg
from django.conf import settings
from psycopg import sql


def _is_safe_string(self, s):
    import re

    return bool(re.match(r"^[\w\s\-\'àâäéèêëïîôöùûüçÀÂÄÉÈÊËÏÎÔÖÙÛÜÇ]+$", s))


def run():
    folder = settings.BASE_DIR / "data_test/couverture"
    key_label = "fid"
    filenames = []

    for i, file in enumerate(os.listdir(folder)):
        process = True  # True to process all

        if i == 2:
            process = True

        if process:
            filename = file.split(".")[0]
            filenames.append(filename)
            url = folder / file

    table_name = "couverture_theorique"
    conn = psycopg.connect(settings.DATABASE_URL)

    with conn.cursor() as cursor:
        query = sql.SQL("DROP TABLE {schema}.{table} CASCADE;").format(
            schema=sql.Identifier(settings.DATABASE_SCHEMA),
            table=sql.Identifier(table_name),
        )
        cursor.execute(query)

        query = sql.SQL("""
            CREATE TABLE IF NOT EXISTS {schema}.{table}(
                id serial,
                {fid} integer,
                operateur bigint,
                date character varying,
                techno character varying,
                usage character varying,
                niveau character varying,
                dept character varying,
                filename character varying,
                geom geometry(MultiPolygon, 3857),
                CONSTRAINT {table}_pk PRIMARY KEY (id)
            ) TABLESPACE pg_default;
        """).format(
            schema=sql.Identifier(settings.DATABASE_SCHEMA),
            table=sql.Identifier(table_name),
            fid=sql.Literal(key_label),
        )
        cursor.execute(query)

        query = sql.SQL("ALTER TABLE IF EXISTS {schema}.{table} OWNER to {user};").format(
            user=sql.Literal(settings.DATABASE_USER),
            schema=sql.Identifier(settings.DATABASE_SCHEMA),
            table=sql.Identifier(table_name),
        )
        cursor.execute(query)

        query = sql.SQL("""
            CREATE INDEX IF NOT EXISTS {table}_geom_geom_idx 
            ON {schema}.{table} USING gist
            (geom) TABLESPACE pg_default;
        """).format(
            schema=sql.Identifier(settings.DATABASE_SCHEMA),
            table=sql.Identifier(table_name),
        )
        cursor.execute(query)

    conn.commit()
    conn.close()

    conn = psycopg.connect(settings.DATABASE_URL)
    with conn.cursor() as cursor:
        for filename in filenames:
            query = sql.SQL("""
                INSERT INTO {schema}.{table} 
                ({label}, operateur, date, techno, usage, niveau, dept, filename, geom)
                SELECT {label}, operateur, date, techno, usage, niveau, dept, filename, 
                ST_Multi(ST_CollectionExtract(geometry)) as geom 
                FROM {schema}.{table_filename};
            """).format(
                schema=sql.Identifier(settings.DATABASE_SCHEMA),
                table=sql.Identifier(table_name),
                label=_is_safe_string(key_label),
                table_filename=sql.Identifier(_is_safe_string(filename)),
            )
            cursor.execute(query)

    conn.commit()
    conn.close()
