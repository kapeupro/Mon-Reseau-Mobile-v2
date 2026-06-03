from django.conf import settings
from django.contrib.gis.db import models


class DataDateDescription(models.Model):
    id = models.AutoField(primary_key=True)
    page = models.CharField(db_column="page", max_length=50, blank=False, null=False)

    date_build = models.DateField(db_column="date_build_start", blank=False, null=False)

    date_build_end = models.DateField(db_column="date_build_end", blank=False, null=False)

    date_maj = models.DateField(db_column="date_maj", blank=True, null=True)

    territoire = models.CharField(db_column="territoire", max_length=50, blank=True, null=True)

    class Meta:
        db_table = settings.DATABASE_SCHEMA + '"."data_date_description'
        verbose_name = "data_date_description"
        verbose_name_plural = "Donnée date description"
        ordering = ["id"]

    def __str__(self):
        return f"{self.id}"
