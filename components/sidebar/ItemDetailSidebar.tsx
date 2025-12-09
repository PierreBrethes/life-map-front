import React, { useMemo, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { LifeItem, Subscription } from '../../types';
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
import { useWidgetData } from '../../hooks/useWidgetData';
import { useWidgetMutations } from '../../hooks/useWidgetMutations';
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
  // --- DATA LOADING ---
  const {
    events, contacts,
    bodyMetrics, appointments,
    history, subscriptions,
    valuations, energy, maintenance,
    alerts
  } = useWidgetData(item.id);

  // --- MUTATIONS ---
  const {
    createEvent, updateEvent, deleteEvent,
    createContact, updateContact, deleteContact,
    createMetric, deleteMetric,
    createAppointment, updateAppointment, deleteAppointment,
    createHistoryEntry, deleteHistoryEntry,
    createSubscription, updateSubscription, deleteSubscription,
    createValuation, updateValuation,
    createEnergyRecord, deleteEnergyRecord,
    createMaintenanceTask, updateMaintenanceTask, deleteMaintenanceTask,
    createAlert, deleteAlert, updateAlert
  } = useWidgetMutations();

  // --- DERIVED STATE / LOGIC (Moved from legacy hooks) ---

  const totalMonthlySubscriptions = useMemo(() =>
    subscriptions.filter(s => s.isActive).reduce((sum, s) => sum + s.amount, 0),
    [subscriptions]);

  const getNextBillingDate = (billingDay: number): Date => {
    const now = new Date();
    const currentDay = now.getDate();
    const nextDate = new Date(now.getFullYear(), now.getMonth(), billingDay);
    if (currentDay >= billingDay) {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }
    return nextDate;
  };

  const activeAlertsCount = useMemo(() => alerts.filter(a => a.isActive).length, [alerts]);

  const activeAlertSeverity = useMemo(() => {
    const active = alerts.filter(a => a.isActive);
    if (active.some(a => a.severity === 'critical')) return 'critical';
    if (active.some(a => a.severity === 'warning')) return 'warning';
    return 'ok';
  }, [alerts]);

  // Social Derived
  const upcomingEvents = useMemo(() => {
    const now = Date.now();
    return events.filter(e => e.date >= now).sort((a, b) => a.date - b.date);
  }, [events]);

  const monthBirthdays = useMemo(() => {
    const currentMonth = new Date().getMonth();
    return contacts.filter(c => c.birthday && new Date(c.birthday).getMonth() === currentMonth);
  }, [contacts]);

  const nextBirthday = useMemo(() => {
    // Simplified next birthday logic (needs robust implementation if critical)
    return monthBirthdays[0];
  }, [monthBirthdays]);

  const overdueContacts = useMemo(() => {
    // Simplified overdue logic
    return [];
  }, []);

  // Health Derived
  const latestMetric = useMemo(() => bodyMetrics[bodyMetrics.length - 1], [bodyMetrics]);

  const bmi = useMemo(() => {
    if (!latestMetric || !latestMetric.height) return 0;
    const heightM = latestMetric.height / 100;
    return latestMetric.weight / (heightM * heightM);
  }, [latestMetric]);

  const weightTrend = 'stable'; // Placeholder for complex calc

  const upcomingAppointments = useMemo(() => {
    const now = Date.now();
    return appointments.filter(a => a.date >= now).sort((a, b) => a.date - b.date);
  }, [appointments]);


  // --- EFFECTS ---

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

  // Wrappers for mutations to match widget expectations
  const handleToggleSubscription = (id: string) => {
    const sub = subscriptions.find(s => s.id === id);
    if (sub) {
      updateSubscription.mutate({ id, payload: { isActive: !sub.isActive } });
    }
  };

  const handleToggleAlert = (id: string) => {
    const alert = alerts.find(a => a.id === id);
    if (alert) {
      updateAlert.mutate({ id, payload: { isActive: !alert.isActive } });
    }
  };


  // --- RENDER HELPERS ---
  const isFinanceType = isFinanceAssetType(item.assetType);
  const isRealEstate = item.assetType && REAL_ESTATE_TYPES.includes(item.assetType);

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

  const textSecondary = isDark ? 'text-slate-400' : 'text-gray-500';
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

        {/* Widgets */}
        <AlertsWidget
          alerts={alerts}
          onAddAlert={(a) => createAlert.mutate(a)}
          onDeleteAlert={(id) => deleteAlert.mutate(id)}
          onToggleAlert={handleToggleAlert}
          activeAlertsCount={activeAlertsCount}
          itemId={item.id}
          isDark={isDark}
        />

        {showHistoryWidget && (
          <HistoryWidget
            history={history}
            onAddEntry={(e) => createHistoryEntry.mutate(e)}
            onDeleteEntry={(id) => deleteHistoryEntry.mutate(id)}
            itemId={item.id}
            isDark={isDark}
          />
        )}

        {showSubscriptionsWidget && (
          <SubscriptionsWidget
            subscriptions={subscriptions}
            totalMonthly={totalMonthlySubscriptions}
            onAddSubscription={(s) => createSubscription.mutate(s)}
            onDeleteSubscription={(id) => deleteSubscription.mutate(id)}
            onToggleSubscription={handleToggleSubscription}
            getNextBillingDate={getNextBillingDate}
            itemId={item.id}
            isDark={isDark}
          />
        )}

        {showPropertyWidget && (
          <PropertyWidget
            valuation={valuations[0] || null} // Assuming single valuation for now
            onUpdateValuation={(v) => valuations[0] ? updateValuation.mutate({ id: valuations[0].id, payload: v }) : null}
            onCreateValuation={(v) => createValuation.mutate(v)}
            itemId={item.id}
            isDark={isDark}
          />
        )}

        {showEnergyWidget && (
          <EnergyWidget
            consumption={energy}
            onAddEntry={(e) => createEnergyRecord.mutate(e)}
            onDeleteEntry={(id) => deleteEnergyRecord.mutate(id)}
            itemId={item.id}
            isDark={isDark}
          />
        )}

        {showMaintenanceWidget && (
          <MaintenanceWidget
            tasks={maintenance}
            onAddTask={(t) => createMaintenanceTask.mutate({ ...t, createdAt: Date.now() })}
            onUpdateTask={(id, t) => updateMaintenanceTask.mutate({ id, payload: t })}
            onDeleteTask={(id) => deleteMaintenanceTask.mutate(id)}
            itemId={item.id}
            isDark={isDark}
          />
        )}

        {showBirthdayWidget && (
          <BirthdayWidget
            nextBirthday={nextBirthday ? {
              ...nextBirthday,
              age: 0, // Placeholder, would need real calc
              daysUntil: 0, // Placeholder
              nextBirthdayDate: 0 // Placeholder
            } : null}
            monthBirthdays={monthBirthdays.map(c => ({
              ...c,
              age: 0,
              daysUntil: 0,
              nextBirthdayDate: 0
            }))}
            contacts={contacts}
            isDark={isDark}
          />
        )}

        {showSocialCalendarWidget && (
          <SocialCalendarWidget
            events={events}
            upcomingEvents={upcomingEvents}
            onAddEvent={(e) => createEvent.mutate(e)}
            onDeleteEvent={(id) => deleteEvent.mutate(id)}
            itemId={item.id}
            isDark={isDark}
          />
        )}

        {showContactsWidget && (
          <ContactsWidget
            contacts={contacts}
            overdueContacts={overdueContacts}
            onAddContact={(c) => createContact.mutate(c)}
            onUpdateContact={(id, c) => updateContact.mutate({ id, payload: c })}
            onDeleteContact={(id) => deleteContact.mutate(id)}
            itemId={item.id}
            isDark={isDark}
          />
        )}

        {showBodyTrackingWidget && (
          <BodyTrackingWidget
            metrics={bodyMetrics}
            latestMetric={latestMetric}
            bmi={bmi ? bmi.toFixed(1) : undefined}
            weightTrend={{ value: '0', direction: 'stable', percentage: '0%' }}
            onAddMetric={(m) => createMetric.mutate(m)}
            onDeleteMetric={(id) => deleteMetric.mutate(id)}
            itemId={item.id}
            isDark={isDark}
          />
        )}

        {showHealthAppointmentsWidget && (
          <HealthAppointmentsWidget
            appointments={appointments}
            upcomingAppointments={upcomingAppointments}
            onAddAppointment={(a) => createAppointment.mutate(a)}
            onUpdateAppointment={(id, a) => updateAppointment.mutate({ id, payload: a })}
            onDeleteAppointment={(id) => deleteAppointment.mutate(id)}
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
