import { AssetType } from '../types';

export interface AssetOption {
  label: string;
  value: AssetType;
}

export interface AssetMetadata {
  topOffset: number;
}

export const ALL_ASSETS: AssetOption[] = [
  { label: 'Défaut (Cylindre)', value: 'default' },
  { label: 'Finance (Pile de pièces)', value: 'finance' },
  { label: 'Maison / Immobilier', value: 'home' },
  { label: 'Santé / Hôpital', value: 'health' },
  { label: 'Personne / Humain', value: 'people' },
  { label: 'Voyage (Avion)', value: 'travel' },
  { label: 'Sport (Haltère)', value: 'sport' },
  { label: 'Tech (Écran)', value: 'tech' },
  { label: 'Nature (Arbre)', value: 'nature' },
];

export const ASSET_MAPPING: Record<string, AssetType[]> = {
  'Finances': ['finance', 'default'],
  'Immobilier': ['home', 'default', 'finance'],
  'Santé': ['health', 'people', 'default'],
  'Famille': ['people', 'home', 'default'],
  'Loisirs': ['travel', 'sport', 'tech', 'nature', 'default'],
  'Travail': ['tech', 'finance', 'people', 'default'],
  'Projets': ['tech', 'finance', 'default'],
};

// Asset metadata: top offset for alert signals and hover labels
export const ASSET_METADATA: Record<AssetType, AssetMetadata> = {
  'default': { topOffset: 0.8 },
  'finance': { topOffset: 0.8 }, // Will be calculated dynamically in Block.tsx based on height
  'home': { topOffset: 1.4 },
  'health': { topOffset: 0.8 },
  'people': { topOffset: 0.9 },
  'travel': { topOffset: 1.0 },
  'sport': { topOffset: 0.6 },
  'tech': { topOffset: 1.1 },
  'nature': { topOffset: 1.4 },
};

export const getAssetMetadata = (assetType: AssetType): AssetMetadata => {
  return ASSET_METADATA[assetType] || ASSET_METADATA['default'];
};

export const getAssetsForCategory = (categoryName: string): AssetOption[] => {
  // Normalize category name for matching (simple case-insensitive check could be added if needed)
  // For now, we check exact match, then try to find a partial match in keys

  let allowedTypes = ASSET_MAPPING[categoryName];

  if (!allowedTypes) {
    // Try case-insensitive match
    const key = Object.keys(ASSET_MAPPING).find(k => k.toLowerCase() === categoryName.toLowerCase());
    if (key) allowedTypes = ASSET_MAPPING[key];
  }

  if (allowedTypes) {
    // Filter ALL_ASSETS to only include allowed types, preserving the order defined in ASSET_MAPPING if possible, 
    // or just filtering.
    // Let's map allowedTypes to AssetOptions
    return allowedTypes.map(type => {
      const found = ALL_ASSETS.find(a => a.value === type);
      return found || { label: type, value: type };
    });
  }

  // Default: Return all assets if no specific mapping found
  return ALL_ASSETS;
};
