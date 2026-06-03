import os
from pathlib import Path

from django.http import JsonResponse
from django.shortcuts import redirect
from django.views import View

from back_mrm.utils.data import Data


class RemoveFileView(View):
    def delete(self, request, data_type, file_name):

        if not request.user.is_authenticated:
            return redirect("login")

        odata = Data()
        folder = odata.getfolderdata(data_type)

        if os.path.isfile(Path(folder) / file_name):
            os.remove(Path(folder) / file_name)
            data = {
                "message": "File deleted",
                "success": True,
            }
            return JsonResponse(data, safe=False)

        data = {
            "message": "File not deleted",
            "success": False,
        }
        return JsonResponse(data, safe=False)
