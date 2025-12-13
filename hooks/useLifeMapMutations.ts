import { useMutation, useQueryClient } from '@tanstack/react-query';
import { itemsApi } from '../api/endpoints/items';
import { categoriesApi } from '../api/endpoints/categories';
import { dependenciesApi } from '../api/endpoints/dependencies';
import { settingsApi } from '../api/endpoints/settings';
import { recurringApi } from '../api/endpoints/recurring';
import { useDependencies } from './useLifeMapData';

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

  // Retrieve dependencies to handle cascade deletion
  const { data: dependencies = [] } = useDependencies();

  const deleteItem = useMutation({
    mutationFn: async (id: string) => {
      // Find dependencies involving this item
      const relatedDeps = dependencies.filter(d =>
        d.fromItemId === id ||
        d.toItemId === id ||
        d.linkedItemId === id
      );

      // Delete them first
      if (relatedDeps.length > 0) {
        await Promise.all(relatedDeps.map(d => dependenciesApi.delete(d.id)));
      }

      // Delete the item
      return itemsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['dependencies'] });
    },
  });

  // --- CATEGORIES ---
  const createCategory = useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  const updateCategory = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { name?: string; color?: string; icon?: string } }) =>
      categoriesApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });

  const deleteCategory = useMutation({
    mutationFn: categoriesApi.delete,
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

  const updateDependency = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      dependenciesApi.update(id, data),
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
    updateCategory,
    deleteCategory,
    createDependency,
    deleteDependency,
    updateDependency,
    updateSettings,
    createRecurring,
    updateRecurring,
    deleteRecurring,
  };
};

