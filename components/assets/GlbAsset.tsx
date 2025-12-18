import React, { useEffect, useRef, useMemo } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import { AssetType } from '../../types';
import { getGlbConfig, GLB_ASSET_CONFIG } from '../../utils/assetMapping';
import { useStore } from '../../store/useStore';
import { Object3D } from 'three';

export interface AnimationInfo {
  name: string;
  duration: number; // in seconds
}

interface GlbAssetProps {
  assetType: AssetType;
  color?: string;
  onAnimationsLoaded?: (animations: AnimationInfo[]) => void;
  currentAnimation?: string;
}

/**
 * Unified GLB Asset component that renders any GLB-based 3D model
 * using the dynamic configuration from Store (DB) or fallback to static assetMapping.ts
 */
export const GlbAsset: React.FC<GlbAssetProps> = ({ assetType, color, onAnimationsLoaded, currentAnimation }) => {
  const { assetConfigs } = useStore();
  const staticConfig = getGlbConfig(assetType);

  // Prefer dynamic config from DB, fallback to static JSON
  const config = assetConfigs[assetType] || staticConfig;

  if (!config) {
    console.warn(`No GLB config found for asset type: ${assetType}`);
    return null;
  }

  return <GlbModel
    path={config.glbPath}
    config={config}
    onAnimationsLoaded={onAnimationsLoaded}
    currentAnimation={currentAnimation}
  />;
};

// Separated component to ensure hooks are called correctly with a valid path
const GlbModel: React.FC<{
  path: string;
  config: any;
  onAnimationsLoaded?: (animations: AnimationInfo[]) => void;
  currentAnimation?: string;
}> = ({ path, config, onAnimationsLoaded, currentAnimation }) => {
  const sceneRef = useRef<Object3D>(null);
  const { scene, animations } = useGLTF(path);

  // Clone the scene to allow multiple instances with independent properties
  const clonedScene = useMemo(() => clone(scene), [scene]);

  // Use animations with direct ref to the cloned scene object
  const { actions } = useAnimations(animations, clonedScene);

  // Report animation names WITH durations
  useEffect(() => {
    if (animations && animations.length > 0 && onAnimationsLoaded) {
      const animInfos: AnimationInfo[] = animations.map(clip => ({
        name: clip.name,
        duration: clip.duration
      }));
      onAnimationsLoaded(animInfos);
    }
  }, [animations, onAnimationsLoaded]);

  // Play requested animation
  useEffect(() => {
    // Stop all current animations first
    Object.values(actions).forEach(action => action?.stop());

    if (currentAnimation && actions[currentAnimation]) {
      actions[currentAnimation]?.reset().fadeIn(0.3).play();
    }
  }, [currentAnimation, actions]);

  return (
    <group position={[0, 0, 0]}>
      <primitive
        ref={sceneRef}
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
