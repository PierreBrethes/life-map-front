import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsApi } from '../api/endpoints/items';
import { categoriesApi } from '../api/endpoints/categories';
import { dependenciesApi } from '../api/endpoints/dependencies';
import { settingsApi } from '../api/endpoints/settings';
import { recurringApi } from '../api/endpoints/recurring';

export const useLifeMapMutations = () => {
  const queryClient = useQueryClient();

  // --- SETTINGS ---
  const updateSettings = useMutation({
    mutationFn: settingsApi.update,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['settings'] }),
  });

  // --- ITEMS ---
  const createItem = useMutation({
    mutationFn: itemsApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  const updateItem = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      itemsApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  const deleteItem = useMutation({
    mutationFn: itemsApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  // --- CATEGORIES ---
  const createCategory = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  // --- DEPENDENCIES ---
  const createDependency = useMutation({
    mutationFn: dependenciesApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dependencies'] }),
  });

  const deleteDependency = useMutation({
    mutationFn: dependenciesApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dependencies'] }),
  });

  // --- RECURRING TRANSACTIONS ---
  const createRecurring = useMutation({
    mutationFn: recurringApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recurring'] }),
  });

  const updateRecurring = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      recurringApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recurring'] }),
  });

  const deleteRecurring = useMutation({
    mutationFn: recurringApi.delete,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['recurring'] }),
  });

  return {
    createItem,
    updateItem,
    deleteItem,
    createCategory,
    createDependency,
    deleteDependency,
    updateSettings,
    createRecurring,
    updateRecurring,
    deleteRecurring,
  };
};

