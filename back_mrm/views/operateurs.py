from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from rest_framework.viewsets import ReadOnlyModelViewSet

from back_mrm.models.operateurs import Operateur
from back_mrm.serializers.operateurs import OperateurSerializer


class OperateurViewSet(ReadOnlyModelViewSet):
    serializer_class = OperateurSerializer
    queryset = Operateur.objects.all()

    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]  # noqa: RUF012
    filterset_fields = {  # noqa: RUF012
        "perimetreMetro": ["exact"],
        "perimetre971": ["exact"],
        "perimetre972": ["exact"],
        "perimetre973": ["exact"],
        "perimetre974": ["exact"],
        "perimetre976": ["exact"],
        "perimetre977": ["exact"],
        "perimetre978": ["exact"],
    }
    ordering_fields = ["identifiant", "nomEntier", "nomAffichage"]  # noqa: RUF012
