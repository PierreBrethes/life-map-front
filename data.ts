
import { Category, Dependency } from './types';

export const DATA: Category[] = [
  { 
    category: 'Finances', 
    color: '#6366f1', // Indigo
    icon: 'Wallet',
    items: [
      { id: 'f1', name: 'Boursorama', value: '12000', type: 'currency', status: 'ok', assetType: 'finance' }, 
      { id: 'f2', name: 'PEA', value: '5000', type: 'currency', status: 'warning', assetType: 'finance' }
    ] 
  },
  { 
    category: 'Santé', 
    color: '#10b981', // Emerald
    icon: 'Activity',
    items: [
      { id: 's1', name: 'Généraliste', value: 'Dr. House', type: 'text', status: 'ok', assetType: 'health' }, 
      { id: 's2', name: 'Mutuelle', value: 'Alan', type: 'text', status: 'ok', assetType: 'health' }
    ] 
  },
  { 
    category: 'Immobilier', 
    color: '#ec4899', // Pink
    icon: 'Home',
    items: [
      { id: 'i1', name: 'Maison', value: 'Nantes', type: 'text', status: 'ok', assetType: 'home' },
      { id: 'i2', name: 'Studio', value: 'Paris', type: 'text', status: 'critical', assetType: 'home' } 
    ] 
  },
  {
    category: 'Famille',
    color: '#f59e0b', // Amber
    icon: 'Users',
    items: [
        { id: 'fa1', name: 'Enfants', value: '2', type: 'text', status: 'ok', assetType: 'nature' },
        { id: 'fa2', name: 'Vacances', value: 'Japon', type: 'text', status: 'ok', assetType: 'travel' }
    ]
  }
];

// Liens architecturaux entre les éléments
export const INITIAL_DEPENDENCIES: Dependency[] = [
    {
        id: 'dep-1',
        fromCategory: 'Finances',
        fromItem: 'Boursorama',
        fromId: 'f1',
        toCategory: 'Immobilier',
        toItem: 'Maison',
        toId: 'i1'
    },
    {
        id: 'dep-2',
        fromCategory: 'Finances',
        fromItem: 'PEA',
        fromId: 'f2',
        toCategory: 'Famille',
        toItem: 'Vacances',
        toId: 'fa2'
    },
    {
        id: 'dep-3',
        fromCategory: 'Santé',
        fromItem: 'Mutuelle',
        fromId: 's2',
        toCategory: 'Famille',
        toItem: 'Enfants',
        toId: 'fa1'
    }
];
