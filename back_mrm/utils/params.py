def getsrid():
    return 3857


def _parse_operateur_list(self, operateurs_raw):
    if not operateurs_raw:
        return []

    result = []
    for op in operateurs_raw.split(","):
        op = op.strip()
        if op.isdigit():
            result.append(op)
    return result
