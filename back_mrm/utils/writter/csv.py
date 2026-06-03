import csv
import os
import uuid
from pathlib import Path

from django.conf import settings


class writerCSV:
    def __init__(self, data):
        self.data = data
        self.setfolderpath(settings.IMPORT_FILE)
        self.setrejected(0)

    def getdata(self):
        return self.data

    def setrejected(self, rejected):
        self.rejected = rejected

    def getrejected(self):
        return self.rejected

    def setfilepath(self, csvfile):
        self.csvfile = csvfile

    def getfilepath(self):
        return self.csvfile

    def setfolderpath(self, folder):
        self.folder = folder

    def getfolderpath(self):
        return self.folder

    def generaterandomnamefile(self):
        return str(uuid.uuid4()) + ".csv"

    def getfilecsv(self):
        return Path(self.getfolderpath()) / self.generaterandomnamefile()

    def increaserejected(self):
        numberrejected = self.getrejected()
        self.setrejected(numberrejected + 1)

    def isvalidanfrfield(self, dataline):
        if "station_anfr" not in dataline.keys():
            return False
        return True

    def write(self):
        csvfilename = self.getfilecsv()
        fieldnames = self.getfields()
        with open(csvfilename, "w", newline="", encoding="utf-8") as csvfile:
            writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

            writer.writeheader()
            for adata in self.getdata():
                dataline = self.formatdata(adata)
                if not self.isvalidanfrfield(dataline):
                    self.increaserejected()
                else:
                    writer.writerow(dataline)

        if os.path.exists(csvfilename):
            self.setfilepath(csvfilename)
            return True

        return False

    def formatdata(self, data):
        result = {}
        properties = data["properties"]

        for key in properties.keys():
            result[key] = properties[key]

        geometry = data["geometry"]

        if len(geometry.keys()) > 0:
            result["geomlong"] = geometry["coordinates"][0]
            result["geomlat"] = geometry["coordinates"][1]

        return result

    def getfields(self):
        if len(self.getdata()) == 0:
            return False
        return list(self.formatdata(self.getdata()[0]).keys())
