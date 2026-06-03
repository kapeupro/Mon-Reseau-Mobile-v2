from django.conf import settings
from django.contrib.gis.db import models


class DataSourceList(models.Model):
    id = models.AutoField(primary_key=True)
    title = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = settings.DATABASE_SCHEMA + '"."qos_data_source_list'
        verbose_name = "qos_data_source_list"
        verbose_name_plural = "QOS : data source"
        ordering = ["id"]

    def __str__(self):
        return f"{self.id}"


class DataSourceDescription(models.Model):
    id = models.AutoField(primary_key=True)
    id_data_source = models.ForeignKey(DataSourceList, on_delete=models.CASCADE, db_column="id_data_source")
    title = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        db_table = settings.DATABASE_SCHEMA + '"."qos_data_source_desc'
        verbose_name = "qos_data_source_desc"
        verbose_name_plural = "QOS : data source description"
        ordering = ["id"]
