import api from '../axios';
import { BodyMetric, HealthAppointment } from '../../types';

export const healthApi = {
  // Body Metrics
  getMetrics: async (itemId?: string) => {
    const params = itemId ? { item_id: itemId } : {};
    const { data } = await api.get<BodyMetric[]>('/health/body-metrics', { params });
    return data;
  },
  createMetric: async (payload: Omit<BodyMetric, 'id'>) => {
    const { data } = await api.post<BodyMetric>('/health/body-metrics', payload);
    return data;
  },
  updateMetric: async (id: string, payload: Partial<BodyMetric>) => {
    const { data } = await api.put<BodyMetric>(`/health/body-metrics/${id}`, payload);
    return data;
  },
  deleteMetric: async (id: string) => {
    await api.delete(`/health/body-metrics/${id}`);
  },

  // Appointments
  getAppointments: async (itemId?: string) => {
    const params = itemId ? { item_id: itemId } : {};
    const { data } = await api.get<HealthAppointment[]>('/health/appointments', { params });
    return data;
  },
  createAppointment: async (payload: Omit<HealthAppointment, 'id'>) => {
    const { data } = await api.post<HealthAppointment>('/health/appointments', payload);
    return data;
  },
  updateAppointment: async (id: string, payload: Partial<HealthAppointment>) => {
    const { data } = await api.put<HealthAppointment>(`/health/appointments/${id}`, payload);
    return data;
  },
  deleteAppointment: async (id: string) => {
    await api.delete(`/health/appointments/${id}`);
  },
};
