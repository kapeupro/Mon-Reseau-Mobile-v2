from django.http import JsonResponse
from django.shortcuts import redirect
from django.views import View

from back_mrm.scripts.update_couvertures import UpdateCouverture


class UpdateImportiew(View):
    def get(self, request, data_type):

        if not request.user.is_authenticated:
            return redirect("login")

        if data_type == "couvertures":
            try:
                oupdatecouverture = UpdateCouverture()
                response = oupdatecouverture.run()
            except Exception as e:  # noqa: BLE001
                response = {"message": "Erreur survenue :" + str(e), "success": False}

            return JsonResponse(response)

        return JsonResponse({"message": "Type de données non supporté", "success": False}, status=400)
