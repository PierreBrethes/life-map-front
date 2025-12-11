import api from '../axios';
import { LifeItem, ItemType, ItemStatus, AssetType } from '../../types';

interface CreateItemPayload {
  name: string;
  value: string;
  type: ItemType;
  status: ItemStatus;
  assetType?: AssetType;
  categoryId: string; // Required by backend
}

interface UpdateItemPayload {
  name?: string;
  value?: string;
  type?: ItemType;
  status?: ItemStatus;
  assetType?: AssetType;
  categoryId?: string;
}

export const itemsApi = {
  getAll: async () => {
    const { data } = await api.get<LifeItem[]>('/items');
    return data;
  },

  getOne: async (id: string) => {
    const { data } = await api.get<LifeItem>(`/items/${id}`);
    return data;
  },

  create: async (payload: CreateItemPayload) => {
    const { data } = await api.post<LifeItem>('/items', payload);
    return data;
  },

  update: async (id: string, payload: UpdateItemPayload) => {
    const { data } = await api.put<LifeItem>(`/items/${id}`, payload);
    return data;
  },

  delete: async (id: string) => {
    await api.delete(`/items/${id}`);
  },

  updateWidgetOrder: async (id: string, order: string[]) => {
    const { data } = await api.put<LifeItem>(`/items/${id}/widget-order`, { order });
    return data;
  },
};

