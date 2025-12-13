import React, { useMemo, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { LifeItem, WidgetType } from '../../types';
import SidebarHeader from './SidebarHeader';
import StatCard from './StatCard';
import WidgetZone from './WidgetZone';
import { useWidgetData } from '../../hooks/useWidgetData';
import { useLifeMapMutations } from '../../hooks/useLifeMapMutations';
import { isWidgetAvailable } from '../../utils/widgetRegistry';
import { isFinanceAssetType } from '../../hooks/useFinanceBalance';
import { parseValueToNumber } from '../../utils/formatters';
import { useStore } from '../../store/useStore';
import { useSettings } from '../../hooks/useLifeMapData';
import GarageStatCards from './GarageStatCards';

// Real estate asset types
const REAL_ESTATE_TYPES = ['house', 'apartment'];

// Garage/Vehicle asset types
const GARAGE_TYPES = ['car', 'motorbike', 'boat', 'plane'];

interface ItemDetailSidebarProps {
  categoryName: string;
  categoryColor: string;
  item: LifeItem;
}

const ItemDetailSidebar: React.FC<ItemDetailSidebarProps> = ({
  categoryName,
  categoryColor,
  item,
}) => {
  // Global Store
  const { setSelection } = useStore();

  // Data Hooks
  const { data: settings } = useSettings();
  const { updateItem, deleteItem } = useLifeMapMutations();

  const isDark = settings?.theme === 'dark';

  // Handlers replacement for props
  const onClose = () => setSelection(null);

  const onUpdateItem = (updates: Partial<LifeItem>) => {
    updateItem.mutate({ id: item.id, payload: updates });
  };

  const onDelete = () => {
    if (window.confirm(`Supprimer ${item.name} ?`)) {
      deleteItem.mutate(item.id);
      setSelection(null);
    }
  };

  // --- DATA LOADING ---
  // Only fetching data needed for Header and StatCards
  const {
    history, subscriptions,
    alerts
  } = useWidgetData(item.id);

  // --- DERIVED STATE ---

  const activeAlertSeverity = useMemo(() => {
    const active = alerts.filter(a => a.isActive);
    if (active.some(a => a.severity === 'critical')) return 'critical';
    if (active.some(a => a.severity === 'warning')) return 'warning';
    return 'ok';
  }, [alerts]);

  // Sync item status with active alerts
  useEffect(() => {
    if (activeAlertSeverity !== item.status) {
      onUpdateItem({
        status: activeAlertSeverity,
        notificationDismissed: activeAlertSeverity === 'ok'
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAlertSeverity, item.status]);


  // --- HANDLERS ---

  const handleToggleSyncBalance = (sync: boolean) => {
    if (sync && item.initialBalance === undefined) {
      onUpdateItem({
        syncBalanceWithBlock: sync,
        initialBalance: parseValueToNumber(item.value)
      });
    } else {
      onUpdateItem({ syncBalanceWithBlock: sync });
    }
  };

  const handleResetBalance = () => {
    onUpdateItem({ initialBalance: 0, syncBalanceWithBlock: false });
  };

  const handleUpdateName = (name: string) => onUpdateItem({ name });
  const handleUpdateValue = (value: string) => onUpdateItem({ value });

  // --- RENDER HELPERS ---
  const isFinanceType = isFinanceAssetType(item.assetType);
  const isRealEstate = item.assetType && REAL_ESTATE_TYPES.includes(item.assetType);

  const showHistoryWidget = isWidgetAvailable('history', item.assetType);
  const showRecurringFlowsWidget = isWidgetAvailable('recurring-flows', item.assetType);
  const showPropertyWidget = isWidgetAvailable('property', item.assetType);
  const showEnergyWidget = isWidgetAvailable('energy', item.assetType);
  const showMaintenanceWidget = isWidgetAvailable('maintenance', item.assetType);
  const showSocialCalendarWidget = isWidgetAvailable('social-calendar', item.assetType);
  const showContactsWidget = isWidgetAvailable('contacts', item.assetType);
  const showBodyTrackingWidget = isWidgetAvailable('health-body', item.assetType);
  const showHealthAppointmentsWidget = isWidgetAvailable('health-appointments', item.assetType);
  const showConnectionsWidget = isWidgetAvailable('connections', item.assetType);

  // Compute available widgets for drag/drop zone
  const availableWidgets = useMemo(() => {
    const widgets: WidgetType[] = [];
    widgets.push('alerts'); // Always available
    if (showHistoryWidget) widgets.push('history');
    if (showRecurringFlowsWidget) widgets.push('recurring-flows');
    if (showPropertyWidget) widgets.push('property');
    if (showEnergyWidget) widgets.push('energy');
    if (showMaintenanceWidget) widgets.push('maintenance');
    if (showSocialCalendarWidget) widgets.push('social-calendar');
    if (showContactsWidget) widgets.push('contacts');
    if (showBodyTrackingWidget) widgets.push('health-body');
    if (showHealthAppointmentsWidget) widgets.push('health-appointments');
    if (showConnectionsWidget) widgets.push('connections');
    return widgets;
  }, [
    showHistoryWidget, showRecurringFlowsWidget, showPropertyWidget,
    showEnergyWidget, showMaintenanceWidget, showSocialCalendarWidget,
    showContactsWidget, showBodyTrackingWidget, showHealthAppointmentsWidget,
    showConnectionsWidget
  ]);

  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
  const isGarage = item.assetType && GARAGE_TYPES.includes(item.assetType);

  // Calculate days until next critical deadline for garage items
  const nextDeadline = useMemo(() => {
    const now = Date.now();
    const activeAlertsWithDate = alerts
      .filter(a => a.isActive && a.dueDate && a.dueDate > now)
      .sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0));

    if (activeAlertsWithDate.length === 0) return null;

    const nextAlert = activeAlertsWithDate[0];
    const daysUntil = Math.ceil((nextAlert.dueDate! - now) / (1000 * 60 * 60 * 24));
    return {
      days: daysUntil,
      severity: nextAlert.severity,
      name: nextAlert.name
    };
  }, [alerts]);

  // For non-garage, non-finance, non-real-estate items (fallback)
  const healthValue = 85; // Mock
  const activityCount = history.length || 0;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <SidebarHeader
        categoryName={categoryName}
        categoryColor={categoryColor}
        item={item}
        onDelete={onDelete}
        onClose={onClose}
        onUpdateName={handleUpdateName}
        onUpdateValue={handleUpdateValue}
        onUpdateItem={onUpdateItem}
        onResetBalance={handleResetBalance}
        isDark={isDark}
        isFinanceType={isFinanceType}
        history={history}
        subscriptions={subscriptions}
        onToggleSyncBalance={handleToggleSyncBalance}
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Garage-specific stat cards */}
        {isGarage && (
          <GarageStatCards
            nextDeadline={nextDeadline}
            item={item}
            onUpdateItem={onUpdateItem}
            isDark={isDark}
          />
        )}

        {/* Default stat cards for non-finance, non-real-estate, non-garage */}
        {!isFinanceType && !isRealEstate && !isGarage && (
          <div className="flex gap-3">
            <StatCard
              label="Santé"
              icon={<Icons.Activity size={12} />}
              value={`${healthValue}%`}
              progress={healthValue}
              variant="gradient"
              isDark={isDark}
            />
            <StatCard
              label="Activité"
              icon={<Icons.TrendingUp size={12} />}
              value={activityCount}
              unit="événements"
              variant="dark"
              isDark={isDark}
            />
          </div>
        )}

        {/* Widgets - Draggable Zone */}
        <WidgetZone
          item={item}
          isDark={isDark}
          availableWidgets={availableWidgets}
          categoryName={categoryName}
        />

      </div>

      {/* Footer */}
      <div className={`p-4 border-t text-center ${isDark ? 'border-slate-700 bg-slate-900/50' : 'border-gray-100 bg-gray-50/50'}`}>
        <span className={`text-[10px] font-mono uppercase ${textSecondary}`}>
          ID: {item.id || 'LEGACY'}
        </span>
      </div>
    </div>
  );
};

export default ItemDetailSidebar;
