# Mon Réseau Mobile — Front-end

Application web **Next.js** développée pour l'[Arcep](https://www.arcep.fr), permettant de comparer la couverture et la qualité du réseau mobile en France.

---

## Stack technique

| Technologie  | Version              |
| ------------ | -------------------- |
| Next.js      | 14.x                 |
| React        | 18.x                 |
| TypeScript   | 5.x                  |
| MapLibre GL  | 3.x                  |
| Tailwind CSS | 3.x                  |
| Zustand      | 4.x                  |
| next-intl    | 2.x                  |
| PWA          | @ducanh2912/next-pwa |

---

## Prérequis

- **Node.js** >= 22
- **npm** >= 10

---

## Installation

```bash
npm install
```

---

## Variables d'environnement

Copier le fichier `.env` et adapter les valeurs :

```bash
cp .env .env.local
```

| Variable                      | Description                                    |
| ----------------------------- | ---------------------------------------------- |
| `NEXT_PUBLIC_TILESERV_URL`    | URL du serveur de tuiles                       |
| `NEXT_PUBLIC_FEATURESERV_URL` | URL du serveur de features                     |
| `NEXT_PUBLIC_API_URL`         | URL de l'API backend                           |
| `NEXT_PUBLIC_ALTIMETRIE_API`  | URL de l'API altimétrie (IGN)                  |
| `NEXT_PUBLIC_LINK_ALERT`      | URL du service J'alerte l'Arcep                |
| `NEXT_PUBLIC_BASE_URL`        | URL publique de l'application (pour OpenGraph) |

---

## Développement

```bash
npm run dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

---

## Build de production

```bash
npm run build
npm run start
```

---

## Docker

### Build de l'image

```bash
docker build -t front-mrm .
```

### Lancer le conteneur

```bash
docker run -p 3000:3000 --env-file .env front-mrm
```

L'image utilise un build **multi-stage** (Node 20 Alpine) pour minimiser la taille finale.

---

## Tests E2E (Cypress)

> Les tests nécessitent que l'application soit démarrée.

```bash
# Lancer les tests en mode headless
npm run cypress:e2e

# Lancer les tests avec l'interface graphique
npm run cypress:open

# Lancer l'application + les tests automatiquement
npm test
```

Les rapports de test sont générés dans `cypress/reports/html/`.

---

## Linting & Formatage

```bash
# Vérifier le formatage
npm run format

# Corriger le formatage automatiquement
npm run format:fix

# Linter
npm run lint
```

---

## Structure du projet

```
src/
├── app/               # App Router Next.js (pages, layouts, composants)
│   ├── components/    # Composants React (carte, panneaux, filtres…)
│   ├── constant/      # Constantes applicatives
│   └── themes/        # Thèmes visuels
├── service/           # Appels API et logique métier
├── store/             # Stores Zustand (état global)
├── translations/      # Fichiers i18n (fr.json, en.json)
└── utils/             # Utilitaires partagés
public/
├── assets/            # Images et icônes statiques
├── js/                # Scripts tiers (Matomo)
└── manifest.json      # Manifest PWA
```

---

## Internationalisation

L'application supporte le français (`fr`) et l'anglais (`en`) via **next-intl**. Les fichiers de traduction sont dans `src/translations/`.
