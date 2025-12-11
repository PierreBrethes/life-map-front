import { AssetType, WidgetConfig, WidgetType } from '../types';

/**
 * Registry of all available widgets and their applicable asset types
 */
export const WIDGET_REGISTRY: WidgetConfig[] = [
  {
    type: 'history',
    label: 'Historique',
    icon: 'LineChart',
    applicableTo: ['current_account', 'savings', 'investments', 'finance'],
  },
  {
    type: 'recurring-flows',
    label: 'Flux Récurrents',
    icon: 'RefreshCw',
    applicableTo: ['current_account', 'savings', 'finance'],
  },
  {
    type: 'maintenance',
    label: 'Entretien',
    icon: 'Wrench',
    applicableTo: ['car', 'motorbike', 'boat', 'plane', 'house', 'apartment'],
  },
  {
    type: 'property',
    label: 'Patrimoine',
    icon: 'Home',
    applicableTo: ['house', 'apartment'],
  },
  {
    type: 'energy',
    label: 'Énergie',
    icon: 'Zap',
    applicableTo: ['house', 'apartment'],
  },
  {
    type: 'social-calendar',
    label: 'Calendrier Social',
    icon: 'CalendarHeart',
    applicableTo: ['family', 'friends', 'pet'],
  },
  {
    type: 'contacts',
    label: 'Contacts & Anniversaires',
    icon: 'Users',
    applicableTo: ['family', 'friends'],
  },
  {
    type: 'health-body',
    label: 'Suivi Corporel',
    icon: 'Activity',
    applicableTo: ['medical', 'sport', 'health', 'people'],
  },
  {
    type: 'health-appointments',
    label: 'Carnet de Santé',
    icon: 'Stethoscope',
    applicableTo: ['medical', 'health', 'insurance'],
  },
];

/**
 * Get widgets applicable to a specific asset type
 */
export function getWidgetsForAssetType(assetType: AssetType | undefined): WidgetConfig[] {
  if (!assetType) return [];
  return WIDGET_REGISTRY.filter(widget => widget.applicableTo.includes(assetType));
}

/**
 * Check if a specific widget is available for an asset type
 */
export function isWidgetAvailable(widgetType: WidgetType, assetType: AssetType | undefined): boolean {
  if (!assetType) return false;
  const widget = WIDGET_REGISTRY.find(w => w.type === widgetType);
  return widget ? widget.applicableTo.includes(assetType) : false;
}
