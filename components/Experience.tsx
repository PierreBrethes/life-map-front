
import React, { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
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
  onBlockClick: (categoryName: string, item: LifeItem) => void;
  showConnections: boolean;
  isDarkMode: boolean;
  selectedDependencyId: string | null;
  onSelectDependency: (id: string | null) => void;
  onDeleteDependency: (id: string) => void;
}

// Ocean Component
const Ocean = ({ isDarkMode }: { isDarkMode: boolean }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
    <planeGeometry args={[100, 100, 20, 20]} />
    <meshStandardMaterial
      color={isDarkMode ? "#0f172a" : "#bae6fd"}
      opacity={isDarkMode ? 0.8 : 0.6}
      transparent
      roughness={0.1}
      metalness={0.1}
    />
  </mesh>
);

const Experience: React.FC<ExperienceProps> = ({
  data,
  dependencies,
  selection,
  setSelection,
  onBlockClick,
  showConnections,
  isDarkMode,
  selectedDependencyId,
  onSelectDependency,
  onDeleteDependency
}) => {

  const handleMiss = () => {
    setSelection(null);
    onSelectDependency(null);
  };

  // Calculate target position for the camera based on selection
  const cameraTarget = useMemo<[number, number, number] | null>(() => {
    if (!selection) return null;
    const category = data.find(c => c.name === selection.categoryName);
    if (!category) return null;
    const pos = getItemWorldPosition(category.id, selection.item.id, data);
    if (!pos) return null;

    // Return raw position without sidebar offset for now
    // This should center the camera exactly on the item
    return pos;
  }, [selection, data]);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      className="w-full h-full"
      onPointerMissed={handleMiss}
      gl={{ preserveDrawingBuffer: true }}
    >
      {/* Cinematic Camera Controller */}
      <CameraRig targetPosition={cameraTarget} />

      {/* --- LIGHTING & ATMOSPHERE --- */}
      <color attach="background" args={[isDarkMode ? '#020617' : '#f0f9ff']} />
      <fog attach="fog" args={[isDarkMode ? '#020617' : '#f0f9ff', 20, 90]} />

      <ambientLight intensity={isDarkMode ? 0.4 : 0.6} />

      <directionalLight
        position={[10, 20, 10]}
        intensity={isDarkMode ? 1.2 : 2.0}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0005}
      />

      <directionalLight position={[-5, 5, -5]} intensity={isDarkMode ? 0.8 : 0.5} color={isDarkMode ? "#4f46e5" : "#e0e7ff"} />

      {/* Additional soft fill light for dark mode */}
      {isDarkMode && <directionalLight position={[0, 10, -10]} intensity={0.3} color="#1e293b" />}

      {/* Ocean Floor */}
      <Ocean isDarkMode={isDarkMode} />

      {/* --- CONTACT SHADOWS --- */}
      <ContactShadows
        position={[0, -0.05, 0]}
        opacity={isDarkMode ? 0.3 : 0.5}
        scale={60}
        blur={2}
        far={10}
        resolution={512}
        color="#000000"
      />

      {/* Islands Generation */}
      <group position={[0, 0, 0]}>
        {data.map((category, index) => {
          const position = getIslandPosition(index, data.length);
          return (
            <Island
              key={category.id}
              category={category}
              position={position}
              selection={selection}
              onSelect={onBlockClick}
            />
          );
        })}
      </group>

      {/* Links / Connections Layer */}
      {showConnections && (
        <Connections
          data={data}
          dependencies={dependencies}
          selectedId={selectedDependencyId}
          onSelect={onSelectDependency}
          onDelete={onDeleteDependency}
        />
      )}

    </Canvas>
  );
};

export default Experience;
