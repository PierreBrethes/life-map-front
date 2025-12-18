
import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, ContactShadows, useGLTF, useAnimations, Environment } from '@react-three/drei';
import { clone } from 'three/addons/utils/SkeletonUtils.js';
import { useControls, button, Leva } from 'leva';
import { GlbAssetConfig, GLB_ASSET_CONFIG } from '../utils/assetMapping';
import { useAssetConfigs } from '../hooks/useLifeMapData';
import { assetsApi } from '../api/endpoints/assets';
import { useQueryClient } from '@tanstack/react-query';

// Simple GLB Viewer Component
const GlbViewer: React.FC<{
  path: string;
  config: GlbAssetConfig;
  onAnimationsLoaded?: (names: string[]) => void;
  currentAnimation?: string;
}> = ({ path, config, onAnimationsLoaded, currentAnimation }) => {
  // Use the internal GlbModel logic directly here or reuse GlbAsset?
  // Since GlbAsset is specific to app logic (DB store), we might duplicate logic or refactor GlbAsset to be reusable.
  // Actually, GlbAsset uses useStore internally.
  // For Studio, we want to preview 'localConfig', which might differ from store.
  // So we should replicate the animation logic of GlbAsset here for the previewer.

  const { scene, animations } = useGLTF(path);
  const { ref, actions } = useAnimations(animations);
  const clonedScene = React.useMemo(() => clone(scene), [scene]);

  useEffect(() => {
    if (animations.length > 0 && onAnimationsLoaded) {
      onAnimationsLoaded(animations.map(c => c.name));
    }
  }, [animations, onAnimationsLoaded]);

  useEffect(() => {
    // Stop all animations if currentAnimation is empty or changes
    Object.values(actions).forEach((a: any) => a?.stop());

    if (currentAnimation && actions[currentAnimation]) {
      actions[currentAnimation]?.reset().fadeIn(0.5).play();
    }
  }, [currentAnimation, actions]);

  return (
    <primitive
      ref={ref}
      object={clonedScene}
      scale={[config.scale, config.scale, config.scale]}
      position={config.position}
      rotation={config.rotation}
    />
  );
};

const AssetStudio: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: fetchedConfigs, isLoading } = useAssetConfigs();

  // Local state initialized with combined configs
  const [localConfig, setLocalConfig] = useState<Record<string, GlbAssetConfig>>(GLB_ASSET_CONFIG as Record<string, GlbAssetConfig>);

  useEffect(() => {
    if (fetchedConfigs) {
      setLocalConfig(prev => ({ ...prev, ...fetchedConfigs }));
    }
  }, [fetchedConfigs]);

  // Get all available asset keys
  const assetKeys = Object.keys(localConfig);

  // Selector for Asset
  const { selectedAssetKey } = useControls('Asset Selector', {
    selectedAssetKey: { options: assetKeys, value: assetKeys[0] || '' },
  }, [localConfig]); // Dependency ensures options enable after load

  // Get config for CURRENT selection
  const currentAssetConfig = localConfig[selectedAssetKey];

  // Animation State
  const [animations, setAnimations] = useState<string[]>([]);
  const [activeAnimation, setActiveAnimation] = useState<string>('');

  // Leva Controls for the SELECTED asset
  // We use Leva to drive this state.
  const [controls, setControls] = useControls('Transform Settings 🔧', () => {
    if (!currentAssetConfig) return {};
    return {
      scale: { value: currentAssetConfig.scale, min: 0.01, max: 2.5, step: 0.01 },
      position: { value: currentAssetConfig.position, step: 0.01 },
      rotation: { value: currentAssetConfig.rotation, step: 0.01 },
      previewScale: { value: currentAssetConfig.previewScale, min: 0.1, max: 2.0, step: 0.01 },
    };
  }, [selectedAssetKey, currentAssetConfig]);

  // Animation Controls in Leva
  useControls('Animations 🎬', () => {
    if (animations.length === 0) return { Info: { value: 'No animations found', editable: false } };

    // Create a button for each animation
    const animControls: Record<string, any> = {};
    animations.forEach(anim => {
      animControls[anim] = button(() => setActiveAnimation(anim));
    });

    // Add Stop button
    animControls['STOP'] = button(() => setActiveAnimation(''));

    return animControls;
  }, [animations]);

  // Update local config state when Leva changes
  useEffect(() => {
    if (!currentAssetConfig) return;

    setLocalConfig(prev => ({
      ...prev,
      [selectedAssetKey]: {
        ...prev[selectedAssetKey],
        scale: controls.scale,
        position: controls.position as [number, number, number],
        rotation: controls.rotation as [number, number, number],
        previewScale: controls.previewScale
      }
    }));
  }, [controls, selectedAssetKey]);


  // Global Actions
  useControls('Actions', {
    'SAUVEGARDER (DB)': button(async () => {
      if (!currentAssetConfig) return;
      try {
        const updated = await assetsApi.updateConfig(selectedAssetKey, localConfig[selectedAssetKey]);
        alert(`Config pour ${selectedAssetKey} sauvegardée en BDD ! 💾`);
        queryClient.invalidateQueries({ queryKey: ['assetConfigs'] });
      } catch (e) {
        console.error(e);
        alert("Erreur lors de la sauvegarde.");
      }
    })
  }, [localConfig, selectedAssetKey]);

  if (isLoading || !currentAssetConfig) return <div className="flex h-screen items-center justify-center bg-slate-900 text-white">Chargement des assets...</div>;

  return (
    <div className="w-full h-screen flex bg-slate-900 text-white">
      <Leva
        theme={{
          sizes: {
            rootWidth: '420px',
            controlWidth: '240px',
            rowHeight: '36px',
            folderTitleHeight: '30px',
            checkboxSize: '24px',
            joystickWidth: '150px',
            joystickHeight: '150px',
            colorPickerWidth: '240px',
            colorPickerHeight: '150px',
            monitorHeight: '90px',
            titleBarHeight: '58px',
          },
          fontSizes: {
            root: '16px',
            toolTip: '16px',
          },
          space: {
            rowGap: '6px',
            colGap: '6px',
          }
        }}
      />
      {/* 3D Viewport */}
      <div className="flex-1 relative">
        <Canvas shadows camera={{ position: [3, 3, 3], fov: 50 }}>
          <color attach="background" args={['#1e293b']} />
          <Suspense fallback={null}>
            {/* Replacement for Stage: Manual Lighting & Environment for true scale */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
            <Environment preset="city" />

            <group position={[0, 0, 0]}>
              {currentAssetConfig && (
                <GlbViewer
                  key={selectedAssetKey} // Remount on key change
                  path={currentAssetConfig.glbPath}
                  config={currentAssetConfig}
                  onAnimationsLoaded={setAnimations}
                  currentAnimation={activeAnimation}
                />
              )}
            </group>
          </Suspense>
          <OrbitControls makeDefault />
          <Grid infiniteGrid fadeDistance={30} sectionColor="#4f46e5" cellColor="#64748b" />
          <ContactShadows opacity={0.5} scale={10} blur={2} far={4} resolution={256} color="#000000" />
        </Canvas>

        <div className="absolute top-4 left-4 bg-black/50 p-4 rounded backdrop-blur text-sm pointer-events-none">
          <h1 className="text-xl font-bold mb-2">Asset Studio (DB Mode) 🗄️</h1>
          <p>1. Sélectionne un Asset</p>
          <p>2. Ajuste Scale / Position</p>
          <p>3. Clique <b>"SAUVEGARDER (DB)"</b></p>
          <p className="text-green-400 mt-2">Les changements sont appliqués immédiatement à l'app.</p>
        </div>
      </div>
    </div>
  );
};

export default AssetStudio;
