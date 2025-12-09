import api from '../axios';
import { UserSettings } from '../../types';

export const settingsApi = {
  get: async () => {
    const { data } = await api.get<UserSettings>('/settings');
    return data;
  },
  update: async (payload: Partial<UserSettings>) => {
    const { data } = await api.put<UserSettings>('/settings', payload);
    return data;
  },
};
