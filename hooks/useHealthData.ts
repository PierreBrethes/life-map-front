import { useState, useEffect, useCallback, useMemo } from 'react';
import { BodyMetric, HealthAppointment } from '../types';

const STORAGE_KEYS = {
  HEALTH_METRICS: 'lifemap_health_metrics',
  HEALTH_APPOINTMENTS: 'lifemap_health_appointments',
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
 * Hook for managing health data (body metrics, appointments)
 */
export function useHealthData(itemId: string | undefined) {
  const [metrics, setMetrics] = useState<BodyMetric[]>([]);
  const [appointments, setAppointments] = useState<HealthAppointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount and when itemId changes
  useEffect(() => {
    if (!itemId) {
      setMetrics([]);
      setAppointments([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const allMetrics = loadFromStorage<BodyMetric>(STORAGE_KEYS.HEALTH_METRICS);
    const allAppointments = loadFromStorage<HealthAppointment>(STORAGE_KEYS.HEALTH_APPOINTMENTS);

    setMetrics(allMetrics.filter(m => m.itemId === itemId));
    setAppointments(allAppointments.filter(a => a.itemId === itemId));

    setIsLoading(false);
  }, [itemId]);

  // === METRICS OPERATIONS ===

  const addMetric = useCallback((metric: Omit<BodyMetric, 'id'>) => {
    const newMetric: BodyMetric = {
      ...metric,
      id: generateId(),
    };

    const allMetrics = loadFromStorage<BodyMetric>(STORAGE_KEYS.HEALTH_METRICS);
    saveToStorage(STORAGE_KEYS.HEALTH_METRICS, [...allMetrics, newMetric]);

    if (metric.itemId === itemId) {
      setMetrics(prev => [...prev, newMetric].sort((a, b) => a.date - b.date));
    }

    return newMetric;
  }, [itemId]);

  const deleteMetric = useCallback((metricId: string) => {
    const allMetrics = loadFromStorage<BodyMetric>(STORAGE_KEYS.HEALTH_METRICS);
    const updated = allMetrics.filter(m => m.id !== metricId);
    saveToStorage(STORAGE_KEYS.HEALTH_METRICS, updated);

    setMetrics(prev => prev.filter(m => m.id !== metricId));
  }, []);

  // === APPOINTMENTS OPERATIONS ===

  const addAppointment = useCallback((appointment: Omit<HealthAppointment, 'id'>) => {
    const newAppointment: HealthAppointment = {
      ...appointment,
      id: generateId(),
    };

    const allAppointments = loadFromStorage<HealthAppointment>(STORAGE_KEYS.HEALTH_APPOINTMENTS);
    saveToStorage(STORAGE_KEYS.HEALTH_APPOINTMENTS, [...allAppointments, newAppointment]);

    if (appointment.itemId === itemId) {
      setAppointments(prev => [...prev, newAppointment].sort((a, b) => a.date - b.date));
    }

    return newAppointment;
  }, [itemId]);

  const updateAppointment = useCallback((appointmentId: string, updates: Partial<HealthAppointment>) => {
    const allAppointments = loadFromStorage<HealthAppointment>(STORAGE_KEYS.HEALTH_APPOINTMENTS);
    const updated = allAppointments.map(a => a.id === appointmentId ? { ...a, ...updates } : a);
    saveToStorage(STORAGE_KEYS.HEALTH_APPOINTMENTS, updated);

    setAppointments(prev =>
      prev.map(a => a.id === appointmentId ? { ...a, ...updates } : a)
        .sort((a, b) => a.date - b.date)
    );
  }, []);

  const deleteAppointment = useCallback((appointmentId: string) => {
    const allAppointments = loadFromStorage<HealthAppointment>(STORAGE_KEYS.HEALTH_APPOINTMENTS);
    const updated = allAppointments.filter(a => a.id !== appointmentId);
    saveToStorage(STORAGE_KEYS.HEALTH_APPOINTMENTS, updated);

    setAppointments(prev => prev.filter(a => a.id !== appointmentId));
  }, []);

  // === COMPUTED VALUES ===

  const latestMetric = useMemo(() => {
    if (metrics.length === 0) return null;
    return metrics[metrics.length - 1]; // Sorted by date
  }, [metrics]);

  const bmi = useMemo(() => {
    if (!latestMetric || !latestMetric.height || !latestMetric.weight) return null;
    const heightInMeters = latestMetric.height / 100;
    return (latestMetric.weight / (heightInMeters * heightInMeters)).toFixed(1);
  }, [latestMetric]);

  const weightTrend = useMemo(() => {
    if (metrics.length < 2) return null;
    const current = metrics[metrics.length - 1].weight;
    const previous = metrics[metrics.length - 2].weight;
    const diff = current - previous;
    return {
      value: Math.abs(diff).toFixed(1),
      direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable',
      percentage: ((diff / previous) * 100).toFixed(1)
    };
  }, [metrics]);

  const upcomingAppointments = useMemo(() => {
    const now = Date.now();
    return appointments
      .filter(a => a.date >= now && !a.isCompleted)
      .slice(0, 5);
  }, [appointments]);

  return {
    // Data
    metrics,
    appointments,
    isLoading,

    // Operations
    addMetric,
    deleteMetric,
    addAppointment,
    updateAppointment,
    deleteAppointment,

    // Computed
    latestMetric,
    bmi,
    weightTrend,
    upcomingAppointments,
  };
}

export default useHealthData;
