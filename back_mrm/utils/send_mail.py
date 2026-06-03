import os
import smtplib
from email.mime.application import MIMEApplication
from email.mime.multipart import MIMEMultipart

# from smtplib import SMTP_SSL as SMTP       # this invokes the secure SMTP protocol (port 465, uses SSL)
# from smtplib import SMTP                  # use this for standard SMTP protocol   (port 25, no encryption)
# old version
# from email.MIMEText import MIMEText
from email.mime.text import MIMEText
from os.path import basename


class SmtpSslSender:
    def __init__(self):
        self.file_attach = None
        self.text_subtype = "html"

    def getHost(self):
        return self.host

    def setHost(self, host):
        self.host = host

    def getSender(self):
        return self.sender  # email sender

    def setSender(self, sender):
        self.sender = sender

    def getDestinations(self):
        return self.destinations  # email sender

    def setDestinations(self, destinations):
        self.destinations = destinations

    def setLoggin(self, user, password):
        self.user = user
        self.password = password

    def getUser(self):
        return self.user

    def getPassword(self):
        return self.password

    def setTextSubtype(self, text_subtype):
        self.text_subtype = text_subtype  # typical values for text_subtype are plain, html, xml

    def getTextSubtype(self):
        return self.text_subtype

    def getFileAttach(self):
        return self.file_attach

    def setFileAttach(self, file_attach):
        self.file_attach = file_attach

    def getContent(self):
        return self.content

    def setContent(self, content):
        self.content = content

    def getSubject(self):
        return self.subject

    def setSubject(self, subject):
        self.subject = subject

    def set_port_mail(self, port_mail):
        self.port_mail = port_mail

    def set_environnemnt(self, environnemnt):
        self.environnemnt = environnemnt

    def get_environnemnt(self):
        return self.environnemnt

    def get_port_mail(self):
        return self.port_mail

    def send(self):
        try:
            msg = MIMEMultipart()
            msg["Subject"] = self.getSubject()
            msg["From"] = self.getSender()
            msg["To"] = ", ".join(self.getDestinations())
            msg.attach(MIMEText(self.getContent(), self.getTextSubtype()))

            if self.getFileAttach() is not None and os.path.isfile(self.getFileAttach()):
                file_attach = self.getFileAttach()
                with open(file_attach, "rb") as attachment:
                    part = MIMEApplication(attachment.read(), Name=basename(file_attach))
                part["Content-Disposition"] = 'attachment; filename="%s"' % basename(file_attach)
                msg.attach(part)

            # conn = SMTP(self.getHost())
            # conn.set_debuglevel(False)
            # conn.login(self.getUser(), self.getPassword())
            # try:
            #     conn.sendmail(self.getSender(), self.getDestinations(), msg.as_string())
            # finally:
            #     conn.quit()
            #     return True

            if self.getPassword() != "":
                with smtplib.SMTP(self.getHost(), self.get_port_mail()) as smtp:
                    # smtp.set_debuglevel(1)
                    smtp.starttls()
                    smtp.login(self.getUser(), self.getPassword())
                    smtp.send_message(msg)

            else:
                with smtplib.SMTP(self.getHost(), self.get_port_mail()) as smtp:
                    smtp.send_message(msg)

            return True

        except Exception:
            return False
