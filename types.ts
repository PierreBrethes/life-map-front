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
export type AssetType =
  | 'default'
  // Finances
  | 'current_account' | 'savings' | 'investments' | 'debt'
  // Immobilier
  | 'house' | 'apartment' | 'land' | 'parking'
  // Garage
  | 'car' | 'motorbike' | 'boat' | 'plane'
  // Carrière
  | 'job' | 'freelance' | 'education' | 'skill'
  // Santé
  | 'medical' | 'sport' | 'insurance' | 'ambulance' | 'hospital' | 'doctor'
  // Loisirs
  | 'travel' | 'hobby_creative' | 'hobby_tech'
  // Social
  | 'family' | 'friends' | 'pet'
  | 'bench' | 'gift' | 'phone'
  // Legacy / Fallbacks (gardés pour compatibilité si nécessaire, ou mappés)
  | 'finance' | 'health' | 'home' | 'nature' | 'tech' | 'people';

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
  // Finance sync
  syncBalanceWithBlock?: boolean; // Auto-sync balance with 3D block display
  initialBalance?: number; // Fixed starting balance for finance items
  // Real estate specific
  rentAmount?: number;           // Monthly rent
  rentDueDay?: number;           // Day of month rent is due (1-31)
  address?: string;              // Street address
  city?: string;                 // City name
  postalCode?: string;           // Postal/ZIP code
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

// ============================================
// WIDGET DATA TYPES
// ============================================

/**
 * Entry for the History widget (account transactions)
 */
export interface HistoryEntry {
  id: string;
  itemId: string;           // Link to LifeItem.id
  date: number;             // Timestamp
  value: number;            // Amount (positive = income, negative = expense)
  label: string;            // "Salaire", "Loyer", etc.
  category: 'income' | 'expense' | 'transfer';
}

/**
 * Subscription for the Subscriptions widget
 */
export interface Subscription {
  id: string;
  itemId: string;           // Linked bank account
  name: string;             // "Netflix", "Spotify"
  amount: number;           // Monthly cost (always positive)
  billingDay: number;       // Day of month (1-31)
  icon?: string;            // Lucide icon name
  color?: string;           // Brand color
  isActive: boolean;
}

/**
 * Widget type identifiers
 */
export type WidgetType =
  | 'history'
  | 'subscriptions'
  | 'goals'
  | 'maintenance'
  | 'deadlines'
  | 'property'
  | 'energy'
  | 'social-calendar'
  | 'birthdays'
  | 'contacts'
  | 'health-body'
  | 'health-appointments';

/**
 * Widget configuration for the registry
 */
export interface WidgetConfig {
  type: WidgetType;
  label: string;
  icon: string;             // Lucide icon name
  applicableTo: AssetType[];
}

/**
 * Alert for the Alerts widget
 */
export interface Alert {
  id: string;
  itemId: string;           // Linked item
  name: string;             // Alert description
  severity: 'warning' | 'critical';
  dueDate?: number;         // Optional timestamp for scheduled alerts
  isActive: boolean;
  createdAt: number;        // Timestamp when alert was created
}

// ============================================
// REAL ESTATE WIDGET DATA TYPES
// ============================================

/**
 * Property valuation for the PropertyWidget
 */
export interface PropertyValuation {
  id: string;
  itemId: string;
  estimatedValue: number;       // Current estimated value
  purchasePrice: number;        // Original purchase price
  purchaseDate: number;         // Timestamp
  // Loan details (optional)
  loanAmount?: number;          // Total loan amount
  loanMonthlyPayment?: number;  // Monthly payment
  loanInterestRate?: number;    // Annual interest rate %
  loanStartDate?: number;       // Timestamp
  loanDurationMonths?: number;  // Total loan duration
  capitalRepaid?: number;       // Capital already repaid
}

/**
 * Energy consumption entry for the EnergyWidget
 */
export interface EnergyConsumption {
  id: string;
  itemId: string;
  date: number;                 // Month timestamp
  electricityCost: number;      // Electricity cost
  electricityKwh?: number;      // kWh consumed
  gasCost: number;              // Gas cost
  gasM3?: number;               // m³ consumed
}

/**
 * Maintenance task for the MaintenanceWidget
 */
export interface MaintenanceTask {
  id: string;
  itemId: string;
  title: string;                // "Révision chaudière", "Peinture salon"
  description?: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  dueDate?: number;             // Deadline timestamp
  estimatedCost?: number;       // Estimated cost
  isCompleted: boolean;
  completedAt?: number;         // Completion timestamp
  createdAt: number;
}


// ============================================
// SOCIAL ISLAND WIDGET DATA TYPES
// ============================================

export interface SocialEvent {
  id: string;
  itemId: string;
  title: string;
  date: number;           // Timestamp
  location?: string;
  type: 'party' | 'dinner' | 'wedding' | 'birthday' | 'other';
  contactIds?: string[];  // Linked contacts
}

export interface Contact {
  id: string;
  itemId: string;         // The item this contact belongs to (e.g., "Friends" or "Family" group)
  name: string;
  birthday?: number;      // Timestamp (year can be ignored for recurrence logic)
  lastContactDate?: number; // Timestamp
  contactFrequencyDays?: number; // Desired frequency in days (e.g., 30 for once a month)
  avatar?: string;        // Optional URL or generic color
  notes?: string;
}

// ============================================
// HEALTH ISLAND WIDGET DATA TYPES
// ============================================

export interface BodyMetric {
  id: string;
  itemId: string;
  date: number;           // Timestamp
  weight: number;         // kg
  height?: number;        // cm (tracked here or in a profile)
  bodyFat?: number;       // %
  muscleMass?: number;    // % or kg
  note?: string;
}

export interface HealthAppointment {
  id: string;
  itemId: string;
  title: string;          // "Dentiste", "Vaccin Grippe"
  date: number;           // Timestamp
  type: 'doctor' | 'dentist' | 'vaccine' | 'checkup' | 'other';
  doctorName?: string;
  location?: string;
  notes?: string;
  isCompleted: boolean;
}

