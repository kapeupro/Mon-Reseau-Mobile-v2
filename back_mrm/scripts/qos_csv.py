import argparse
import os
import shutil
import time
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import geopandas as gpd
import psycopg
from django.conf import settings
from psycopg import sql

from back_mrm.utils.db import Db

TYPE_IMPORT = "import qualité (QoS)"
CREATE_AT = datetime.now(tz=ZoneInfo("Europe/Paris"))

FOLDER = Path(settings.IMPORT_FILE) / "qualite"

COPY_DESTINATION = Path(settings.IMPORT_FILE_COPY) / "qualite" / time.strftime("%Y%m%d-%H%M%S")

SCHEMA = settings.DATABASE_SCHEMA

CONN = psycopg.connect(settings.DATABASE_URL)
CURSOR = CONN.cursor()


def executesql(query):
    """Exécute une requête SQL (string ou psycopg.sql.SQL)."""
    if isinstance(query, sql.SQL):
        query = query.as_string(CONN)
    CURSOR.execute(query)


def commitsql():
    CONN.commit()


def close():
    CURSOR.close()
    CONN.close()


def runselected(lst_file):
    lst_path_file = []
    lst_file_name = []
    for file in lst_file:
        path_file = Path(FOLDER) / file
        if os.path.isfile(path_file):
            file_name = file.split(".")[0]
            extension = file.split(".")[-1]
            if extension == "csv":
                lst_file_name.append(file_name)
                lst_path_file.append(path_file)

    if lst_path_file:
        response = runnextstep(lst_path_file, lst_file_name)
        copyfile(lst_path_file)
    else:
        response = {"message": "Aucun fichier csv trouvé", "success": False}

    odb = Db()
    odb.insertlog(CREATE_AT, TYPE_IMPORT, response["success"], response["message"])

    return response


def copyfile(lst_path_file):
    if not os.path.exists(COPY_DESTINATION):
        os.makedirs(COPY_DESTINATION)

    for path_file in lst_path_file:
        if os.path.isfile(path_file):
            if shutil.copy(path_file, COPY_DESTINATION):
                os.remove(path_file)


def run():
    lst_path_file = []
    lst_file_name = []
    for file in os.listdir(FOLDER):
        path_file = Path(FOLDER) / file
        if os.path.isfile(path_file):
            file_name = file.split(".")[0]
            extension = file.split(".")[-1]
            if extension == "csv":
                lst_file_name.append(file_name)
                lst_path_file.append(path_file)

    if lst_path_file:
        runnextstep(lst_path_file, lst_file_name)


def runnextstep(lst_path_file, lst_file_name):
    for i, file_name in enumerate(lst_file_name):
        file_name_splited = file_name.split("_")
        table_name = gettablename(file_name_splited)
        createtable(table_name)
        readfile(table_name, lst_path_file[i], file_name)
        commitsql()

    response = {"message": "QoS importés avec succès", "success": True}
    return response


def gettablename(file_name_splited):
    if "Metropole" in file_name_splited:
        if "data" in file_name_splited:
            if "habitations" in file_name_splited:
                return "qos_metropole_data_habitations"
            if "transports" in file_name_splited:
                return "qos_metropole_data_transports"
        elif "voix" in file_name_splited:
            if "habitations" in file_name_splited:
                return "qos_metropole_voix_habitations"
            if "transports" in file_name_splited:
                return "qos_metropole_voix_transports"
    elif "Outremer" in file_name_splited:
        if "data" in file_name_splited:
            if "habitations" in file_name_splited:
                return "qos_outremer_data_habitations"
            if "transports" in file_name_splited:
                return "qos_outremer_data_transports"
        elif "voix" in file_name_splited:
            if "habitations" in file_name_splited:
                return "qos_outremer_voix_habitations"
            if "transports" in file_name_splited:
                return "qos_outremer_voix_transports"


def createtable(table_name):
    if table_name == "qos_metropole_data_habitations":
        executesql(createtablemetropoledatahabitations(table_name))
    elif table_name == "qos_metropole_data_transports":
        executesql(createtablemetropoledatatransports(table_name))
    elif table_name == "qos_metropole_voix_habitations":
        executesql(createtablemetropolevoixhabitations(table_name))
    elif table_name == "qos_metropole_voix_transports":
        executesql(createtablemetropolevoixtransports(table_name))
    elif table_name == "qos_outremer_data_habitations":
        executesql(createtableoutremerdatahabitations(table_name))
    elif table_name == "qos_outremer_data_transports":
        executesql(createtableoutremerdatatransports(table_name))
    elif table_name == "qos_outremer_voix_habitations":
        executesql(createtableoutremervoixhabitations(table_name))
    elif table_name == "qos_outremer_voix_transports":
        executesql(createtableoutremervoixtransports(table_name))

    executesql(createindex(table_name))


def createtablemetropoledatahabitations(table_name):
    return sql.SQL("""
        CREATE TABLE IF NOT EXISTS {schema}.{table}
        (
            fid bigint NOT NULL,
            lieu text COLLATE pg_catalog."default",
            situation text COLLATE pg_catalog."default",
            date text COLLATE pg_catalog."default",
            heure text COLLATE pg_catalog."default",
            mcc_mnc bigint,
            operateur text COLLATE pg_catalog."default",
            profil text COLLATE pg_catalog."default",
            rsrp double precision,
            longitude double precision,
            latitude double precision,
            protocole text COLLATE pg_catalog."default",
            url text COLLATE pg_catalog."default",
            file_name text COLLATE pg_catalog."default",
            file_type text COLLATE pg_catalog."default",
            terminal text COLLATE pg_catalog."default",
            adresse text COLLATE pg_catalog."default",
            strate text COLLATE pg_catalog."default",
            sous_strate text COLLATE pg_catalog."default",
            page_chargee_moins_10s boolean,
            page_chargee_moins_5s boolean,
            debit_en_mbits double precision,
            video_en_qualite_parfaite boolean,
            video_en_qualite_correcte boolean,
            fichier_charge_en_moins_de_30s boolean,
            temps_en_secondes double precision,
            delai_lancement_stream_s double precision,
            lag_stream_s double precision,
            accroche_5g boolean,
            insee_com text COLLATE pg_catalog."default",
            insee_dep text COLLATE pg_catalog."default",
            insee_reg bigint,
            nom_dep text COLLATE pg_catalog."default",
            filename text COLLATE pg_catalog."default",
            geometry geometry(Point,3857),
            id_hexa integer,
            CONSTRAINT {constraint} PRIMARY KEY (fid)
        )
        TABLESPACE pg_default;
        ALTER TABLE IF EXISTS {schema}.{table} OWNER to postgres;
    """).format(
        schema=sql.Identifier(SCHEMA), table=sql.Identifier(table_name), constraint=sql.Identifier(f"{table_name}_pk")
    )


def createtablemetropoledatatransports(table_name):
    return sql.SQL("""
        CREATE TABLE IF NOT EXISTS {schema}.{table}
        (
            fid bigint NOT NULL,
            lieu text COLLATE pg_catalog."default",
            situation text COLLATE pg_catalog."default",
            date text COLLATE pg_catalog."default",
            heure text COLLATE pg_catalog."default",
            mcc_mnc bigint,
            operateur text COLLATE pg_catalog."default",
            profil text COLLATE pg_catalog."default",
            rsrp double precision,
            latitude double precision,
            longitude double precision,
            protocole text COLLATE pg_catalog."default",
            url text COLLATE pg_catalog."default",
            terminal text COLLATE pg_catalog."default",
            strate text COLLATE pg_catalog."default",
            sous_strate text COLLATE pg_catalog."default",
            page_chargee_moins_5s boolean,
            page_chargee_moins_10s boolean,
            temps_en_secondes double precision,
            insee_dep text COLLATE pg_catalog."default",
            insee_reg text COLLATE pg_catalog."default",
            nom_dep text COLLATE pg_catalog."default",
            filename text COLLATE pg_catalog."default",
            geometry geometry(Point,3857),
            id_hexa integer,
            debit_en_mbits double precision,
            CONSTRAINT {constraint} PRIMARY KEY (fid)
        )
        TABLESPACE pg_default;
        ALTER TABLE IF EXISTS {schema}.{table} OWNER to postgres;
    """).format(
        schema=sql.Identifier(SCHEMA), table=sql.Identifier(table_name), constraint=sql.Identifier(f"{table_name}_pk")
    )


def createtablemetropolevoixhabitations(table_name):
    return sql.SQL("""
        CREATE TABLE IF NOT EXISTS {schema}.{table}
        (
            fid bigint NOT NULL,
            lieu text COLLATE pg_catalog."default",
            situation text COLLATE pg_catalog."default",
            protocole text COLLATE pg_catalog."default",
            mcc_mnc bigint,
            operateur text COLLATE pg_catalog."default",
            intra_inte text COLLATE pg_catalog."default",
            type_appel text COLLATE pg_catalog."default",
            sens text COLLATE pg_catalog."default",
            date text COLLATE pg_catalog."default",
            heure text COLLATE pg_catalog."default",
            date_fin text COLLATE pg_catalog."default",
            heure_fin text COLLATE pg_catalog."default",
            delai_etablissement double precision,
            temps_appel double precision,
            techno_debut text COLLATE pg_catalog."default",
            techno_fin text COLLATE pg_catalog."default",
            rsrp double precision,
            mos_1 double precision,
            mos_2 double precision,
            mos_3 double precision,
            mos_4 double precision,
            mos_5 double precision,
            mos_6 double precision,
            mos_7 double precision,
            mos_8 double precision,
            mos_dl_min double precision,
            mos_ul_min double precision,
            mos_dl_moy double precision,
            mos_ul_moy double precision,
            mosminglob double precision,
            mosmoyglob double precision,
            appel_2min boolean,
            sms_10s boolean,
            duree_sms double precision,
            terminal text COLLATE pg_catalog."default",
            strate text COLLATE pg_catalog."default",
            sous_strat text COLLATE pg_catalog."default",
            id_appel text COLLATE pg_catalog."default",
            longitude double precision,
            latitude double precision,
            adresse text COLLATE pg_catalog."default",
            insee_com text COLLATE pg_catalog."default",
            insee_dep text COLLATE pg_catalog."default",
            insee_reg bigint,
            nom_dep text COLLATE pg_catalog."default",
            filename text COLLATE pg_catalog."default",
            geometry geometry(Point,3857),
            id_hexa integer,
            CONSTRAINT {constraint} PRIMARY KEY (fid)
        )
        TABLESPACE pg_default;
        ALTER TABLE IF EXISTS {schema}.{table} OWNER to postgres;
    """).format(
        schema=sql.Identifier(SCHEMA), table=sql.Identifier(table_name), constraint=sql.Identifier(f"{table_name}_pk")
    )


def createtablemetropolevoixtransports(table_name):
    return sql.SQL("""
        CREATE TABLE IF NOT EXISTS {schema}.{table}
        (
            fid bigint NOT NULL,
            lieu text COLLATE pg_catalog."default",
            situation text COLLATE pg_catalog."default",
            protocole text COLLATE pg_catalog."default",
            mcc_mnc bigint,
            operateur text COLLATE pg_catalog."default",
            sens text COLLATE pg_catalog."default",
            date text COLLATE pg_catalog."default",
            heure text COLLATE pg_catalog."default",
            date_fin text COLLATE pg_catalog."default",
            heure_fin text COLLATE pg_catalog."default",
            delai_etablissement double precision,
            temps_appel double precision,
            techno_debut text COLLATE pg_catalog."default",
            techno_fin text COLLATE pg_catalog."default",
            rsrp double precision,
            mos_1 double precision,
            mos_2 double precision,
            mos_3 double precision,
            mos_4 double precision,
            mos_5 double precision,
            mos_6 double precision,
            mos_7 double precision,
            mos_8 double precision,
            mos_dl_min double precision,
            mos_ul_min double precision,
            mos_dl_moy double precision,
            mos_ul_moy double precision,
            mosminglob double precision,
            mosmoyglob double precision,
            appel_2min boolean,
            sms_10s boolean,
            duree_sms double precision,
            terminal text COLLATE pg_catalog."default",
            strate text COLLATE pg_catalog."default",
            sous_strat text COLLATE pg_catalog."default",
            id_appel text COLLATE pg_catalog."default",
            longitude double precision,
            latitude double precision,
            insee_dep text COLLATE pg_catalog."default",
            insee_reg text COLLATE pg_catalog."default",
            nom_dep text COLLATE pg_catalog."default",
            filename text COLLATE pg_catalog."default",
            geometry geometry(Point,3857),
            id_hexa integer,
            CONSTRAINT {constraint} PRIMARY KEY (fid)
        )
        TABLESPACE pg_default;
        ALTER TABLE IF EXISTS {schema}.{table} OWNER to postgres;
    """).format(
        schema=sql.Identifier(SCHEMA), table=sql.Identifier(table_name), constraint=sql.Identifier(f"{table_name}_pk")
    )


def createtableoutremerdatahabitations(table_name):
    return sql.SQL("""
        CREATE TABLE IF NOT EXISTS {schema}.{table}
        (
            fid bigint NOT NULL,
            mesures_helicoptere bigint,
            departement text COLLATE pg_catalog."default",
            descopage double precision,
            communeaxe text COLLATE pg_catalog."default",
            precision_lieuaxe text COLLATE pg_catalog."default",
            operateur text COLLATE pg_catalog."default",
            situation text COLLATE pg_catalog."default",
            service text COLLATE pg_catalog."default",
            detail text COLLATE pg_catalog."default",
            url text COLLATE pg_catalog."default",
            temps_en_secondes double precision,
            volume_mb_ou_init_video_s double precision,
            debit_en_mbits double precision,
            mobile text COLLATE pg_catalog."default",
            startlatitude double precision,
            startlongitude double precision,
            startdate_time text COLLATE pg_catalog."default",
            web10 double precision,
            web5 double precision,
            transfert_ok double precision,
            crp_video double precision,
            crc_video double precision,
            debit3mbs double precision,
            techno text COLLATE pg_catalog."default",
            filename text COLLATE pg_catalog."default",
            geometry geometry(Point,3857),
            protocole text COLLATE pg_catalog."default",
            mcc_mnc bigint,
            page_chargee_moins_10s boolean,
            page_chargee_moins_5s boolean,
            video_en_qualite_parfaite boolean,
            video_en_qualite_correcte boolean,
            fichier_charge_en_moins_de_30s boolean,
            strate text COLLATE pg_catalog."default",
            insee_dep text COLLATE pg_catalog."default",
            id_hexa integer,
            date text COLLATE pg_catalog."default",
            heure text COLLATE pg_catalog."default",
            CONSTRAINT {constraint} PRIMARY KEY (fid)
        )
        TABLESPACE pg_default;
        ALTER TABLE IF EXISTS {schema}.{table} OWNER to postgres;
    """).format(
        schema=sql.Identifier(SCHEMA), table=sql.Identifier(table_name), constraint=sql.Identifier(f"{table_name}_pk")
    )


def createtableoutremerdatatransports(table_name):
    return sql.SQL("""
        CREATE TABLE IF NOT EXISTS {schema}.{table}
        (
            fid bigint NOT NULL,
            mesures_helicoptere bigint,
            departement text COLLATE pg_catalog."default",
            descopage double precision,
            communeaxe text COLLATE pg_catalog."default",
            precision_lieuaxe text COLLATE pg_catalog."default",
            operateur text COLLATE pg_catalog."default",
            situation text COLLATE pg_catalog."default",
            service text COLLATE pg_catalog."default",
            detail text COLLATE pg_catalog."default",
            url text COLLATE pg_catalog."default",
            duree_s double precision,
            volume_mb_ou_init_video_s double precision,
            debit_en_mbits double precision,
            mobile text COLLATE pg_catalog."default",
            startlatitude double precision,
            startlongitude double precision,
            startdate_time text COLLATE pg_catalog."default",
            web10 double precision,
            web5 double precision,
            transfert_ok double precision,
            crp_video double precision,
            crc_video double precision,
            debit3mbs double precision,
            techno text COLLATE pg_catalog."default",
            filename text COLLATE pg_catalog."default",
            geometry geometry(Point,3857),
            protocole text COLLATE pg_catalog."default",
            mcc_mnc bigint,
            page_chargee_moins_10s boolean,
            page_chargee_moins_5s boolean,
            video_en_qualite_parfaite boolean,
            video_en_qualite_correcte boolean,
            fichier_charge_en_moins_de_30s boolean,
            id_hexa integer,
            date text COLLATE pg_catalog."default",
            heure text COLLATE pg_catalog."default",
            CONSTRAINT {constraint} PRIMARY KEY (fid)
        )
        TABLESPACE pg_default;
        ALTER TABLE IF EXISTS {schema}.{table} OWNER to postgres;
    """).format(
        schema=sql.Identifier(SCHEMA), table=sql.Identifier(table_name), constraint=sql.Identifier(f"{table_name}_pk")
    )


def createtableoutremervoixhabitations(table_name):
    return sql.SQL("""
        CREATE TABLE IF NOT EXISTS {schema}.{table}
        (
            fid bigint NOT NULL,
            protocole text COLLATE pg_catalog."default",
            commune_axe text COLLATE pg_catalog."default",
            descopage double precision,
            situation text COLLATE pg_catalog."default",
            date text COLLATE pg_catalog."default",
            operateur text COLLATE pg_catalog."default",
            calldirection text COLLATE pg_catalog."default",
            heure text COLLATE pg_catalog."default",
            longitude double precision,
            latitude double precision,
            techno_emetteur text COLLATE pg_catalog."default",
            techno_recepteur text COLLATE pg_catalog."default",
            rsrp double precision,
            rsrq double precision,
            duree_communication double precision,
            intrainter text COLLATE pg_catalog."default",
            departement text COLLATE pg_catalog."default",
            couple_kpi text COLLATE pg_catalog."default",
            bilan double precision,
            mosminglob double precision,
            mos_moyen double precision,
            mos1 double precision,
            mos2 double precision,
            mos3 double precision,
            mos4 double precision,
            mos5 double precision,
            mos6 double precision,
            mos7 double precision,
            nb_mos double precision,
            bilan_couple double precision,
            mos_min_couple double precision,
            mos_moyen_couple double precision,
            tqp double precision,
            dea double precision,
            duree_sms text COLLATE pg_catalog."default",
            filename text COLLATE pg_catalog."default",
            geometry geometry(Point,3857),
            mcc_mnc bigint,
            strate text COLLATE pg_catalog."default",
            appel_2min boolean DEFAULT false,
            insee_dep text COLLATE pg_catalog."default",
            sms_10s boolean,
            id_hexa integer,
            CONSTRAINT {constraint} PRIMARY KEY (fid)
        )
        TABLESPACE pg_default;
        ALTER TABLE IF EXISTS {schema}.{table} OWNER to postgres;
    """).format(
        schema=sql.Identifier(SCHEMA), table=sql.Identifier(table_name), constraint=sql.Identifier(f"{table_name}_pk")
    )


def createtableoutremervoixtransports(table_name):
    return sql.SQL("""
        CREATE TABLE IF NOT EXISTS {schema}.{table}
        (
            fid bigint NOT NULL,
            protocole text COLLATE pg_catalog."default",
            commune_axe text COLLATE pg_catalog."default",
            descopage double precision,
            situation text COLLATE pg_catalog."default",
            date text COLLATE pg_catalog."default",
            operateur text COLLATE pg_catalog."default",
            calldirection text COLLATE pg_catalog."default",
            heure text COLLATE pg_catalog."default",
            longitude double precision,
            latitude double precision,
            techno_emetteur text COLLATE pg_catalog."default",
            techno_recepteur text COLLATE pg_catalog."default",
            rsrp double precision,
            rsrq double precision,
            duree_communication double precision,
            intrainter text COLLATE pg_catalog."default",
            departement text COLLATE pg_catalog."default",
            couple_kpi text COLLATE pg_catalog."default",
            bilan double precision,
            mosminglob double precision,
            mos_moyen double precision,
            mos1 double precision,
            mos2 double precision,
            mos3 double precision,
            mos4 double precision,
            mos5 double precision,
            mos6 double precision,
            mos7 double precision,
            nb_mos double precision,
            bilan_couple double precision,
            mos_min_couple double precision,
            mos_moyen_couple double precision,
            tqp double precision,
            dea double precision,
            duree_sms text COLLATE pg_catalog."default",
            filename text COLLATE pg_catalog."default",
            geometry geometry(Point,3857),
            mcc_mnc bigint,
            strate text COLLATE pg_catalog."default",
            appel_2min boolean,
            insee_dep text COLLATE pg_catalog."default",
            sms_10s boolean,
            id_hexa integer,
            CONSTRAINT {constraint} PRIMARY KEY (fid)
        )
        TABLESPACE pg_default;
        ALTER TABLE IF EXISTS {schema}.{table} OWNER to postgres;
    """).format(
        schema=sql.Identifier(SCHEMA), table=sql.Identifier(table_name), constraint=sql.Identifier(f"{table_name}_pk")
    )


def createindex(table_name):
    return sql.SQL("""
        CREATE INDEX IF NOT EXISTS {idx_geom}
        ON {schema}.{table} USING gist
        (geometry)
        TABLESPACE pg_default;
        
        CREATE INDEX IF NOT EXISTS {idx_fid}
        ON {schema}.{table} USING btree
        (fid ASC NULLS LAST)
        TABLESPACE pg_default;
    """).format(
        schema=sql.Identifier(SCHEMA),
        table=sql.Identifier(table_name),
        idx_geom=sql.Identifier(f"idx_{table_name}_geometry"),
        idx_fid=sql.Identifier(f"ix_{SCHEMA}_{table_name}_fid"),
    )


def readfile(table_name, path_file, file_name):
    if table_name == "qos_metropole_data_habitations":
        datas = gpd.read_file(path_file)
    else:
        datas = gpd.read_file(path_file, encoding="utf-8")
    insertsqldata(table_name, datas, file_name)


def insertsqldata(table_name, datas, file_name):
    if table_name == "qos_metropole_data_habitations":
        insertmetropoledatahabitations(table_name, datas, file_name)
        updatemetropoledatahabitations()
    elif table_name == "qos_metropole_data_transports":
        insertmetropoledatatransports(table_name, datas, file_name)
        updatemetropoledatatransports()
    elif table_name == "qos_metropole_voix_habitations":
        insertmetropolevoixhabitations(table_name, datas, file_name)
        updatemetropolevoixhabitations()
    elif table_name == "qos_metropole_voix_transports":
        insertmetropolevoixtransports(table_name, datas, file_name)
        updatemetropolevoixtransports()
    elif table_name == "qos_outremer_data_habitations":
        insertoutremerdatahabitations(table_name, datas, file_name)
        updateOutremerDataHabitations()
    elif table_name == "qos_outremer_data_transports":
        insertoutremerdatatransports(table_name, datas, file_name)
        updateoutremerdatatransports()
    elif table_name == "qos_outremer_voix_habitations":
        insertoutremervoixhabitations(table_name, datas, file_name)
        updateoutremervoixhabitations()
    elif table_name == "qos_outremer_voix_transports":
        insertoutremervoixtransports(table_name, datas, file_name)
        updateoutremervoixtransports()


def convertdouble(row):
    if row:
        if type(row) == str:
            return "NULL"
        return str(float(row.replace(",", ".")))
    return "NULL"


def testboolean(row):
    if row:
        return f"'{row}'"
    return "NULL"


def formatstr(strValue):
    if strValue is None or strValue == "":
        return "null"

    try:
        strValue = str(strValue)
    except:
        strValue = str(strValue.encode("utf-8"))

    strValue = strValue.replace("'", "''")
    return "'" + strValue + "'"


def build_insert_query(table_name, columns, values):
    """Construit une requête INSERT sécurisée avec psycopg.sql."""
    return sql.SQL("""
        INSERT INTO {schema}.{table} ({columns})
        VALUES ({values})
    """).format(
        schema=sql.Identifier(SCHEMA),
        table=sql.Identifier(table_name),
        columns=sql.SQL(", ").join(map(sql.Identifier, columns)),
        values=sql.SQL(", ").join(map(sql.SQL, values)),
    )


def insertmetropoledatahabitations(table_name, datas, file_name):
    columns = [
        "fid",
        "lieu",
        "situation",
        "date",
        "heure",
        "operateur",
        "profil",
        "rsrp",
        "longitude",
        "latitude",
        "protocole",
        "url",
        "file_name",
        "file_type",
        "terminal",
        "adresse",
        "strate",
        "sous_strate",
        "page_chargee_moins_10s",
        "page_chargee_moins_5s",
        "debit_en_mbits",
        "video_en_qualite_parfaite",
        "video_en_qualite_correcte",
        "fichier_charge_en_moins_de_30s",
        "temps_en_secondes",
        "delai_lancement_stream_s",
        "lag_stream_s",
        "accroche_5g",
        "insee_dep",
        "insee_reg",
        "nom_dep",
        "filename",
    ]

    for index, row in datas.iterrows():
        lstData = [
            str(index),
            formatstr(row["lieu"]),
            formatstr(row["situation"]),
            formatstr(row["date"]),
            formatstr(row["heure"]),
            formatstr(row["operateur"]),
            formatstr(row["Profil"]),
            convertdouble(row["rsrp"]),
            convertdouble(row["longitude"]),
            convertdouble(row["latitude"]),
            formatstr(row["protocole"]),
            formatstr(row["url"]),
            formatstr(row["file_name"]),
            formatstr(row["file_type"]),
            formatstr(row["terminal"]),
            formatstr(row["adresse"]),
            formatstr(row["strate"]),
            formatstr(row["sous_strate"]),
            testboolean(row["page_chargée_moins_10s"]),
            testboolean(row["page_chargée_moins_5s"]),
            convertdouble(row["débit_en_Mbit/s"]),
            testboolean(row["video_en_qualité_parfaite"]),
            testboolean(row["video_en_qualité_correcte"]),
            testboolean(row["fichier_chargé_en_moins_de_30s"]),
            convertdouble(row["temps_en_secondes"]),
            convertdouble(row["delai_lancement_stream_s"]),
            convertdouble(row["lag_stream_s"]),
            testboolean(row["accroche_5G"]),
            formatstr(row["INSEE_DEP"]),
            formatstr(row["INSEE_REG"]),
            formatstr(row["NOM_DEP"]),
            formatstr(file_name),
        ]

        query = build_insert_query(table_name, columns, lstData)
        executesql(query)


def insertmetropoledatatransports(table_name, datas, file_name):
    columns = [
        "fid",
        "lieu",
        "situation",
        "date",
        "heure",
        "operateur",
        "profil",
        "rsrp",
        "latitude",
        "longitude",
        "protocole",
        "url",
        "terminal",
        "strate",
        "sous_strate",
        "page_chargee_moins_5s",
        "page_chargee_moins_10s",
        "temps_en_secondes",
        "insee_dep",
        "insee_reg",
        "nom_dep",
        "filename",
    ]

    for index, row in datas.iterrows():
        lstData = [
            str(index),
            formatstr(row["lieu"]),
            formatstr(row["situation"]),
            formatstr(row["date"]),
            formatstr(row["heure"]),
            formatstr(row["operateur"]),
            formatstr(row["Profil"]),
            convertdouble(row["rsrp"]),
            convertdouble(row["latitude"]),
            convertdouble(row["longitude"]),
            formatstr(row["protocole"]),
            formatstr(row["url"]),
            formatstr(row["terminal"]),
            formatstr(row["strate"]),
            formatstr(row["sous_strate"]),
            testboolean(row["page_chargee_moins_5s"]),
            testboolean(row["page_chargee_moins_10s"]),
            convertdouble(row["temps_en_secondes"]),
            formatstr(row["INSEE_DEP"]),
            formatstr(row["INSEE_REG"]),
            formatstr(row["NOM_DEP"]),
            formatstr(file_name),
        ]

        query = build_insert_query(table_name, columns, lstData)
        executesql(query)


def insertmetropolevoixhabitations(table_name, datas, file_name):
    columns = [
        "fid",
        "lieu",
        "situation",
        "protocole",
        "operateur",
        "intra_inte",
        "type_appel",
        "sens",
        "date",
        "heure",
        "date_fin",
        "heure_fin",
        "delai_etablissement",
        "temps_appel",
        "techno_debut",
        "techno_fin",
        "rsrp",
        "mos_1",
        "mos_2",
        "mos_3",
        "mos_4",
        "mos_5",
        "mos_6",
        "mos_7",
        "mos_8",
        "mos_dl_min",
        "mos_ul_min",
        "mos_dl_moy",
        "mos_ul_moy",
        "mosminglob",
        "mosmoyglob",
        "appel_2min",
        "sms_10s",
        "duree_sms",
        "terminal",
        "strate",
        "sous_strat",
        "id_appel",
        "longitude",
        "latitude",
        "adresse",
        "insee_com",
        "insee_dep",
        "insee_reg",
        "nom_dep",
        "filename",
    ]

    for index, row in datas.iterrows():
        lstData = [
            str(index),
            formatstr(row["Lieu"]),
            formatstr(row["Situation"]),
            formatstr(row["protocole"]),
            formatstr(row["operateur"]),
            formatstr(row["intra_inte"]),
            formatstr(row["type_appel"]),
            formatstr(row["sens"]),
            formatstr(row["date"]),
            formatstr(row["heure"]),
            formatstr(row["date_fin"]),
            formatstr(row["heure_fin"]),
            convertdouble(row["delai_etablissement"]),
            convertdouble(row["temps_appel"]),
            formatstr(row["techno_debut"]),
            formatstr(row["techno_fin"]),
            convertdouble(row["rsrp"]),
            convertdouble(row["mos_1"]),
            convertdouble(row["mos_2"]),
            convertdouble(row["mos_3"]),
            convertdouble(row["mos_4"]),
            convertdouble(row["mos_5"]),
            convertdouble(row["mos_6"]),
            convertdouble(row["mos_7"]),
            convertdouble(row["mos_8"]),
            convertdouble(row["mos_dl_min"]),
            convertdouble(row["mos_ul_min"]),
            convertdouble(row["mos_dl_moy"]),
            convertdouble(row["mos_ul_moy"]),
            convertdouble(row["mosminglob"]),
            convertdouble(row["mosmoyglob"]),
            testboolean(row["appel_2min"]),
            testboolean(row["sms_10s"]),
            convertdouble(row["duree_sms"]),
            formatstr(row["terminal"]),
            formatstr(row["Strate"]),
            formatstr(row["sous_strat"]),
            formatstr(row["id_appel"]),
            convertdouble(row["longitude"]),
            convertdouble(row["latitude"]),
            formatstr(row["Adresse"]),
            formatstr(row["INSEE"]),
            formatstr(row["INSEE_DEP"]),
            formatstr(row["INSEE_REG"]),
            formatstr(row["NOM_DEP"]),
            formatstr(file_name),
        ]

        query = build_insert_query(table_name, columns, lstData)
        executesql(query)


def insertmetropolevoixtransports(table_name, datas, file_name):
    columns = [
        "fid",
        "lieu",
        "situation",
        "protocole",
        "operateur",
        "sens",
        "date",
        "heure",
        "date_fin",
        "heure_fin",
        "delai_etablissement",
        "temps_appel",
        "techno_debut",
        "techno_fin",
        "rsrp",
        "mos_1",
        "mos_2",
        "mos_3",
        "mos_4",
        "mos_5",
        "mos_6",
        "mos_7",
        "mos_8",
        "mos_dl_min",
        "mos_ul_min",
        "mos_dl_moy",
        "mos_ul_moy",
        "mosminglob",
        "mosmoyglob",
        "appel_2min",
        "sms_10s",
        "duree_sms",
        "terminal",
        "strate",
        "sous_strat",
        "id_appel",
        "longitude",
        "latitude",
        "insee_dep",
        "insee_reg",
        "nom_dep",
        "filename",
    ]

    for index, row in datas.iterrows():
        lstData = [
            str(index),
            formatstr(row["Lieu"]),
            formatstr(row["Situation"]),
            formatstr(row["protocole"]),
            formatstr(row["operateur"]),
            formatstr(row["sens"]),
            formatstr(row["date"]),
            formatstr(row["heure"]),
            formatstr(row["date_fin"]),
            formatstr(row["heure_fin"]),
            convertdouble(row["delai_etablissement"]),
            convertdouble(row["temps_appel"]),
            formatstr(row["techno_debut"]),
            formatstr(row["techno_fin"]),
            convertdouble(row["rsrp"]),
            convertdouble(row["mos_1"]),
            convertdouble(row["mos_2"]),
            convertdouble(row["mos_3"]),
            convertdouble(row["mos_4"]),
            convertdouble(row["mos_5"]),
            convertdouble(row["mos_6"]),
            convertdouble(row["mos_7"]),
            convertdouble(row["mos_8"]),
            convertdouble(row["mos_dl_min"]),
            convertdouble(row["mos_ul_min"]),
            convertdouble(row["mos_dl_moy"]),
            convertdouble(row["mos_ul_moy"]),
            convertdouble(row["mosminglob"]),
            convertdouble(row["mosmoyglob"]),
            testboolean(row["appel_2min"]),
            testboolean(row["sms_10s"]),
            convertdouble(row["duree_sms"]),
            formatstr(row["terminal"]),
            formatstr(row["Strate"]),
            formatstr(row["sous_strat"]),
            formatstr(row["id_appel"]),
            convertdouble(row["longitude"]),
            convertdouble(row["latitude"]),
            formatstr(row["INSEE_DEP"]),
            formatstr(row["INSEE_REG"]),
            formatstr(row["NOM_DEP"]),
            formatstr(file_name),
        ]

        query = build_insert_query(table_name, columns, lstData)
        executesql(query)


def insertoutremerdatahabitations(table_name, datas, file_name):
    columns = [
        "fid",
        "mesures_helicoptere",
        "departement",
        "descopage",
        "communeaxe",
        "precision_lieuaxe",
        "operateur",
        "situation",
        "service",
        "detail",
        "url",
        "temps_en_secondes",
        "volume_mb_ou_init_video_s",
        "debit_en_mbits",
        "mobile",
        "startlatitude",
        "startlongitude",
        "startdate_time",
        "web10",
        "web5",
        "transfert_ok",
        "crp_video",
        "crc_video",
        "debit3mbs",
        "techno",
        "filename",
    ]

    for index, row in datas.iterrows():
        lstData = [
            str(index),
            formatstr(row["MESURES HELICOPTERE"]),
            formatstr(row["DEPARTEMENT"]),
            convertdouble(row["DESCOPAGE"]),
            formatstr(row["COMMUNE/AXE"]),
            formatstr(row["PRECISION LIEU/AXE"]),
            formatstr(row["OPERATEUR"]),
            formatstr(row["USAGE"]),
            formatstr(row["SERVICE"]),
            formatstr(row["DETAIL"]),
            formatstr(row["URL"]),
            convertdouble(row["DUREE (s)"]),
            convertdouble(row["VOLUME (MB) ou INIT VIDEO (s)"]),
            convertdouble(row["DEBIT (Mbits/s) ou FREEZE VIDEO (s)"]),
            formatstr(row["MOBILE"]),
            convertdouble(row["Start/latitude"]),
            convertdouble(row["Start/longitude"]),
            formatstr(row["Start/date-time"]),
            convertdouble(row["WEB10"]),
            convertdouble(row["WEB5"]),
            convertdouble(row["Transfert OK"]),
            convertdouble(row["CRP video"]),
            convertdouble(row["CRC video"]),
            convertdouble(row["Debit>3Mbs"]),
            formatstr(row["Techno"]),
            formatstr(file_name),
        ]

        query = build_insert_query(table_name, columns, lstData)
        executesql(query)


def insertoutremerdatatransports(table_name, datas, file_name):
    columns = [
        "fid",
        "mesures_helicoptere",
        "departement",
        "descopage",
        "communeaxe",
        "precision_lieuaxe",
        "operateur",
        "situation",
        "service",
        "detail",
        "url",
        "duree_s",
        "volume_mb_ou_init_video_s",
        "debit_en_mbits",
        "mobile",
        "startlatitude",
        "startlongitude",
        "startdate_time",
        "web10",
        "web5",
        "transfert_ok",
        "crp_video",
        "crc_video",
        "debit3mbs",
        "techno",
        "filename",
    ]

    for index, row in datas.iterrows():
        lstData = [
            str(index),
            formatstr(row["MESURES HELICOPTERE"]),
            formatstr(row["DEPARTEMENT"]),
            convertdouble(row["DESCOPAGE"]),
            formatstr(row["COMMUNE/AXE"]),
            formatstr(row["PRECISION LIEU/AXE"]),
            formatstr(row["OPERATEUR"]),
            formatstr(row["USAGE"]),
            formatstr(row["SERVICE"]),
            formatstr(row["DETAIL"]),
            formatstr(row["URL"]),
            convertdouble(row["DUREE (s)"]),
            convertdouble(row["VOLUME (MB) ou INIT VIDEO (s)"]),
            convertdouble(row["DEBIT (Mbits/s) ou FREEZE VIDEO (s)"]),
            formatstr(row["MOBILE"]),
            convertdouble(row["Start/latitude"]),
            convertdouble(row["Start/longitude"]),
            formatstr(row["Start/date-time"]),
            convertdouble(row["WEB10"]),
            convertdouble(row["WEB5"]),
            convertdouble(row["Transfert OK"]),
            convertdouble(row["CRP video"]),
            convertdouble(row["CRC video"]),
            convertdouble(row["Debit>3Mbs"]),
            formatstr(row["Techno"]),
            formatstr(file_name),
        ]

        query = build_insert_query(table_name, columns, lstData)
        executesql(query)


def insertoutremervoixhabitations(table_name, datas, file_name):
    columns = [
        "fid",
        "protocole",
        "commune_axe",
        "descopage",
        "situation",
        "date",
        "operateur",
        "calldirection",
        "heure",
        "longitude",
        "latitude",
        "techno_emetteur",
        "techno_recepteur",
        "rsrp",
        "rsrq",
        "duree_communication",
        "intrainter",
        "departement",
        "couple_kpi",
        "bilan",
        "mosminglob",
        "mos_moyen",
        "mos1",
        "mos2",
        "mos3",
        "mos4",
        "mos5",
        "mos6",
        "mos7",
        "nb_mos",
        "bilan_couple",
        "mos_min_couple",
        "mos_moyen_couple",
        "tqp",
        "dea",
        "duree_sms",
        "filename",
    ]

    for index, row in datas.iterrows():
        lstData = [
            str(index),
            formatstr(row["protocole"]),
            formatstr(row["Commune / Axe"]),
            convertdouble(row["DESCOPAGE"]),
            formatstr(row["usage"]),
            formatstr(row["Date"]),
            formatstr(row["opérateur"]),
            formatstr(row["CallDirection"]),
            formatstr(row["heure"]),
            convertdouble(row["longitude"]),
            convertdouble(row["latitude"]),
            formatstr(row["techno emetteur"]),
            formatstr(row["techno recepteur"]),
            convertdouble(row["RSRP"]),
            convertdouble(row["RSRQ"]),
            convertdouble(row["durée communication"]),
            formatstr(row["intra/inter"]),
            formatstr(row["DEPARTEMENT"]),
            formatstr(row["Couple KPI"]),
            convertdouble(row["BILAN"]),
            convertdouble(row["MOS Min"]),
            convertdouble(row["MOS Moyen"]),
            convertdouble(row["MOS1"]),
            convertdouble(row["MOS2"]),
            convertdouble(row["MOS3"]),
            convertdouble(row["MOS4"]),
            convertdouble(row["MOS5"]),
            convertdouble(row["MOS6"]),
            convertdouble(row["MOS7"]),
            convertdouble(row["nb MOS"]),
            convertdouble(row["BILAN Couple"]),
            convertdouble(row["MOS Min Couple"]),
            convertdouble(row["MOS Moyen Couple"]),
            convertdouble(row["TQP"]),
            convertdouble(row["DEA"]),
            formatstr(row["duree_sms"]),
            formatstr(file_name),
        ]

        query = build_insert_query(table_name, columns, lstData)
        executesql(query)


def insertoutremervoixtransports(table_name, datas, file_name):
    columns = [
        "fid",
        "protocole",
        "commune_axe",
        "descopage",
        "situation",
        "date",
        "operateur",
        "calldirection",
        "heure",
        "longitude",
        "latitude",
        "techno_emetteur",
        "techno_recepteur",
        "rsrp",
        "rsrq",
        "duree_communication",
        "intrainter",
        "departement",
        "couple_kpi",
        "bilan",
        "mosminglob",
        "mos_moyen",
        "mos1",
        "mos2",
        "mos3",
        "mos4",
        "mos5",
        "mos6",
        "mos7",
        "nb_mos",
        "bilan_couple",
        "mos_min_couple",
        "mos_moyen_couple",
        "tqp",
        "dea",
        "duree_sms",
        "filename",
    ]

    for index, row in datas.iterrows():
        lstData = [
            str(index),
            formatstr(row["protocole"]),
            formatstr(row["Commune / Axe"]),
            convertdouble(row["DESCOPAGE"]),
            formatstr(row["usage"]),
            formatstr(row["Date"]),
            formatstr(row["opérateur"]),
            formatstr(row["CallDirection"]),
            formatstr(row["heure"]),
            convertdouble(row["longitude"]),
            convertdouble(row["latitude"]),
            formatstr(row["techno emetteur"]),
            formatstr(row["techno recepteur"]),
            convertdouble(row["RSRP"]),
            convertdouble(row["RSRQ"]),
            convertdouble(row["durée communication"]),
            formatstr(row["intra/inter"]),
            formatstr(row["DEPARTEMENT"]),
            formatstr(row["Couple KPI"]),
            convertdouble(row["BILAN"]),
            convertdouble(row["MOS Min"]),
            convertdouble(row["MOS Moyen"]),
            convertdouble(row["MOS1"]),
            convertdouble(row["MOS2"]),
            convertdouble(row["MOS3"]),
            convertdouble(row["MOS4"]),
            convertdouble(row["MOS5"]),
            convertdouble(row["MOS6"]),
            convertdouble(row["MOS7"]),
            convertdouble(row["nb MOS"]),
            convertdouble(row["BILAN Couple"]),
            convertdouble(row["MOS Min Couple"]),
            convertdouble(row["MOS Moyen Couple"]),
            convertdouble(row["TQP"]),
            convertdouble(row["DEA"]),
            formatstr(row["duree_sms"]),
            formatstr(file_name),
        ]

        query = build_insert_query(table_name, columns, lstData)
        executesql(query)


def build_update_query(table_name, updates):
    """Construit une requête UPDATE multi-statements sécurisée."""
    return sql.SQL(updates).format(schema=sql.Identifier(SCHEMA), table=sql.Identifier(table_name))


def updatemetropoledatahabitations():
    query = sql.SQL("""
        UPDATE {schema}.qos_metropole_data_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'SFR Caraïbes') WHERE operateur IN ('SFR');

        UPDATE {schema}.qos_metropole_data_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Bouygues Telecom') WHERE operateur IN ('Bouygues Telecom', 'Bouygues');

        UPDATE {schema}.qos_metropole_data_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Free Mobile') WHERE operateur IN ('Free');

        UPDATE {schema}.qos_metropole_data_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Free Caraïbes') WHERE operateur IN ('FREE');

        UPDATE {schema}.qos_metropole_data_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Orange') WHERE operateur IN ('Orange');

        UPDATE {schema}.qos_metropole_data_habitations s SET insee_dep = (
            SELECT d.insee_dep
            FROM {schema}.qos_metropole_data_habitations t, {schema}.departement d
            WHERE t.fid = s.fid AND st_contains(d.geom, t.geometry)
        );

        UPDATE {schema}.qos_metropole_data_habitations AS qos SET id_hexa = h.fid
        FROM {schema}.hexa_30m AS h WHERE ST_Intersects(qos.geometry, h.geometry);
    """).format(schema=sql.Identifier(SCHEMA))
    executesql(query)


def updatemetropoledatatransports():
    query = sql.SQL("""
        UPDATE {schema}.qos_metropole_data_transports 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'SFR Caraïbes') WHERE operateur IN ('SFR');

        UPDATE {schema}.qos_metropole_data_transports 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Bouygues Telecom') WHERE operateur IN ('Bouygues Telecom', 'Bouygues');

        UPDATE {schema}.qos_metropole_data_transports 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Free Mobile') WHERE operateur IN ('Free');

        UPDATE {schema}.qos_metropole_data_transports 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Orange') WHERE operateur IN ('Orange');

        UPDATE {schema}.qos_metropole_data_transports s SET insee_dep = (
            SELECT d.insee_dep
            FROM {schema}.qos_metropole_data_transports t, {schema}.departement d
            WHERE t.fid = s.fid AND st_contains(d.geom, t.geometry)
        );

        UPDATE {schema}.qos_metropole_data_transports AS qos SET id_hexa = h.fid
        FROM {schema}.hexa_30m AS h WHERE ST_Intersects(qos.geometry, h.geometry);
    """).format(schema=sql.Identifier(SCHEMA))
    executesql(query)


def updatemetropolevoixhabitations():
    query = sql.SQL("""
        UPDATE {schema}.qos_metropole_voix_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'SFR Caraïbes') WHERE operateur IN ('SFR');

        UPDATE {schema}.qos_metropole_voix_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Bouygues Telecom') WHERE operateur IN ('Bouygues');

        UPDATE {schema}.qos_metropole_voix_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Free Caraïbes') WHERE operateur IN ('FREE');

        UPDATE {schema}.qos_metropole_voix_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Orange') WHERE operateur IN ('Orange');

        UPDATE {schema}.qos_metropole_voix_habitations s SET insee_dep = (
            SELECT d.insee_dep
            FROM {schema}.qos_metropole_voix_habitations t, {schema}.departement d
            WHERE t.fid = s.fid AND st_contains(d.geom, t.geometry)
        );

        UPDATE {schema}.qos_metropole_voix_habitations AS qos SET id_hexa = h.fid
        FROM {schema}.hexa_30m AS h WHERE ST_Intersects(qos.geometry, h.geometry);
    """).format(schema=sql.Identifier(SCHEMA))
    executesql(query)


def updatemetropolevoixtransports():
    query = sql.SQL("""
        UPDATE {schema}.qos_metropole_voix_transports 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'SFR Caraïbes') WHERE operateur IN ('SFR', 'SFR_SFR');

        UPDATE {schema}.qos_metropole_voix_transports 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Bouygues Telecom') WHERE operateur IN ('Bouygues', 'Bouygues_Bouygues');

        UPDATE {schema}.qos_metropole_voix_transports
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Free Mobile') WHERE operateur IN ('Free', 'Free_Free');

        UPDATE {schema}.qos_metropole_voix_transports 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Orange') WHERE operateur IN ('Orange', 'Orange_Orange');

        UPDATE {schema}.qos_metropole_voix_transports s SET insee_dep = (
            SELECT d.insee_dep
            FROM {schema}.qos_metropole_voix_transports t, {schema}.departement d
            WHERE t.fid = s.fid AND st_contains(d.geom, t.geometry)
        );

        UPDATE {schema}.qos_metropole_voix_transports AS qos SET id_hexa = h.fid
        FROM {schema}.hexa_30m AS h WHERE ST_Intersects(qos.geometry, h.geometry);
    """).format(schema=sql.Identifier(SCHEMA))
    executesql(query)


def updateOutremerDataHabitations():
    query = sql.SQL("""
        UPDATE {schema}.qos_outremer_data_habitations 
        SET protocole = 'DOWNLOAD' WHERE service IN ('DLD', 'DLH');

        UPDATE {schema}.qos_outremer_data_habitations 
        SET protocole = 'UPLOAD' WHERE service IN ('ULD', 'ULH');

        UPDATE {schema}.qos_outremer_data_habitations 
        SET protocole = 'WEB' WHERE service IN ('WEB');

        UPDATE {schema}.qos_outremer_data_habitations 
        SET protocole = 'STREAM' WHERE service IN ('VIDEO');

        UPDATE {schema}.qos_outremer_data_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Orange Caraïbes') WHERE operateur IN ('Orange caraibe', 'Orange Caraibe');

        UPDATE {schema}.qos_outremer_data_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Digicel') WHERE operateur IN ('DGC', 'Digicel');

        UPDATE {schema}.qos_outremer_data_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Dauphin Telecom') WHERE operateur IN ('Dauphin');

        UPDATE {schema}.qos_outremer_data_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'UTS') WHERE operateur IN ('UTS caraibe');

        UPDATE {schema}.qos_outremer_data_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Zeop') WHERE operateur IN ('Zeop');

        UPDATE {schema}.qos_outremer_data_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Only') WHERE operateur IN ('ONLY');

        UPDATE {schema}.qos_outremer_data_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Maore Mobile') WHERE operateur IN ('Maoré mobile', 'Maoré Mobile');

        UPDATE {schema}.qos_outremer_data_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'SFR Caraïbes') WHERE operateur IN ('SFR');

        UPDATE {schema}.qos_outremer_data_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Société Réunionaise du radiotéléphone') WHERE operateur IN ('SFRREUNION');

        UPDATE {schema}.qos_outremer_data_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Free Mobile' AND perimetre_metro = false) WHERE operateur IN ('Free');

        UPDATE {schema}.qos_outremer_data_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Free Caraïbes') WHERE operateur IN ('FREE');

        UPDATE {schema}.qos_outremer_data_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Orange' AND perimetre_metro = false) WHERE operateur IN ('Orange', 'Orange Mayotte', 'Orange Reunion');

        UPDATE {schema}.qos_outremer_data_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Only' AND perimetre_metro = false) WHERE operateur IN ('Telco');

        UPDATE {schema}.qos_outremer_data_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Orange' AND perimetre_metro = false) WHERE operateur IN ('ORF');

        UPDATE {schema}.qos_outremer_data_habitations SET situation = lower(situation);

        UPDATE {schema}.qos_outremer_data_habitations SET page_chargee_moins_10s = true 
        WHERE protocole = 'WEB' AND web10 = 1; 

        UPDATE {schema}.qos_outremer_data_habitations SET page_chargee_moins_5s = true 
        WHERE protocole = 'WEB' AND web5 = 1; 

        UPDATE {schema}.qos_outremer_data_habitations q SET insee_dep = (
            SELECT insee_dep FROM {schema}.departement d WHERE st_contains(d.geom, q.geometry)
        );

        UPDATE {schema}.qos_outremer_data_habitations AS qos SET id_hexa = h.fid
        FROM {schema}.hexa_30m AS h WHERE ST_Intersects(qos.geometry, h.geometry);

        UPDATE {schema}.qos_outremer_data_habitations 
        SET date = to_char(date(startdate_time), 'DD/MM/YYYY'), 
        heure = startdate_time::time;
    """).format(schema=sql.Identifier(SCHEMA))
    executesql(query)


def updateoutremerdatatransports():
    query = sql.SQL("""
        UPDATE {schema}.qos_outremer_data_transports 
        SET protocole = 'DOWNLOAD' WHERE service IN ('DLD', 'DLH');

        UPDATE {schema}.qos_outremer_data_transports 
        SET protocole = 'UPLOAD' WHERE service IN ('ULD', 'ULH');

        UPDATE {schema}.qos_outremer_data_transports 
        SET protocole = 'WEB' WHERE service IN ('WEB');

        UPDATE {schema}.qos_outremer_data_transports 
        SET protocole = 'STREAM' WHERE service IN ('VIDEO');

        UPDATE {schema}.qos_outremer_data_transports 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Orange Caraïbes') WHERE operateur IN ('Orange caraibe', 'Orange Caraibe');

        UPDATE {schema}.qos_outremer_data_transports 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Digicel') WHERE operateur IN ('DGC', 'Digicel');

        UPDATE {schema}.qos_outremer_data_transports 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Dauphin Telecom') WHERE operateur IN ('Dauphin');

        UPDATE {schema}.qos_outremer_data_transports 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'UTS') WHERE operateur IN ('UTS caraibe');

        UPDATE {schema}.qos_outremer_data_transports 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Zeop') WHERE operateur IN ('Zeop');

        UPDATE {schema}.qos_outremer_data_transports 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Only') WHERE operateur IN ('ONLY');

        UPDATE {schema}.qos_outremer_data_transports 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Maore Mobile') WHERE operateur IN ('Maoré mobile', 'Maoré Mobile');

        UPDATE {schema}.qos_outremer_data_transports 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'SFR Caraïbes') WHERE operateur IN ('SFR');

        UPDATE {schema}.qos_outremer_data_transports 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Société Réunionaise du radiotéléphone') WHERE operateur IN ('SFRREUNION');

        UPDATE {schema}.qos_outremer_data_transports 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Free Mobile' AND perimetre_metro = false) WHERE operateur IN ('Free');

        UPDATE {schema}.qos_outremer_data_transports 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Free Caraïbes') WHERE operateur IN ('FREE');

        UPDATE {schema}.qos_outremer_data_transports 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Orange' AND perimetre_metro = false) WHERE operateur IN ('Orange', 'Orange Mayotte', 'Orange Reunion');

        UPDATE {schema}.qos_outremer_data_transports 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Only' AND perimetre_metro = false) WHERE operateur IN ('Telco');

        UPDATE {schema}.qos_outremer_data_transports 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Orange' AND perimetre_metro = false) WHERE operateur IN ('ORF');

        UPDATE {schema}.qos_outremer_data_transports SET situation = lower(situation);

        UPDATE {schema}.qos_outremer_data_transports SET page_chargee_moins_10s = true 
        WHERE protocole = 'WEB' AND web10 = 1; 

        UPDATE {schema}.qos_outremer_data_transports SET page_chargee_moins_5s = true 
        WHERE protocole = 'WEB' AND web5 = 1; 

        UPDATE {schema}.qos_outremer_data_transports AS qos SET id_hexa = h.fid
        FROM {schema}.hexa_30m AS h WHERE ST_Intersects(qos.geometry, h.geometry);

        UPDATE {schema}.qos_outremer_data_transports 
        SET date = to_char(date(startdate_time), 'DD/MM/YYYY'), 
        heure = startdate_time::time;
    """).format(schema=sql.Identifier(SCHEMA))
    executesql(query)


def updateoutremervoixhabitations():
    query = sql.SQL("""
        UPDATE {schema}.qos_outremer_voix_habitations SET protocole = 'Voix' WHERE protocole = 'voix'; 

        UPDATE {schema}.qos_outremer_voix_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Orange Caraïbes') WHERE operateur IN ('Orange caraibe', 'Orange Caraibe');

        UPDATE {schema}.qos_outremer_voix_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Orange Caraïbes') WHERE operateur IN ('Orange caraibe', 'Orange Caraibe');

        UPDATE {schema}.qos_outremer_voix_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Digicel') WHERE operateur IN ('DGC', 'Digicel');

        UPDATE {schema}.qos_outremer_voix_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Dauphin Telecom') WHERE operateur IN ('Dauphin');

        UPDATE {schema}.qos_outremer_voix_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'UTS') WHERE operateur IN ('UTS caraibe');

        UPDATE {schema}.qos_outremer_voix_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Zeop') WHERE operateur IN ('Zeop');

        UPDATE {schema}.qos_outremer_voix_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Only') WHERE operateur IN ('ONLY');

        UPDATE {schema}.qos_outremer_voix_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Maore Mobile') WHERE operateur IN ('Maoré mobile', 'Maoré Mobile');

        UPDATE {schema}.qos_outremer_voix_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'SFR Caraïbes') WHERE operateur IN ('SFR');

        UPDATE {schema}.qos_outremer_voix_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Société Réunionaise du radiotéléphone') WHERE operateur IN ('SFRREUNION');

        UPDATE {schema}.qos_outremer_voix_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Free Mobile' AND perimetre_metro = false) WHERE operateur IN ('Free');

        UPDATE {schema}.qos_outremer_voix_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Free Caraïbes') WHERE operateur IN ('FREE');

        UPDATE {schema}.qos_outremer_voix_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Orange' AND perimetre_metro = false) WHERE operateur IN ('Orange', 'Orange Mayotte', 'Orange Reunion');

        UPDATE {schema}.qos_outremer_voix_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Only' AND perimetre_metro = false) WHERE operateur IN ('Telco');

        UPDATE {schema}.qos_outremer_voix_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Orange' AND perimetre_metro = false) WHERE operateur IN ('ORF');

        UPDATE {schema}.qos_outremer_voix_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'UTS' AND perimetre_metro = false) WHERE operateur IN ('UTS');

        UPDATE {schema}.qos_outremer_voix_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Free Caraïbes' AND perimetre_metro = false) WHERE operateur IN ('FRE');

        UPDATE {schema}.qos_outremer_voix_habitations 
        SET mcc_mnc = (SELECT identifiant FROM {schema}.operateurs 
        WHERE nom_entier = 'Dauphin Telecom' AND perimetre_metro = false) WHERE operateur IN ('DPH');

        UPDATE {schema}.qos_outremer_voix_habitations SET situation = lower(situation);

        UPDATE {schema}.qos_outremer_voix_habitations SET appel_2min = true WHERE duree_communication >= 120;

        UPDATE {schema}.qos_outremer_voix_habitations q SET insee_dep = (
            SELECT insee_dep FROM {schema}.departement d WHERE st_contains(d.geom, q.geometry)
        );

        UPDATE {schema}.qos_outremer_voix_habitations AS qos SET id_hexa = h.fid
        FROM {schema}.hexa_30m AS h WHERE ST_Intersects(qos.geometry, h.geometry);
    """).format(schema=sql.Identifier(SCHEMA))
    executesql(query)


def updateoutremervoixtransports():
    query = sql.SQL("""
        update {schema}.qos_outremer_voix_transports set protocole = 'Voix' where protocole = 'voix' ; 
            
        update {schema}.qos_outremer_voix_transports 
        set mcc_mnc = (select identifiant from {schema}.operateurs 
        where nom_entier = 'Orange Caraïbes') where operateur IN ('Orange caraibe', 'Orange Caraibe');

        update {schema}.qos_outremer_voix_transports 
        set mcc_mnc = (select identifiant from {schema}.operateurs 
        where nom_entier = 'Orange Caraïbes') where operateur IN ('Orange caraibe', 'Orange Caraibe');

        update {schema}.qos_outremer_voix_transports 
        set mcc_mnc = (select identifiant from {schema}.operateurs 
        where nom_entier = 'Digicel') where operateur IN ('DGC', 'Digicel');

        update {schema}.qos_outremer_voix_transports 
        set mcc_mnc = (select identifiant from {schema}.operateurs 
        where nom_entier = 'Dauphin Telecom') where operateur IN ('Dauphin');

        update {schema}.qos_outremer_voix_transports 
        set mcc_mnc = (select identifiant from {schema}.operateurs 
        where nom_entier = 'UTS') where operateur IN ('UTS caraibe');

        update {schema}.qos_outremer_voix_transports 
        set mcc_mnc = (select identifiant from {schema}.operateurs 
        where nom_entier = 'Zeop') where operateur IN ('Zeop');

        update {schema}.qos_outremer_voix_transports 
        set mcc_mnc = (select identifiant from {schema}.operateurs 
        where nom_entier = 'Only') where operateur IN ('ONLY');

        update {schema}.qos_outremer_voix_transports 
        set mcc_mnc = (select identifiant from {schema}.operateurs 
        where nom_entier = 'Maore Mobile') where operateur IN ('Maoré mobile', 'Maoré Mobile');

        update {schema}.qos_outremer_voix_transports 
        set mcc_mnc = (select identifiant from {schema}.operateurs 
        where nom_entier = 'SFR Caraïbes') where operateur IN ('SFR');

        update {schema}.qos_outremer_voix_transports 
        set mcc_mnc = (select identifiant from {schema}.operateurs 
        where nom_entier = 'Société Réunionaise du radiotéléphone') where operateur IN ('SFRREUNION');

        update {schema}.qos_outremer_voix_transports 
        set mcc_mnc = (select identifiant from {schema}.operateurs 
        where nom_entier = 'Free Mobile' and perimetre_metro = false) where operateur IN ('Free');

        update {schema}.qos_outremer_voix_transports 
        set mcc_mnc = (select identifiant from {schema}.operateurs 
        where nom_entier = 'Free Caraïbes') where operateur IN ('FREE');

        update {schema}.qos_outremer_voix_transports 
        set mcc_mnc = (select identifiant from {schema}.operateurs 
        where nom_entier = 'Orange' and perimetre_metro = false) where operateur IN ('Orange', 'Orange Mayotte', 'Orange Reunion');

        update {schema}.qos_outremer_voix_transports 
        set mcc_mnc = (select identifiant from {schema}.operateurs 
        where nom_entier = 'Only' and perimetre_metro = false) where operateur IN ('Telco');

        update {schema}.qos_outremer_voix_transports 
        set mcc_mnc = (select identifiant from {schema}.operateurs 
        where nom_entier = 'Orange' and perimetre_metro = false) where operateur IN ('ORF');

        update {schema}.qos_outremer_voix_transports 
        set mcc_mnc = (select identifiant from {schema}.operateurs 
        where nom_entier = 'UTS' and perimetre_metro = false) where operateur IN ('UTS');

        update {schema}.qos_outremer_voix_transports 
        set mcc_mnc = (select identifiant from {schema}.operateurs 
        where nom_entier = 'Free Caraïbes' and perimetre_metro = false) where operateur IN ('FRE');

        update {schema}.qos_outremer_voix_transports 
        set mcc_mnc = (select identifiant from {schema}.operateurs 
        where nom_entier = 'Dauphin Telecom' and perimetre_metro = false) where operateur IN ('DPH');
            
        update {schema}.qos_outremer_voix_transports set situation = lower(situation);
   
        update {schema}.qos_outremer_voix_transports set appel_2min = true where duree_communication >= 120;
            
        UPDATE {schema}.qos_outremer_voix_transports q SET insee_dep = (
            select insee_dep from {schema}.departement d where st_contains(d.geom, q.geometry)
        );

        UPDATE {schema}.qos_outremer_voix_transports as qos SET id_hexa = h.fid
        FROM {schema}.hexa_30m as h WHERE ST_Intersects(qos.geometry, h.geometry);
    """).format(schema=sql.Identifier(SCHEMA))
    executesql(query)


def main():
    parser = argparse.ArgumentParser(description="Exécute une fonction spécifique.")
    parser.add_argument("--function", type=str, help="Nom de la fonction à appeler")

    args = parser.parse_args()

    if args.function == "run":
        run()


if __name__ == "__main__":
    main()
