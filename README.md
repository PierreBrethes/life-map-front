<div align="center">

# 🏝️ LifeMap

**Visualisez votre vie comme un archipel 3D interactif.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-r181-000000?style=flat-square&logo=threedotjs)](https://threejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.x-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)

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
| **Tailwind CSS** | Styling utilitaire |
| **Axios** | Client HTTP |

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
*   Node.js 18+
*   Le backend LifeMap qui tourne (voir README backend)

### Commandes

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de développement
npm run dev
# L'app sera disponible sur http://localhost:5173
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
*   **Mode Sombre/Clair** : Adaptation de l'interface et de l'ambiance 3D.

---

<div align="center">

**Made with ❤️ and R3F**

*"Your life, visualized."*

</div>
