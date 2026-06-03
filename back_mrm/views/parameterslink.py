from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from back_mrm.models.parameters_link import ParametersLink
from back_mrm.serializers.parameters import ParametersLinkSerializer


class ParametersLinkView(APIView):
    permission_classes = [permissions.IsAuthenticated]  # noqa: RUF012
    queryset = ParametersLink.objects.all()
    serializer_class = ParametersLinkSerializer

    def get_object(self, parameters_id):
        try:
            return ParametersLink.objects.get(id=parameters_id)
        except ParametersLink.DoesNotExist:
            return None

    def get(self, request, *args, **kwargs):  # noqa: ARG002
        if request.data.get("id") is None:
            dtresponse = {"success": False, "msg": "parameter id is needed"}
            return Response(dtresponse, status=status.HTTP_400_BAD_REQUEST)

        parameter_instance = self.get_object(request.GET["id"])
        if not parameter_instance:
            return Response(
                {"success": False, "res": "No data with id {} was found".format(request.GET["id"])},
                status=status.HTTP_400_BAD_REQUEST,
            )

        serializer = self.serializer_class(parameter_instance)

        dtresponse = {"success": True, "data": serializer.data}
        return Response(dtresponse, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):  # noqa: ARG002

        data = {
            "key_word": request.data.get("key_word"),
            "label_value": request.data.get("label_value"),
            "link_value": request.data.get("link_value"),
        }

        serializer = self.serializer_class(data=data)
        if serializer.is_valid():
            serializer.save()
            dtresponse = {"success": True, "data": serializer.data}
            return Response(dtresponse, status=status.HTTP_201_CREATED)

        dtresponse = {"success": False, "data": serializer.errors}
        return Response(dtresponse, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, *args, **kwargs):  # noqa: ARG002

        parameter_instance = self.get_object(pk)
        if not parameter_instance:
            return Response({"success": False, "msg": "Object does not exists"}, status=status.HTTP_400_BAD_REQUEST)

        parameter_instance.delete()

        return Response({"success": True, "msg": "object deleted"}, status=status.HTTP_200_OK)

    def put(self, request, pk, *args, **kwargs):  # noqa: ARG002

        parameter_instance = self.get_object(pk)

        if not parameter_instance:
            return Response({"success": False, "msg": "Object does not exists"}, status=status.HTTP_400_BAD_REQUEST)

        data = {
            "key_word": request.data.get("key_word"),
            "label_value": request.data.get("label_value"),
            "link_value": request.data.get("link_value"),
        }
        serializer = self.serializer_class(instance=parameter_instance, data=data, partial=True)

        if not serializer.is_valid():
            return Response({"success": True, "data": serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        serializer.save()

        return Response({"success": True, "data": serializer.data}, status=status.HTTP_200_OK)


class ParametersLinkListView(generics.ListAPIView):
    queryset = ParametersLink.objects.filter(key_word="FOR_CROWDSOURCING")
    serializer_class = ParametersLinkSerializer
