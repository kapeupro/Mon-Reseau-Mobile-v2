from rest_framework import serializers

from back_mrm.models import Operateur


class OperateurSerializer(serializers.ModelSerializer):
    class Meta:
        model = Operateur
        fields = "__all__"
