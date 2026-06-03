from rest_framework import serializers

from back_mrm.models.parameters_link import ParametersLink


class ParametersLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = ParametersLink
        fields = "__all__"
