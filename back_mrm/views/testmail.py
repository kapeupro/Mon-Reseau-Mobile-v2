import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from django.http import JsonResponse
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

RECEIVER_MAIL = "onegeo-suite@neogeo.fr"


class TestMailView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        self.request = request

        msg = MIMEMultipart()
        msg["Subject"] = "test"
        msg["From"] = self.get_user()
        msg["To"] = self.get_to()
        msg.attach(MIMEText("test mail", "plain"))

        if self.get_password() != "":
            with smtplib.SMTP(self.get_host(), self.get_port_mail()) as smtp:
                smtp.starttls()
                smtp.login(self.get_user(), self.get_password())
                smtp.send_message(msg)

        else:
            with smtplib.SMTP(self.get_host(), self.get_port_mail()) as smtp:
                smtp.send_message(msg)

        data = {"success": True}
        return JsonResponse(data, safe=False)

    def get_host(self):
        if "host" in self.request.GET:
            return self.request.GET["host"]
        return ""

    def get_port_mail(self):
        if "port" in self.request.GET:
            return self.request.GET["port"]
        return ""

    def get_user(self):
        if "user" in self.request.GET:
            return self.request.GET["user"]
        return ""

    def get_password(self):
        if "pass" in self.request.GET:
            return self.request.GET["pass"]
        return ""

    def get_to(self):
        if "to" in self.request.GET:
            return self.request.GET["to"]
        return RECEIVER_MAIL
