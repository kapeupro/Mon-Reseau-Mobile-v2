from django.conf import settings
from django.contrib.gis.db import models


class ImportLog(models.Model):
    id = models.AutoField(primary_key=True)
    date = models.DateTimeField(blank=True, null=True)
    type = models.CharField(max_length=100, blank=True, null=True)
    success = models.BooleanField(default=False)
    observation = models.CharField(max_length=200, blank=True, null=True)

    class Meta:
        db_table = settings.DATABASE_SCHEMA + '"."import_log'
        verbose_name = "import_log"
        verbose_name_plural = "LOG : Data imports"
        ordering = ["id"]

    def __str__(self):
        return f"{self.id}"
