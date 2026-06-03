from django.conf import settings
from psycopg import sql


class Metropole:
    # Whitelist des tables autorisées pour éviter l'injection SQL
    ALLOWED_TABLES = ["qos", "qos_density", "stats_qos_departements", "stats_qos_regions"]

    # Whitelist des protocoles autorisés
    ALLOWED_PROTOCOLS = ["web", "stream", "download", "upload", "sms", "voix"]

    # Whitelist des situations autorisées
    ALLOWED_SITUATIONS = ["zones rurales", "zones intermediaires", "zones denses", "zones touristiques", "others"]

    # Whitelist des zones/strates autorisées
    ALLOWED_ZONES = ["tgv", "intercites_ter", "transiliens_rer", "metros", "routes"]

    def __init__(self, table, request):
        self.table = self._validate_table(table)
        self.request = request

    def _validate_table(self, table_name):
        """Valide le nom de table contre la whitelist"""
        if table_name not in self.ALLOWED_TABLES:
            raise ValueError(f"Table non autorisée : {table_name}")
        return table_name

    def _validate_protocol(self, protocol):
        """Valide le protocole contre la whitelist"""
        protocol_lower = protocol.lower().strip()
        if protocol_lower not in self.ALLOWED_PROTOCOLS:
            raise ValueError(f"Protocole non autorisé : {protocol}")
        return protocol_lower

    def _validate_situation(self, situation):
        """Valide la situation contre la whitelist"""
        situation_lower = situation.lower().strip()
        if situation_lower not in self.ALLOWED_SITUATIONS:
            raise ValueError(f"Situation non autorisée : {situation}")
        return situation_lower

    def _validate_zone(self, zone):
        """Valide la zone contre la whitelist"""
        zone_lower = zone.lower().strip()
        if zone_lower not in self.ALLOWED_ZONES:
            raise ValueError(f"Zone non autorisée : {zone}")
        return zone_lower

    def _validate_buffer(self, buffer):
        """Valide le buffer comme entier positif"""
        try:
            buffer_int = int(buffer)
            if buffer_int < 0 or buffer_int > 100000:
                raise ValueError("Buffer doit être entre 0 et 100000")
            return buffer_int
        except (ValueError, TypeError):
            raise ValueError("Buffer doit être un entier valide")

    def _validate_operators(self, operators_str):
        """Valide les opérateurs comme liste d'entiers"""
        if not operators_str:
            return []
        operators = [o.strip() for o in operators_str.split(",") if o.strip()]
        validated = []
        for o in operators:
            try:
                validated.append(int(o))
            except (ValueError, TypeError):
                continue
        return validated

    def gettablename(self):
        return self.table

    def getrequest(self):
        return self.request

    def addwhereoperators(self, lstwhere, params):
        """Ajoute la condition WHERE pour les opérateurs de manière sécurisée"""
        operators_str = self.getparams("operators")
        lstoperators = self._validate_operators(operators_str)

        if not lstoperators:
            return lstwhere, params

        # Création des placeholders pour IN (%s, %s, ...)
        placeholders = ",".join(["%s"] * len(lstoperators))
        lstwhere.append(f"mcc_mnc IN ({placeholders})")
        params.extend(lstoperators)
        return lstwhere, params

    def addwherezones(self, lstwhere, params):
        """Ajoute la condition WHERE pour les zones de manière sécurisée"""
        zones_str = self.getparams("zones")
        if not zones_str:
            return lstwhere, params

        lstzones = [z.strip() for z in zones_str.split(",") if z.strip()]

        if not lstzones or "toutes" in [z.lower() for z in lstzones]:
            return lstwhere, params

        # Validation des zones contre la whitelist
        validated_zones = []
        for zone in lstzones:
            try:
                validated_zones.append(self._validate_zone(zone))
            except ValueError:
                continue

        if not validated_zones:
            return lstwhere, params

        # Création des placeholders pour IN (%s, %s, ...)
        placeholders = ",".join(["%s"] * len(validated_zones))
        lstwhere.append(f"LOWER(strate) IN ({placeholders})")
        params.extend(validated_zones)
        return lstwhere, params

    def addwheresituation(self, lstwhere, params):
        """Ajoute la condition WHERE pour la situation de manière sécurisée"""
        situation = self.getparams("situation")

        if not situation or situation.lower() == "toutes":
            return lstwhere, params

        try:
            validated_situation = self._validate_situation(situation)
        except ValueError:
            return lstwhere, params

        lstwhere.append("LOWER(situation) = %s")
        params.append(validated_situation)
        return lstwhere, params

    def addwhereprotocole(self, lstwhere, params):
        """Ajoute la condition WHERE pour le protocole de manière sécurisée"""
        service = self.getparams("service")

        if service == "internet":
            protocole = self.getparams("internet")
        else:
            protocole = self.getparams("appel")

        try:
            validated_protocole = self._validate_protocol(protocole)
        except ValueError:
            return lstwhere, params

        lstwhere.append("protocole = %s")
        params.append(validated_protocole)
        return lstwhere, params

    def addwherebuffer(self, lstwhere, params, fid):
        """Ajoute la condition WHERE pour le buffer de manière sécurisée"""
        try:
            buffer_value = self._validate_buffer(self.getparams("buffer"))
        except ValueError:
            return lstwhere, params

        # Note: Le buffer value est un entier validé, on peut l'utiliser dans ST_Buffer
        # mais la table name doit être validée (déjà fait dans __init__)
        lstwhere.append("st_contains((SELECT st_buffer(geometry, %s) FROM {schema}.{table} WHERE fid = %s), geometry)")
        params.extend([buffer_value, fid])
        return lstwhere, params

    def getparams(self, key):
        request = self.getrequest()
        return request.GET.get(key, "").strip()

    def splitparams(self, key):
        sParams = self.getparams(key)
        return [p.strip() for p in sParams.split(",") if p.strip()]

    def formatparams(self, key):
        param = self.getparams(key)
        return param.strip().lower()

    def getfiltersuccess(self):
        """Retourne la condition de filtre de succès (structure SQL fixe)"""
        service = self.getparams("service")
        filterresult = self.getfiltersuccessdata() if service == "internet" else self.getfiltersuccessvoix()
        return filterresult or "FALSE"

    def getfiltersuccessdata(self):
        """Retourne la condition de filtre pour les données (structure SQL fixe)"""
        data = self.formatparams("internet")

        dctfilter = {
            "web": "temps_en_secondes < 5",
            "stream": "video_en_qualite_parfaite = TRUE",
            "download": "debit_en_mbits < 3",
            "upload": "fichier_charge_en_moins_de_30s = TRUE",
        }

        return dctfilter.get(data, False)

    def getfiltersuccessvoix(self):
        """Retourne la condition de filtre pour la voix (structure SQL fixe)"""
        voix = self.formatparams("appel")

        dctfilter = {
            "sms": "sms_10s = TRUE",
            "voix": "mosminglob > 2.1 AND appel_2min = TRUE",
        }

        return dctfilter.get(voix, False)

    def buildsqlpourcentagesuccess(self, fid=None):
        """Construit la requête SQL de manière sécurisée"""
        lstwhere, params = self.buildwhere(fid)

        filter_condition = self.getfiltersuccess()

        # Validation que filter_condition est une condition SQL fixe (pas d'input utilisateur)
        if not filter_condition or filter_condition == "FALSE":
            filter_clause = sql.SQL("FALSE")
        else:
            filter_clause = sql.SQL(filter_condition)

        query = sql.SQL("""
            SELECT 
                CASE 
                    WHEN count(*) > 0 THEN ROUND((CAST((count(*) FILTER (WHERE {filter_clause}) * 100) AS NUMERIC) / count(*)), 2)
                    ELSE 0 
                END AS prct
            FROM {schema}.{table}
            WHERE {where_clause}
        """).format(
            schema=sql.Identifier(settings.DATABASE_SCHEMA),
            table=sql.Identifier(self.gettablename()),
            filter_clause=filter_clause,
            where_clause=sql.SQL(" AND ").join([sql.SQL(w) for w in lstwhere]),
        )

        return query, params

    def buildwhere(self, fid=None):
        """Construit la clause WHERE avec paramètres"""
        lstwhere = []
        params = []

        lstwhere, params = self.addwhereoperators(lstwhere, params)
        lstwhere, params = self.addwherezones(lstwhere, params)
        lstwhere, params = self.addwheresituation(lstwhere, params)
        lstwhere, params = self.addwhereprotocole(lstwhere, params)

        if fid:
            lstwhere, params = self.addwherebuffer(lstwhere, params, fid)

        return lstwhere, params
