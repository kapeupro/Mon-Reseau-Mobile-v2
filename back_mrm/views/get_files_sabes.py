import csv
import os
import zipfile
from pathlib import Path

from django.http import JsonResponse
from django.shortcuts import redirect
from rest_framework.views import APIView

from back_mrm.utils.data import Data
from back_mrm.utils.file_analysis import FileAnalysis

VALID_FILENAME = ["SUP_ANTENNE", "SUP_BANDE", "SUP_EMETTEUR", "SUP_STATION", "SUP_SUPPORT"]


class GetFilesSabes(APIView):
    def get(self, request):
        if not request.user.is_authenticated:
            return redirect("login")

        self.filename = self.get_element(request, "filename")
        self.data_type = self.get_element(request, "data_type")
        if not self.filename or not self.data_type:
            data = {"success": False, "msg": "Paramètres incorrects"}
            return JsonResponse(data, safe=False)

        csv_file_list = self.get_csv_file_list()
        if not csv_file_list:
            data = {"success": False, "msg": f"Erreur récupération fichiers ({self.error})"}
            return JsonResponse(data, safe=False)

        data = {"success": True, "msg": "Fichiers récupérés", "csv_file_list": csv_file_list}
        return JsonResponse(data, safe=False)

    def get_element(self, request, key):
        if key not in request.GET:
            return False

        return request.GET[key]

    def set_folder(self):
        odata = Data()
        self.folder = odata.getfolderdata(self.data_type)

    def set_path_file(self):
        self.path_file = Path(self.folder) / self.filename

    def get_csv_file_list(self):
        self.error = ""
        self.set_folder()
        self.set_path_file()

        if not os.path.isfile(self.path_file):
            self.error = f"is file: {self.path_file}"
            return False

        if not self.extract_zip_file():
            self.error = f"extract zip: {self.path_file}"
            return False

        lst_file_txt = self.get_lst_file_txt()
        if not lst_file_txt:
            return False

        converted_files = self.convert_txt_to_csv(lst_file_txt)
        if not converted_files:
            self.error = "convert file to csv: {}".format(", ".join(lst_file_txt))
            return False

        self.deletefile(lst_file_txt)

        return converted_files

    def extract_zip(self):
        with zipfile.ZipFile(self.path_file, "r") as zip_ref:
            zip_ref.extractall(path=self.folder)

    def extract_zip_file(self):
        if zipfile.is_zipfile(self.path_file):
            self.extract_zip()
            return True
        return False

    def get_lst_file_txt(self):
        lst_file_txt, lst_filename = self.get_name_and_file_txt()
        if self.checkvalidfilename(lst_filename):
            lst_file_txt_converted = self.reencode_files(lst_file_txt)
            if not lst_file_txt_converted:
                return False

            return lst_file_txt
        self.error = "invalid  filename: {}".format(",".join(lst_filename))
        self.deletefile(lst_file_txt)
        return False

    def get_name_and_file_txt(self):
        txt_file = []
        file_name = []
        for file in os.listdir(self.folder):
            filename = file.split(".")[0]
            extension = file.split(".")[-1]
            if extension == "txt":
                txt_file.append(file)
                file_name.append(filename.upper())

        return txt_file, file_name

    def checkvalidfilename(self, lst_filename):
        lst_valid_filename = [name.lower() for name in VALID_FILENAME]

        for filename in lst_filename:
            if filename.lower() not in lst_valid_filename:
                return False

        return True

    def reencode_files(self, lst_file_txt):
        for file in lst_file_txt:
            filepath = Path(self.folder) / file
            is_file_encoded = self.run_file_analysis(filepath)

            if not is_file_encoded:
                self.error = f"file encoded: {filepath}"
                return False

        return True

    def run_file_analysis(self, filepath):
        o_file_analysis = FileAnalysis(filepath)
        res = o_file_analysis.writeConversion()

        return res

    def convert_txt_to_csv(self, lst_file_txt):
        csv_filenames = []

        for file in lst_file_txt:
            filename = file.split(".")[0]
            file_txt = Path(self.folder) / file
            file_csv = Path(self.folder) / (filename + ".csv")
            file_csv_tmp = Path(self.folder) / (filename + ".csv.tmp")

            try:
                with (
                    open(file_txt, encoding="utf8") as input_file,
                    open(file_csv_tmp, "w", newline="", encoding="utf8") as output_file,
                ):
                    writer = csv.writer(output_file)
                    first_line = True
                    for ligne in input_file:
                        ligne = ligne.strip().replace(",", ".")
                        lines = ligne.split(";")
                        if first_line:
                            lines = [line.lower() for line in lines]
                            first_line = False
                        writer.writerow(lines)

                    output_file.flush()
                    os.fsync(output_file.fileno())

                os.replace(file_csv_tmp, file_csv)
            except OSError:
                if file_csv_tmp.is_file():
                    try:
                        os.remove(file_csv_tmp)
                    except OSError:
                        pass
                raise

            csv_filenames.append(filename + ".csv")

        return csv_filenames

    def deletefile(self, lst_file_txt):
        for file in lst_file_txt:
            src = Path(self.folder) / file
            if os.path.isfile(src):
                os.remove(src)
