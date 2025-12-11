import React, { useMemo, useCallback } from 'react';
import { WidgetType, LifeItem } from '../../types';
import {
  HistoryWidget,
  RecurringFlowsWidget,
  AlertsWidget,
  PropertyWidget,
  EnergyWidget,
  MaintenanceWidget,
  SocialCalendarWidget,
  ContactsWidget,
  BodyTrackingWidget,
  HealthAppointmentsWidget,
  DependenciesWidget,
} from '../widgets';
import { useWidgetData } from '../../hooks/useWidgetData';
import { useWidgetMutations } from '../../hooks/useWidgetMutations';

interface WidgetRendererProps {
  widgetType: WidgetType;
  item: LifeItem;
  isDark: boolean;
  categoryName: string;
}

const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widgetType, item, isDark, categoryName }) => {
  // Data Loading
  const {
    events, contacts,
    bodyMetrics, appointments,
    history, recurring,
    valuations, energy, maintenance,
    alerts
  } = useWidgetData(item.id);

  // Mutations
  const {
    createEvent, deleteEvent,
    createContact, updateContact, deleteContact,
    createMetric, deleteMetric,
    createAppointment, updateAppointment, deleteAppointment,
    createHistoryEntry, deleteHistoryEntry,
    createRecurring, updateRecurring, deleteRecurring,
    createValuation, updateValuation,
    createEnergyRecord, deleteEnergyRecord,
    createMaintenanceTask, updateMaintenanceTask, deleteMaintenanceTask,
    createAlert, updateAlert, deleteAlert
  } = useWidgetMutations();

  // --- DERIVED DATA ---
  const activeAlertsCount = useMemo(() => alerts.filter(a => a.isActive).length, [alerts]);

  const upcomingEvents = useMemo(() => {
    const now = Date.now();
    return events
      .filter(e => e.date >= now)
      .sort((a, b) => a.date - b.date)
      .slice(0, 3);
  }, [events]);

  const upcomingAppointments = useMemo(() => {
    const now = Date.now();
    return appointments
      .filter(a => a.date >= now)
      .sort((a, b) => a.date - b.date)
      .slice(0, 3);
  }, [appointments]);

  const overdueContacts = useMemo(() => {
    const now = Date.now();
    return contacts.filter(c => {
      if (!c.contactFrequencyDays) return false;
      const lastContact = c.lastContactDate || 0;
      const nextContact = lastContact + (c.contactFrequencyDays * 24 * 60 * 60 * 1000);
      return nextContact < now;
    }).map(c => {
      const lastContact = c.lastContactDate || 0;
      const nextContact = lastContact + ((c.contactFrequencyDays || 0) * 24 * 60 * 60 * 1000);
      const daysOverdue = Math.ceil((now - nextContact) / (1000 * 60 * 60 * 24));
      return {
        ...c,
        isOverdue: true,
        daysOverdue,
        nextContactDate: nextContact
      };
    });
  }, [contacts]);

  const latestMetric = useMemo(() => {
    if (bodyMetrics.length === 0) return undefined;
    return bodyMetrics.sort((a, b) => b.date - a.date)[0];
  }, [bodyMetrics]);

  const bmi = useMemo(() => {
    if (!latestMetric || !latestMetric.height || !latestMetric.weight) return undefined;
    const heightM = latestMetric.height / 100;
    return latestMetric.weight / (heightM * heightM);
  }, [latestMetric]);

  // --- HANDLERS ---
  const handleToggleAlert = useCallback((id: string) => {
    const alert = alerts.find(a => a.id === id);
    if (alert) {
      updateAlert.mutate({ id, payload: { isActive: !alert.isActive } });
    }
  }, [alerts, updateAlert]);

  // --- RENDER ---
  switch (widgetType) {
    case 'alerts':
      return (
        <AlertsWidget
          alerts={alerts}
          onAddAlert={(a) => createAlert.mutate(a)}
          onDeleteAlert={(id) => deleteAlert.mutate(id)}
          onToggleAlert={handleToggleAlert}
          activeAlertsCount={activeAlertsCount}
          itemId={item.id}
          isDark={isDark}
        />
      );
    case 'history':
      return (
        <HistoryWidget
          history={history}
          onAddEntry={(e) => createHistoryEntry.mutate(e)}
          onDeleteEntry={(id) => deleteHistoryEntry.mutate(id)}
          itemId={item.id}
          isDark={isDark}
        />
      );
    case 'recurring-flows':
      return (
        <RecurringFlowsWidget
          recurring={recurring}
          onAddRecurring={(r) => createRecurring.mutate(r)}
          onDeleteRecurring={(id) => deleteRecurring.mutate(id)}
          onToggleRecurring={(id, isActive) => updateRecurring.mutate({ id, payload: { isActive } })}
          targetAccountId={item.id}
          isDark={isDark}
        />
      );
    case 'property':
      return (
        <PropertyWidget
          valuation={valuations[0] || null}
          onUpdateValuation={(v) => valuations[0] ? updateValuation.mutate({ id: valuations[0].id, payload: v }) : null}
          onCreateValuation={(v) => createValuation.mutate(v)}
          itemId={item.id}
          isDark={isDark}
        />
      );
    case 'energy':
      return (
        <EnergyWidget
          consumption={energy}
          onAddEntry={(e) => createEnergyRecord.mutate(e)}
          onDeleteEntry={(id) => deleteEnergyRecord.mutate(id)}
          itemId={item.id}
          isDark={isDark}
        />
      );
    case 'maintenance':
      return (
        <MaintenanceWidget
          tasks={maintenance}
          onAddTask={(t) => createMaintenanceTask.mutate({ ...t, createdAt: Date.now() })}
          onUpdateTask={(id, t) => updateMaintenanceTask.mutate({ id, payload: t })}
          onDeleteTask={(id) => deleteMaintenanceTask.mutate(id)}
          itemId={item.id}
          isDark={isDark}
        />
      );
    case 'social-calendar':
      return (
        <SocialCalendarWidget
          events={events}
          upcomingEvents={upcomingEvents}
          onAddEvent={(e) => createEvent.mutate(e)}
          onDeleteEvent={(id) => deleteEvent.mutate(id)}
          itemId={item.id}
          isDark={isDark}
        />
      );
    case 'contacts':
      return (
        <ContactsWidget
          contacts={contacts}
          overdueContacts={overdueContacts}
          onAddContact={(c) => createContact.mutate(c)}
          onUpdateContact={(id, c) => updateContact.mutate({ id, payload: c })}
          onDeleteContact={(id) => deleteContact.mutate(id)}
          itemId={item.id}
          isDark={isDark}
        />
      );
    case 'health-body':
      return (
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
      );
    case 'health-appointments':
      return (
        <HealthAppointmentsWidget
          appointments={appointments}
          upcomingAppointments={upcomingAppointments}
          onAddAppointment={(a) => createAppointment.mutate(a)}
          onUpdateAppointment={(id, a) => updateAppointment.mutate({ id, payload: a })}
          onDeleteAppointment={(id) => deleteAppointment.mutate(id)}
          itemId={item.id}
          isDark={isDark}
        />
      );
    case 'connections':
      return (
        <DependenciesWidget
            itemId={item.id}
            categoryName={categoryName}
            isDark={isDark}
        />
      );
    default:
      return null;
  }
};

export default WidgetRenderer;
