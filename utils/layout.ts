
import { Category } from '../types';

export const ITEM_SPACING = 1.5;
export const ISLAND_GAP = 7.0; // Espace un peu plus grand pour laisser passer les câbles
export const ISLAND_ROW_SIZE = 2;

// Calcule la position (X, Z) du centre d'une île selon son index dans la liste des catégories
export const getIslandPosition = (index: number, totalCategories: number): [number, number, number] => {
  const xIndex = index % ISLAND_ROW_SIZE;
  const zIndex = Math.floor(index / ISLAND_ROW_SIZE);
  
  const offsetX = (ISLAND_ROW_SIZE - 1) * ISLAND_GAP * 0.5;
  const offsetZ = (Math.ceil(totalCategories / ISLAND_ROW_SIZE) - 1) * ISLAND_GAP * 0.5;

  const x = (xIndex * ISLAND_GAP) - offsetX;
  const z = (zIndex * ISLAND_GAP) - offsetZ;

  return [x, 0, z];
};

// Calcule la position locale (X, Z) d'un item au sein de son île (par rapport au centre de l'île)
export const getItemLocalPosition = (itemIndex: number, totalItems: number): [number, number, number] => {
  const cols = Math.ceil(Math.sqrt(totalItems)) || 1;
  const rows = Math.ceil(totalItems / cols) || 1;

  const colIndex = itemIndex % cols;
  const rowIndex = Math.floor(itemIndex / cols);

  const xOffset = (colIndex - (cols - 1) / 2) * ITEM_SPACING;
  // Invert Z logic implies rows grow towards viewer usually, kept consistent with original logic
  const zOffset = (rowIndex - (rows - 1) / 2) * ITEM_SPACING;

  return [xOffset, 0, zOffset];
};

// Calcule la position absolue dans le monde 3D d'un item spécifique
export const getItemWorldPosition = (
  categoryName: string, 
  itemName: string, 
  data: Category[],
  itemId?: string
): [number, number, number] | null => {
  
  const catIndex = data.findIndex(c => c.category === categoryName);
  if (catIndex === -1) return null;

  const category = data[catIndex];
  
  let itemIndex = -1;
  
  if (itemId) {
    itemIndex = category.items.findIndex(i => i.id === itemId);
  }

  // Fallback to name search if ID not provided or not found
  if (itemIndex === -1) {
    itemIndex = category.items.findIndex(i => i.name === itemName);
  }
  
  if (itemIndex === -1) return null;

  const islandPos = getIslandPosition(catIndex, data.length);
  const localPos = getItemLocalPosition(itemIndex, category.items.length);

  return [
    islandPos[0] + localPos[0],
    0,
    islandPos[2] + localPos[2]
  ];
};
