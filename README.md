# WayPoint - Frontend (Vue.js + Nuxt.js)

<p align="center">
  <img src="public/logo.png" alt="WayPoint Logo" style="max-width: 100%;" />
</p>

<details>
<summary><strong>🌍 English version</strong></summary>

WayPoint Frontend is the user interface of the collaborative map builder, built with **Nuxt.js 3** and **Vue.js 3**. It provides an intuitive, responsive web application for creating, editing, and sharing interactive maps with points of interest.

This frontend serves as the certification project interface for a full-stack web/mobile developer certification (RNCP 5).

> 📅 **Open-source release scheduled for July 2025.**

---

## 🎯 Features

- 🗺️ **Interactive Map Viewer** powered by Leaflet.js
- 📌 **POI Management** with drag-and-drop functionality
- 🗂️ **Category Management** with hierarchical organization
- 👥 **Collaborative Editing** with real-time invitations
- 🔍 **Advanced Filtering** by categories, games, and metadata
- 🌐 **Public Map Sharing** with read-only access
- 📱 **PWA Support** for mobile compatibility
- 🌍 **Multi-language** support (English/French)
- 🎮 **Game Integration** with IGDB database
- 🔐 **Authentication** via Google OAuth2 or email/password

---

## 🚀 Technology Stack

| Component             | Technology                   |
|-----------------------|------------------------------|
| 🌐 **Framework**      | Nuxt.js 3 + Vue.js 3         |
| 🎨 **UI Library**     | Vuetify 3                    |
| 🗺️ **Maps**          | Leaflet.js                   |
| 🔄 **State Management** | Pinia                      |
| 🌍 **Internationalization** | Nuxt i18n            |
| 📝 **Language**       | TypeScript                   |
| 🎨 **Icons**          | Material Design Icons       |
| 📡 **HTTP Client**    | Axios                        |
| 🖼️ **Images**        | Nuxt Image                   |
| ⚡ **Build Tool**     | Vite                         |

---

## 🚀 Development Setup

### Prerequisites
- Node.js 18+ and npm
- Backend API running (see backend repository)

### Quick Start

1. **Clone the frontend repository**
```bash
git clone <frontend-repository-url>
cd <frontend-repo-name>
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start the development server**
```bash
npm run dev
```

5. **Access the application**
- Frontend: http://localhost:3000
- Make sure the backend API is running on http://localhost:3000

### Environment Variables

Create a `.env` file with the following variables:

```bash
# API Configuration
NUXT_PUBLIC_API_BASE=http://localhost:3000

# Google OAuth2 (optional, for authentication)
NUXT_GOOGLE_CLIENT_ID=your_google_client_id
NUXT_GOOGLE_CLIENT_SECRET=your_google_client_secret

# Auth Secret
NUXT_AUTH_SECRET=your_auth_secret_key
```

---

## 📱 Build & Deployment

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run generate     # Generate static site
```

### Production Build
```bash
npm run build
npm run preview
```

### Docker Build
```bash
# Build Docker image
docker build -t waypoint-frontend .

# Run container
docker run -p 3000:3000 waypoint-frontend
```

---

## 📁 Project Structure

```
frontend/
├── assets/              # Static assets (CSS, images)
├── components/          # Vue components
│   ├── MapViewer.vue   # Main map component
│   ├── Sidebar.vue     # Navigation sidebar
│   ├── AppHeader.vue   # Application header
│   └── ...
├── composables/         # Vue composables
├── i18n/               # Internationalization
│   └── locales/        # Language files
│       ├── en.json     # English translations
│       └── fr.json     # French translations
├── layouts/            # Nuxt layouts
├── middleware/         # Route middleware
├── pages/              # Nuxt pages (auto-routing)
│   ├── index.vue       # Home page
│   ├── login.vue       # Authentication
│   ├── my-maps.vue     # User maps
│   ├── explore.vue     # Public maps
│   └── maps/           # Dynamic map routes
├── plugins/            # Nuxt plugins
├── public/             # Public static files
├── server/             # Server-side code
├── stores/             # Pinia stores
├── types/              # TypeScript definitions
└── utils/              # Utility functions
```

---

## 🌍 Internationalization

The application supports multiple languages using Nuxt i18n:

- **English** (default): `i18n/locales/en.json`
- **French**: `i18n/locales/fr.json`

### Adding a New Language

1. Create a new JSON file in `i18n/locales/`
2. Add the locale configuration in `nuxt.config.ts`
3. Update the language switcher component

### Translation Keys Structure

```json
{
  "nav": {
    "home": "Home",
    "maps": "My Maps",
    "explore": "Explore"
  },
  "map": {
    "title": "Map Title",
    "description": "Description"
  }
}
```

---

## 🗺️ Map Features

### Interactive Map Viewer
- **Leaflet.js** integration for smooth map interactions
- **Zoom controls** with custom styling
- **Marker clustering** for better performance
- **Custom icons** for different POI categories

### POI Management
- **Drag-and-drop** POI creation and editing
- **Category-based** organization with colors and icons
- **Image uploads** for POI details
- **Search and filtering** capabilities

### Collaborative Features
- **Real-time invitations** with role management
- **Permission-based** editing (viewer/editor)
- **Activity tracking** for map modifications

---

## 🎮 Game Integration

The frontend integrates with the IGDB (Internet Game Database) for:
- **Game selection** when creating maps
- **Automatic metadata** fetching (cover, genres, release date)
- **Search functionality** for finding games
- **Game-based filtering** in map exploration

---

## 🔧 Configuration

### Nuxt Configuration

Key configuration in `nuxt.config.ts`:

```typescript
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxtjs/i18n',
    '@pinia/nuxt'
  ],
  
  css: [
    'vuetify/styles',
    '~/assets/css/main.css'
  ],
  
  i18n: {
    locales: [
      { code: 'en', file: 'en.json', name: 'English' },
      { code: 'fr', file: 'fr.json', name: 'Français' }
    ],
    defaultLocale: 'en'
  }
})
```

### Vuetify Configuration

Vuetify is configured for Material Design 3 theming with custom WayPoint branding.

---

## 📌 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run generate` | Generate static site |
| `npm run lint` | Run ESLint |

---

## 🤝 Backend Integration

The frontend communicates with the WayPoint backend API:

- **Authentication** endpoints for login/register
- **Maps API** for CRUD operations
- **POI management** with real-time updates
- **File uploads** for map images and POI media
- **User management** and permissions

API base URL is configured via `NUXT_PUBLIC_API_BASE` environment variable.

---

## 📌 License

WayPoint Frontend will be published under an open-source license after the final certification exam.

**Expected open-source release: July 2025.**

</details>

</br>

<details>

<summary><strong>🇫🇷 Version Française</strong></summary>

WayPoint Frontend est l'interface utilisateur du constructeur de cartes collaboratif, construite avec **Nuxt.js 3** et **Vue.js 3**. Elle fournit une application web intuitive et responsive pour créer, éditer et partager des cartes interactives avec des points d'intérêt.

Ce frontend sert d'interface pour le projet de certification développeur web/mobile full-stack (RNCP 5).

> 📅 **Publication open-source prévue pour juillet 2025.**

---

## 🎯 Fonctionnalités

- 🗺️ **Visualiseur de cartes interactif** propulsé par Leaflet.js
- 📌 **Gestion des POI** avec fonctionnalité glisser-déposer
- 🗂️ **Gestion des catégories** avec organisation hiérarchique
- 👥 **Édition collaborative** avec invitations en temps réel
- 🔍 **Filtrage avancé** par catégories, jeux et métadonnées
- 🌐 **Partage public de cartes** avec accès en lecture seule
- 📱 **Support PWA** pour la compatibilité mobile
- 🌍 **Support multi-langues** (Anglais/Français)
- 🎮 **Intégration jeux** avec base de données IGDB
- 🔐 **Authentification** via Google OAuth2 ou email/mot de passe

---

## 🚀 Stack technique

| Composant             | Technologie                  |
|-----------------------|------------------------------|
| 🌐 **Framework**      | Nuxt.js 3 + Vue.js 3        |
| 🎨 **Bibliothèque UI** | Vuetify 3                   |
| 🗺️ **Cartes**         | Leaflet.js                  |
| 🔄 **Gestion d'état** | Pinia                       |
| 🌍 **Internationalisation** | Nuxt i18n           |
| 📝 **Langage**        | TypeScript                  |
| 🎨 **Icônes**         | Material Design Icons       |
| 📡 **Client HTTP**    | Axios                       |
| 🖼️ **Images**         | Nuxt Image                  |
| ⚡ **Outil de build** | Vite                        |

---

## 🚀 Configuration de développement

### Prérequis
- Node.js 18+ et npm
- API Backend en cours d'exécution (voir dépôt backend)

### Démarrage rapide

1. **Cloner le dépôt frontend**
```bash
git clone <frontend-repository-url>
cd <frontend-repo-name>
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env
# Éditer .env avec votre configuration
```

4. **Démarrer le serveur de développement**
```bash
npm run dev
```

5. **Accéder à l'application**
- Frontend : http://localhost:3000
- Assurez-vous que l'API backend fonctionne sur http://localhost:3000

### Variables d'environnement

Créer un fichier `.env` avec les variables suivantes :

```bash
# Configuration API
NUXT_PUBLIC_API_BASE=http://localhost:3000

# Google OAuth2 (optionnel, pour l'authentification)
NUXT_GOOGLE_CLIENT_ID=votre_google_client_id
NUXT_GOOGLE_CLIENT_SECRET=votre_google_client_secret

# Secret d'authentification
NUXT_AUTH_SECRET=votre_cle_secrete_auth
```

---

## 📱 Build et déploiement

### Développement
```bash
npm run dev          # Démarrer le serveur de développement
npm run build        # Build pour la production
npm run preview      # Aperçu du build de production
npm run generate     # Générer un site statique
```

### Build de production
```bash
npm run build
npm run preview
```

### Build Docker
```bash
# Construire l'image Docker
docker build -t waypoint-frontend .

# Exécuter le conteneur
docker run -p 3000:3000 waypoint-frontend
```

---

## 📁 Structure du projet

```
frontend/
├── assets/              # Ressources statiques (CSS, images)
├── components/          # Composants Vue
│   ├── MapViewer.vue   # Composant principal de carte
│   ├── Sidebar.vue     # Sidebar de navigation
│   ├── AppHeader.vue   # En-tête d'application
│   └── ...
├── composables/         # Composables Vue
├── i18n/               # Internationalisation
│   └── locales/        # Fichiers de langue
│       ├── en.json     # Traductions anglaises
│       └── fr.json     # Traductions françaises
├── layouts/            # Layouts Nuxt
├── middleware/         # Middleware de routes
├── pages/              # Pages Nuxt (routage automatique)
│   ├── index.vue       # Page d'accueil
│   ├── login.vue       # Authentification
│   ├── my-maps.vue     # Cartes utilisateur
│   ├── explore.vue     # Cartes publiques
│   └── maps/           # Routes dynamiques de cartes
├── plugins/            # Plugins Nuxt
├── public/             # Fichiers statiques publics
├── server/             # Code côté serveur
├── stores/             # Stores Pinia
├── types/              # Définitions TypeScript
└── utils/              # Fonctions utilitaires
```

---

## 🌍 Internationalisation

L'application supporte plusieurs langues en utilisant Nuxt i18n :

- **Anglais** (par défaut) : `i18n/locales/en.json`
- **Français** : `i18n/locales/fr.json`

### Ajouter une nouvelle langue

1. Créer un nouveau fichier JSON dans `i18n/locales/`
2. Ajouter la configuration locale dans `nuxt.config.ts`
3. Mettre à jour le composant de changement de langue

### Structure des clés de traduction

```json
{
  "nav": {
    "home": "Accueil",
    "maps": "Mes Cartes",
    "explore": "Explorer"
  },
  "map": {
    "title": "Titre de la carte",
    "description": "Description"
  }
}
```

---

## 🗺️ Fonctionnalités de carte

### Visualiseur de cartes interactif
- Intégration **Leaflet.js** pour des interactions fluides
- **Contrôles de zoom** avec style personnalisé
- **Clustering de marqueurs** pour de meilleures performances
- **Icônes personnalisées** pour différentes catégories de POI

### Gestion des POI
- Création et édition **glisser-déposer** de POI
- Organisation **basée sur les catégories** avec couleurs et icônes
- **Upload d'images** pour les détails des POI
- Capacités de **recherche et filtrage**

### Fonctionnalités collaboratives
- **Invitations en temps réel** avec gestion des rôles
- Édition **basée sur les permissions** (lecteur/éditeur)
- **Suivi d'activité** pour les modifications de carte

---

## 🎮 Intégration de jeux

Le frontend s'intègre avec IGDB (Internet Game Database) pour :
- **Sélection de jeux** lors de la création de cartes
- **Récupération automatique de métadonnées** (couverture, genres, date de sortie)
- **Fonctionnalité de recherche** pour trouver des jeux
- **Filtrage basé sur les jeux** dans l'exploration de cartes

---

## 🔧 Configuration

### Configuration Nuxt

Configuration clé dans `nuxt.config.ts` :

```typescript
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/image',
    '@nuxtjs/i18n',
    '@pinia/nuxt'
  ],
  
  css: [
    'vuetify/styles',
    '~/assets/css/main.css'
  ],
  
  i18n: {
    locales: [
      { code: 'en', file: 'en.json', name: 'English' },
      { code: 'fr', file: 'fr.json', name: 'Français' }
    ],
    defaultLocale: 'en'
  }
})
```

### Configuration Vuetify

Vuetify est configuré pour le thème Material Design 3 avec la marque personnalisée WayPoint.

---

## 📌 Scripts disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Démarrer le serveur de développement |
| `npm run build` | Build pour la production |
| `npm run preview` | Aperçu du build de production |
| `npm run generate` | Générer un site statique |
| `npm run lint` | Exécuter ESLint |

---

## 🤝 Intégration backend

Le frontend communique avec l'API backend WayPoint :

- Points de terminaison **d'authentification** pour login/register
- **API Maps** pour les opérations CRUD
- **Gestion des POI** avec mises à jour en temps réel
- **Upload de fichiers** pour les images de cartes et médias POI
- **Gestion des utilisateurs** et permissions

L'URL de base de l'API est configurée via la variable d'environnement `NUXT_PUBLIC_API_BASE`.

## 📌 Licence

WayPoint Frontend sera publié sous une licence open-source après l'examen final de certification.

**Publication open-source prévue : juillet 2025.**

</details>
