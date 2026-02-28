---
name: mise-a-jour-ui-overlay
description: Update or creation of a 2D user interface (UI) overlaid on top of the 3D canvas. Use this to edit, create, or fix HTML elements (menus, buttons, texts) styled with TailwindCSS.
---

# UI Overlay Update

Instructions for correctly configuring and coding the HTML/Tailwind overlay acting on top of the React Three Fiber spatial scene.

## When to use this skill
- Whenever a modification to the 2D HTML/TailwindCSS layers (Overlay UI) is requested (details panel, statuses, alerts).
- To create an interactive UI isolated from bordering camera interactions (pointer events).

## How to use it
1. **Pointer Events**: Ensure `pointer-events-auto` is explicitly implemented on the view components requiring interaction. This is fundamental because if the parent wrapper containing the 3D canvas restricts interactions (`pointer-events-none`), the UI will not respond to any click or hover.
2. **Colors / Themes (Light & Dark)**: Think autonomously (without waiting for specific instructions) to cover the `dark:` class in your stylized Tailwind components for theme adaptation, as well as the normal mode. Beware of potential chromatic conflicts.
3. **Visual Rendering**: Aim as much as possible towards the 'Glassmorphism' aspect (`backdrop-blur`) advocated by the global business philosophy.
