from colorfield.fields import ColorField
from django.conf import settings
from django.db import models


class Operateur(models.Model):
    identifiant = models.IntegerField(
        primary_key=True,
        verbose_name="Identifiant",
        db_column="identifiant",
    )

    nomEntier = models.CharField(
        max_length=255,
        verbose_name="Nom entier",
        db_column="nom_entier",
        null=False,
        blank=False,
    )

    nomAffichage = models.CharField(
        max_length=255,
        verbose_name="Nom d'affichage",
        db_column="nom_affichage",
        null=False,
        blank=False,
    )

    logo = models.CharField(
        max_length=255,
        verbose_name="Chemin de fichier du logo",
        db_column="logo",
        null=True,
        blank=True,
    )

    couleurDefaut = ColorField(
        verbose_name="Couleur (defaut)",
        db_column="couleur_defaut",
        null=False,
        blank=False,
    )

    couleurNiveau1 = ColorField(
        verbose_name="Couleur (Niveau 1)",
        db_column="couleur_niveau_1",
        null=False,
        blank=False,
    )

    couleurNiveau2 = ColorField(
        verbose_name="Couleur (Niveau 2)",
        db_column="couleur_niveau_2",
        null=False,
        blank=False,
    )

    couleurNiveau3 = ColorField(
        verbose_name="Couleur (Niveau 3)",
        db_column="couleur_niveau_3",
        null=False,
        blank=False,
    )

    couleurNiveau4 = ColorField(
        verbose_name="Couleur (Niveau 4)",
        db_column="couleur_niveau_4",
        null=False,
        blank=False,
    )

    optCouleurDefaut = ColorField(
        verbose_name="Couleur optimisée (defaut)",
        db_column="opt_couleur_defaut",
        null=False,
        blank=False,
    )

    optCouleurNiveau1 = ColorField(
        verbose_name="Couleur optimisée (Niveau 1)",
        db_column="opt_couleur_niveau_1",
        null=False,
        blank=False,
    )

    optCouleurNiveau2 = ColorField(
        verbose_name="Couleur optimisée (Niveau 2)",
        db_column="opt_couleur_niveau_2",
        null=False,
        blank=False,
    )

    optCouleurNiveau3 = ColorField(
        verbose_name="Couleur optimisée (Niveau 3)",
        db_column="opt_couleur_niveau_3",
        null=False,
        blank=False,
    )

    optCouleurNiveau4 = ColorField(
        verbose_name="Couleur optimisée (Niveau 4)",
        db_column="opt_couleur_niveau_4",
        null=False,
        blank=False,
    )

    mapCouleurDefaut = ColorField(
        verbose_name="Couleur de la carte (defaut)",
        db_column="map_couleur_defaut",
        null=False,
        blank=False,
    )

    mapCouleurNiveau1 = ColorField(
        verbose_name="Couleur de la carte (Niveau 1)",
        db_column="map_couleur_niveau_1",
        null=False,
        blank=False,
    )

    mapCouleurNiveau2 = ColorField(
        verbose_name="Couleur de la carte (Niveau 2)",
        db_column="map_couleur_niveau_2",
        null=False,
        blank=False,
    )

    mapCouleurNiveau3 = ColorField(
        verbose_name="Couleur de la carte (Niveau 3)",
        db_column="map_couleur_niveau_3",
        null=False,
        blank=False,
    )

    mapCouleurNiveau4 = ColorField(
        verbose_name="Couleur de la carte (Niveau 4)",
        db_column="map_couleur_niveau_4",
        null=False,
        blank=False,
    )

    mapOptCouleurDefaut = ColorField(
        verbose_name="Couleur de la carte optimisée (defaut)",
        db_column="map_opt_couleur_defaut",
        null=False,
        blank=False,
    )

    mapOptCouleurNiveau1 = ColorField(
        verbose_name="Couleur de la carte optimisée (Niveau 1)",
        db_column="map_opt_couleur_niveau_1",
        null=False,
        blank=False,
    )

    mapOptCouleurNiveau2 = ColorField(
        verbose_name="Couleur de la carte optimisée (Niveau 2)",
        db_column="map_opt_couleur_niveau_2",
        null=False,
        blank=False,
    )

    mapOptCouleurNiveau3 = ColorField(
        verbose_name="Couleur de la carte optimisée (Niveau 3)",
        db_column="map_opt_couleur_niveau_3",
        null=False,
        blank=False,
    )

    mapOptCouleurNiveau4 = ColorField(
        verbose_name="Couleur de la carte optimisée (Niveau 4)",
        db_column="map_opt_couleur_niveau_4",
        null=False,
        blank=False,
    )

    perimetreMetro = models.BooleanField(
        verbose_name="Perimètre (Metropole)",
        db_column="perimetre_metro",
        null=False,
        blank=False,
    )

    perimetre971 = models.BooleanField(
        verbose_name="Perimètre (971 Guadeloupe)",
        db_column="perimetre_971",
        null=False,
        blank=False,
    )

    perimetre972 = models.BooleanField(
        verbose_name="Perimètre (972 Martinique)",
        db_column="perimetre_972",
        null=False,
        blank=False,
    )

    perimetre973 = models.BooleanField(
        verbose_name="Perimètre (973 Guyane)",
        db_column="perimetre_973",
        null=False,
        blank=False,
    )

    perimetre974 = models.BooleanField(
        verbose_name="Perimètre (974 La Réunion)",
        db_column="perimetre_974",
        null=False,
        blank=False,
    )

    perimetre976 = models.BooleanField(
        verbose_name="Perimètre (976 Mayotte)",
        db_column="perimetre_976",
        null=False,
        blank=False,
    )

    perimetre977 = models.BooleanField(
        verbose_name="Perimètre (977 Saint-Barthélemy)",
        db_column="perimetre_977",
        null=False,
        blank=False,
    )

    perimetre978 = models.BooleanField(
        verbose_name="Perimètre (978 Saint-Martin)",
        db_column="perimetre_978",
        null=False,
        blank=False,
    )

    iconAntenne = models.CharField(
        max_length=25, verbose_name="Type d'icône afficher sur la carte", db_column="icon_antenne"
    )

    code = models.CharField(max_length=255, verbose_name="Code", db_column="code", null=True, blank=True)

    class Meta:
        db_table = settings.DATABASE_SCHEMA + '"."operateurs'
        verbose_name = "Operateur"
        verbose_name_plural = "Operateurs"
        ordering = ["nomEntier"]

    def __str__(self):
        return f"{self.nomEntier}"
