import { useState, useEffect, useCallback, useMemo } from 'react';
import { SocialEvent, Contact } from '../types';

const STORAGE_KEYS = {
  SOCIAL_EVENTS: 'lifemap_social_events',
  CONTACTS: 'lifemap_contacts',
};

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Load data from LocalStorage
 */
function loadFromStorage<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error loading ${key} from storage:`, error);
    return [];
  }
}

/**
 * Save data to LocalStorage
 */
function saveToStorage<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
}

/**
 * Hook for managing social data (events, contacts)
 */
export function useSocialData(itemId: string | undefined) {
  const [events, setEvents] = useState<SocialEvent[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount and when itemId changes
  useEffect(() => {
    if (!itemId) {
      setEvents([]);
      setContacts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const allEvents = loadFromStorage<SocialEvent>(STORAGE_KEYS.SOCIAL_EVENTS);
    const allContacts = loadFromStorage<Contact>(STORAGE_KEYS.CONTACTS);

    setEvents(allEvents.filter(e => e.itemId === itemId));
    setContacts(allContacts.filter(c => c.itemId === itemId));

    setIsLoading(false);
  }, [itemId]);

  // === EVENTS OPERATIONS ===

  const addEvent = useCallback((event: Omit<SocialEvent, 'id'>) => {
    const newEvent: SocialEvent = {
      ...event,
      id: generateId(),
    };

    const allEvents = loadFromStorage<SocialEvent>(STORAGE_KEYS.SOCIAL_EVENTS);
    saveToStorage(STORAGE_KEYS.SOCIAL_EVENTS, [...allEvents, newEvent]);

    if (event.itemId === itemId) {
      setEvents(prev => [...prev, newEvent].sort((a, b) => a.date - b.date));
    }

    return newEvent;
  }, [itemId]);

  const updateEvent = useCallback((eventId: string, updates: Partial<SocialEvent>) => {
    const allEvents = loadFromStorage<SocialEvent>(STORAGE_KEYS.SOCIAL_EVENTS);
    const updated = allEvents.map(e => e.id === eventId ? { ...e, ...updates } : e);
    saveToStorage(STORAGE_KEYS.SOCIAL_EVENTS, updated);

    setEvents(prev =>
      prev.map(e => e.id === eventId ? { ...e, ...updates } : e)
        .sort((a, b) => a.date - b.date)
    );
  }, []);

  const deleteEvent = useCallback((eventId: string) => {
    const allEvents = loadFromStorage<SocialEvent>(STORAGE_KEYS.SOCIAL_EVENTS);
    const updated = allEvents.filter(e => e.id !== eventId);
    saveToStorage(STORAGE_KEYS.SOCIAL_EVENTS, updated);

    setEvents(prev => prev.filter(e => e.id !== eventId));
  }, []);

  // === CONTACTS OPERATIONS ===

  const addContact = useCallback((contact: Omit<Contact, 'id'>) => {
    const newContact: Contact = {
      ...contact,
      id: generateId(),
    };

    const allContacts = loadFromStorage<Contact>(STORAGE_KEYS.CONTACTS);
    saveToStorage(STORAGE_KEYS.CONTACTS, [...allContacts, newContact]);

    if (contact.itemId === itemId) {
      setContacts(prev => [...prev, newContact].sort((a, b) => a.name.localeCompare(b.name)));
    }

    return newContact;
  }, [itemId]);

  const updateContact = useCallback((contactId: string, updates: Partial<Contact>) => {
    const allContacts = loadFromStorage<Contact>(STORAGE_KEYS.CONTACTS);
    const updated = allContacts.map(c => c.id === contactId ? { ...c, ...updates } : c);
    saveToStorage(STORAGE_KEYS.CONTACTS, updated);

    setContacts(prev =>
      prev.map(c => c.id === contactId ? { ...c, ...updates } : c)
        .sort((a, b) => a.name.localeCompare(b.name))
    );
  }, []);

  const deleteContact = useCallback((contactId: string) => {
    const allContacts = loadFromStorage<Contact>(STORAGE_KEYS.CONTACTS);
    const updated = allContacts.filter(c => c.id !== contactId);
    saveToStorage(STORAGE_KEYS.CONTACTS, updated);

    setContacts(prev => prev.filter(c => c.id !== contactId));
  }, []);

  // === COMPUTED VALUES ===

  const upcomingEvents = useMemo(() => {
    const now = Date.now();
    return events.filter(e => e.date >= now).slice(0, 5);
  }, [events]);

  const nextBirthday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();

    const upcoming = contacts
      .filter(c => c.birthday)
      .map(c => {
        const birthDate = new Date(c.birthday!);
        // Create date for this year
        let nextDate = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());

        // If passed, move to next year
        if (nextDate < today) {
          nextDate.setFullYear(currentYear + 1);
        }

        const daysUntil = Math.ceil((nextDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return {
          ...c,
          nextBirthdayDate: nextDate.getTime(),
          daysUntil,
          age: currentYear - birthDate.getFullYear() + (nextDate.getFullYear() > currentYear ? 1 : 0)
        };
      })
      .sort((a, b) => a.daysUntil - b.daysUntil);

    return upcoming[0] || null;
  }, [contacts]);

  const monthBirthdays = useMemo(() => {
    const currentMonth = new Date().getMonth();

    return contacts.filter(c => {
      if (!c.birthday) return false;
      const birthDate = new Date(c.birthday);
      return birthDate.getMonth() === currentMonth;
    }).sort((a, b) => {
      const dayA = new Date(a.birthday!).getDate();
      const dayB = new Date(b.birthday!).getDate();
      return dayA - dayB;
    });
  }, [contacts]);

  const overdueContacts = useMemo(() => {
    const now = Date.now();

    return contacts
      .filter(c => c.contactFrequencyDays && c.lastContactDate)
      .map(c => {
        const nextContactDate = c.lastContactDate! + (c.contactFrequencyDays! * 24 * 60 * 60 * 1000);
        const isOverdue = now > nextContactDate;
        const daysOverdue = isOverdue
          ? Math.ceil((now - nextContactDate) / (1000 * 60 * 60 * 24))
          : 0;

        return {
          ...c,
          isOverdue,
          daysOverdue,
          nextContactDate
        };
      })
      .filter(c => c.isOverdue)
      .sort((a, b) => b.daysOverdue - a.daysOverdue);
  }, [contacts]);

  return {
    // Data
    events,
    contacts,
    isLoading,

    // Events Operations
    addEvent,
    updateEvent,
    deleteEvent,
    upcomingEvents,

    // Contacts Operations
    addContact,
    updateContact,
    deleteContact,

    // Computed
    nextBirthday,
    monthBirthdays,
    overdueContacts,
  };
}

export default useSocialData;
