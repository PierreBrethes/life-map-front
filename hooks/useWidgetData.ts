import { useQuery } from '@tanstack/react-query';
import { socialApi } from '../api/endpoints/social';
import { healthApi } from '../api/endpoints/health';
import { financeApi } from '../api/endpoints/finance';
import { alertsApi } from '../api/endpoints/alerts';
import { realEstateApi } from '../api/endpoints/real_estate';
import { recurringApi } from '../api/endpoints/recurring';

export const useWidgetData = (itemId: string | undefined) => {
  const enabled = !!itemId;

  // Social
  const { data: events = [] } = useQuery({
    queryKey: ['social-events', itemId],
    queryFn: () => socialApi.getEvents(itemId),
    enabled
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['social-contacts', itemId],
    queryFn: () => socialApi.getContacts(itemId),
    enabled
  });

  // Health
  const { data: bodyMetrics = [] } = useQuery({
    queryKey: ['health-metrics', itemId],
    queryFn: () => healthApi.getMetrics(itemId),
    enabled
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['health-appointments', itemId],
    queryFn: () => healthApi.getAppointments(itemId),
    enabled
  });

  // Finance
  const { data: history = [] } = useQuery({
    queryKey: ['finance-history', itemId],
    queryFn: () => financeApi.getHistory(itemId),
    enabled
  });

  const { data: subscriptions = [] } = useQuery({
    queryKey: ['finance-subscriptions', itemId],
    queryFn: () => financeApi.getSubscriptions(itemId),
    enabled
  });

  // Recurring Transactions
  const { data: recurring = [] } = useQuery({
    queryKey: ['recurring', itemId],
    queryFn: () => recurringApi.getAll(itemId),
    enabled
  });

  // Real Estate
  const { data: valuations = [] } = useQuery({
    queryKey: ['real-estate-valuations', itemId],
    queryFn: () => realEstateApi.getValuations(itemId),
    enabled
  });

  const { data: energy = [] } = useQuery({
    queryKey: ['real-estate-energy', itemId],
    queryFn: () => realEstateApi.getEnergyRecords(itemId),
    enabled
  });

  const { data: maintenance = [] } = useQuery({
    queryKey: ['real-estate-maintenance', itemId],
    queryFn: () => realEstateApi.getMaintenanceTasks(itemId),
    enabled
  });

  // Alerts
  const { data: alerts = [] } = useQuery({
    queryKey: ['alerts', itemId],
    queryFn: () => alertsApi.getAll(itemId),
    enabled
  });

  return {
    events, contacts,
    bodyMetrics, appointments,
    history, subscriptions, recurring,
    valuations, energy, maintenance,
    alerts
  };
};

