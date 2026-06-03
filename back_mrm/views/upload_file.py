import re
from pathlib import Path

from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views import View

from back_mrm.utils.data import Data

ALLOWED_EXTENSIONS = [".json", ".csv", ".gpkg", ".zip", ".txt"]


class UploadFileView(View):
    def get(self, request, data_type):
        if not request.user.is_authenticated:
            html_response = f"<!--REDIRECT:{reverse('login')}-->"
            return HttpResponse(html_response)
        return render(request, "upload.html", {"data_type": data_type})

    def has_special_characters(self, filename) -> bool:
        pattern = r"^[a-zA-Z0-9_\-\.]+$"

        return not bool(re.match(pattern, filename))

    def is_valid_gpkg(self, file) -> bool:

        SQLITE_MAGIC = b"SQLite format 3\x00"

        # Vérifier l'extension
        if not file.name.lower().endswith(".gpkg"):
            return False

        # Vérifier la signature magique
        chunk = file.read(16)
        file.seek(0)
        return chunk == SQLITE_MAGIC

    def is_binary_file(self, file, sample_size=8192):
        chunk = file.read(sample_size)
        file.seek(0)  # remet le curseur au début pour une lecture ultérieure

        if not chunk:
            return False

        if b"\x00" in chunk:
            return True

        try:
            chunk.decode("utf-8")
            return False
        except UnicodeDecodeError:
            return True

    def post(self, request, data_type):
        berror = False
        bupload = False
        error_message = "Extensions de fichiers "
        upload_message = ""
        file_uploads = []

        if request.FILES:
            files = request.FILES.getlist("files")

            for file in files:
                if self.has_special_characters(file.name):
                    message = f"Le nom de fichier {file.name} contient des caractères spéciaux non autorisés."
                    return JsonResponse({"success": False, "message": message})

                if data_type == "couvertures":
                    if self.is_binary_file(file) and not self.is_valid_gpkg(file):
                        message = f"Le fichier {file.name} n'est pas autorisé"
                        return JsonResponse({"success": False, "message": message})

                file_extension = self.getfileextension(file.name)
                if file_extension not in ALLOWED_EXTENSIONS:
                    berror = True
                    error_message = error_message + file.name + ", "
                    continue

                file_uploads.append(file)

            if berror:
                error_message = error_message + " non prises en charge"
                return JsonResponse({"success": False, "message": error_message})

            if file_uploads:
                bupload = True
                odata = Data()
                folder = odata.getfolderdata(data_type)
                for file in file_uploads:
                    self.savefile(file, folder)
                    upload_message = upload_message + file.name + ", "

            if bupload:
                messages = upload_message + " importé avec succès"
                return JsonResponse({"success": True, "message": messages})
            return JsonResponse({"success": False, "message": "Aucun fichier importé"})

        return JsonResponse({"success": False, "message": "Veuillez choisir un fichier au moins svp"})

    def getfileextension(self, filename):
        return Path(filename).suffix.lower()

    def savefile(self, uploaded_file, folder):
        if not Path.exists(folder):
            Path(folder).mkdir(parents=True, exist_ok=True)

        file_path = Path(folder) / uploaded_file.name

        with Path.open(file_path, "wb+") as destination:
            destination.writelines(uploaded_file.chunks())
