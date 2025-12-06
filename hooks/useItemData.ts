import { useState, useEffect, useCallback } from 'react';
import { HistoryEntry, Subscription, Alert } from '../types';

const STORAGE_KEYS = {
  HISTORY: 'lifemap_history',
  SUBSCRIPTIONS: 'lifemap_subscriptions',
  ALERTS: 'lifemap_alerts',
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
 * Hook for managing item-specific data (history, subscriptions, alerts)
 * Designed to be swapped with API calls later
 */
export function useItemData(itemId: string | undefined) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount and when itemId changes
  useEffect(() => {
    if (!itemId) {
      setHistory([]);
      setSubscriptions([]);
      setAlerts([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Load all data
    const allHistory = loadFromStorage<HistoryEntry>(STORAGE_KEYS.HISTORY);
    const allSubscriptions = loadFromStorage<Subscription>(STORAGE_KEYS.SUBSCRIPTIONS);
    const allAlerts = loadFromStorage<Alert>(STORAGE_KEYS.ALERTS);

    // Filter by itemId
    setHistory(allHistory.filter(h => h.itemId === itemId));
    setSubscriptions(allSubscriptions.filter(s => s.itemId === itemId));
    setAlerts(allAlerts.filter(a => a.itemId === itemId));

    setIsLoading(false);
  }, [itemId]);

  // === HISTORY OPERATIONS ===

  const addHistoryEntry = useCallback((entry: Omit<HistoryEntry, 'id'>) => {
    const newEntry: HistoryEntry = {
      ...entry,
      id: generateId(),
    };

    const allHistory = loadFromStorage<HistoryEntry>(STORAGE_KEYS.HISTORY);
    const updated = [...allHistory, newEntry];
    saveToStorage(STORAGE_KEYS.HISTORY, updated);

    if (entry.itemId === itemId) {
      setHistory(prev => [...prev, newEntry].sort((a, b) => a.date - b.date));
    }

    return newEntry;
  }, [itemId]);

  const deleteHistoryEntry = useCallback((entryId: string) => {
    const allHistory = loadFromStorage<HistoryEntry>(STORAGE_KEYS.HISTORY);
    const updated = allHistory.filter(h => h.id !== entryId);
    saveToStorage(STORAGE_KEYS.HISTORY, updated);
    setHistory(prev => prev.filter(h => h.id !== entryId));
  }, []);

  // === SUBSCRIPTION OPERATIONS ===

  const addSubscription = useCallback((subscription: Omit<Subscription, 'id'>) => {
    const newSub: Subscription = {
      ...subscription,
      id: generateId(),
    };

    const allSubs = loadFromStorage<Subscription>(STORAGE_KEYS.SUBSCRIPTIONS);
    const updated = [...allSubs, newSub];
    saveToStorage(STORAGE_KEYS.SUBSCRIPTIONS, updated);

    if (subscription.itemId === itemId) {
      setSubscriptions(prev => [...prev, newSub]);
    }

    return newSub;
  }, [itemId]);

  const updateSubscription = useCallback((subId: string, updates: Partial<Subscription>) => {
    const allSubs = loadFromStorage<Subscription>(STORAGE_KEYS.SUBSCRIPTIONS);
    const updated = allSubs.map(s => s.id === subId ? { ...s, ...updates } : s);
    saveToStorage(STORAGE_KEYS.SUBSCRIPTIONS, updated);
    setSubscriptions(prev => prev.map(s => s.id === subId ? { ...s, ...updates } : s));
  }, []);

  const deleteSubscription = useCallback((subId: string) => {
    const allSubs = loadFromStorage<Subscription>(STORAGE_KEYS.SUBSCRIPTIONS);
    const updated = allSubs.filter(s => s.id !== subId);
    saveToStorage(STORAGE_KEYS.SUBSCRIPTIONS, updated);
    setSubscriptions(prev => prev.filter(s => s.id !== subId));
  }, []);

  const toggleSubscription = useCallback((subId: string) => {
    const sub = subscriptions.find(s => s.id === subId);
    if (sub) {
      updateSubscription(subId, { isActive: !sub.isActive });
    }
  }, [subscriptions, updateSubscription]);

  // === ALERT OPERATIONS ===

  const addAlert = useCallback((alert: Omit<Alert, 'id' | 'createdAt'>) => {
    const newAlert: Alert = {
      ...alert,
      id: generateId(),
      createdAt: Date.now(),
    };

    const allAlerts = loadFromStorage<Alert>(STORAGE_KEYS.ALERTS);
    const updated = [...allAlerts, newAlert];
    saveToStorage(STORAGE_KEYS.ALERTS, updated);

    if (alert.itemId === itemId) {
      setAlerts(prev => [...prev, newAlert]);
    }

    return newAlert;
  }, [itemId]);

  const updateAlert = useCallback((alertId: string, updates: Partial<Alert>) => {
    const allAlerts = loadFromStorage<Alert>(STORAGE_KEYS.ALERTS);
    const updated = allAlerts.map(a => a.id === alertId ? { ...a, ...updates } : a);
    saveToStorage(STORAGE_KEYS.ALERTS, updated);
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, ...updates } : a));
  }, []);

  const deleteAlert = useCallback((alertId: string) => {
    const allAlerts = loadFromStorage<Alert>(STORAGE_KEYS.ALERTS);
    const updated = allAlerts.filter(a => a.id !== alertId);
    saveToStorage(STORAGE_KEYS.ALERTS, updated);
    setAlerts(prev => prev.filter(a => a.id !== alertId));
  }, []);

  const toggleAlert = useCallback((alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
      updateAlert(alertId, { isActive: !alert.isActive });
    }
  }, [alerts, updateAlert]);

  // === COMPUTED VALUES ===

  const totalMonthlySubscriptions = subscriptions
    .filter(s => s.isActive)
    .reduce((sum, s) => sum + s.amount, 0);

  const getNextBillingDate = useCallback((billingDay: number): Date => {
    const now = new Date();
    const currentDay = now.getDate();
    const nextDate = new Date(now.getFullYear(), now.getMonth(), billingDay);

    if (currentDay >= billingDay) {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }

    return nextDate;
  }, []);

  // Get the highest severity active alert
  const activeAlertSeverity = useCallback((): 'ok' | 'warning' | 'critical' => {
    const activeAlerts = alerts.filter(a => a.isActive);
    if (activeAlerts.some(a => a.severity === 'critical')) return 'critical';
    if (activeAlerts.some(a => a.severity === 'warning')) return 'warning';
    return 'ok';
  }, [alerts]);

  const activeAlertsCount = alerts.filter(a => a.isActive).length;

  return {
    // Data
    history,
    subscriptions,
    alerts,
    isLoading,

    // History operations
    addHistoryEntry,
    deleteHistoryEntry,

    // Subscription operations
    addSubscription,
    updateSubscription,
    deleteSubscription,
    toggleSubscription,

    // Alert operations
    addAlert,
    updateAlert,
    deleteAlert,
    toggleAlert,

    // Computed
    totalMonthlySubscriptions,
    getNextBillingDate,
    activeAlertSeverity,
    activeAlertsCount,
  };
}

export default useItemData;
