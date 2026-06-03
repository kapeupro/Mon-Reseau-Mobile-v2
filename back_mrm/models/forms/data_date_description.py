from django import forms

from back_mrm.models.data_date_description import DataDateDescription


class DataDateDescriptionForm(forms.ModelForm):
    class Meta:
        model = DataDateDescription
        fields = ["page", "date_build", "date_build_end", "date_maj", "territoire"]
        labels = {
            "date_build": "Début de création",
            "date_build_end": "Fin de création",
            "date_maj": "Mise à jour",
        }
