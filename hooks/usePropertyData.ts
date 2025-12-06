import { useState, useEffect, useCallback } from 'react';
import { PropertyValuation, EnergyConsumption, MaintenanceTask } from '../types';

const STORAGE_KEYS = {
  PROPERTY: 'lifemap_property',
  ENERGY: 'lifemap_energy',
  MAINTENANCE: 'lifemap_maintenance',
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
 * Hook for managing property-specific data (valuation, energy, maintenance)
 */
export function usePropertyData(itemId: string | undefined) {
  const [valuation, setValuation] = useState<PropertyValuation | null>(null);
  const [energy, setEnergy] = useState<EnergyConsumption[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data on mount and when itemId changes
  useEffect(() => {
    if (!itemId) {
      setValuation(null);
      setEnergy([]);
      setMaintenance([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Load all data
    const allValuations = loadFromStorage<PropertyValuation>(STORAGE_KEYS.PROPERTY);
    const allEnergy = loadFromStorage<EnergyConsumption>(STORAGE_KEYS.ENERGY);
    const allMaintenance = loadFromStorage<MaintenanceTask>(STORAGE_KEYS.MAINTENANCE);

    // Filter by itemId
    setValuation(allValuations.find(v => v.itemId === itemId) || null);
    setEnergy(allEnergy.filter(e => e.itemId === itemId));
    setMaintenance(allMaintenance.filter(m => m.itemId === itemId));

    setIsLoading(false);
  }, [itemId]);

  // === PROPERTY VALUATION OPERATIONS ===

  const createValuation = useCallback((data: Omit<PropertyValuation, 'id'>) => {
    const newValuation: PropertyValuation = {
      ...data,
      id: generateId(),
    };

    const allValuations = loadFromStorage<PropertyValuation>(STORAGE_KEYS.PROPERTY);
    // Remove existing valuation for this item if any
    const filtered = allValuations.filter(v => v.itemId !== data.itemId);
    saveToStorage(STORAGE_KEYS.PROPERTY, [...filtered, newValuation]);
    setValuation(newValuation);

    return newValuation;
  }, []);

  const updateValuation = useCallback((updates: Partial<PropertyValuation>) => {
    if (!valuation) return;

    const updated = { ...valuation, ...updates };
    const allValuations = loadFromStorage<PropertyValuation>(STORAGE_KEYS.PROPERTY);
    const newList = allValuations.map(v => v.id === valuation.id ? updated : v);
    saveToStorage(STORAGE_KEYS.PROPERTY, newList);
    setValuation(updated);
  }, [valuation]);

  // === ENERGY OPERATIONS ===

  const addEnergyEntry = useCallback((entry: Omit<EnergyConsumption, 'id'>) => {
    const newEntry: EnergyConsumption = {
      ...entry,
      id: generateId(),
    };

    const allEnergy = loadFromStorage<EnergyConsumption>(STORAGE_KEYS.ENERGY);
    saveToStorage(STORAGE_KEYS.ENERGY, [...allEnergy, newEntry]);

    if (entry.itemId === itemId) {
      setEnergy(prev => [...prev, newEntry].sort((a, b) => a.date - b.date));
    }

    return newEntry;
  }, [itemId]);

  const deleteEnergyEntry = useCallback((entryId: string) => {
    const allEnergy = loadFromStorage<EnergyConsumption>(STORAGE_KEYS.ENERGY);
    const updated = allEnergy.filter(e => e.id !== entryId);
    saveToStorage(STORAGE_KEYS.ENERGY, updated);
    setEnergy(prev => prev.filter(e => e.id !== entryId));
  }, []);

  // === MAINTENANCE OPERATIONS ===

  const addMaintenanceTask = useCallback((task: Omit<MaintenanceTask, 'id' | 'createdAt'>) => {
    const newTask: MaintenanceTask = {
      ...task,
      id: generateId(),
      createdAt: Date.now(),
    };

    const allMaintenance = loadFromStorage<MaintenanceTask>(STORAGE_KEYS.MAINTENANCE);
    saveToStorage(STORAGE_KEYS.MAINTENANCE, [...allMaintenance, newTask]);

    if (task.itemId === itemId) {
      setMaintenance(prev => [...prev, newTask]);
    }

    return newTask;
  }, [itemId]);

  const updateMaintenanceTask = useCallback((taskId: string, updates: Partial<MaintenanceTask>) => {
    const allMaintenance = loadFromStorage<MaintenanceTask>(STORAGE_KEYS.MAINTENANCE);
    const updated = allMaintenance.map(t => t.id === taskId ? { ...t, ...updates } : t);
    saveToStorage(STORAGE_KEYS.MAINTENANCE, updated);
    setMaintenance(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t));
  }, []);

  const deleteMaintenanceTask = useCallback((taskId: string) => {
    const allMaintenance = loadFromStorage<MaintenanceTask>(STORAGE_KEYS.MAINTENANCE);
    const updated = allMaintenance.filter(t => t.id !== taskId);
    saveToStorage(STORAGE_KEYS.MAINTENANCE, updated);
    setMaintenance(prev => prev.filter(t => t.id !== taskId));
  }, []);

  // === COMPUTED VALUES ===

  const pendingMaintenanceCount = maintenance.filter(t => !t.isCompleted).length;
  const urgentMaintenanceCount = maintenance.filter(
    t => !t.isCompleted && (t.urgency === 'critical' || t.urgency === 'high')
  ).length;

  return {
    // Data
    valuation,
    energy,
    maintenance,
    isLoading,

    // Property operations
    createValuation,
    updateValuation,

    // Energy operations
    addEnergyEntry,
    deleteEnergyEntry,

    // Maintenance operations
    addMaintenanceTask,
    updateMaintenanceTask,
    deleteMaintenanceTask,

    // Computed
    pendingMaintenanceCount,
    urgentMaintenanceCount,
  };
}

export default usePropertyData;
