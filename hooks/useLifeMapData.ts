import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../api/endpoints/categories';
import { dependenciesApi } from '../api/endpoints/dependencies';
import { settingsApi } from '../api/endpoints/settings';
import { recurringApi } from '../api/endpoints/recurring';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: categoriesApi.getAll,
  });
};

export const useDependencies = () => {
  return useQuery({
    queryKey: ['dependencies'],
    queryFn: dependenciesApi.getAll,
  });
};

export const useSettings = () => {
  return useQuery({
    queryKey: ['settings'],
    queryFn: settingsApi.get,
  });
};

export const useRecurringTransactions = (accountId?: string) => {
  return useQuery({
    queryKey: ['recurring', accountId],
    queryFn: () => recurringApi.getAll(accountId),
  });
};

export const useSyncRecurring = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: recurringApi.sync,
    onSuccess: () => {
      // Invalidate history to show new entries created by sync
      queryClient.invalidateQueries({ queryKey: ['history'] });
      queryClient.invalidateQueries({ queryKey: ['recurring'] });
    },
  });
};
