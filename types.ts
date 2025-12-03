import * as THREE from 'three';

// Explicitly extend JSX.IntrinsicElements to include React Three Fiber elements
// This resolves "Property does not exist on type 'JSX.IntrinsicElements'" errors
declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Core
      group: any;
      mesh: any;
      
      // Geometries
      sphereGeometry: any;
      cylinderGeometry: any;
      capsuleGeometry: any;
      boxGeometry: any;
      coneGeometry: any;
      planeGeometry: any;
      circleGeometry: any;
      torusGeometry: any;
      dodecahedronGeometry: any;
      shapeGeometry: any;
      edgesGeometry: any;
      
      // Materials
      meshStandardMaterial: any;
      lineBasicMaterial: any;
      
      // Lines
      lineSegments: any;

      // Lights & Scene
      ambientLight: any;
      directionalLight: any;
      fog: any;
      color: any; // Used for attach="background"

      // Catch-all
      [elemName: string]: any;
    }
  }

  // Augment React.JSX namespace for React 18+ support
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        // Core
        group: any;
        mesh: any;
        
        // Geometries
        sphereGeometry: any;
        cylinderGeometry: any;
        capsuleGeometry: any;
        boxGeometry: any;
        coneGeometry: any;
        planeGeometry: any;
        circleGeometry: any;
        torusGeometry: any;
        dodecahedronGeometry: any;
        shapeGeometry: any;
        edgesGeometry: any;
        
        // Materials
        meshStandardMaterial: any;
        lineBasicMaterial: any;
        
        // Lines
        lineSegments: any;

        // Lights & Scene
        ambientLight: any;
        directionalLight: any;
        fog: any;
        color: any;

        // Catch-all
        [elemName: string]: any;
      }
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
