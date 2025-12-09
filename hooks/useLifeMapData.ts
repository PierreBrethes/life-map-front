import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '../api/endpoints/categories';
import { dependenciesApi } from '../api/endpoints/dependencies';
import { settingsApi } from '../api/endpoints/settings';

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
