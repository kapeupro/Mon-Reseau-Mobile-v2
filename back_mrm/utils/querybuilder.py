from typing import Any

from psycopg import sql


class QueryBuilder:
    def __init__(self):
        self._where_clauses: list[sql.Composed] = []
        self._params: list[Any] = []

    def add_condition(self, clause: sql.Composed, params: list[Any]):
        """Ajoute une condition et ses paramètres à la requête"""
        if clause:  # On ignore les clauses vides
            self._where_clauses.append(clause)
            self._params.extend(params)

    def get_where_clause(self) -> tuple[sql.Composed, list[Any]]:
        """Retourne la clause WHERE complète et tous les paramètres"""
        if not self._where_clauses:
            return sql.SQL(""), []

        # Équivalent sécurisé de " AND ".join(lst_where)
        combined_clause = sql.SQL(" AND ").join(self._where_clauses)
        return combined_clause, self._params
