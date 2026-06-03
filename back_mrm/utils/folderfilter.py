import pathlib


class FolderFilter:
    def __init__(self):
        self.setisqos(False)

    def getdatafolderbrut(self):
        return self.datafolder

    def setdatafolderbrut(self, datafolder):
        self.datafolder = datafolder

    def getdatatable(self):
        return self.dataTable

    def setdatatable(self, dataTable):
        self.dataTable = dataTable

    def getisqos(self):
        return self.bisqos

    def setisqos(self, bisqos):
        self.bisqos = bisqos

    def isqos(self):
        return self.getisqos()

    def getlistfiles(self):
        if not self.getdatafolderbrut():
            return self.getdatafolderbrut()

        if not self.getdatatable():
            return self.getdatafolderbrut()

        afileinlected = self.getlistefileinjected()
        aresult = []
        for afolder in self.getdatafolderbrut():
            if self.isqos():
                if self.removeextension(afolder["file"].lower()) not in afileinlected:
                    aresult.append(afolder)
            elif self.removeextension(afolder.lower()) not in afileinlected:
                aresult.append(afolder)

        return aresult

    def getlistefileinjected(self):
        aresult = []
        for atabledata in self.getdatatable():
            if atabledata["filename"]:
                aresult.append(self.removeextension(atabledata["filename"].lower()))
        return aresult

    def removeextension(self, filename):
        extension = pathlib.Path(filename).suffix
        if extension != "":
            return filename.replace(extension, "")
        return filename
