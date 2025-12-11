import { useMutation, useQueryClient } from '@tanstack/react-query';
import { socialApi } from '../api/endpoints/social';
import { healthApi } from '../api/endpoints/health';
import { financeApi } from '../api/endpoints/finance';
import { alertsApi } from '../api/endpoints/alerts';
import { realEstateApi } from '../api/endpoints/real_estate';
import { recurringApi } from '../api/endpoints/recurring';

export const useWidgetMutations = () => {
  const queryClient = useQueryClient();

  // Helper to invalidate
  const invalidate = (key: string) => queryClient.invalidateQueries({ queryKey: [key] });

  return {
    // Social
    createEvent: useMutation({ mutationFn: socialApi.createEvent, onSuccess: () => invalidate('social-events') }),
    updateEvent: useMutation({ mutationFn: ({ id, payload }: any) => socialApi.updateEvent(id, payload), onSuccess: () => invalidate('social-events') }),
    deleteEvent: useMutation({ mutationFn: socialApi.deleteEvent, onSuccess: () => invalidate('social-events') }),

    createContact: useMutation({ mutationFn: socialApi.createContact, onSuccess: () => invalidate('social-contacts') }),
    updateContact: useMutation({ mutationFn: ({ id, payload }: any) => socialApi.updateContact(id, payload), onSuccess: () => invalidate('social-contacts') }),
    deleteContact: useMutation({ mutationFn: socialApi.deleteContact, onSuccess: () => invalidate('social-contacts') }),

    // Health
    createMetric: useMutation({ mutationFn: healthApi.createMetric, onSuccess: () => invalidate('health-metrics') }),
    deleteMetric: useMutation({ mutationFn: healthApi.deleteMetric, onSuccess: () => invalidate('health-metrics') }),

    createAppointment: useMutation({ mutationFn: healthApi.createAppointment, onSuccess: () => invalidate('health-appointments') }),
    updateAppointment: useMutation({ mutationFn: ({ id, payload }: any) => healthApi.updateAppointment(id, payload), onSuccess: () => invalidate('health-appointments') }),
    deleteAppointment: useMutation({ mutationFn: healthApi.deleteAppointment, onSuccess: () => invalidate('health-appointments') }),

    // Finance
    createHistoryEntry: useMutation({ mutationFn: financeApi.createHistoryEntry, onSuccess: () => invalidate('finance-history') }),
    updateHistoryEntry: useMutation({ mutationFn: ({ id, payload }: any) => financeApi.updateHistoryEntry(id, payload), onSuccess: () => invalidate('finance-history') }),
    deleteHistoryEntry: useMutation({ mutationFn: financeApi.deleteHistoryEntry, onSuccess: () => invalidate('finance-history') }),

    createSubscription: useMutation({ mutationFn: financeApi.createSubscription, onSuccess: () => invalidate('finance-subscriptions') }),
    updateSubscription: useMutation({ mutationFn: ({ id, payload }: any) => financeApi.updateSubscription(id, payload), onSuccess: () => invalidate('finance-subscriptions') }),
    deleteSubscription: useMutation({ mutationFn: financeApi.deleteSubscription, onSuccess: () => invalidate('finance-subscriptions') }),

    // Recurring Transactions
    createRecurring: useMutation({ mutationFn: recurringApi.create, onSuccess: () => invalidate('recurring') }),
    updateRecurring: useMutation({ mutationFn: ({ id, payload }: any) => recurringApi.update(id, payload), onSuccess: () => invalidate('recurring') }),
    deleteRecurring: useMutation({ mutationFn: recurringApi.delete, onSuccess: () => invalidate('recurring') }),

    // Real Estate
    createValuation: useMutation({ mutationFn: realEstateApi.createValuation, onSuccess: () => invalidate('real-estate-valuations') }),
    updateValuation: useMutation({ mutationFn: ({ id, payload }: any) => realEstateApi.updateValuation(id, payload), onSuccess: () => invalidate('real-estate-valuations') }),

    createEnergyRecord: useMutation({ mutationFn: realEstateApi.createEnergyRecord, onSuccess: () => invalidate('real-estate-energy') }),
    deleteEnergyRecord: useMutation({ mutationFn: realEstateApi.deleteEnergyRecord, onSuccess: () => invalidate('real-estate-energy') }),

    createMaintenanceTask: useMutation({ mutationFn: realEstateApi.createMaintenanceTask, onSuccess: () => invalidate('real-estate-maintenance') }),
    updateMaintenanceTask: useMutation({ mutationFn: ({ id, payload }: any) => realEstateApi.updateMaintenanceTask(id, payload), onSuccess: () => invalidate('real-estate-maintenance') }),
    deleteMaintenanceTask: useMutation({ mutationFn: realEstateApi.deleteMaintenanceTask, onSuccess: () => invalidate('real-estate-maintenance') }),

    // Alerts
    createAlert: useMutation({ mutationFn: alertsApi.create, onSuccess: () => invalidate('alerts') }),
    updateAlert: useMutation({ mutationFn: ({ id, payload }: any) => alertsApi.update(id, payload), onSuccess: () => invalidate('alerts') }),
    deleteAlert: useMutation({ mutationFn: alertsApi.delete, onSuccess: () => invalidate('alerts') }),
  };
};

