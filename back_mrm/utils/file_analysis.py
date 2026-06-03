import codecs
import os
import shutil
from pathlib import Path

import chardet
from django.conf import settings


class FileAnalysis:
    def __init__(self, pathfile):
        self.pathfile = pathfile
        self.encodage_fail = "ISO-8859-1"
        self.init_output_dir()

    def init_output_dir(self):
        output_dir = Path(settings.IMPORT_FILE) / "tmp_convertion"
        self.set_output_dir(output_dir)

    def set_output_dir(self, output_dir):
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        self.output_dir = output_dir

    def get_output_dir(self):
        return self.output_dir

    def check_encodage(self):
        if not os.path.exists(self.pathfile):
            return False

        # Ouvrez votre fichier en mode binaire.
        with open(self.pathfile, "rb") as fichier:
            # Lisez le contenu du fichier.
            contenu = fichier.read()
            # Utilisez chardet pour détecter l'encodage du fichier.
            resultat = chardet.detect(contenu)

        encodage = resultat["encoding"]
        return encodage

    def remove_source(self):
        if os.path.exists(self.pathfile):
            os.remove(self.pathfile)

    def restore_converted(self):
        if not os.path.exists(self.file_converted):
            return False

        shutil.copy2(self.file_converted, self.pathfile)
        os.remove(self.file_converted)

    def writeConversion(self):
        if not self.check_encodage() == self.encodage_fail:
            return True

        try:
            filename = os.path.basename(self.pathfile)
            file_output = Path(self.get_output_dir()) / filename
            BLOCKSIZE = 1048576
            with codecs.open(self.pathfile, "r", self.encodage_fail) as source_file:
                with codecs.open(file_output, "w", "UTF-8") as target_file:
                    while True:
                        contents = source_file.read(BLOCKSIZE)
                        if not contents:
                            break
                        target_file.write(contents)
        except:
            return False

        self.file_converted = file_output
        self.remove_source()
        self.restore_converted()
        return True
