from django.contrib.gis.db import models


class Departement(models.Model):
    gid = models.AutoField(primary_key=True)
    id = models.CharField(max_length=24, blank=True, null=True)
    nom_m = models.CharField(max_length=30, blank=True, null=True)
    nom = models.CharField(max_length=30, blank=True, null=True)
    insee_dep = models.CharField(max_length=3, blank=True, null=True)
    insee_reg = models.CharField(max_length=2, blank=True, null=True)
    geom = models.MultiPolygonField(srid=3857, blank=True, null=True)

    class Meta:
        managed = False
        db_table = "departement"
