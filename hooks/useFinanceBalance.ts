import { useMemo } from 'react';
import { HistoryEntry, Subscription, LifeItem } from '../types';

// Finance-related asset types
export const FINANCE_ASSET_TYPES = ['finance', 'current_account', 'savings', 'investments', 'debt'] as const;

/**
 * Check if an asset type is a finance type
 */
export function isFinanceAssetType(assetType: string | undefined): boolean {
  return !!assetType && FINANCE_ASSET_TYPES.includes(assetType as any);
}

/**
 * Format a number as French currency
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Calculate the forecast balance (current - upcoming subscriptions in next N days)
 */
export function calculateForecast(
  currentBalance: number,
  subscriptions: Subscription[],
  daysAhead: number = 7
): number {
  const now = new Date();
  const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  let upcomingExpenses = 0;

  subscriptions
    .filter(sub => sub.isActive)
    .forEach(sub => {
      const currentDay = now.getDate();
      const billingDay = sub.billingDay;

      // Create next billing date
      let nextBilling = new Date(now.getFullYear(), now.getMonth(), billingDay);
      if (currentDay >= billingDay) {
        nextBilling.setMonth(nextBilling.getMonth() + 1);
      }

      // Check if it's within the future window
      if (nextBilling <= futureDate) {
        upcomingExpenses += sub.amount;
      }
    });

  return currentBalance - upcomingExpenses;
}

interface UseFinanceBalanceResult {
  /** Current balance (initialBalance + all history transactions) */
  balance: number;
  /** Formatted balance as currency string */
  formattedBalance: string;
  /** Forecast balance (balance - upcoming subscriptions in next 7 days) */
  forecast: number;
  /** Formatted forecast as currency string */
  formattedForecast: string;
  /** Whether the forecast is negative */
  isNegativeForecast: boolean;
}

/**
 * Hook to calculate and format finance-related balances.
 * 
 * SIMPLIFIED APPROACH:
 * - Balance = initialBalance (stored in item) + sum of all history transactions
 * - initialBalance is set ONCE when the user first enables sync
 * - If initialBalance is not set, we return 0 (no base value yet)
 * 
 * @param item - The LifeItem
 * @param history - Array of history entries for this item
 * @param subscriptions - Array of subscriptions for this item
 * @returns Computed balance values and formatted strings
 */
export function useFinanceBalance(
  item: LifeItem | null,
  history: HistoryEntry[],
  subscriptions: Subscription[]
): UseFinanceBalanceResult {
  // Get the fixed initial balance (set once when sync was first enabled)
  // If not set, default to 0
  const initialBalance = item?.initialBalance ?? 0;

  // Calculate balance: initial + all history transactions
  const balance = useMemo(() => {
    const historySum = history.reduce((sum, entry) => sum + entry.value, 0);
    return initialBalance + historySum;
  }, [initialBalance, history]);

  // Calculate 7-day forecast
  const forecast = useMemo(() => {
    return calculateForecast(balance, subscriptions, 7);
  }, [balance, subscriptions]);

  // Format values
  const formattedBalance = useMemo(() => formatCurrency(balance), [balance]);
  const formattedForecast = useMemo(() => formatCurrency(forecast), [forecast]);

  return {
    balance,
    formattedBalance,
    forecast,
    formattedForecast,
    isNegativeForecast: forecast < 0,
  };
}

export default useFinanceBalance;
