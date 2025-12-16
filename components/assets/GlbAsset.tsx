import React from 'react';
import { useGLTF } from '@react-three/drei';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import { useMemo } from 'react';
import { AssetType } from '../../types';
import { getGlbConfig, GLB_ASSET_CONFIG } from '../../utils/assetMapping';

interface GlbAssetProps {
  assetType: AssetType;
  color?: string;
}

import { useStore } from '../../store/useStore';

/**
 * Unified GLB Asset component that renders any GLB-based 3D model
 * using the dynamic configuration from Store (DB) or fallback to static assetMapping.ts
 */
export const GlbAsset: React.FC<GlbAssetProps> = ({ assetType, color }) => {
  const { assetConfigs } = useStore();
  const staticConfig = getGlbConfig(assetType);

  // Prefer dynamic config from DB, fallback to static JSON
  const config = assetConfigs[assetType] || staticConfig;

  // If no GLB config exists for this asset type, return null
  if (!config) {
    console.warn(`No GLB config found for asset type: ${assetType}`);
    return null;
  }

  const { scene } = useGLTF(config.glbPath);

  // Clone the scene to allow multiple instances with independent properties
  const clonedScene = useMemo(() => {
    return clone(scene);
  }, [scene]);

  return (
    <group position={[0, 0, 0]}>
      <primitive
        object={clonedScene}
        scale={config.scale}
        position={config.position}
        rotation={config.rotation}
      />
    </group>
  );
};

// Dynamic preloading of all GLB assets from config
Object.values(GLB_ASSET_CONFIG).forEach((config) => {
  if (config?.glbPath) {
    useGLTF.preload(config.glbPath);
  }
});
