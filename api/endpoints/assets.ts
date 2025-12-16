import api from '../axios';
import { GlbAssetConfig } from '../../utils/assetMapping';

export const assetsApi = {
  getConfig: async (): Promise<Record<string, GlbAssetConfig>> => {
    const response = await api.get<Record<string, GlbAssetConfig>>('/assets/config');
    return response.data;
  },

  updateConfig: async (assetType: string, config: GlbAssetConfig): Promise<GlbAssetConfig> => {
    const response = await api.put<GlbAssetConfig>(`/assets/config/${assetType}`, config);
    return response.data;
  },
};
