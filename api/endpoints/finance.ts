import api from '../axios';
import { HistoryEntry, Subscription } from '../../types';

export const financeApi = {
  // History
  getHistory: async (itemId?: string) => {
    const params = itemId ? { item_id: itemId } : {};
    const { data } = await api.get<HistoryEntry[]>('/finance/history', { params });
    return data;
  },
  createHistoryEntry: async (payload: Omit<HistoryEntry, 'id'>) => {
    const { data } = await api.post<HistoryEntry>('/finance/history', payload);
    return data;
  },
  updateHistoryEntry: async (id: string, payload: Partial<HistoryEntry>) => {
    const { data } = await api.put<HistoryEntry>(`/finance/history/${id}`, payload);
    return data;
  },
  deleteHistoryEntry: async (id: string) => {
    await api.delete(`/finance/history/${id}`);
  },

  // Subscriptions
  getSubscriptions: async (itemId?: string) => {
    const params = itemId ? { item_id: itemId } : {};
    const { data } = await api.get<Subscription[]>('/finance/subscriptions', { params });
    return data;
  },
  createSubscription: async (payload: Omit<Subscription, 'id'>) => {
    const { data } = await api.post<Subscription>('/finance/subscriptions', payload);
    return data;
  },
  updateSubscription: async (id: string, payload: Partial<Subscription>) => {
    const { data } = await api.put<Subscription>(`/finance/subscriptions/${id}`, payload);
    return data;
  },
  deleteSubscription: async (id: string) => {
    await api.delete(`/finance/subscriptions/${id}`);
  },
};
