<div align="center">

# Mon réseau mobile

**Comparer la couverture et la qualité de service des opérateurs mobiles en France**

[![Licence du code](https://img.shields.io/badge/Code-GPLv3-blue.svg)](LICENSE)
[![Licence des données](https://img.shields.io/badge/Données-Licence%20Ouverte%201.0-blue.svg)](#-licences)
[![Service en ligne](https://img.shields.io/badge/Démo-monreseaumobile.arcep.fr-green.svg)](https://monreseaumobile.arcep.fr/)
[![Code public](https://img.shields.io/badge/code.gouv.fr-référencé-informational.svg)](https://code.gouv.fr/)

[Accéder au service](https://monreseaumobile.arcep.fr/) ·
[Signaler un bug](../../issues) ·
[Contribuer](#-contribuer)

</div>

---

## Sommaire

- [À propos](#-à-propos)
- [Fonctionnalités](#-fonctionnalités)
- [Captures et démonstration](#-captures-et-démonstration)
- [Sources de données](#-sources-de-données)
- [Architecture](#-architecture)
- [Pile technique](#-pile-technique)
- [Démarrage rapide](#-démarrage-rapide)
- [Configuration](#-configuration)
- [Mise à jour des données](#-mise-à-jour-des-données)
- [Accessibilité et éco-conception](#-accessibilité-et-éco-conception)
- [Contribuer](#-contribuer)
- [Sécurité](#-sécurité)
- [Licences](#-licences)
- [Crédits et contact](#-crédits-et-contact)

---

## ℹ️ À propos

**« Mon réseau mobile »** est un outil cartographique édité par l'**Arcep** (Autorité de
régulation des communications électroniques, des postes et de la distribution de la presse).
Cette version correspond à la version disponible depuis **août 2025**. **« Mon réseau mobile »** 
permet de comparer les performances des  opérateurs mobiles en matière de couverture
(services : "Appels et SMS" et "Internet mobile") et de qualité de service dans son lieu de vie comme dans 
les transports, en France métropolitaine et en Outre-mer.

Le service s'adresse à tous les publics :

- les **particuliers** qui veulent comparer les réseaux avant de changer d'opérateur ;
- les **entreprises** qui envisagent une nouvelle implantation ;
- les **collectivités** qui suivent l'évolution des déploiements des réseaux mobiles sur leur territoire.

Ce dépôt publie le **code source** de l'application, conformément à la démarche d'ouverture
des codes sources des administrations (article L.300-4 du code des relations entre le public
et l'administration). Il vise la transparence, la réutilisation et la contribution de la communauté.

> ℹ️ Ce README décrit le projet à des fins de réutilisation. Le service de référence reste
> celui mis en ligne par l'Arcep : <https://monreseaumobile.arcep.fr/>.

---

## ✨ Fonctionnalités

L'application restitue, sur un fond cartographique interactif, plusieurs couches d'information
disponibles par opérateur et par technologie (2G / 3G / 4G / 5G) :

- **Cartes de couverture mobile**
  - Couverture _Appels et SMS_ : très bonne / bonne / limitée / non couvert.
  - Couverture _Internet mobile_ : très bonne / bonne / limitée / non couvert.
- **Tests de qualité de service** issus des campagnes de mesures terrain de l'Arcep et de partenaires
  - Tests de _navigation web_ (taux de pages chargées en moins de 5 ou 10 s).
  - Tests de _vidéo en ligne_ (qualité du visionnage de vidéo en streaming).
  - Tests de _débits descendants_ (paliers : < 3, 3–8, 8–30, > 30 Mbit/s).
  - Tests de _téléversement de fichiers_ (upload d'un fichier de 1 Mo).
  - Tests de _voix_ (maintient d'un appel pendant 120 secondes et note MOS < 2.1).
  - Tests de _SMS_ (réception de SMS en moins de 10 s).
- **Antennes et déploiements**
  - Emplacement des sites par opérateur.
  - Eplacement des sites en pannes.
- **Zones à couvrir** 
  - _Points d'intérêt_ (POI) et zones identifiées par les pouvoirs publics.
  - _Axes routiers prioritaires_ et _axes ferrés_.
- **Signalements** remontés via [« J'alerte l'Arcep »](https://www.arcep.fr/nos-sujets/jalerte-larcep-un-geste-citoyen-pour-ameliorer-les-reseaux-dechange.html).

> ⚠️ Les informations de couverture sont **simulées** et fournies à titre indicatif, sans valeur
> contractuelle. La couverture réelle peut varier selon le terminal, le bâti, la météo, la saison
> et la charge du réseau.

---

## 🖼️ Captures et démonstration

<!-- À adapter : ajoutez vos visuels dans /docs/assets -->

| Couverture mobile | Qualité de service | Antennes et déploiements |
| :---: | :---: | :---: |
| ![alt text](Isolated.png "Title") | _capture à insérer_ | _capture à insérer_ |

Démonstration en ligne : **<https://monreseaumobile.arcep.fr/>**

---

## 🗂️ Sources de données

Les données affichées proviennent de sources ouvertes et de transmissions réglementaires des
opérateurs. Les principales sources publiques réutilisables :

| Donnée | Producteur | Portail |
| --- | --- | --- |
| Cartes de couverture (voix/SMS, Internet) | Opérateurs / Arcep | [data.arcep.fr](https://data.arcep.fr/) · [data.gouv.fr](https://www.data.gouv.fr/) |
| Mesures de qualité de service mobile | Arcep | [data.arcep.fr](https://data.arcep.fr/) |
| Sites et antennes radioélectriques | ANFR | [data.anfr.fr](https://data.anfr.fr/) · [Cartoradio](https://www.cartoradio.fr/) |
| Zones du dispositif de couverture ciblée | Arcep / Gouvernement | [data.arcep.fr](https://data.arcep.fr/) |
| Signalements consommateurs | Arcep (« J'alerte l'Arcep ») | [jalerte.arcep.fr](https://jalerte.arcep.fr/) |

<!-- À adapter : remplacez par les URLs exactes des jeux de données effectivement consommés -->

Les jeux de données sont, sauf mention contraire, publiés sous **Licence Ouverte / Open Licence 2.0**
(Etalab). Vérifiez la licence propre à chaque jeu de données avant toute réutilisation.

---

## 🏗️ Architecture

<!-- À adapter à l'implémentation réelle. Schéma indicatif d'une application cartographique. -->

```
┌──────────────────────────┐      ┌──────────────────────────┐
│      Front-end (SPA)      │      │      Tuiles vectorielles  │
│  Carte interactive + UI   │◀────▶│   / fonds de carte        │
└──────────────┬───────────┘      └──────────────────────────┘
               │ API REST / GeoJSON / MVT
               ▼
┌──────────────────────────┐      ┌──────────────────────────┐
│        API back-end       │◀────▶│   Base géospatiale        │
│   Agrégation / requêtage  │      │   (PostgreSQL + PostGIS)  │
└──────────────┬───────────┘      └──────────────────────────┘
               │ ETL / imports planifiés
               ▼
┌──────────────────────────┐
│   Sources ouvertes        │
│  (Arcep, ANFR, data.gouv) │
└──────────────────────────┘
```

Organisation indicative du dépôt :

```
.
├── frontend/        # Application web (carte interactive, UI)
├── backend/         # API et logique métier
├── data-pipeline/   # Scripts ETL d'import et de préparation des données
├── tiles/           # Génération / service des tuiles cartographiques
├── docs/            # Documentation et visuels
├── deploy/          # Déploiement (conteneurs, IaC, CI/CD)
└── README.md
```

---

## 🧰 Pile technique

<!-- À adapter : ces choix sont des exemples typiques, à remplacer par la stack réelle. -->

- **Cartographie** : MapLibre GL JS (ou Leaflet), tuiles vectorielles (MVT) / WMTS.
- **Front-end** : framework JS (ex. React / Vue), TypeScript.
- **Back-end** : API HTTP (ex. Node.js, Python/FastAPI ou Java/Spring).
- **Données géospatiales** : PostgreSQL + PostGIS.
- **ETL** : scripts d'import (Python / GDAL-OGR) planifiés.
- **Conteneurisation & déploiement** : Docker, CI/CD.

---

## 🚀 Démarrage rapide

> Prérequis indicatifs — **à adapter** : Git, Docker et Docker Compose (ou Node.js ≥ 20 et
> Python ≥ 3.11 selon les composants).

```bash
# 1. Cloner le dépôt
git clone https://github.com/<organisation>/mon-reseau-mobile.git
cd mon-reseau-mobile

# 2. Copier et renseigner la configuration
cp .env.example .env

# 3. Démarrer l'ensemble des services
docker compose up --build
```

L'application est alors disponible sur `http://localhost:8080` (port indicatif).

<!-- À adapter : ajoutez les commandes spécifiques (migrations, seed des données, build front, etc.) -->

---

## ⚙️ Configuration

Les paramètres sont définis via des variables d'environnement (voir `.env.example`) :

| Variable | Description | Exemple |
| --- | --- | --- |
| `DATABASE_URL` | Connexion PostgreSQL/PostGIS | `postgres://user:pass@db:5432/mrm` |
| `TILES_URL` | URL du service de tuiles | `https://tiles.example.org` |
| `DATA_SOURCE_URL` | Point d'accès aux jeux de données | `https://data.arcep.fr/...` |
| `PUBLIC_BASE_URL` | URL publique de l'application | `https://localhost:8080` |

<!-- À adapter à la configuration réelle -->

---

## 🔄 Mise à jour des données

Les couches sont régénérées à partir des sources ouvertes. Exemple de pipeline :

```bash
# Importer / rafraîchir les jeux de données
make data-import        # ou : python data-pipeline/import.py

# Régénérer les tuiles vectorielles
make tiles-build
```

Une mise à jour majeure de l'interface et des données a été déployée par l'Arcep **en 2025**
(clarté accrue et granularité plus fine des informations publiées).

---

## ♿ Accessibilité et éco-conception

Service public numérique, l'application vise la conformité au **RGAA** (Référentiel général
d'amélioration de l'accessibilité) et une démarche d'**éco-conception**. Toute contribution
doit veiller à ne pas dégrader l'accessibilité (navigation clavier, contrastes, alternatives
textuelles, ARIA) ni la sobriété (poids des assets, requêtes réseau).

---

## 🤝 Contribuer

Les contributions sont les bienvenues !

1. Consultez les [issues ouvertes](../../issues) et le fichier `CONTRIBUTING.md`.
2. Ouvrez une issue pour discuter d'une évolution avant de coder un changement important.
3. Créez une branche, committez (messages clairs), puis ouvrez une **pull request**.
4. Respectez le style de code, ajoutez des tests et documentez vos changements.

Ce projet adhère à un **code de conduite** (`CODE_OF_CONDUCT.md`) ; en participant, vous
vous engagez à le respecter.

---

## 🔐 Sécurité

Merci de **ne pas** divulguer publiquement une faille de sécurité dans une issue.
Signalez-la de manière responsable via le canal indiqué dans `SECURITY.md`
(ou par courriel à l'adresse de contact ci-dessous). Voir aussi le programme de
divulgation coordonnée des vulnérabilités de l'État.

---

## 📜 Licences

- **Code source** : publié sous **EUPL-1.2** *(à confirmer / adapter — autres licences libres
  recommandées pour le secteur public : MIT, Apache-2.0, GNU GPL-3.0, CeCILL)*. Voir [`LICENSE`](LICENSE).
- **Données** : **Licence Ouverte / Open Licence 2.0** (Etalab), sauf mention contraire propre
  à chaque jeu de données.
- **Marques et logos** (« Mon réseau mobile », Arcep) : protégés, exclus de la licence du code
  et non réutilisables sans autorisation.

---

## 🙏 Crédits et contact

- **Éditeur** : Arcep — Autorité de régulation des communications électroniques, des postes
  et de la distribution de la presse.
- **Données partenaires** : opérateurs mobiles, ANFR, services de l'État.
- **Service en ligne** : <https://monreseaumobile.arcep.fr/>
- **Page d'information** :
  [arcep.fr — « Mon réseau mobile »](https://www.arcep.fr/nos-sujets/monreseaumobile-comparer-couverture-qualite-service-operateurs-mobiles.html)
- **Contact** : <https://www.arcep.fr/nous-contacter.html>

<div align="center">

—

*« Mon réseau mobile » — un service de l'Arcep.*

</div>
