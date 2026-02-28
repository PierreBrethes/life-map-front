# Dashboard Unifié "Taquito Spotlight" - Design Document

## 1. Objectif du projet
Créer un centre de commandement minimaliste et piloté par l'IA (façon "Spotlight" d'Apple ou "Raycast") se superposant directement au-dessus du canvas 3D existant (`LifeMap`). L'utilisateur interagit principalement via un grand champ de saisie central pour parler à "Taquito", sans avoir à naviguer dans des menus complexes.

## 2. Décisions Architecturales

### 2.1 Interface Utilisateur (UI)
*   **Approche "En faire le moins possible"** : L'écran reste 100% de la 3D par défaut.
*   **Déclencheur** : Une simple touche (raccourci clavier style `Cmd+K` ou `Espace`) ou le bouton de discussion de l'assistant fait apparaître le Dashboard.
*   **Aspect Visuel ("Bento UI / Glassmorphism")** : 
    *   Le fond 3D s'estompe légèrement `backdrop-blur` et overlay sombre.
    *   La barre de saisie (Prompt) est immense, centrée majestueusement au milieu.
    *   En dessous, une zone d'affichage dynamique (grille Bento) permet d'afficher des modules (Calendrier, Tâches, Réponse texte) selon le retour de l'Agent.

### 2.2 Composants React à créer/modifier
1.  **`components/CommandPaletteHub.tsx`** : Le nouveau composant géant. Il va contenir la logique d'état (ouvert/fermé), l'input texte géant, et le conteneur pour les widgets enfants.
2.  **`components/UIOverlay.tsx`** : 
    *   Sera allégé (`UIOverlay` actuel contient peut-être trop de HUD classique). 
    *   Il intègrera le déclencheur pour ouvrir le `CommandPaletteHub`.
3.  **`components/widgets/`** : Un nouveau dossier pour les petits composants "Bento" qui viendront se loger sous la barre (ex: `AgendaWidget.tsx`, `TaskListWidget.tsx`). *Ces widgets recevront des props et ne seront affichés que si l'Agent le décide.*

### 2.3 Flux de données & Interaction Agent
*   L'input central sera directement branché au hook `useAgentStream` (qui est actuellement appelé dans `GameLayout.tsx`). 
*   **Évènement** : `sendMessage("Ce que je tape")` est envoyé au backend `life-map-back` (ADK Agent).
*   **Représentation** : La réponse de l'Agent s'affichera de manière élégante dans un des blocs Bento, et d'autres blocs afficheront "magiquement" le calendrier si on le demande.

## 3. Contraintes & Règles
*   **Zéro Modélisation externe (\`NO EXTERNAL MODELS\`)** respectée car tout le reste concernant la 3D (`GameLayout`, islands) reste intact.
*   **Stack** : React, TypeScript, TailwindCSS (pour toute la logique de positionnement absolut, backdrop-blur, et Grid Bento).

## 4. Stratégie d'implémentation (Prochaines étapes)
1.  **UI/UX Pro Max** : Générer une palette de couleurs / design system basée sur la maquette Stitch (Dark Theme Bento).
2.  Mettre en place la structure du `CommandPaletteHub.tsx`.
3.  L'importer et l'ancrer dans l'application avec un joli `transition-all duration-300`.
4.  Le relier à la logique de messagerie de Gemini (qui existe déjà via `useAgentStream`).
