from django.conf import settings
from django.contrib.gis.db import models


class ParametersLink(models.Model):
    id = models.AutoField(primary_key=True)
    key_word = models.CharField(db_column="key_word", max_length=50, blank=False, null=False)
    label_value = models.CharField(db_column="label_value", max_length=100, blank=False, null=False)
    link_value = models.TextField(db_column="link_value", blank=False, null=False)

    class Meta:
        db_table = settings.DATABASE_SCHEMA + '"."parameters'
        verbose_name = "parameters"
        verbose_name_plural = "Paramètres : Lien externe"
        ordering = ["id"]

    def __str__(self):
        return f"{self.id}"
