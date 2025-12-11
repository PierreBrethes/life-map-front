import api from '../axios';
import { RecurringTransaction } from '../../types';

export const recurringApi = {
  /**
   * Get all recurring transactions, optionally filtered by account
   */
  getAll: async (accountId?: string) => {
    const params = accountId ? { account_id: accountId } : {};
    const { data } = await api.get<RecurringTransaction[]>('/finance/recurring', { params });
    return data;
  },

  /**
   * Create a new recurring transaction
   */
  create: async (payload: Omit<RecurringTransaction, 'id'>) => {
    const { data } = await api.post<RecurringTransaction>('/finance/recurring', payload);
    return data;
  },

  /**
   * Update an existing recurring transaction
   */
  update: async (id: string, payload: Partial<RecurringTransaction>) => {
    const { data } = await api.put<RecurringTransaction>(`/finance/recurring/${id}`, payload);
    return data;
  },

  /**
   * Delete a recurring transaction
   */
  delete: async (id: string) => {
    await api.delete(`/finance/recurring/${id}`);
  },

  /**
   * Trigger synchronization of missed recurring transactions
   * Creates HistoryEntries for any days that were missed since lastProcessedDate
   */
  sync: async () => {
    const { data } = await api.post<{ processedCount: number; errors: string[] }>('/finance/recurring/sync');
    return data;
  },
};

