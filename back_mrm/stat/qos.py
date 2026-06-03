from django.http import JsonResponse
from rest_framework.views import APIView

from back_mrm.stat.qosmodule.qosbyoperator import StatQosByOperator


class StatQos(APIView):
    def get(self, request):
        if self.isparamscorrect(request):
            ostatqosoperation = StatQosByOperator(request)
            bRes = ostatqosoperation.getstatqos()
            if not bRes:
                response = {"success": False, "message": "Erreur survenue"}
            else:
                response = {
                    "success": True,
                    "label": ostatqosoperation.getlabel(),
                    "labelNiveau": ostatqosoperation.getlabelniveau(),
                    "statQos": ostatqosoperation.getdata(),
                }

        else:
            response = {"success": False, "message": "Paramètres incomplets!"}

        return JsonResponse(response, safe=False)

    def isparamscorrect(self, request):
        if "protocole" not in request.GET and "entite" not in request.GET and "operators" not in request.GET:
            return False

        return True
