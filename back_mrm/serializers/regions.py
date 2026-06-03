from rest_framework import serializers

from back_mrm.models.regions import Region


class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = "__all__"
