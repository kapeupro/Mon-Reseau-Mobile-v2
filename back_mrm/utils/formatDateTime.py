import math
from datetime import datetime


def dctmonth():
    return {
        "1": "janvier",
        "2": "février",
        "3": "mars",
        "4": "avril",
        "5": "mai",
        "6": "juin",
        "7": "juillet",
        "8": "août",
        "9": "septembre",
        "10": "octobre",
        "11": "novembre",
        "12": "decembre",
    }


def formatdate(date):
    if date is None:
        return ""
    if "/" in date:
        d, m, y = date.split("/")
    elif "-" in date:
        y, m, d = date.split("-")
    else:
        return "Format non supporté"

    if m:
        cle = int(m)
        m = dctmonth()[str(cle)]

    return d + " " + m + " " + y


def format_time(time):
    hour_minute = time.split(":")[:2]
    formatted_time = ":".join(hour_minute)

    return formatted_time


def get_current_trimestre():
    today = datetime.today()
    montth = int(today.month)
    return int(math.ceil(montth / 3))


def get_current_year():
    today = datetime.today()
    return int(today.year)


def get_current_trimestre_long():
    trimestre = get_current_trimestre()
    if trimestre == 1:
        return "1er_trimestre"
    if trimestre == 2:
        return "2eme_trimestre"
    if trimestre == 3:
        return "3eme_trimestre"
    if trimestre == 4:
        return "4eme_trimestre"
    return "none_trimestre"


def get_current_trimestre_court():
    trimestre = get_current_trimestre()
    annee = get_current_year()
    return f"T{trimestre}{annee}"
