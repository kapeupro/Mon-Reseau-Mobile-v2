FROM python:3.12-slim

# Variables d'environnement
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Installation des dépendances système
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl gdal-bin \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Utilisateur non-root
# RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser

WORKDIR /code

# Copie des requirements en premier pour profiter du cache Docker
COPY requirements.txt /code/
RUN pip install -r requirements.txt

# Copie du code
COPY back_mrm/ /code/back_mrm/
COPY cron_signalement.py cron_update_site.py /code/
COPY docker/manage.py docker/start.sh /code/
COPY docker/config/ /code/config/

#RUN mkdir -p /code/static /code/media
#RUN chown -R appuser:appgroup /code && chmod g+rwx manage.py start.sh
RUN chmod g+rwx manage.py start.sh

EXPOSE 8000

# Utiliser l'utilisateur non-root
#USER appuser

CMD ["./start.sh"]

