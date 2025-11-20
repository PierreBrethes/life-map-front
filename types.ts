
export type ItemType = 'currency' | 'text' | 'percentage' | 'date';
export type ItemStatus = 'ok' | 'warning' | 'critical';
export type AssetType = 'default' | 'finance' | 'health' | 'home' | 'nature' | 'sport' | 'tech' | 'travel';

export interface LifeItem {
  id: string;
  name: string;
  value: string;
  type: ItemType;
  status: ItemStatus;
  assetType?: AssetType; // Le modèle 3D à afficher
  lastUpdated?: number;
}

export interface Category {
  category: string;
  color: string;
  icon?: string; // Nom de l'icone Lucide
  items: LifeItem[];
}

export interface SelectionState {
  categoryName: string;
  item: LifeItem;
}

export interface Dependency {
  id: string;
  fromCategory: string;
  fromItem: string;
  fromId?: string;
  toCategory: string;
  toItem: string;
  toId?: string;
}
