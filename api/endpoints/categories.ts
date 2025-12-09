import api from '../axios';
import { Category } from '../../types';

interface CreateCategoryPayload {
  name: string;
  color: string;
  icon?: string;
}

interface UpdateCategoryPayload {
  name?: string;
  color?: string;
  icon?: string;
}

export const categoriesApi = {
  getAll: async () => {
    const { data } = await api.get<Category[]>('/categories');
    return data;
  },

  getOne: async (id: string) => {
    const { data } = await api.get<Category>(`/categories/${id}`);
    return data;
  },

  create: async (payload: CreateCategoryPayload) => {
    const { data } = await api.post<Category>('/categories', payload);
    return data;
  },

  update: async (id: string, payload: UpdateCategoryPayload) => {
    const { data } = await api.put<Category>(`/categories/${id}`, payload);
    return data;
  },

  delete: async (id: string) => {
    await api.delete(`/categories/${id}`);
  },
};
