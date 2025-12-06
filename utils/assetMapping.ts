import { AssetType } from '../types';

export interface AssetOption {
  label: string;
  value: AssetType;
}

export interface AssetMetadata {
  topOffset: number;
}

// GLB Asset Configuration - centralized config for all GLB-based 3D models
export interface GlbAssetConfig {
  glbPath: string;
  scale: number;
  position: [number, number, number];
  rotation: [number, number, number];
  previewScale: number; // Multiplier for carousel preview
}

// All GLB assets with their rendering configuration
export const GLB_ASSET_CONFIG: Partial<Record<AssetType, GlbAssetConfig>> = {
  // Vehicles
  'car': {
    glbPath: '/models/car.glb',
    scale: 0.02,
    position: [0, 0.3, 0],
    rotation: [0, 0, 0],
    previewScale: 0.9,
  },
  'plane': {
    glbPath: '/models/plane.glb',
    scale: 0.75,
    position: [0, 0.6, 0],
    rotation: [0, Math.PI / 2, 0],
    previewScale: 0.7,
  },
  'motorbike': {
    glbPath: '/models/motorcycle.glb',
    scale: 0.1,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    previewScale: 1.0,
  },
  'boat': {
    glbPath: '/models/ship.glb',
    scale: 0.7,
    position: [0, 0.7, 0],
    rotation: [0, 0, 0],
    previewScale: 1.0,
  },

  // Real Estate
  'house': {
    glbPath: '/models/house.glb',
    scale: 1.2,
    position: [0, 0.8, 0],
    rotation: [0, 0, 0],
    previewScale: 0.7,
  },
  'home': { // Alias
    glbPath: '/models/house.glb',
    scale: 1.2,
    position: [0, 0.8, 0],
    rotation: [0, 0, 0],
    previewScale: 0.7,
  },
  'apartment': {
    glbPath: '/models/building.glb',
    scale: 0.85,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    previewScale: 0.5,
  },
  'parking': {
    glbPath: '/models/garage.glb',
    scale: 0.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    previewScale: 0.8,
  },

  // Health
  'ambulance': {
    glbPath: '/models/ambulance.glb',
    scale: 0.025,
    position: [0, 0.2, 0],
    rotation: [0, 0, 0],
    previewScale: 0.8,
  },
  'hospital': {
    glbPath: '/models/hospital.glb',
    scale: 0.004,
    position: [0, 0.7, 0],
    rotation: [0, -Math.PI / 2, 0],
    previewScale: 0.5,
  },
  'doctor': {
    glbPath: '/models/doctor.glb',
    scale: 0.1,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    previewScale: 1.0,
  },

  // Social
  'pet': {
    glbPath: '/models/dog.glb',
    scale: 0.5,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    previewScale: 2.0,
  },
  'family': {
    glbPath: '/models/character-explorer.glb',
    scale: 0.6,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    previewScale: 1.0,
  },
  'friends': {
    glbPath: '/models/character-explorer.glb',
    scale: 0.6,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    previewScale: 1.0,
  },
  'people': {
    glbPath: '/models/character-explorer.glb',
    scale: 0.6,
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    previewScale: 1.0,
  },
};

// Helper to check if an asset type uses GLB
export const isGlbAsset = (assetType: AssetType): boolean => {
  return assetType in GLB_ASSET_CONFIG;
};

// Helper to get GLB config
export const getGlbConfig = (assetType: AssetType): GlbAssetConfig | null => {
  return GLB_ASSET_CONFIG[assetType] || null;
};


export const ALL_ASSETS: AssetOption[] = [
  // Default
  { label: 'Défaut (Cylindre)', value: 'default' },

  // Finances
  { label: 'Compte Courant (Carte)', value: 'current_account' },
  { label: 'Épargne (Coffre)', value: 'savings' },
  { label: 'Investissement (Graph/Crypto)', value: 'investments' },
  { label: 'Dette (Boulet)', value: 'debt' },

  // Immobilier
  { label: 'Maison', value: 'house' },
  { label: 'Appartement (Immeuble)', value: 'apartment' },
  { label: 'Terrain / Ferme', value: 'land' },
  { label: 'Garage / Parking', value: 'parking' },

  // Garage
  { label: 'Voiture', value: 'car' },
  { label: 'Moto', value: 'motorbike' },
  { label: 'Bateau', value: 'boat' },
  { label: 'Avion', value: 'plane' },

  // Carrière
  { label: 'Emploi (Bureau)', value: 'job' },
  { label: 'Freelance (Mallette)', value: 'freelance' },
  { label: 'Formation (Diplôme)', value: 'education' },
  { label: 'Compétence (Outil)', value: 'skill' },

  // Santé
  { label: 'Médical (Croix)', value: 'medical' },
  { label: 'Sport (Haltère)', value: 'sport' },
  { label: 'Assurance (Bouclier)', value: 'insurance' },
  { label: 'Ambulance', value: 'ambulance' },
  { label: 'Hôpital', value: 'hospital' },
  { label: 'Docteur', value: 'doctor' },

  // Loisirs
  { label: 'Voyage (Globe)', value: 'travel' },
  { label: 'Art / Musique', value: 'hobby_creative' },
  { label: 'Gaming / Tech', value: 'hobby_tech' },

  // Social
  { label: 'Famille (Maison)', value: 'family' },
  { label: 'Amis (Groupe)', value: 'friends' },
  { label: 'Animal (Patte)', value: 'pet' },
  { label: 'Banc / Café', value: 'bench' },
  { label: 'Cadeau / Gâteau', value: 'gift' },
  { label: 'Téléphone / Lettre', value: 'phone' },

  // Legacy (pour compatibilité)
  { label: 'Finance (Pile)', value: 'finance' },
  { label: 'Tech (Écran)', value: 'tech' },
  { label: 'Nature (Arbre)', value: 'nature' },
];

export const ASSET_MAPPING: Record<string, AssetType[]> = {
  'Finances': ['current_account', 'savings', 'investments', 'debt', 'finance', 'default'],
  'Immobilier': ['house', 'apartment', 'land', 'parking', 'default'],
  'Garage': ['car', 'motorbike', 'boat', 'plane', 'default'],
  'Travail': ['job', 'freelance', 'education', 'skill', 'tech', 'default'],
  'Santé': ['medical', 'sport', 'insurance', 'ambulance', 'hospital', 'doctor', 'health', 'default'],
  'Loisirs': ['travel', 'hobby_creative', 'hobby_tech', 'sport', 'nature', 'default'],
  'Famille': ['family', 'friends', 'pet', 'people', 'default'],
  'Social': ['family', 'friends', 'pet', 'bench', 'gift', 'phone', 'people', 'default'],
  'Projets': ['travel', 'freelance', 'hobby_creative', 'default'],
};

// Asset metadata: top offset for alert signals and hover labels
export const ASSET_METADATA: Record<AssetType, AssetMetadata> = {
  'default': { topOffset: 0.8 },

  // Finances
  'current_account': { topOffset: 0.6 },
  'savings': { topOffset: 1.0 },
  'investments': { topOffset: 1.2 },
  'debt': { topOffset: 0.8 },
  'finance': { topOffset: 0.8 }, // Legacy stack

  // Immobilier
  'house': { topOffset: 1.4 },
  'apartment': { topOffset: 2.5 }, // Immeuble haut
  'land': { topOffset: 0.6 },
  'parking': { topOffset: 0.8 },
  'home': { topOffset: 1.4 }, // Legacy

  // Garage
  'car': { topOffset: 0.8 },
  'motorbike': { topOffset: 0.7 },
  'boat': { topOffset: 1.0 },
  'plane': { topOffset: 1.2 },

  // Carrière
  'job': { topOffset: 2.0 }, // Tour
  'freelance': { topOffset: 0.7 },
  'education': { topOffset: 0.6 },
  'skill': { topOffset: 0.8 },

  // Santé
  'medical': { topOffset: 0.8 },
  'sport': { topOffset: 0.6 },
  'insurance': { topOffset: 0.9 },
  'ambulance': { topOffset: 0.6 },
  'hospital': { topOffset: 1.0 },
  'doctor': { topOffset: 0.5 },
  'health': { topOffset: 0.8 }, // Legacy

  // Loisirs
  'travel': { topOffset: 1.0 },
  'hobby_creative': { topOffset: 0.9 },
  'hobby_tech': { topOffset: 1.1 },
  'tech': { topOffset: 1.1 }, // Legacy
  'nature': { topOffset: 1.4 }, // Legacy

  // Social
  'family': { topOffset: 1.2 },
  'friends': { topOffset: 1.0 },
  'pet': { topOffset: 0.6 },
  'bench': { topOffset: 0.6 },
  'gift': { topOffset: 0.8 },
  'phone': { topOffset: 0.7 },
  'people': { topOffset: 0.9 }, // Legacy
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
