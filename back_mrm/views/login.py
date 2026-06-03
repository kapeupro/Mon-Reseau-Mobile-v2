from django.contrib.auth import authenticate, login
from django.shortcuts import redirect, render
from django.views import View


class LoginView(View):
    def get(self, request):
        return render(request, "login.html")

    def post(self, request):
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect("home")
        return render(request, "login.html", {"error_message": "Incorrect username and / or password."})
