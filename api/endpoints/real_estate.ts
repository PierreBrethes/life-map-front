import api from '../axios';
import { PropertyValuation, EnergyConsumption, MaintenanceTask } from '../../types';

export const realEstateApi = {
  // Valuations
  getValuations: async (itemId?: string) => {
    const params = itemId ? { item_id: itemId } : {};
    const { data } = await api.get<PropertyValuation[]>('/real-estate/valuations', { params });
    return data;
  },
  createValuation: async (payload: Omit<PropertyValuation, 'id'>) => {
    const { data } = await api.post<PropertyValuation>('/real-estate/valuations', payload);
    return data;
  },
  updateValuation: async (id: string, payload: Partial<PropertyValuation>) => {
    const { data } = await api.put<PropertyValuation>(`/real-estate/valuations/${id}`, payload);
    return data;
  },
  deleteValuation: async (id: string) => {
    await api.delete(`/real-estate/valuations/${id}`);
  },

  // Energy Consumption
  getEnergyRecords: async (itemId?: string) => {
    const params = itemId ? { item_id: itemId } : {};
    const { data } = await api.get<EnergyConsumption[]>('/real-estate/energy-consumption', { params });
    return data;
  },
  createEnergyRecord: async (payload: Omit<EnergyConsumption, 'id'>) => {
    const { data } = await api.post<EnergyConsumption>('/real-estate/energy-consumption', payload);
    return data;
  },
  updateEnergyRecord: async (id: string, payload: Partial<EnergyConsumption>) => {
    const { data } = await api.put<EnergyConsumption>(`/real-estate/energy-consumption/${id}`, payload);
    return data;
  },
  deleteEnergyRecord: async (id: string) => {
    await api.delete(`/real-estate/energy-consumption/${id}`);
  },

  // Maintenance Tasks
  getMaintenanceTasks: async (itemId?: string) => {
    const params = itemId ? { item_id: itemId } : {};
    const { data } = await api.get<MaintenanceTask[]>('/real-estate/maintenance-tasks', { params });
    return data;
  },
  createMaintenanceTask: async (payload: Omit<MaintenanceTask, 'id'>) => {
    const { data } = await api.post<MaintenanceTask>('/real-estate/maintenance-tasks', payload);
    return data;
  },
  updateMaintenanceTask: async (id: string, payload: Partial<MaintenanceTask>) => {
    const { data } = await api.put<MaintenanceTask>(`/real-estate/maintenance-tasks/${id}`, payload);
    return data;
  },
  deleteMaintenanceTask: async (id: string) => {
    await api.delete(`/real-estate/maintenance-tasks/${id}`);
  },
};
