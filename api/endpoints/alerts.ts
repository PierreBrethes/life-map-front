import api from '../axios';
import { Alert } from '../../types';

export const alertsApi = {
  getAll: async (itemId?: string) => {
    const params = itemId ? { item_id: itemId } : {};
    const { data } = await api.get<Alert[]>('/alerts', { params });
    return data;
  },
  create: async (payload: Omit<Alert, 'id' | 'createdAt'>) => {
    const { data } = await api.post<Alert>('/alerts', payload);
    return data;
  },
  update: async (id: string, payload: Partial<Alert>) => {
    const { data } = await api.put<Alert>(`/alerts/${id}`, payload);
    return data;
  },
  delete: async (id: string) => {
    await api.delete(`/alerts/${id}`);
  },
};
