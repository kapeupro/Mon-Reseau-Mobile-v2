from django.conf import settings
from psycopg import sql

from back_mrm.utils.db import Db


class StatQosByOperator:
    # Whitelist des protocoles autorisés pour éviter l'injection SQL
    ALLOWED_PROTOCOLS = ["WEB", "STREAM", "UPLOAD", "DOWNLOAD", "VOIX", "SMS"]

    # Whitelist des situations autorisées
    ALLOWED_SITUATIONS = ["zones rurales", "zones intermediaires", "zones denses", "zones touristiques", "others"]

    # Whitelist des strates autorisées
    ALLOWED_STRATES = ["tgv", "intercites_ter", "transiliens_rer", "metros", "routes"]

    def __init__(self, request):
        self.initparams(request)

    def initparams(self, request):
        self.odb = Db()
        self.entite = request.GET["entite"]
        self.protocole = self.formattedprotocole(request.GET["protocole"])
        self.operator_list = self.formatoperators(request.GET["operators"])
        self.request = request

        # Validation du protocole contre la whitelist
        if self.protocole not in self.ALLOWED_PROTOCOLS:
            raise ValueError(f"Protocole non autorisé : {self.protocole}")

    def getdata(self):
        return self.data

    def setdata(self, data):
        self.data = data

    def getschema(self):
        return settings.DATABASE_SCHEMA

    def getlabel(self):
        if self.isweb():
            return "Durée d'accès à une page"

        if self.isstream():
            return "Qualité de la vidéo en ligne"

        if self.isupload():
            return "Test d'envoie de fichier"

        if self.isdownload():
            return "Débit en Mbits/s"

        if self.isvoix():
            return "Durée de communication supérieur à 2mn"

        if self.issms():
            return "Délai d'envoie < 10 s"

    def getstatqos(self):
        try:
            data = self.getdataoperator()
            if not data:
                return False
            self.formatteddata(data)
            return True
        except Exception:
            return False

    def getdataoperator(self):
        # Validation stricte des opérateurs (uniquement des entiers)
        validated_operators = []
        for op in self.operator_list:
            try:
                validated_operators.append(int(op))
            except (ValueError, TypeError):
                continue

        if not validated_operators:
            return False

        # Création des placeholders pour la clause IN (%s, %s, ...)
        placeholders = ",".join(["%s"] * len(validated_operators))
        params = validated_operators

        # Construction sécurisée de la requête avec psycopg.sql
        query = sql.SQL("""
            SELECT
                identifiant,
                nom_affichage,
                couleur_niveau_1,
                couleur_niveau_2,
                couleur_niveau_3,
                couleur_niveau_4
            FROM {schema}.operateurs
            WHERE identifiant IN ({placeholders})
            ORDER BY nom_affichage
        """).format(schema=sql.Identifier(self.getschema()), placeholders=sql.SQL(placeholders))

        results = self.odb.selectasarray(query, params)

        return results or False

    def getcolorfailure(self):
        return "#F1EDE6"

    def getlistcolor(self, result):
        if self.isweb() or self.isstream() or self.isvoix():
            return [result["couleur_niveau_3"], result["couleur_niveau_1"], self.getcolorfailure()]

        if self.isupload() or self.issms():
            return [result["couleur_niveau_3"], self.getcolorfailure()]

        if self.isdownload():
            return [
                result["couleur_niveau_3"],
                result["couleur_niveau_2"],
                result["couleur_niveau_1"],
                self.getcolorfailure(),
            ]

    def formatteddata(self, data):
        result = [
            {
                "nom_affichage": result["nom_affichage"],
                "valeur_stats": self.getstatbyoperator(result["identifiant"]),
                "couleur_niveaux": self.getlistcolor(result),
            }
            for result in data
        ]

        self.setdata(result)
        return True

    def formatoperators(self, operator_list):
        """Parse la chaîne d'opérateurs en liste validée"""
        operators = [operator.strip() for operator in operator_list.split(",") if operator.strip()]
        return operators

    def formattedprotocole(self, protocole):
        return protocole.upper()

    def isstream(self):
        return self.protocole == "STREAM"

    def isweb(self):
        return self.protocole == "WEB"

    def isdownload(self):
        return self.protocole == "DOWNLOAD"

    def isupload(self):
        return self.protocole == "UPLOAD"

    def isvoix(self):
        return self.protocole == "VOIX"

    def issms(self):
        return self.protocole == "SMS"

    def getstatbyoperator(self, identifiant):
        try:
            strWhere, where_params = self.buildwhere(identifiant)
            strFields = self.buildfieldstorequest()
            strFieldsStat = self.getfieldbyprotocolestat()

            if not strWhere or not strFields:
                return False

            # Construction sécurisée de la requête
            query = sql.SQL("""
                WITH datastatqos AS (
                    SELECT 
                        {strFields}
                    FROM {schema}.qos 
                    WHERE {strWhere}
                )
                SELECT 
                    {strFieldsStat}
                FROM datastatqos 
                WHERE total > 0
            """).format(
                schema=sql.Identifier(self.getschema()),
                strFields=sql.SQL(strFields),
                strWhere=sql.SQL(strWhere),
                strFieldsStat=sql.SQL(strFieldsStat),
            )

            res = self.odb.selectasarray(query, where_params)

            if not res or len(res) == 0:
                return False

            result = []
            for value in res[0].values():
                result.append(float(value) if value else 0.0)

            return result
        except Exception:
            return False

    def getlabelniveau(self):
        if self.isweb():
            return ["< 5s", "[5 - 10[ s", " > 10s"]

        if self.isstream():
            return ["Parfaite", "Correcte", "Echec"]

        if self.isupload():
            return ["Succès", "Echec"]

        if self.isdownload():
            return ["< 3 Mbits/s", "[3 - 8[ Mbits/s", "[8 - 30[ Mbits/s", "> 30 Mbits/s"]

        if self.isvoix():
            return ["Succès", "Succès partiel", "Echec"]

        if self.issms():
            return ["< 10", ">=10"]

    def istransport(self):
        if "habitation" not in self.request.GET.keys():
            return True  # Par défaut is_transport = TRUE

        # Inversion logique : habitation=1 → is_transport=FALSE
        return self.request.GET["habitation"] != "1"

    def getterritory(self):
        if "metropole" not in self.request.GET.keys():
            return True  # Par défaut is_metropole = TRUE

        return self.request.GET["metropole"] != "0"

    def getdatasource(self):
        datasource = self.request.GET.get("datasource", "")
        # Validation que datasource est un entier
        try:
            return int(datasource)
        except (ValueError, TypeError):
            return 0

    def buildwhere(self, identifiant):
        """Construit la clause WHERE avec des paramètres sécurisés"""
        strwhere_parts = []
        params = []

        # is_metropole (booléen)
        strwhere_parts.append("is_metropole = %s")
        params.append(self.getterritory())

        # id_data_source_desc (entier)
        strwhere_parts.append("id_data_source_desc = %s")
        params.append(self.getdatasource())

        # Conditions par protocole
        if self.isweb():
            strwhere_parts.append("acess_duration IS NOT NULL")
        elif self.isstream():
            strwhere_parts.append("quality_perfect IS NOT NULL")
        elif self.isupload():
            strwhere_parts.append("upload_ok IS NOT NULL")
        elif self.isdownload():
            strwhere_parts.append("bitrate_dl IS NOT NULL")
        elif self.isvoix():
            strwhere_parts.append("real_communiation_time IS NOT NULL")
        elif self.issms():
            strwhere_parts.append("sms_delai IS NOT NULL")

        # mcc_mnc (entier)
        strwhere_parts.append("mcc_mnc = %s")
        try:
            params.append(int(identifiant))
        except (ValueError, TypeError):
            params.append(0)

        # is_transport (booléen)
        strwhere_parts.append("is_transport = %s")
        params.append(self.istransport())

        # situation (whitelist)
        if self.issituationrequested():
            situation = self.getsituation()
            if situation in self.ALLOWED_SITUATIONS:
                strwhere_parts.append("LOWER(situation) = %s")
                params.append(situation.lower())

        # strate/zone (whitelist)
        if self.isstraterequested():
            strates = self.getstrate("array")
            if strates:
                # Filtrer contre la whitelist
                valid_strates = [s for s in strates if s in self.ALLOWED_STRATES]
                if valid_strates:
                    placeholders = ",".join(["%s"] * len(valid_strates))
                    strwhere_parts.append(f"LOWER(zone) IN ({placeholders})")
                    params.extend([s.lower() for s in valid_strates])

        # protocole (déjà validé dans __init__)
        strwhere_parts.append("protocole = %s")
        params.append(self.protocole.lower())

        return " AND ".join(strwhere_parts), params

    def getsituation(self):
        situation = self.request.GET.get("situation", "").lower().strip()
        return situation

    def getstrate(self, format_type):
        """Retourne la liste des strates validées"""
        strate = self.request.GET.get("strate", "").lower()
        strate = strate.replace("{", "").replace("}", "")
        aRes = []
        for data in strate.split(","):
            data = data.strip()
            if data and data != "toutes":
                aRes.append(data)

        if format_type == "array":
            return aRes

        return aRes

    def isstraterequested(self):
        if "strate" not in self.request.GET.keys():
            return False

        astrate = self.getstrate("array")
        return len(astrate) > 0

    def issituationrequested(self):
        if "situation" not in self.request.GET.keys():
            return False

        situation = self.request.GET["situation"].lower().strip()
        return situation != "toutes"

    def buildfieldstorequest(self):
        fields = """
            COUNT(1)::NUMERIC AS total, 
            {protocol_fields}
        """
        protocol_fields = self.getfieldbyprotocole()
        if protocol_fields:
            fields = fields.format(protocol_fields=protocol_fields)
        else:
            fields = fields.format(protocol_fields="")

        return fields

    def getfieldbyprotocolestat(self):
        if self.isweb() or self.isstream() or self.isvoix():
            return """
                ROUND(success * 100 / NULLIF(total, 0), 2) AS prct_sucess,
                ROUND(success_partiel * 100 / NULLIF(total, 0), 2) AS prct_success_partiel,
                ROUND(fail * 100 / NULLIF(total, 0), 2) AS prct_fail
            """

        if self.isupload():
            return """
                ROUND(success * 100 / NULLIF(total, 0), 2) AS prct_sucess,
                ROUND(echec * 100 / NULLIF(total, 0), 2) AS prct_echec
            """

        if self.isdownload():
            return """
                ROUND(val0_3 * 100 / NULLIF(total, 0), 2) AS prct_val0_3,
                ROUND(val3_8 * 100 / NULLIF(total, 0), 2) AS prct_val3_8,
                ROUND(val8_30 * 100 / NULLIF(total, 0), 2) AS prct_val8_30,
                ROUND(val30 * 100 / NULLIF(total, 0), 2) AS prct_val30
            """

        if self.issms():
            return """
                ROUND(nb_pass * 100 / NULLIF(total, 0), 2) AS prct_nb_pass,
                ROUND(nb_fail * 100 / NULLIF(total, 0), 2) AS prct_nb_fail
            """

        return ""

    def getfieldbyprotocole(self):
        if self.isweb():
            return """
                COUNT(CASE WHEN trunc(acess_duration) < 5 THEN 1 END)::NUMERIC AS success,
                COUNT(CASE WHEN trunc(acess_duration) >= 5 AND trunc(acess_duration) < 10 THEN 1 END)::NUMERIC AS success_partiel,
                COUNT(CASE WHEN trunc(acess_duration) >= 10 THEN 1 END)::NUMERIC AS fail
            """

        if self.isstream():
            return """
                COUNT(CASE WHEN quality_perfect = TRUE THEN 1 END)::NUMERIC AS success,
                COUNT(CASE WHEN quality_perfect = FALSE AND quality_correct = TRUE THEN 1 END)::NUMERIC AS success_partiel,
                COUNT(CASE WHEN quality_perfect = FALSE AND quality_correct = FALSE THEN 1 END)::NUMERIC AS fail
            """

        if self.isupload():
            return """
                COUNT(CASE WHEN upload_ok = TRUE THEN 1 END)::NUMERIC AS success,
                COUNT(CASE WHEN upload_ok = FALSE THEN 1 END)::NUMERIC AS echec
            """

        if self.isdownload():
            return """
                COUNT(CASE WHEN bitrate_dl < 3 THEN 1 END)::NUMERIC AS val0_3,
                COUNT(CASE WHEN bitrate_dl >= 3 AND bitrate_dl < 8 THEN 1 END)::NUMERIC AS val3_8,
                COUNT(CASE WHEN bitrate_dl >= 8 AND bitrate_dl < 30 THEN 1 END)::NUMERIC AS val8_30,
                COUNT(CASE WHEN bitrate_dl >= 30 THEN 1 END)::NUMERIC AS val30
            """

        if self.isvoix():
            return """
                COUNT(CASE WHEN min_mos_couple >= 2.1 AND real_communiation_time = 120 THEN 1 END)::NUMERIC AS success,
                COUNT(CASE WHEN min_mos_couple < 2.1 AND real_communiation_time = 120 THEN 1 END)::NUMERIC AS success_partiel,
                COUNT(CASE WHEN real_communiation_time <> 120 OR min_mos_couple IS NULL THEN 1 END)::NUMERIC AS fail
            """

        if self.issms():
            return """
                COUNT(CASE WHEN sms_delai <= 10 THEN 1 END) AS nb_pass,
                COUNT(CASE WHEN sms_delai > 10 THEN 1 END) AS nb_fail
            """

        return ""
