import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, SoftShadows } from '@react-three/drei';
import Island from './Island';
import CameraRig from './CameraRig';
import Connections from './Connections';
import { SelectionState, LifeItem, Category, Dependency } from '../types';
import { getIslandPosition, getItemWorldPosition } from '../utils/layout';

interface ExperienceProps {
  data: Category[];
  dependencies: Dependency[];
  selection: SelectionState | null;
  setSelection: (sel: SelectionState | null) => void;
  showConnections: boolean;
}

const Experience: React.FC<ExperienceProps> = ({ data, dependencies, selection, setSelection, showConnections }) => {
  const handleSelect = (categoryName: string, item: LifeItem) => {
    setSelection({ categoryName, item });
  };

  const handleMiss = () => {
    setSelection(null);
  };

  // Calculate target position for the camera based on selection using the new utility
  const cameraTarget = useMemo<[number, number, number] | null>(() => {
    if (!selection) return null;
    return getItemWorldPosition(selection.categoryName, selection.item.name, data);
  }, [selection, data]);

  return (
    <Canvas shadows className="w-full h-full" onPointerMissed={handleMiss}>
      {/* Cinematic Camera Controller */}
      <CameraRig targetPosition={cameraTarget} />

      {/* --- GESTION DES OMBRES PORTÉES (Soleil) --- */}
      <SoftShadows size={20} focus={0.5} samples={12} />

      {/* --- LUMIÈRES --- */}
      <ambientLight intensity={0.5} />
      
      <directionalLight
        position={[8, 20, 8]}
        intensity={2.5}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />
      
      <directionalLight position={[-5, 5, -5]} intensity={0.4} color="#e0e7ff" />

      <Environment preset="city" />

      {/* --- OMBRES DE CONTACT (Ancrage au sol) --- */}
      <ContactShadows 
        position={[0, -0.05, 0]} 
        opacity={0.6}     
        scale={60}        
        blur={2.5}        
        far={4} 
        color="#000000" 
      />

      {/* Islands Generation */}
      <group position={[0, 0, 0]}>
        {data.map((category, index) => {
          // Use utility for consistent positioning
          const position = getIslandPosition(index, data.length);

          return (
            <Island
              key={category.category}
              category={category}
              position={position}
              selection={selection}
              onSelect={handleSelect}
            />
          );
        })}
      </group>

      {/* Links / Connections Layer */}
      {showConnections && <Connections data={data} dependencies={dependencies} />}

    </Canvas>
  );
};

export default Experience;