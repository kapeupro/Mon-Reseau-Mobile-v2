# Mon Réseau Mobile - Back (`back_mrm`)

API Django REST pour l'application **Mon Réseau Mobile** développée pour l'ARCEP.
Elle expose des données géographiques et statistiques sur la couverture mobile en France.

---

## Sommaire

- [Prérequis](#prérequis)
- [Architecture](#architecture)
- [Environnement de développement](#environnement-de-développement)
- [Environnement déployé Docker](#environnement-déployé-docker)
- [Variables d'environnement](#variables-denvironnement)
- [API](#api)
- [Tâches planifiées Crons](#tâches-planifiées-crons)
- [Qualité du code](#qualité-du-code)
- [Tests](#tests)

---

## Prérequis

- Python >= 3.12
- GDAL / PostGIS
- PostgreSQL >= 14 avec les extensions `postgis` et `unaccent`

---

## Architecture

### Stack technique

| Composant | Technologie |
|-----------|-------------|
| Framework | Django 4.2 + Django REST Framework |
| Base de données | PostgreSQL / PostGIS |
| Serveur | Gunicorn |
| Géospatial | GeoDjango, GeoPandas, Fiona |
| Authentification | Sessions Django + django-axes |
| Monitoring | Sentry |
| Conteneurisation | Docker |

---

### Structure du projet

```
back_mrm/
├── models/               # Modèles Django
│   ├── users.py          # Modèle utilisateur custom
│   ├── sites.py          # Sites mobiles
│   ├── supports.py       # Supports (pylônes, etc.)
│   ├── operateurs.py     # Opérateurs mobiles
│   ├── departements.py   # Départements
│   ├── regions.py        # Régions
│   └── log.py            # Logs applicatifs
│
├── views/                # Vues Django (endpoints backend admin)
│   ├── login.py          # Authentification
│   ├── upload_file.py    # Upload de fichiers
│   └── import_*.py       # Import de données (couvertures, sites, QoS, ZAC...)
│
├── services/             # Logique métier (endpoints publics)
│   ├── service_get_site.py       # Informations sur un site
│   ├── service_get_support.py    # Informations sur un support
│   ├── service_get_territory.py  # Données territoriales
│   ├── service_get_density.py    # Densité de couverture
│   ├── service_get_zac.py        # Zones d'activité commerciale
│   ├── service_clone_schema.py   # Clonage de schéma BDD
│   ├── signalement/              # Gestion des signalements
│   └── update_site/              # Mise à jour des sites
│
├── stat/                 # Statistiques (endpoints publics)
│   ├── couverture.py             # Statistiques de couverture
│   ├── couv_operateur.py         # Couverture par opérateur
│   ├── qos.py                    # Qualité de service
│   ├── signalement.py            # Statistiques signalements
│   ├── zone.py                   # Statistiques par zone
│   ├── territoire_train.py       # Couverture ferroviaire
│   └── test.py                   # Tests de performance réseau
│
├── scripts/              # Scripts d'import et de traitement
│   ├── import_script.py          # Script d'import générique
│   ├── anfr.py                   # Import données ANFR
│   ├── couverture.py             # Import couvertures
│   ├── site.py                   # Import sites
│   ├── qos.py                    # Import QoS
│   └── update_couvertures.py     # Mise à jour couvertures
│
├── utils/                # Utilitaires transverses
│   ├── db.py             # Wrapper base de données (psycopg3)
│   ├── datapusher.py     # Push de données via ogr2ogr
│   ├── cmdprocess.py     # Exécution sécurisée de commandes système
│   ├── send_mail.py      # Envoi d'emails
│   └── querybuilder.py   # Construction de requêtes SQL
│
├── serializers/          # Sérialiseurs DRF
├── data/                 # Données initiales (fixtures, SRID, SQL)
└── tests/                # Tests unitaires et d'intégration

config_sample/            # Configuration Django (template)
docker/                   # Fichiers Docker
├── start.sh              # Script de démarrage
├── manage.py             # manage.py pour Docker
└── config/               # Settings Docker

cron_signalement.py       # Cron import signalements
cron_update_site.py       # Cron mise à jour des sites
```

---

### Schéma de la base de données

La base utilise **deux schémas PostgreSQL** :
- **`public`** : données en production (accessibles publiquement)
- **`private`** : données en cours de mise à jour

Le basculement entre les deux schémas est géré via `service_clone_schema.py`.

---

### Authentification

L'application utilise **l'authentification par session Django** :

```
Client -> GET /api/csrf/           -> Récupération du token CSRF
Client -> POST /api/backend/login  -> Connexion (session cookie)
Client -> GET /api/...             -> Requêtes authentifiées (cookie session)
Client -> POST /api/backend/logout -> Déconnexion
```

- Sessions expirées après **30 minutes** d'inactivité
- Blocage après **3 tentatives** échouées (django-axes, 10 min)
- Cookies sécurisés HTTPS uniquement en production

---

## Environnement de développement

### 1. Cloner le dépôt

```bash
git clone https://git.neogeo.fr/arcep/back_mrm.git
cd back_mrm
```

### 2. Créer l'environnement virtuel

```bash
python -m venv venv
```

- **Windows** : `venv\Scripts\activate`
- **Linux / macOS** : `source venv/bin/activate`

### 3. Installer les dépendances

```bash
pip install --upgrade pip
pip-compile requirements.in
pip install -r requirements.txt
```

#### Contrôle des dépendances

```bash
# Vérifier les mises à jour disponibles (patch)
pcu --target patch

# Appliquer les mises à jour (patch)
pcu --target patch -u

# Auditer les failles de sécurité
pip-audit -r requirements-dev.txt
```

### 5. Initialiser la base de données

Renommer le `manage.py` à la racine en `devmanage.py`, puis :

```bash
python devmanage.py migrate
python devmanage.py loaddata back_mrm/data/operateurs.json
python devmanage.py createsuperuser
```

---

## Environnement déployé Docker

### Extensions PostgreSQL requises

```sql
CREATE EXTENSION unaccent;
CREATE EXTENSION postgis;
```

### Lancer l'application

Passer par le projet Ansible

### Initialisation via Docker

```bash
# Charger les données initiales
docker exec -it $(docker ps -q -f name=backend) python manage.py loaddata back_mrm/data/operateurs.json

# Créer un super-utilisateur
docker exec -it $(docker ps -q -f name=backend) python manage.py createsuperuser --noinput
```

---

## Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `SECRET_KEY` | Clé secrète Django | `django-insecure-...` |
| `DATABASE_NAME` | Nom de la BDD | `mrm_db` |
| `DATABASE_USER` | Utilisateur BDD | `mrm_user` |
| `DATABASE_PASSWORD` | Mot de passe BDD | `****` |
| `DATABASE_HOST` | Hôte BDD | `localhost` |
| `DATABASE_PORT` | Port BDD | `5432` |
| `DATABASE_SCHEMA` | Schéma principal | `public` |
| `PUBLIC_SCHEMA` | Schéma public | `public` |
| `PRIVATE_SCHEMA` | Schéma privé | `private` |
| `APP_MODE` | Mode applicatif | `production` |
| `SENTRY_ACTIVED` | Activer Sentry | `true` |
| `SENDER_MAIL` | Email expéditeur | `no-reply@arcep.fr` |
| `RECEIVER_MAIL` | Email destinataire | `admin@arcep.fr` |
| `SERVER_SMTP` | Serveur SMTP | `smtp.arcep.fr` |
| `PORT_MAIL` | Port SMTP | `587` |
| `LOG_PATH` | Chemin des logs | `/var/log/mrm/` |
| `IMPORT_FILE_PATH` | Chemin fichier import | `/data/import/` |
| `CONVERTED_UTF8_PATHFILE` | Chemin fichiers UTF-8 | `/data/converted/` |

---

## API

### Endpoints publics

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/operateurs/` | Liste des opérateurs |
| `GET` | `/api/search/` | Recherche par nom |
| `GET` | `/api/search_optimal/` | Recherche optimisée |
| `GET` | `/api/support/` | Informations support |
| `GET` | `/api/site/` | Informations site mobile |
| `GET` | `/api/extent/` | Coordonnées géographiques |
| `GET` | `/api/territory/` | Données territoriales |
| `GET` | `/api/density/` | Densité de couverture |
| `GET` | `/api/crowd/` | Données crowdsourcing |
| `GET` | `/api/zac_infos/` | Infos ZAC |
| `GET` | `/api/train/` | Couverture ferroviaire |

### Statistiques

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/stat_couverture/` | Stats de couverture |
| `GET` | `/api/stat_couv_operateur/` | Couverture par opérateur |
| `GET` | `/api/stat_qos/` | Qualité de service |
| `GET` | `/api/stat_signalement/` | Stats signalements |
| `GET` | `/api/stat_zone/` | Stats par zone |
| `GET` | `/api/stat_test/` | Tests réseau |
| `GET` | `/api/stat_nbope/` | Nombre d'opérateurs |

### Endpoints admin (authentification requise)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/backend/login` | Connexion |
| `POST` | `/api/backend/logout` | Déconnexion |
| `POST` | `/api/backend/import_couvertures/` | Import couvertures |
| `POST` | `/api/backend/import_sites/` | Import sites |
| `POST` | `/api/backend/import_qos/` | Import QoS |
| `POST` | `/api/backend/import_zac/` | Import ZAC |
| `POST` | `/api/backend/upload/<data_type>/` | Upload fichier |
| `POST` | `/api/backend/updatesite/` | Mise à jour sites |
| `POST` | `/api/backend/consolidation/` | Consolidation données |
| `POST` | `/api/backend/copyschema/` | Clonage schéma BDD |
| `GET` | `/api/csrf/` | Récupération token CSRF |

---

## Tâches planifiées Crons

### `cron_signalement.py`

Import automatique des signalements et envoi d'un email de récapitulatif.

```bash
python cron_signalement.py
```

### `cron_update_site.py`

Mise à jour des sites mobiles depuis l'API data.gouv.fr et envoi d'un email de récapitulatif.

```bash
python cron_update_site.py
```

> Ces scripts utilisent les mêmes variables d'environnement que l'application Django.

---

## Qualité du code

```bash
# Formatter
ruff format --check   # Vérifier le formatage
ruff format           # Appliquer le formatage

# Linter
ruff check .          # Analyser le code
ruff check . --fix    # Corriger automatiquement

# Analyse de sécurité
bandit -r back_mrm/
bandit -r back_mrm/ -t B608                        # Injections SQL uniquement
bandit -r back_mrm/ --format json -o rapport.json  # Export JSON
```

---

## Tests

```bash
# Lancer tous les tests
python devmanage.py test back_mrm/tests/

# Lancer avec la couverture de code
coverage run --source=back_mrm python devmanage.py test back_mrm/tests/
coverage report
coverage html