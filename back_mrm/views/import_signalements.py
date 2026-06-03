from pathlib import Path

from django.conf import settings
from django.shortcuts import redirect, render
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from back_mrm.utils.data import Data
from back_mrm.utils.db import Db
from back_mrm.utils.folderfilter import FolderFilter


class ImportSignalementsView(APIView):
    permission_classes = (IsAuthenticated,)
    FOLDER = Path(settings.IMPORT_FILE) / "signalements"

    def get(self, request):

        if not request.user.is_authenticated:
            return redirect("login")

        context = self.getcontext()

        return render(request, "signalements.html", context=context)

    def getcontext(self):
        odata = Data()
        lst_files = odata.getlistfiles(self.FOLDER)
        table_name = odata.gettablename("signalements")

        odb = Db()
        lst_files_db = odb.getlistfiledb(table_name)

        data = self.getdata(lst_files, lst_files_db)

        return {
            "data": data,
            "data_db": lst_files_db,
            "folder": self.FOLDER,
            "table_name": odata.gettablename("signalements"),
        }

    def getdata(self, lst_files, lst_files_db):
        ofolderfilter = FolderFilter()
        ofolderfilter.setdatafolderbrut(lst_files)
        ofolderfilter.setdatatable(lst_files_db)

        return ofolderfilter.getlistfiles()
