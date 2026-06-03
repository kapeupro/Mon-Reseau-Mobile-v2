import os
from pathlib import Path

from django.http import JsonResponse
from django.shortcuts import redirect
from rest_framework.views import APIView

from back_mrm.utils.data import Data


class IsFileGenerated(APIView):
    """Vérifie que les fichiers listés existent sur le disque (dossier data_type)."""

    def get(self, request):
        if not request.user.is_authenticated:
            return redirect("login")

        data_type = request.GET.get("data_type", "stations")
        files_param = request.GET.get("files", "")
        if not files_param:
            return JsonResponse({"success": False, "msg": "Paramètre files manquant"})

        folder = Data().getfolderdata(data_type)
        if not folder or not os.path.isdir(folder):
            return JsonResponse({"success": False, "msg": "Dossier invalide"})

        names = [f.strip() for f in files_param.split(",") if f.strip()]
        for name in names:
            safe_name = os.path.basename(name)
            path = Path(folder) / safe_name
            if not path.is_file():
                return JsonResponse({"success": False, "msg": f"Fichier manquant: {safe_name}"})

        return JsonResponse({"success": True})
