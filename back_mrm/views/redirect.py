from django.http import HttpResponseRedirect
from django.shortcuts import redirect, render
from django.urls import reverse
from django.views import View


class RedirectView(View):
    def get(self, request):
        if request.user.is_authenticated:
            return render(request, "home.html")
        return redirect("login")

    def post(self, request):
        selected_option = request.POST.get("page_options")

        url_mapping = {
            "couvertures": reverse("couvertures"),
            "sites": reverse("sites"),
            "qos": reverse("qos"),
            "admin": "/admin",
            "operateur": "/admin/back_mrm/operateur/",
            "import_log": "/admin/back_mrm/importlog/",
            "data_source_list": "/admin/back_mrm/datasourcelist/",
        }

        if selected_option not in url_mapping:
            return HttpResponseRedirect("/")  # Ou lever une exception 400

        return HttpResponseRedirect(url_mapping[selected_option])
