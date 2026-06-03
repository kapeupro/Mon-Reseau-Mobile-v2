from rest_framework import serializers

from back_mrm.models.supports import AnfrSupSupport


class SupportSerializer(serializers.ModelSerializer):
    class Meta:
        model = AnfrSupSupport
        fields = "__all__"
