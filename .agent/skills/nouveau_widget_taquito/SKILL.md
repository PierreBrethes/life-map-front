---
name: nouveau-widget-taquito
description: Création ou modification d'un composant "Bento Widget" pour le CommandPaletteHub de Taquito. Utile pour ajouter des cartes analytiques ou de l'intégration de données dynamiques (Agendas, Tâches, etc.).
---

# 🤖 Création de Widgets Taquito (Bento Grid)

Ce guide décrit la marche à suivre stricte pour ajouter de nouveaux "Widgets Bento" à l'interface conversationnelle et globale **Taquito** (`CommandPaletteHub.tsx`).

## Règles de UI & de Thème
Tous les composants doivent parfaitement s'intégrer au Design System Glassmorphism et supporter le clair/sombre (`light` et `dark` de Tailwind).

1. **Card Layout & Style**
   - Utiliser `<Card>`, `<CardHeader>`, et `<CardContent>` du dossier `ui/card`.
   - Classes de base Tailwind à injecter dans `<Card>` :
      `bg-card/60 border-border/50 backdrop-blur-md hover:bg-card/80 transition-colors h-full shadow-lg`

2. **Typographie**
   - Le titre de la carte (`<CardTitle>`) doit avoir une bordure basse, une icône de couleur primary, et être en majuscules avec un espacement (tracking) :
      `text-sm font-semibold tracking-widest text-muted-foreground`
   - Le contenu (`<CardContent>`) doit utiliser `text-foreground/80` (pour un look tamisé) et la couleur `primary` pour les tags ou highlights.

3. **Animations**
   - Toujours emballer la tuile (Card) dans une `div` d'animation d'entrée :
      `<div className="animate-in fade-in zoom-in-95 duration-700 delay-[XXX]ms fill-mode-both">`
   - Attention à décaler le `delay` (ex: `delay-100`, `delay-200`, `delay-300`) en fonction de la position du widget pour faire un effet cascade.

## Processus d'Intégration
1. **Création du fichier** (si le widget est complexe, isole-le dans un fichier ex: `components/widgets/TaquitoAgendaWidget.tsx`).
2. **Hook de Data** : N'utilise `fetch` directement que si nécessaire, mais privilégie les custom hooks (React Query) dans `hooks/useLifeMapData.ts` associés à l'API FastAPI du backend.
   - Par exemple, pour les tâches: `const { data: tasks } = useTasks();`
3. **Mise à jour du Grid** : Intégrer le composant crée dans la grid css (`<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">`) du `CommandPaletteHub.tsx`. Assure-toi que les proportions et le flex-box ne sont pas rompus.

## Checklist d'auto-vérification
- [ ] L'élément utilise `text-primary` pour les icônes d'accent au lieu de `text-accent`.
- [ ] Les bordures utilisent `border-border/50` (support natif du mode sombre) et PAS explicitement `border-white/10`.
- [ ] Le fond utilise `bg-card/60` ou un équivalent sémantique, PAS `bg-black` ou `bg-white/5`.
- [ ] Interactions minimalistes (survol, pointer, changement subtil de couleur `group-hover:text-primary`).

## Notes de Futur (Feature Ideas)
Ce modèle servira particulièrement pour implémenter :
- Le calendrier synchronisé Google.
- Les To-Do list manuelles ou générées par l'agent.
- Les graphiques miniatures (Recharts).
