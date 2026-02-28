---
name: nouveau-composant-3d
description: Creation of a new procedural 3D object for the LifeMap scene. Use this whenever you need to add new geometries, meshes, or 3D assets to the canvas.
---

# New 3D Component

Strict guidelines for creating procedural 3D components within the @react-three/fiber framework.

## When to use this skill
- When creating a new 3D file or component (e.g., a house, a map element, an item).
- When completing and adding geometries within an existing 3D component.

## How to use it
1. **Main Container**: Always wrap the procedural code of the object within a `<group>` tag. This allows for more natural positioning or resizing without compromising sub-meshes.
2. **Pre-built Helpers**: Prioritize the use of helpers or primitives provided by the `@react-three/drei` library if they help optimize, clarify, and bypass low-level `three.js` code.
3. **Component Structure**: Export the component formatted as a default function (`export default function NewComponent()`).
4. **No External Imports**: Strictly follow the "NO EXTERNAL MODELS" rule: `.gltf` or `.obj` resources are forbidden.
