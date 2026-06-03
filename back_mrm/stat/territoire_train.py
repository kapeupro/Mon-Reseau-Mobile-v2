from django.conf import settings
from django.http import JsonResponse
from psycopg import sql
from rest_framework.views import APIView

from back_mrm.utils.db import Db
from back_mrm.utils.querybuilder import QueryBuilder


class StatTerritoireTrain(APIView):
    database_schema = settings.DATABASE_SCHEMA
    lst_required_fields = ["operators", "level", "type", "nom", "entite", "protocole", "datasource"]
    lst_train_axis = ["tgv", "tgv_internationaux", "intercites_ter", "transiliens_rer", "metros"]
    lst_route_axis = ["routes"]
    operators = []

    def get(self, request):
        lst_data = False

        if self.is_correct_params(request):
            self.init_params(request)
            lst_data = self.get_stat()

        response = {"success": bool(lst_data), "stats": lst_data}

        return JsonResponse(response, safe=False)

    def is_correct_params(self, request):
        for field in self.lst_required_fields:
            if field not in request.GET:
                return False
        return True

    def build_operators_params(self, operators_param):
        try:
            operators = [int(item.strip()) for item in operators_param.split(",") if item.strip()]
            return operators
        except ValueError:
            return []

    def init_params(self, request):
        self.odb = Db()
        self.operators = self.build_operators_params(request.GET["operators"])
        self.level = request.GET["level"]
        self.type = request.GET["type"]
        self.nom = request.GET["nom"]
        self.entite = request.GET["entite"]
        self.protocole = request.GET["protocole"].lower()
        self.datasource = request.GET["datasource"]

    def get_stat(self):
        dct_operators = self.get_infos_operators(self.operators)
        if not dct_operators:
            return False

        query, params = self.build_sql_stat()

        results = self.odb.selectasarray(query, params)

        return self.format_data_stat(results, dct_operators) if results else self.build_no_data_stat(dct_operators)

    def format_data_stat(self, lst_data, dct_operators):
        lst_stats = []

        for dt in lst_data:
            dct_operator = dct_operators.get(dt["mcc_mnc"])
            if not dct_operator:
                continue

            total = dt["total_success"] + dt["total_partial_success"] + dt["total_error"]

            lst_stats.append(
                {
                    "nom_affichage": dct_operator.get("nom_affichage", ""),
                    "valeur_stats": [
                        self.get_pourcentage(dt["total_success"], total),
                        self.get_pourcentage(dt["total_partial_success"], total),
                        self.get_pourcentage(dt["total_error"], total),
                    ],
                    "couleur_niveaux": [
                        dct_operator.get("couleur_niveau_3", "#232351"),
                        dct_operator.get("couleur_niveau_2", "#CDCCFD"),
                        dct_operator.get("couleur_niveau_1", "#F1EDE6"),
                    ],
                }
            )

        return lst_stats

    def build_order_clause(self):
        if len(self.operators) == 0:
            return sql.SQL(""), []

        placeholders = sql.SQL(", ").join(sql.Placeholder() for _ in self.operators)
        order_clause = sql.SQL("""
            array_position(ARRAY[{placeholders}], mcc_mnc)
        """).format(placeholders=placeholders)

        return order_clause, self.operators

    def build_sql_stat(self):

        where_clause, params_where = self.build_where(self.get_params_stat())
        orderby_clause, params_orderby = self.build_order_clause()

        query = sql.SQL("""
            SELECT
                mcc_mnc,
                {fields}
            FROM {schema}.qos 
            WHERE {where_clause}
            GROUP BY mcc_mnc
            ORDER BY {orderby_clause}
        """).format(
            fields=self.get_fields(),
            schema=sql.Identifier(self.database_schema),
            where_clause=where_clause,
            orderby_clause=orderby_clause,
        )

        params = params_where + params_orderby
        return query, params

    def get_params_stat(self):
        dct_stat = {
            "axis": self.lst_route_axis if self.entite == "route" and self.type == "all" else self.type,
            "operators": self.operators,
            "datasource": self.datasource,
        }
        if int(self.level) == 3:
            dct_stat["axis_name"] = self.nom

        return dct_stat

    def get_fields(self):
        fields = sql.SQL("""
            SUM(CASE WHEN loaded_in_less_5_secondes then 1 ELSE 0 END) as total_success,
            SUM(CASE WHEN loaded_in_less_5_secondes = false AND loaded_in_less_10_secondes then 1 ELSE 0 END) as total_partial_success,
            SUM(CASE WHEN loaded_in_less_5_secondes = false AND loaded_in_less_10_secondes = false then 1 ELSE 0 END) as total_error,
            count(*) as total
        """)

        if self.protocole != "web":
            fields = sql.SQL("""
                sum(case when min_mos_couple >= 2.1 and real_communiation_time = 120 then 1 else 0 end) as total_success,
                sum(case when min_mos_couple < 2.1 and real_communiation_time = 120 then 1 else 0 end) as total_partial_success,
                sum(case when coalesce(real_communiation_time, 1) <> 120	then 1 else 0 end) as total_error,
                count(*) as total
            """)

        return fields

    def build_where_axis(self, dct_params):
        # delete data tgv_internationaux ticket 23714
        axis = dct_params.get("axis")

        if axis and self.type != "all":
            if isinstance(axis, str):
                axis = self.as_array(axis)
                if "tgv_internationaux" in axis:
                    axis.pop(axis.index("tgv_internationaux"))

            if axis:
                # Création dynamique des placeholders %s
                placeholders = sql.SQL(", ").join(sql.Placeholder() for _ in axis)
                condition = sql.SQL("axis IN ({})").format(placeholders)
                return condition, axis
            return sql.SQL(""), []

        if self.entite == "route":
            return sql.SQL("axis = %s"), ["routes"]
        excluded_axis = ["tgv_internationaux", "routes"]
        placeholders = sql.SQL(", ").join(sql.Placeholder() for _ in excluded_axis)
        condition = sql.SQL("axis NOT IN ({})").format(placeholders)
        return condition, excluded_axis

    def build_where(self, dct_params):
        builder = QueryBuilder()

        filter_axis, param_axis = self.build_where_axis(dct_params)
        builder.add_condition(filter_axis, param_axis)

        axis_name = dct_params.get("axis_name")
        if axis_name:
            filter_axis_name = sql.SQL("axis_name_search = LOWER(UNACCENT(%s))")
            param_axis_name = axis_name
            builder.add_condition(filter_axis_name, (param_axis_name,))

        operators = dct_params.get("operators")
        if operators:
            placeholders = sql.SQL(", ").join(sql.Placeholder() for _ in operators)
            clause = sql.SQL("mcc_mnc IN ({})").format(placeholders)
            builder.add_condition(clause, tuple(operators))

        datasource = dct_params.get("datasource")
        if datasource:
            clause = sql.SQL("id_data_source_desc = %s")
            builder.add_condition(clause, (datasource,))

        zone = dct_params.get("zone")
        if zone:
            zone_list = zone.split(",") if zone else []
            query = sql.SQL("LOWER(zone) IN ({})").format(sql.SQL(", ").join([sql.Placeholder()] * len(zone_list)))
            builder.add_condition(query, tuple(zone_list))

        builder.add_condition(sql.SQL("is_metropole"), ())
        builder.add_condition(sql.SQL("is_transport"), ())
        builder.add_condition(sql.SQL("LOWER(protocole) = %s"), (self.protocole,))

        return builder.get_where_clause()

    def as_array(self, s_value):
        return str(s_value).split(",")

    def get_pourcentage(self, value, total):
        if not (total and value):
            return 0

        prct = value * 100 / total
        return round(prct, 2)

    def get_infos_operators(self, operators):
        query, params = self.build_sql_infos_operators(operators)
        results = self.odb.selectasarray(query, params)
        return self.format_infos_operators(results) if results else False

    def build_sql_infos_operators(self, operators):
        query = sql.SQL("""
            SELECT
                identifiant,
                nom_affichage,
                couleur_niveau_3,
                couleur_niveau_2,
                '#F1EDE6' as couleur_niveau_1
            FROM {schema}.operateurs
            WHERE identifiant IN ({placeholders})
        """).format(
            schema=sql.Identifier(self.database_schema),
            placeholders=sql.SQL(", ").join([sql.Placeholder()] * len(operators)),
        )

        return query, operators

    def format_infos_operators(self, lst_data):
        dct_data = {}

        for dt in lst_data:
            dct_data[dt["identifiant"]] = dt

        return dct_data

    def build_no_data_stat(self, dct_operators):
        lst_data = []

        for key, dt in dct_operators.items():
            lst_data.append(
                {
                    "nom_affichage": dt["nom_affichage"],
                    "valeur_stats": [0],
                    "couleur_niveaux": [dt["couleur_niveau_3"], dt["couleur_niveau_2"], dt["couleur_niveau_1"]],
                }
            )

        return lst_data
