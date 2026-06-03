from django.contrib.gis.db import models


class Site(models.Model):
    fid = models.BigIntegerField(primary_key=True)
    code_op = models.BigIntegerField(blank=True, null=True)
    nom_op = models.TextField(blank=True, null=True)
    num_site = models.TextField(blank=True, null=True)
    id_station_anfr = models.TextField(blank=True, null=True)
    x = models.FloatField(blank=True, null=True)
    y = models.FloatField(blank=True, null=True)
    latitude = models.FloatField(blank=True, null=True)
    longitude = models.FloatField(blank=True, null=True)
    nom_reg = models.TextField(blank=True, null=True)
    nom_dep = models.TextField(blank=True, null=True)
    insee_dep = models.TextField(blank=True, null=True)
    nom_com = models.TextField(blank=True, null=True)
    insee_com = models.TextField(blank=True, null=True)
    site_2g = models.BooleanField(blank=True, null=True)
    site_3g = models.BooleanField(blank=True, null=True)
    site_4g = models.BooleanField(blank=True, null=True)
    site_5g = models.BooleanField(blank=True, null=True)
    date_ouverturecommerciale_5g = models.TextField(blank=True, null=True)
    site_5g_700_m_hz = models.BooleanField(blank=True, null=True)
    site_5g_800_m_hz = models.BooleanField(blank=True, null=True)
    site_5g_1800_m_hz = models.BooleanField(blank=True, null=True)
    site_5g_2100_m_hz = models.BooleanField(blank=True, null=True)
    site_5g_3500_m_hz = models.BooleanField(blank=True, null=True)
    id_site_partage = models.TextField(blank=True, null=True)
    mes_4g_trim = models.BooleanField(blank=True, null=True)
    site_zb = models.BooleanField(db_column="site_ZB", blank=True, null=True)  # Field name made lowercase.
    site_dcc = models.BooleanField(db_column="site_DCC", blank=True, null=True)  # Field name made lowercase.
    site_strategique = models.BooleanField(blank=True, null=True)
    site_capa_240mbps = models.BooleanField(blank=True, null=True)
    annee_donnee = models.TextField(blank=True, null=True)
    trimestre_donnee = models.TextField(blank=True, null=True)
    geometry = models.PointField(srid=3857, blank=True, null=True)
    sup_id = models.BigIntegerField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "site"
