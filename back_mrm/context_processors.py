from django.conf import settings


def export_vars(request):
    data = {}
    data["APP_MODE"] = settings.APP_MODE
    data["PUBLIC_SCHEMA"] = settings.PUBLIC_SCHEMA
    data["PRIVATE_SCHEMA"] = settings.PRIVATE_SCHEMA
    return data
