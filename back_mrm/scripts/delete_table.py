import psycopg
from django.conf import settings


def run(table_name):
    conn = psycopg.connect(settings.DATABASE_URL)

    with conn.cursor() as cursor:
        cursor.execute(f"DROP TABLE IF EXISTS {settings.DATABASE_SCHEMA}.{table_name} CASCADE;")

    conn.commit()
    conn.close()
