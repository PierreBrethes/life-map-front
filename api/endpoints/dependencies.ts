import api from '../axios';
import { Dependency } from '../../types';

interface CreateDependencyPayload {
  fromCategoryId: string;
  fromItemId: string;
  toCategoryId: string;
  toItemId: string;
}

interface UpdateDependencyPayload {
  fromCategory?: string;
  fromItem?: string;
  toCategory?: string;
  toItem?: string;
}

export const dependenciesApi = {
  getAll: async () => {
    const { data } = await api.get<Dependency[]>('/dependencies');
    return data;
  },

  getOne: async (id: string) => {
    const { data } = await api.get<Dependency>(`/dependencies/${id}`);
    return data;
  },

  create: async (payload: CreateDependencyPayload) => {
    const { data } = await api.post<Dependency>('/dependencies', payload);
    return data;
  },

  update: async (id: string, payload: UpdateDependencyPayload) => {
    const { data } = await api.put<Dependency>(`/dependencies/${id}`, payload);
    return data;
  },

  delete: async (id: string) => {
    await api.delete(`/dependencies/${id}`);
  },
};
