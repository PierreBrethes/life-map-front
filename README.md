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

LifeMap transforme vos **catégories de vie** (Finance, Santé, Social, etc.) en **îles flottantes** dans un monde 3D isométrique à la *SimCity 2000*.

Chaque **bloc** sur une île représente un élément de votre vie : un compte bancaire, un objectif fitness, une relation importante. Suivez leur statut, créez des liens entre eux, et gardez une vue d'ensemble sur ce qui compte vraiment.

> 🎮 **Gamifiez votre vie** - Pas de tableaux Excel. Pas de listes infinies. Juste des îles, des blocs, et vous.

---

## 🖼️ Aperçu

| Vue d'ensemble | Détail d'un bloc |
|---|---|
| *Vos îles disposées dans un océan 3D* | *Sidebar avec widgets contextuels* |

---

## 🚀 Installation

### Prérequis

- **Node.js** 18+ 
- **npm** ou **yarn**
- **Backend LifeMap API** (optionnel, pour la persistance)

### Lancer le projet

```bash
# Cloner le repo
git clone https://github.com/votre-username/life-map-front.git
cd life-map-front

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev
```

L'app sera disponible sur `http://localhost:5173`

### Variables d'environnement

Créez un fichier `.env.local` si besoin :

```env
# Optionnel : Clé API Gemini pour les fonctionnalités IA
VITE_GEMINI_API_KEY=your_key_here
```

---

## 🏗️ Stack Technique

| Technologie | Rôle |
|---|---|
| **React 19** | UI moderne avec les dernières features |
| **@react-three/fiber** | Rendu 3D déclaratif (Three.js) |
| **@react-three/drei** | Helpers 3D (caméra, ombres, contrôles) |
| **Zustand** | State management léger |
| **React Query** | Fetching & cache de données |
| **Tailwind CSS** | Styling utilitaire |
| **TypeScript** | Typage strict |

---

## 📁 Structure du projet

```
src/
├── components/
│   ├── Experience.tsx      # Scene 3D principale
│   ├── Island.tsx          # Île = catégorie
│   ├── Block.tsx           # Bloc = item
│   ├── CameraRig.tsx       # Contrôle caméra isométrique
│   ├── Connections.tsx     # Liens entre blocs
│   ├── sidebar/            # Sidebar de détail
│   ├── widgets/            # Widgets contextuels
│   └── assets/             # Assets 3D procéduraux
├── hooks/                  # Custom hooks (data, mutations)
├── store/                  # Zustand store
├── utils/                  # Helpers (layout, registry)
└── types.ts                # Types TypeScript
```

---

## 🎨 Design Philosophy

- **Low-poly isométrique** : Esthétique minimaliste inspirée des jeux de gestion
- **Glassmorphism** : UI overlay avec blur et transparence
- **Dark/Light mode** : Thème adaptatif
- **Pas de modèles 3D externes** : Tout est généré procéduralement avec des primitives Three.js

---

## 🔧 Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement (Vite) |
| `npm run build` | Build de production |
| `npm run preview` | Prévisualiser le build |

---

## 📝 License

MIT © LifeMap

---

<div align="center">

**Made with ❤️ and Three.js**

*"Your life, visualized."*

</div>
