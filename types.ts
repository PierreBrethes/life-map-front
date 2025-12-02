
import * as THREE from 'three';
import { ReactThreeFiber } from '@react-three/fiber';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Catch-all for Three.js elements in JSX (mesh, group, etc.)
      // This resolves "Property does not exist" errors without needing exhaustive manual definitions
      [elemName: string]: any;
    }
  }
}

export type ItemType = 'currency' | 'text' | 'percentage' | 'date';
export type ItemStatus = 'ok' | 'warning' | 'critical';
export type AssetType = 'default' | 'finance' | 'health' | 'home' | 'nature' | 'sport' | 'tech' | 'travel' | 'people';

export interface LifeItem {
  id: string;
  name: string;
  value: string;
  type: ItemType;
  status: ItemStatus;
  assetType?: AssetType; // Le modèle 3D à afficher
  lastUpdated?: number;
  // Notification system
  notificationDismissed?: boolean;
  notificationLabel?: string;
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

export interface UserSettings {
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
}
