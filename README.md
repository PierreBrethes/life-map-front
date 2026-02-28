<div align="center">

# 🏝️ LifeMap

**Visualisez votre vie comme un archipel 3D interactif.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-r181-000000?style=flat-square&logo=threedotjs)](https://threejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker)](https://www.docker.com)

</div>

---

## ✨ Concept

LifeMap transforme vos **catégories de vie** (Finance, Santé, Social, etc.) en **îles flottantes** dans un monde 3D isométrique.

Chaque **bloc** sur une île représente un élément de votre vie : un compte bancaire, une relation importante, un bien immobilier. Suivez leur statut, créez des liens entre eux, et gardez une vue d'ensemble sur ce qui compte vraiment.

> 🎮 **Gamifiez votre vie** - Pas de tableaux Excel. Pas de listes infinies. Juste des îles, des blocs, et vous.

---

## 🏗️ Stack Technique

| Technologie | Rôle |
|---|---|
| **React 19** | UI moderne avec les dernières features |
| **@react-three/fiber (R3F)** | Rendu 3D déclaratif (Three.js) |
| **@react-three/drei** | Helpers 3D (caméra, ombres, contrôles) |
| **Zustand** | Gestion d'état global du frontend |
| **React Query** | Fetching & cache de données API |
| **Recharts** | Visualisation de données (Graphiques widgets) |
| **shadcn/ui** | Composants UI accessibles (Dialog, Card, etc.) |
| **Tailwind CSS** | Styling utilitaire avec tokens CSS dynamiques |
| **Axios** | Client HTTP |
| **Google ADK** | Backend de l'agent IA (*Taquito*) |

---

## 📁 Structure du projet

```
src/
├── api/                # Services API (Axios calls)
├── components/
│   ├── Experience.tsx      # Scene 3D principale
│   ├── Island.tsx          # Île = catégorie (Finance, Health, etc.)
│   ├── Block.tsx           # Bloc = item interactif
│   ├── CameraRig.tsx       # Contrôle caméra isométrique
│   ├── sidebar/            # Sidebar de détail (Overlay 2D)
│   ├── widgets/            # Widgets fonctionnels (History, Goals, etc.)
│   └── assets/             # Assets 3D procéduraux (Glb/Procedural)
├── hooks/              # Custom hooks (useItems, useCategories)
├── store/              # Zustand store (Sélection, UI state)
├── utils/              # Helpers (layout, registry)
└── types.ts            # Types TypeScript partagés avec le back
```

---

## 🚀 Installation & Démarrage

### Prérequis
*   Docker & Docker Compose
*   Variables d'environnement dans `life-map-back/.env` (dont `GOOGLE_API_KEY`)
*   Variables dans `life-map-front/.env` (dont `VITE_API_BASE_URL=http://localhost:8000/api`)

### Lancer en développement (recommandé)

```bash
# Depuis la racine du workspace (dossier parent contenant docker-compose.dev.yml)
docker compose -f docker-compose.dev.yml up --build

# L'app sera disponible sur :
# Frontend : http://localhost:5173
# Backend  : http://localhost:8000
```

### Lancer localement sans Docker (frontend seul)

```bash
cd life-map-front
npm install
npm run dev
```

---

## 🔧 Features Clés

*   **Rendu 3D Procédural** : Génération des maisons, véhicules et objets sans charger de lourds modèles externes.
*   **Widgets Interactifs** :
    *   **Finance** : Historique, Abonnements.
    *   **Santé** : Suivi poids (Graphique Recharts), Carnet de santé.
    *   **Social** : Contacts et Fréquence.
    *   **Garage** : Maintenance véhicules.
*   **Système d'Alertes** : Feedback visuel sur les blocs (Couleur/Pulsation) en cas de statut `WARNING` ou `CRITICAL`.
*   **Mode Sombre/Clair** : Adaptation de l'interface et de l'ambiance 3D. Les tokens CSS (`global.css`) sont synchronisés et affectent toutes les modales (Dialog portals) via `document.documentElement.classList`.

---

## 🤖 Taquito — Assistant IA

**Taquito** est l'assistant IA intégré à LifeMap, propulsé par le **Google ADK** (côté backend).

*   **Accès** : Bouton `Taquito` dans la barre de navigation ou raccourci `Ctrl + K` / `Cmd + K`.
*   **Hub Glassmorphism** : Un panneau modal avec un design Bento Grid, totalement adaptatif au thème (clair/sombre).
*   **Conversation contextuelle** : L'historique complet de la session est conservé et affiché dans des bulles de chat différenciées (Utilisateur à droite, Taquito à gauche).
*   **Streaming** : Les réponses de l'agent s'affichent en temps réel grâce au streaming SSE (`/run_sse`).
*   **Widgets Bento** : Le Hub affiche des widgets (Agenda, Tâches) au dessus de l'interface de conversation.

---

<div align="center">

**Made with ❤️ and R3F**

*"Your life, visualized."*

</div>
