import api from '../axios';
import { SocialEvent, Contact } from '../../types';

export const socialApi = {
  // Events
  getEvents: async (itemId?: string) => {
    const params = itemId ? { item_id: itemId } : {};
    const { data } = await api.get<SocialEvent[]>('/social/events', { params });
    return data;
  },
  createEvent: async (payload: Omit<SocialEvent, 'id'>) => {
    const { data } = await api.post<SocialEvent>('/social/events', payload);
    return data;
  },
  updateEvent: async (id: string, payload: Partial<SocialEvent>) => {
    const { data } = await api.put<SocialEvent>(`/social/events/${id}`, payload);
    return data;
  },
  deleteEvent: async (id: string) => {
    await api.delete(`/social/events/${id}`);
  },

  // Contacts
  getContacts: async (itemId?: string) => {
    const params = itemId ? { item_id: itemId } : {};
    const { data } = await api.get<Contact[]>('/social/contacts', { params });
    return data;
  },
  createContact: async (payload: Omit<Contact, 'id'>) => {
    const { data } = await api.post<Contact>('/social/contacts', payload);
    return data;
  },
  updateContact: async (id: string, payload: Partial<Contact>) => {
    const { data } = await api.put<Contact>(`/social/contacts/${id}`, payload);
    return data;
  },
  deleteContact: async (id: string) => {
    await api.delete(`/social/contacts/${id}`);
  },
};
