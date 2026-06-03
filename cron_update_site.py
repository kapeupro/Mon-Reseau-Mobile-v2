import os
from datetime import datetime
from pathlib import Path
from zoneinfo import ZoneInfo

import django
import environ

env = environ.Env()
env_path = Path("config") / ".env"
environ.Env.read_env(env_file=env_path)

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from back_mrm.services.send_mail_method import MailSender
from back_mrm.services.update_site.lunchupdate import LunchUpdateSite
from back_mrm.utils.db import Db

DATABASE_NAME = env("DATABASE_NAME", default="")
DATABASE_USER = env("DATABASE_USER", default="")
DATABASE_PASSWORD = env("DATABASE_PASSWORD", default="")
DATABASE_HOST = env("DATABASE_HOST", default="")
DATABASE_PORT = env("DATABASE_PORT", default="")


VAR_ENV = env("VAR_ENV", default="developpement")
MDP_MAIL = env("MDP_MAIL", default="")
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

current_date = datetime.now(ZoneInfo("Europe/Paris"))
formatted_date = current_date.strftime("%Y-%m-%d")

db = Db()

urlgeojson = (
    f"https://object.files.data.gouv.fr/arcep/sites-indisponibles/all/{formatted_date}/raw{formatted_date}.geojson"
)

olunchupdatesite = LunchUpdateSite(db, formatted_date)
olunchupdatesite.seturlgeojson(urlgeojson)
bres = olunchupdatesite.run()
logs = olunchupdatesite.get_all_log()

o_mail_sender = MailSender()
o_mail_sender.set_mdp_mail(MDP_MAIL)
o_mail_sender.set_port_mail(PORT_MAIL)
o_mail_sender.set_server_smtp(SERVER_SMTP)
o_mail_sender.set_log_path(LOG_PATH)
o_mail_sender.set_sender_mail(SENDER_MAIL)
o_mail_sender.set_receiver_mail(RECEIVER_MAIL)
o_mail_sender.set_text_file_attach(logs)
o_mail_sender.set_environnemnt(VAR_ENV)

if not bres:
    errors = olunchupdatesite.get_all_error_msg()
    o_mail_sender.set_text_error(errors)
    o_mail_sender.send_error_mail()
else:
    o_mail_sender.send_table_mail()
