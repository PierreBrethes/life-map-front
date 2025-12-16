
import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, Grid, ContactShadows, useGLTF } from '@react-three/drei';
import { useControls, button } from 'leva';
import { GlbAssetConfig } from '../utils/assetMapping';
import { useAssetConfigs } from '../hooks/useLifeMapData';
import { assetsApi } from '../api/endpoints/assets';
import { useQueryClient } from '@tanstack/react-query';

// Simple GLB Viewer Component
const GlbViewer: React.FC<{
  path: string;
  config: GlbAssetConfig;
}> = ({ path, config }) => {
  const { scene } = useGLTF(path);

  return (
    <primitive
      object={scene.clone()}
      scale={[config.scale, config.scale, config.scale]}
      position={config.position}
      rotation={config.rotation}
    />
  );
};

const AssetStudio: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: fetchedConfigs, isLoading } = useAssetConfigs();

  // Local state initialized with fetched configs or empty
  const [localConfig, setLocalConfig] = useState<Record<string, GlbAssetConfig>>({});

  useEffect(() => {
    if (fetchedConfigs) {
      setLocalConfig(fetchedConfigs);
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

  // Leva Controls for the SELECTED asset
  // We use Leva to drive this state.
  const [controls, setControls] = useControls('Transform', () => {
    if (!currentAssetConfig) return {};
    return {
      scale: { value: currentAssetConfig.scale, min: 0.01, max: 5, step: 0.01 },
      position: { value: currentAssetConfig.position, step: 0.05 },
      rotation: { value: currentAssetConfig.rotation, step: 0.05 },
      previewScale: { value: currentAssetConfig.previewScale, min: 0.1, max: 3, step: 0.1 },
    };
  }, [selectedAssetKey, currentAssetConfig]);

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
      {/* 3D Viewport */}
      <div className="flex-1 relative">
        <Canvas shadows camera={{ position: [3, 3, 3], fov: 50 }}>
          <color attach="background" args={['#1e293b']} />
          <Suspense fallback={null}>
            <Stage environment="city" intensity={0.5} adjustCamera={false}>
              {currentAssetConfig && (
                <GlbViewer
                  key={selectedAssetKey} // Remount on key change
                  path={currentAssetConfig.glbPath}
                  config={currentAssetConfig}
                />
              )}
            </Stage>
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
