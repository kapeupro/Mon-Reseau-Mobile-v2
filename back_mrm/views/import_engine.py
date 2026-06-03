from pathlib import Path

from django.conf import settings
from django.http import JsonResponse
from rest_framework.views import APIView

from back_mrm.utils.pusher.csv import PusherCSV


class ImportEngineView(APIView):
    # permission_classes = (IsAuthenticated,)
    def get(self, request):
        filecsv = Path(settings.IMPORT_FILE) / "qualite" / "2022_QoS_Metropole_data_habitations.csv"
        table = "qos_metropole_data_habitations_test"
        opushercsv = PusherCSV(filecsv, table)
        res = opushercsv.run()
        if res:
            data = {"success": True}
        else:
            data = {"success": False, "error": opushercsv.getError()}

        return JsonResponse(data, safe=False)
