from back_mrm.scripts.insert_csv import InsertCsv


class EmetteurLink(InsertCsv):
    def __init__(self, file, table, data_type):
        InsertCsv.__init__(self, file, data_type)
        self.settable(table)

    def run(self):
        if self.checkcsvfile():
            response = self.insertfiledata()
        else:
            response = {
                "message": "Fichier non csv",
                "success": False,
            }

        return response
