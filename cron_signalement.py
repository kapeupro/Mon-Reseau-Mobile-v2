import os
from pathlib import Path

import django
import environ

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

env = environ.Env()
env_path = Path("config") / ".env"
environ.Env.read_env(env_file=env_path)

django.setup()

from back_mrm.services.signalement.importsignalement import ImportSignalement
from back_mrm.services.signalement.send_mail import MailSenderSignalement
from back_mrm.utils.db import Db

DATABASE_NAME = env("DATABASE_NAME", default="")
DATABASE_USER = env("DATABASE_USER", default="")
DATABASE_PASSWORD = env("DATABASE_PASSWORD", default="")
DATABASE_HOST = env("DATABASE_HOST", default="")
DATABASE_PORT = env("DATABASE_PORT", default="")

MDP_MAIL = env("MDP_MAIL", default="")
VAR_ENV = env("VAR_ENV", default="developpement")
PORT_MAIL = env("PORT_MAIL", default="587")
SENDER_MAIL = env("SENDER_MAIL", default="")
RECEIVER_MAIL = env("RECEIVER_MAIL", default="")
SERVER_SMTP = env("SERVER_SMTP", default="")
LOG_PATH = env("LOG_PATH", default="/tmp/")

DATABASES = {
    "default": {
        "ENGINE": "django.contrib.gis.db.backends.postgis",
        "NAME": DATABASE_NAME,
        "USER": DATABASE_USER,
        "PASSWORD": DATABASE_PASSWORD,
        "HOST": DATABASE_HOST,
        "PORT": DATABASE_PORT,
    },
}


db = Db()


obj_import_signalement = ImportSignalement(db)
bres = obj_import_signalement.run()

logs = obj_import_signalement.get_all_log()

o_mail_sender = MailSenderSignalement()

o_mail_sender.set_mdp_mail(MDP_MAIL)
o_mail_sender.set_port_mail(PORT_MAIL)
o_mail_sender.set_server_smtp(SERVER_SMTP)
o_mail_sender.set_log_path(LOG_PATH)
o_mail_sender.set_sender_mail(SENDER_MAIL)
o_mail_sender.set_receiver_mail(RECEIVER_MAIL)
o_mail_sender.set_environnemnt(VAR_ENV)
o_mail_sender.set_text_file_attach(logs)

if not bres:
    errors = obj_import_signalement.get_all_error_msg()
    o_mail_sender.set_text_error(errors)
    o_mail_sender.send_error_mail()
else:
    data_recap = obj_import_signalement.get_params_on_mail()
    if data_recap["csv"] != "no_file":
        o_mail_sender.set_data_recap(data_recap)
        o_mail_sender.send_success_mail()
