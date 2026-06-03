from django.contrib.admin import register, site
from django.contrib.admin.options import ModelAdmin
from django.contrib.auth.admin import UserAdmin

from back_mrm.models import ImportLog, Operateur, User
from back_mrm.models.data_date_description import DataDateDescription
from back_mrm.models.data_source_list import DataSourceDescription, DataSourceList
from back_mrm.models.forms.data_date_description import DataDateDescriptionForm
from back_mrm.models.parameters_link import ParametersLink

site.site_header = "Administration de Mon Réseau Mobile"
site.site_title = "Arcep - Mon Réseau Mobile"
site.index_title = "Administration"


@register(Operateur)
class OperateurAdmin(ModelAdmin):
    fieldsets = (
        (
            "Général",
            {"fields": ("identifiant", "nomEntier", "nomAffichage", "logo", "code")},
        ),
        (
            "Couleurs",
            {
                "fields": (
                    "couleurDefaut",
                    "couleurNiveau1",
                    "couleurNiveau2",
                    "couleurNiveau3",
                    "couleurNiveau4",
                )
            },
        ),
        (
            "Couleurs mode accessibilité",
            {
                "fields": (
                    "optCouleurDefaut",
                    "optCouleurNiveau1",
                    "optCouleurNiveau2",
                    "optCouleurNiveau3",
                    "optCouleurNiveau4",
                )
            },
        ),
        (
            "Couleurs de la carte couverture",
            {
                "fields": (
                    "mapCouleurDefaut",
                    "mapCouleurNiveau1",
                    "mapCouleurNiveau2",
                    "mapCouleurNiveau3",
                    "mapCouleurNiveau4",
                )
            },
        ),
        (
            "Couleurs carto mode accessibilité",
            {
                "fields": (
                    "mapOptCouleurDefaut",
                    "mapOptCouleurNiveau1",
                    "mapOptCouleurNiveau2",
                    "mapOptCouleurNiveau3",
                    "mapOptCouleurNiveau4",
                )
            },
        ),
        (
            "Présence géographique",
            {
                "fields": (
                    "perimetreMetro",
                    "perimetre971",
                    "perimetre972",
                    "perimetre973",
                    "perimetre974",
                    "perimetre976",
                    "perimetre977",
                    "perimetre978",
                )
            },
        ),
    )

    list_display = (
        "identifiant",
        "nomEntier",
        "nomAffichage",
    )

    list_filter = (
        "perimetreMetro",
        "perimetre971",
        "perimetre972",
        "perimetre973",
        "perimetre974",
        "perimetre976",
        "perimetre977",
        "perimetre978",
    )

    search_fields = (
        "nomEntier",
        "nomAffichage",
        "identifiant",
    )


@register(User)
class UserAdmin(UserAdmin):
    list_display = ("username",)
    search_fields = ("username",)


@register(ImportLog)
class LogAdmin(ModelAdmin):
    list_display = ("id", "date", "type", "success", "observation")
    search_fields = ("type",)


@register(DataSourceList)
class DataSourceListAdmin(ModelAdmin):
    list_display = ("id", "title")
    search_fields = ("title",)


@register(DataSourceDescription)
class DataSourceDescriptionAdmin(ModelAdmin):
    list_display = ("id", "id_data_source", "title")
    search_fields = ("title",)
    readonly_fields = ["id_data_source"]

    def has_add_permission(self, request):
        return False


@register(DataDateDescription)
class DataDateDescription(ModelAdmin):
    form = DataDateDescriptionForm
    list_display = ("id", "page", "date_build_display", "date_build_end_display", "date_maj_display", "territoire")
    search_fields = ("page",)
    readonly_fields = ("page", "territoire")
    fields = ["page", "date_build", "date_build_end", "date_maj", "territoire"]

    def date_build_display(self, obj):
        return obj.date_build

    date_build_display.short_description = "Début de création"

    def date_build_end_display(self, obj):
        return obj.date_build_end

    date_build_end_display.short_description = "Fin de création"

    def date_maj_display(self, obj):
        return obj.date_maj

    date_maj_display.short_description = "Mise à jour"

    def has_add_permission(self, request):
        return False


@register(ParametersLink)
class ParametersLinkAdmin(ModelAdmin):
    list_display = ("id", "key_word", "label_value", "link_value")
    search_fields = ("label_value", "link_value")
