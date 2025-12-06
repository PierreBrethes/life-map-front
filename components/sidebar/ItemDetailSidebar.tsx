import React, { useEffect } from 'react';
import * as Icons from 'lucide-react';
import { LifeItem } from '../../types';
import SidebarHeader from './SidebarHeader';
import StatCard from './StatCard';
import {
  HistoryWidget,
  SubscriptionsWidget,
  AlertsWidget,
  PropertyWidget,
  EnergyWidget,
  MaintenanceWidget,
  SocialCalendarWidget,
  BirthdayWidget,
  ContactsWidget,
  BodyTrackingWidget,
  HealthAppointmentsWidget,
} from '../widgets';
import { useItemData } from '../../hooks/useItemData';
import { usePropertyData } from '../../hooks/usePropertyData';
import { useSocialData } from '../../hooks/useSocialData';
import { useHealthData } from '../../hooks/useHealthData';
import { isWidgetAvailable } from '../../utils/widgetRegistry';
import { isFinanceAssetType } from '../../hooks/useFinanceBalance';
import { parseValueToNumber } from '../../utils/formatters';

// Real estate asset types
const REAL_ESTATE_TYPES = ['house', 'apartment'];

interface ItemDetailSidebarProps {
  categoryName: string;
  categoryColor: string;
  item: LifeItem;
  isDark: boolean;
  onClose: () => void;
  onDelete: () => void;
  onUpdateItem: (updates: Partial<LifeItem>) => void;
}

const ItemDetailSidebar: React.FC<ItemDetailSidebarProps> = ({
  categoryName,
  categoryColor,
  item,
  isDark,
  onClose,
  onDelete,
  onUpdateItem
}) => {
  // Load item-specific data for widgets
  const {
    history,
    subscriptions,
    alerts,
    addHistoryEntry,
    deleteHistoryEntry,
    addSubscription,
    deleteSubscription,
    toggleSubscription,
    totalMonthlySubscriptions,
    getNextBillingDate,
    addAlert,
    deleteAlert,
    toggleAlert,
    activeAlertSeverity,
    activeAlertsCount,
  } = useItemData(item.id);

  // Load property-specific data for real estate widgets
  const {
    valuation,
    energy,
    maintenance,
    createValuation,
    updateValuation,
    addEnergyEntry,
    deleteEnergyEntry,
    addMaintenanceTask,
    updateMaintenanceTask,
    deleteMaintenanceTask,
  } = usePropertyData(item.id);

  // Load social data for social widgets
  const {
    events,
    contacts,
    upcomingEvents,
    nextBirthday,
    monthBirthdays,
    overdueContacts,
    addEvent,
    deleteEvent,
    addContact,
    updateContact,
    deleteContact,
  } = useSocialData(item.id);

  // Load health data
  const {
    metrics,
    appointments,
    latestMetric,
    bmi,
    weightTrend,
    upcomingAppointments,
    addMetric,
    deleteMetric,
    addAppointment,
    updateAppointment,
    deleteAppointment,
  } = useHealthData(item.id);

  // Check which widgets are available for this asset type
  const showHistoryWidget = isWidgetAvailable('history', item.assetType);
  const showSubscriptionsWidget = isWidgetAvailable('subscriptions', item.assetType);
  const showPropertyWidget = isWidgetAvailable('property', item.assetType);
  const showEnergyWidget = isWidgetAvailable('energy', item.assetType);
  const showMaintenanceWidget = isWidgetAvailable('maintenance', item.assetType);
  const showSocialCalendarWidget = isWidgetAvailable('social-calendar', item.assetType);
  const showBirthdayWidget = isWidgetAvailable('birthdays', item.assetType);
  const showContactsWidget = isWidgetAvailable('contacts', item.assetType);
  const showBodyTrackingWidget = isWidgetAvailable('health-body', item.assetType);
  const showHealthAppointmentsWidget = isWidgetAvailable('health-appointments', item.assetType);

  // Check if this is a finance-type item
  const isFinanceType = isFinanceAssetType(item.assetType);

  // Check if this is a real estate item
  const isRealEstate = item.assetType && REAL_ESTATE_TYPES.includes(item.assetType);

  // Sync item status with active alerts
  useEffect(() => {
    const severity = activeAlertSeverity();
    if (severity !== item.status) {
      onUpdateItem({
        status: severity,
        notificationDismissed: severity === 'ok'
      });
    }
  }, [alerts, activeAlertSeverity]);

  // NOTE: initialBalance is set ONLY when the user first enables sync (in handleToggleSyncBalance)
  // We do NOT auto-set it here to avoid overwriting with an already-synced value

  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';

  // Mock data for stats (as per user request - fake data for now)
  const healthValue = 85;
  const activityCount = history.length || 12;

  // Handlers for header edits
  const handleUpdateName = (name: string) => {
    onUpdateItem({ name });
  };

  const handleUpdateValue = (value: string) => {
    onUpdateItem({ value });
  };

  // Handler for sync toggle
  const handleToggleSyncBalance = (sync: boolean) => {
    // When enabling sync for the first time, ensure initialBalance is set
    if (sync && item.initialBalance === undefined) {
      onUpdateItem({
        syncBalanceWithBlock: sync,
        initialBalance: parseValueToNumber(item.value)
      });
    } else {
      onUpdateItem({ syncBalanceWithBlock: sync });
    }
  };

  // Handler to reset corrupted initialBalance
  const handleResetBalance = () => {
    // Reset initialBalance to 0 and recalculate from history only
    onUpdateItem({
      initialBalance: 0,
      syncBalanceWithBlock: false
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header - Uses centralized finance balance hook */}
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
        {/* Stats Cards Row - Hidden for finance types and real estate */}
        {!isFinanceType && !isRealEstate && (
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

        {/* === CONTEXTUAL WIDGETS === */}

        {/* Alerts Widget - for all items */}
        <AlertsWidget
          alerts={alerts}
          onAddAlert={addAlert}
          onDeleteAlert={deleteAlert}
          onToggleAlert={toggleAlert}
          activeAlertsCount={activeAlertsCount}
          itemId={item.id}
          isDark={isDark}
        />

        {/* === FINANCE WIDGETS === */}

        {/* History Widget - for finance-related items */}
        {showHistoryWidget && (
          <HistoryWidget
            history={history}
            onAddEntry={addHistoryEntry}
            onDeleteEntry={deleteHistoryEntry}
            itemId={item.id}
            isDark={isDark}
          />
        )}

        {/* Subscriptions Widget - for current accounts */}
        {showSubscriptionsWidget && (
          <SubscriptionsWidget
            subscriptions={subscriptions}
            totalMonthly={totalMonthlySubscriptions}
            onAddSubscription={addSubscription}
            onDeleteSubscription={deleteSubscription}
            onToggleSubscription={toggleSubscription}
            getNextBillingDate={getNextBillingDate}
            itemId={item.id}
            isDark={isDark}
          />
        )}

        {/* === REAL ESTATE WIDGETS === */}

        {/* Property Widget - for house/apartment */}
        {showPropertyWidget && (
          <PropertyWidget
            valuation={valuation}
            onUpdateValuation={updateValuation}
            onCreateValuation={createValuation}
            itemId={item.id}
            isDark={isDark}
          />
        )}

        {/* Energy Widget - for house/apartment */}
        {showEnergyWidget && (
          <EnergyWidget
            consumption={energy}
            onAddEntry={addEnergyEntry}
            onDeleteEntry={deleteEnergyEntry}
            itemId={item.id}
            isDark={isDark}
          />
        )}

        {/* Maintenance Widget - for vehicles and real estate */}
        {showMaintenanceWidget && (
          <MaintenanceWidget
            tasks={maintenance}
            onAddTask={addMaintenanceTask}
            onUpdateTask={updateMaintenanceTask}
            onDeleteTask={deleteMaintenanceTask}
            itemId={item.id}
            isDark={isDark}
          />
        )}

        {/* === SOCIAL WIDGETS === */}

        {/* Birthday Widget */}
        {showBirthdayWidget && (
          <BirthdayWidget
            nextBirthday={nextBirthday}
            monthBirthdays={monthBirthdays}
            contacts={contacts}
            isDark={isDark}
          />
        )}

        {/* Social Calendar Widget */}
        {showSocialCalendarWidget && (
          <SocialCalendarWidget
            events={events}
            upcomingEvents={upcomingEvents}
            onAddEvent={addEvent}
            onDeleteEvent={deleteEvent}
            itemId={item.id}
            isDark={isDark}
          />
        )}

        {/* Contacts Widget */}
        {showContactsWidget && (
          <ContactsWidget
            contacts={contacts}
            overdueContacts={overdueContacts}
            onAddContact={addContact}
            onUpdateContact={updateContact}
            onDeleteContact={deleteContact}
            itemId={item.id}
            isDark={isDark}
          />
        )}

        {/* === HEALTH WIDGETS === */}

        {/* Body Tracking Widget */}
        {showBodyTrackingWidget && (
          <BodyTrackingWidget
            metrics={metrics}
            latestMetric={latestMetric}
            bmi={bmi}
            weightTrend={weightTrend}
            onAddMetric={addMetric}
            onDeleteMetric={deleteMetric}
            itemId={item.id}
            isDark={isDark}
          />
        )}

        {/* Health Appointments Widget */}
        {showHealthAppointmentsWidget && (
          <HealthAppointmentsWidget
            appointments={appointments}
            upcomingAppointments={upcomingAppointments}
            onAddAppointment={addAppointment}
            onUpdateAppointment={updateAppointment}
            onDeleteAppointment={deleteAppointment}
            itemId={item.id}
            isDark={isDark}
          />
        )}
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
