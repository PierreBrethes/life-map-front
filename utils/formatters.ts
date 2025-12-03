import { ItemType, ItemStatus } from '../types';

export const parseValueToNumber = (val: string): number => {
  const clean = val.toLowerCase().replace(/[^0-9.k]/g, '');
  let multiplier = 1;
  if (clean.endsWith('k')) multiplier = 1000;
  const num = parseFloat(clean);
  return isNaN(num) ? 0 : num * multiplier;
};

export const formatDisplayValue = (value: string, type: ItemType): string => {
  if (type === 'currency') {
    if (value.includes('€') || value.includes('$')) return value;
    const num = parseFloat(value);
    if (!isNaN(num)) {
      if (num >= 1000) return (num / 1000).toFixed(1) + 'k€';
      return num + '€';
    }
    return value + '€';
  }
  if (type === 'percentage') {
    if (value.includes('%')) return value;
    return value + '%';
  }
  return value;
};

export const getStatusColor = (baseColor: string, status: ItemStatus): string => {
  if (status === 'critical') return '#ef4444';
  if (status === 'warning') return '#f59e0b';
  return baseColor;
};
