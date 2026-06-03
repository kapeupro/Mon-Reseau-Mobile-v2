from django.conf import settings
from psycopg import sql


class SignalementDetail:
    # Whitelist des entités/territoires autorisés pour éviter l'injection SQL
    ALLOWED_ENTITES = {
        "971": "perimetre_971",
        "972": "perimetre_972",
        "973": "perimetre_973",
        "974": "perimetre_974",
        "976": "perimetre_976",
        "977": "perimetre_977",
        "978": "perimetre_978",
    }

    def __init__(self, odb):
        self.odb = odb
        self.database_schema = settings.DATABASE_SCHEMA
        self.entite = None
        self.id = None
        self.total = None

    def get(self):
        try:
            result_operateur = self.get_operateurs()
            if not result_operateur:
                return False
            operators = result_operateur[0]
            labels_operators = result_operateur[1]

            months = self.get_last_sixmonts()

            if not operators:
                return False

            data_hexa = self.get_data_hexa(operators)

            if not operators or not months or not data_hexa:
                return False

            data = self.format_result(operators, labels_operators, months, data_hexa)
            return data
        except Exception:
            return False

    def get_total_by_month(self, operator, months, data_hexa):
        if str(operator) not in data_hexa:
            return [0, 0, 0, 0, 0, 0]

        data_op = data_hexa[operator]
        result = []
        for month in months:
            if str(month) not in data_op:
                result.append(0)
            else:
                result.append(data_op[month])

        return result

    def format_result(self, operators, labels_operators, months, data_hexa):
        result = []
        for i in range(len(operators)):
            numbers = self.get_total_by_month(operators[i], months, data_hexa)

            data = {
                "operator": operators[i],
                "name": labels_operators[i],
                "total": sum(numbers),
                "number": numbers,
                "months": months,
            }

            result.append(data)

        numbers = self.get_all(months, result)

        data_all = {
            "operator": "all",
            "name": "all",
            "total": sum(numbers),
            "number": numbers,
            "months": months,
        }

        result.insert(0, data_all)
        return result

    def get_all(self, months, dataresult):
        result = []
        for i in range(len(months)):
            total = 0
            for data in dataresult:
                total += data["number"][i]

            result.append(total)

        return result

    def get_data_hexa(self, operators):
        # 1. Validation stricte des opérateurs (uniquement des entiers)
        validated_operators = []
        for op in operators:
            try:
                validated_operators.append(int(op))
            except (ValueError, TypeError):
                continue

        if not validated_operators:
            return False

        # 2. Création des placeholders pour la clause IN (%s, %s, ...)
        placeholders = ",".join(["%s"] * len(validated_operators))
        params = [self.getid()] + validated_operators

        # 3. Construction sécurisée de la requête avec psycopg.sql
        query = sql.SQL("""
            SELECT
                operateur,
                lower(TO_CHAR(date, 'Mon')) AS mois_abrege,
                count(1) as total
            FROM {schema}.signalement s
            WHERE id_hexa = %s
            AND operateur IN ({placeholders})
            GROUP BY operateur, mois_abrege
            ORDER BY operateur
        """).format(schema=sql.Identifier(self.database_schema), placeholders=sql.SQL(placeholders))

        res = self.odb.selectasarray(query, params)
        if not res or len(res) == 0:
            return False

        result = {}
        operateur = ""
        total = 0

        for i in range(len(res)):
            if operateur != str(res[i]["operateur"]):
                operateur = str(res[i]["operateur"])
                result[operateur] = {}

            mois = res[i]["mois_abrege"]
            result[operateur][mois] = res[i]["total"]
            total += res[i]["total"]

        self.set_total(total)

        return result

    def get_last_sixmonts(self):
        params = [self.getid()]

        query = sql.SQL("""
            SELECT
                lower(TO_CHAR(max(date) - INTERVAL '5 months', 'Mon')) as month1,
                lower(TO_CHAR(max(date) - INTERVAL '4 months', 'Mon')) as month2,
                lower(TO_CHAR(max(date) - INTERVAL '3 months', 'Mon')) as month3,
                lower(TO_CHAR(max(date) - INTERVAL '2 months', 'Mon')) as month4,
                lower(TO_CHAR(max(date) - INTERVAL '1 months', 'Mon')) as month5,
                lower(TO_CHAR(max(date), 'Mon')) as month6
            FROM {schema}.signalement
            WHERE id_hexa = %s
        """).format(schema=sql.Identifier(self.database_schema))

        res = self.odb.selectasarray(query, params)
        if not res or len(res) == 0:
            return False

        result = []
        for i in range(6):
            index = "month%s" % str(i + 1)
            result.append(res[0][index])

        return result

    def get_operateurs(self):
        territoire = self.get_territoire()
        params = []

        # Le territoire vient d'une whitelist, donc safe pour sql.SQL()
        query = sql.SQL("""
            SELECT identifiant, nom_affichage
            FROM {schema}.operateurs
            WHERE {territoire}
            ORDER BY nom_affichage
        """).format(schema=sql.Identifier(self.database_schema), territoire=sql.SQL(territoire))

        res = self.odb.selectasarray(query, params)
        if not res or len(res) == 0:
            return False

        ident = []
        labels = []
        for i in range(len(res)):
            ident.append(str(res[i]["identifiant"]))
            labels.append(str(res[i]["nom_affichage"]))

        return [ident, labels]

    def get_territoire(self):
        entite = self.getentite()
        # Utilisation de la whitelist pour éviter l'injection SQL
        return self.ALLOWED_ENTITES.get(entite, "perimetre_metro")

    def setentite(self, entite):
        self.entite = entite

    def getentite(self):
        return self.entite

    def setid(self, id):
        # Validation que l'ID est un entier pour éviter les injections
        try:
            self.id = int(id)
        except (ValueError, TypeError):
            self.id = None

    def getid(self):
        return self.id

    def set_total(self, total):
        self.total = total

    def gettotal(self):
        return self.total
