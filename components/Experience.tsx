import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment } from '@react-three/drei';
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
    <Canvas 
      shadows 
      dpr={[1, 2]} // Handle high-DPI screens without killing performance
      className="w-full h-full" 
      onPointerMissed={handleMiss}
      gl={{ preserveDrawingBuffer: true }} // Helps with stability
    >
      {/* Cinematic Camera Controller */}
      <CameraRig targetPosition={cameraTarget} />

      {/* --- LUMIÈRES --- */}
      <ambientLight intensity={0.6} />
      
      <directionalLight
        position={[10, 20, 10]}
        intensity={2.0}
        castShadow
        shadow-mapSize={[1024, 1024]} // Reasonable shadow map size
        shadow-bias={-0.0005}
      />
      
      <directionalLight position={[-5, 5, -5]} intensity={0.5} color="#e0e7ff" />

      <Environment preset="city" />

      {/* --- OMBRES DE CONTACT (Optimized) --- */}
      {/* Removed SoftShadows to prevent WebGL Context Lost on some GPUs */}
      <ContactShadows 
        position={[0, -0.05, 0]} 
        opacity={0.5}     
        scale={60}        
        blur={2}        
        far={10} 
        resolution={512} // Lower resolution for better stability
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