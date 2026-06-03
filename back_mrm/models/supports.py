from django.contrib.gis.db import models

from back_mrm.models.departements import Departement  # noqa: F401


class AnfrSupSupport(models.Model):
    fid = models.BigIntegerField(primary_key=True)
    sup_id = models.BigIntegerField(db_column="SUP_ID", blank=True, null=True)  # Field name made lowercase.
    sta_nm_anfr = models.TextField(db_column="STA_NM_ANFR", blank=True, null=True)  # Field name made lowercase.
    nat_id = models.BigIntegerField(db_column="NAT_ID", blank=True, null=True)  # Field name made lowercase.
    cor_nb_dg_lat = models.BigIntegerField(
        db_column="COR_NB_DG_LAT", blank=True, null=True
    )  # Field name made lowercase.
    cor_nb_mn_lat = models.BigIntegerField(
        db_column="COR_NB_MN_LAT", blank=True, null=True
    )  # Field name made lowercase.
    cor_nb_sc_lat = models.BigIntegerField(
        db_column="COR_NB_SC_LAT", blank=True, null=True
    )  # Field name made lowercase.
    cor_cd_ns_lat = models.TextField(db_column="COR_CD_NS_LAT", blank=True, null=True)  # Field name made lowercase.
    cor_nb_dg_lon = models.BigIntegerField(
        db_column="COR_NB_DG_LON", blank=True, null=True
    )  # Field name made lowercase.
    cor_nb_mn_lon = models.BigIntegerField(
        db_column="COR_NB_MN_LON", blank=True, null=True
    )  # Field name made lowercase.
    cor_nb_sc_lon = models.BigIntegerField(
        db_column="COR_NB_SC_LON", blank=True, null=True
    )  # Field name made lowercase.
    cor_cd_ew_lon = models.TextField(db_column="COR_CD_EW_LON", blank=True, null=True)  # Field name made lowercase.
    sup_nm_haut = models.TextField(db_column="SUP_NM_HAUT", blank=True, null=True)  # Field name made lowercase.
    tpo_id = models.FloatField(db_column="TPO_ID", blank=True, null=True)  # Field name made lowercase.
    adr_lb_lieu = models.TextField(db_column="ADR_LB_LIEU", blank=True, null=True)  # Field name made lowercase.
    adr_lb_add1 = models.TextField(db_column="ADR_LB_ADD1", blank=True, null=True)  # Field name made lowercase.
    adr_lb_add2 = models.TextField(db_column="ADR_LB_ADD2", blank=True, null=True)  # Field name made lowercase.
    adr_lb_add3 = models.TextField(db_column="ADR_LB_ADD3", blank=True, null=True)  # Field name made lowercase.
    adr_nm_cp = models.BigIntegerField(db_column="ADR_NM_CP", blank=True, null=True)  # Field name made lowercase.
    com_cd_insee = models.TextField(db_column="COM_CD_INSEE", blank=True, null=True)  # Field name made lowercase.
    geom = models.PointField(srid=3857, blank=True, null=True)
    id_departement = models.ForeignKey(
        "back_mrm.Departement", models.DO_NOTHING, db_column="id_departement", blank=True, null=True
    )

    class Meta:
        managed = False
        db_table = "anfr_sup_support"
