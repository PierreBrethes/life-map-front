
import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { LifeItem, ItemType, ItemStatus, AssetType } from '../types';

interface BlockProps {
  item: LifeItem;
  color: string;
  position: [number, number, number];
  categoryName: string;
  isSelected: boolean;
  onSelect: (categoryName: string, item: LifeItem) => void;
}

// --- Helper: Parse Value ---
const parseValueToNumber = (val: string): number => {
    const clean = val.toLowerCase().replace(/[^0-9.k]/g, '');
    let multiplier = 1;
    if (clean.endsWith('k')) multiplier = 1000;
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num * multiplier;
};

// --- Helper: Format Value ---
const formatDisplayValue = (value: string, type: ItemType): string => {
    if (type === 'currency') {
        if (value.includes('€') || value.includes('$')) return value;
        const num = parseFloat(value);
        if (!isNaN(num)) {
            if (num >= 1000) return (num / 1000).toFixed(1) + 'k€';
            return num + '€';
        }
        return value + '€';
    }
    if (type === 'percentage') {
        if (value.includes('%')) return value;
        return value + '%';
    }
    return value;
};

// --- Helper: Get Status Color ---
const getStatusColor = (baseColor: string, status: ItemStatus): string => {
    if (status === 'critical') return '#ef4444';
    if (status === 'warning') return '#f59e0b';
    return baseColor;
};

// --- 3D ASSETS ---

const HouseAsset = ({ color }: { color: string }) => (
  <group>
    <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
      <boxGeometry args={[1, 0.8, 1]} />
      <meshStandardMaterial color={color} roughness={0.3} />
    </mesh>
    <mesh position={[0, 1.1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
      <coneGeometry args={[0.9, 0.6, 4]} />
      <meshStandardMaterial color="#333" roughness={0.5} />
    </mesh>
  </group>
);

const TechAsset = ({ color }: { color: string }) => (
    <group>
        {/* Server Base */}
        <mesh position={[0, 0.1, 0]} castShadow>
            <boxGeometry args={[0.8, 0.2, 0.6]} />
            <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* Monitor Stand */}
        <mesh position={[0, 0.5, -0.1]}>
            <boxGeometry args={[0.1, 0.6, 0.05]} />
            <meshStandardMaterial color="#94a3b8" />
        </mesh>
        {/* Monitor Screen */}
        <mesh position={[0, 0.8, 0]} rotation={[-0.1, 0, 0]} castShadow>
            <boxGeometry args={[1.0, 0.6, 0.05]} />
            <meshStandardMaterial color="#0f172a" />
        </mesh>
        {/* Screen Glow */}
        <mesh position={[0, 0.8, 0.03]} rotation={[-0.1, 0, 0]}>
            <planeGeometry args={[0.9, 0.5]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
        </mesh>
    </group>
);

const SportAsset = ({ color }: { color: string }) => (
    <group>
        {/* Yoga Mat / Base */}
        <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[0.6, 0.04, 1.2]} />
            <meshStandardMaterial color="#334155" />
        </mesh>
        {/* Ball */}
        <mesh position={[0, 0.4, 0.2]} castShadow>
            <sphereGeometry args={[0.35]} />
            <meshStandardMaterial color={color} roughness={0.4} />
        </mesh>
        {/* Dumbbell */}
        <group position={[0.3, 0.1, -0.3]} rotation={[0, 0.5, 0]}>
            <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                <cylinderGeometry args={[0.02, 0.02, 0.6]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
            </mesh>
            <mesh position={[0.3, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                <cylinderGeometry args={[0.1, 0.1, 0.1]} />
                <meshStandardMaterial color="#1e293b" />
            </mesh>
            <mesh position={[-0.3, 0, 0]} rotation={[0, 0, Math.PI/2]}>
                <cylinderGeometry args={[0.1, 0.1, 0.1]} />
                <meshStandardMaterial color="#1e293b" />
            </mesh>
        </group>
    </group>
);

const TravelAsset = ({ color }: { color: string }) => (
    <group>
        {/* Suitcase */}
        <mesh position={[0, 0.4, 0]} castShadow>
            <boxGeometry args={[0.8, 0.6, 0.3]} />
            <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>
        {/* Handle */}
        <mesh position={[0, 0.75, 0]}>
            <torusGeometry args={[0.1, 0.02, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#333" />
        </mesh>
        {/* Stickers/Details */}
        <mesh position={[0.2, 0.4, 0.16]}>
            <circleGeometry args={[0.1]} />
            <meshStandardMaterial color="#fff" />
        </mesh>
        
        {/* Paper Plane floating above */}
        <group position={[0.4, 0.9, 0.2]} rotation={[0.5, 0.5, 0]}>
             <mesh>
                <coneGeometry args={[0.1, 0.3, 3]} />
                <meshStandardMaterial color="#f8fafc" />
             </mesh>
        </group>
    </group>
);

const FinanceStackAsset = ({ color, height, value, status }: { color: string, height: number, value: string, status: ItemStatus }) => {
    const numValue = parseValueToNumber(value);
    const isHighValue = numValue >= 10000; 
    
    const segmentHeight = 0.2;
    const gap = 0.05;
    const stackCount = Math.max(2, Math.floor(height / (segmentHeight + gap)));
    let displayColor = color;
    if (status === 'critical') displayColor = '#ef4444';
    else if (status === 'warning') displayColor = '#f97316'; 
    else if (isHighValue) displayColor = '#fbbf24';

    const metalness = isHighValue && status === 'ok' ? 0.8 : 0.4;
    const totalStackHeight = 0.1 + (stackCount * (segmentHeight + gap));

    return (
        <group>
            <mesh position={[0, 0.05, 0]} receiveShadow castShadow>
                <boxGeometry args={[0.7, 0.1, 0.7]} />
                <meshStandardMaterial color="#1f2937" roughness={0.5} />
            </mesh>
            {Array.from({ length: stackCount }).map((_, i) => (
                <mesh 
                    key={i}
                    position={[0, 0.15 + i * (segmentHeight + gap) + (segmentHeight / 2), 0]}
                    castShadow receiveShadow
                >
                    <boxGeometry args={[0.6, segmentHeight, 0.6]} />
                    <meshStandardMaterial 
                        color={displayColor} 
                        metalness={metalness}
                        roughness={0.3}
                        emissive={displayColor}
                        emissiveIntensity={status === 'critical' ? 0.5 : 0.1}
                    />
                     <lineSegments>
                        <edgesGeometry args={[new THREE.BoxGeometry(0.6, segmentHeight, 0.6)]} />
                        <lineBasicMaterial color={isHighValue ? "#fff" : "#a5b4fc"} transparent opacity={0.3} />
                    </lineSegments>
                </mesh>
            ))}
            <group position={[0, totalStackHeight + 0.4, 0]}>
                <Billboard follow={true}>
                    <Text fontSize={0.25} color="#1e1b4b" anchorX="center" anchorY="bottom" outlineWidth={0.02} outlineColor="white" fontWeight={800}>
                        {value}
                    </Text>
                </Billboard>
            </group>
        </group>
    );
};

const TreeAsset = ({ color }: { color: string }) => (
  <group>
    <mesh position={[0, 0.3, 0]} castShadow>
      <cylinderGeometry args={[0.1, 0.15, 0.6, 8]} />
      <meshStandardMaterial color="#78350f" />
    </mesh>
    <mesh position={[0, 0.9, 0]} castShadow>
      <dodecahedronGeometry args={[0.6, 0]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  </group>
);

const HealthAsset = ({ color }: { color: string }) => (
  <group>
     <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[1, 0.7, 0.4]} />
        <meshStandardMaterial color="#fff" />
     </mesh>
     <mesh position={[0, 0.35, 0.21]}>
        <boxGeometry args={[0.4, 0.15, 0.05]} />
        <meshStandardMaterial color="#ef4444" />
     </mesh>
     <mesh position={[0, 0.35, 0.21]}>
        <boxGeometry args={[0.15, 0.4, 0.05]} />
        <meshStandardMaterial color="#ef4444" />
     </mesh>
  </group>
);

const GenericAsset = ({ color }: { color: string }) => (
    <group>
        <mesh position={[0, 0.01, 0]} receiveShadow>
            <cylinderGeometry args={[0.6, 0.6, 0.02, 64]} />
            <meshStandardMaterial color={color} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.4, 0]} castShadow>
            <boxGeometry args={[0.6, 0.6, 0.6]} />
            <meshStandardMaterial color={color} opacity={0.8} transparent />
        </mesh>
    </group>
);

// --- Main Component ---

const Block: React.FC<BlockProps> = ({ item, color, position, categoryName, isSelected, onSelect }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const effectiveColor = useMemo(() => getStatusColor(color, item.status), [color, item.status]);
  
  // Determine Height for Finance stacks
  let height = 0.5;
  if (item.assetType === 'finance' || categoryName === 'Finances' || item.type === 'currency') {
      const num = parseValueToNumber(item.value);
      height = Math.min(Math.max(num / 5000, 0.6), 5.0);
  }

  useFrame((state, delta) => {
    if (groupRef.current) {
      const t = state.clock.getElapsedTime();
      let floatY = Math.sin(t * 2 + position[0] * 10) * 0.03;
      if (item.assetType === 'finance' || categoryName === 'Finances') floatY = 0;
      
      const targetY = position[1] + Math.max(0, floatY) + (hovered || isSelected ? 0.2 : 0);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.1);

      if (isSelected) groupRef.current.rotation.y += delta;
      else groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, delta * 2);
    }
  });

  const renderAsset = () => {
    // Priority 1: Explicit Asset Type
    if (item.assetType === 'sport') return <SportAsset color={effectiveColor} />;
    if (item.assetType === 'tech') return <TechAsset color={effectiveColor} />;
    if (item.assetType === 'travel') return <TravelAsset color={effectiveColor} />;
    if (item.assetType === 'home') return <HouseAsset color={effectiveColor} />;
    if (item.assetType === 'health') return <HealthAsset color={effectiveColor} />;
    if (item.assetType === 'nature') return <TreeAsset color={effectiveColor} />;
    if (item.assetType === 'finance') return <FinanceStackAsset color={color} height={height} value={formatDisplayValue(item.value, item.type)} status={item.status} />;

    // Priority 2: Category fallback (Legacy)
    if (categoryName === 'Finances') return <FinanceStackAsset color={color} height={height} value={formatDisplayValue(item.value, item.type)} status={item.status} />;
    if (categoryName === 'Immobilier') return <HouseAsset color={effectiveColor} />;
    if (categoryName === 'Santé') return <HealthAsset color={effectiveColor} />;
    if (categoryName === 'Famille') return <TreeAsset color={effectiveColor} />;

    return <GenericAsset color={effectiveColor} />;
  };

  return (
    <group 
        ref={groupRef} 
        position={position}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
        onClick={(e) => { e.stopPropagation(); onSelect(categoryName, item); }}
    >
      {renderAsset()}
      
      {/* Hover Label */}
      <group position={[0, 2, 0]} visible={hovered || isSelected}>
         <Billboard>
             <mesh>
                <planeGeometry args={[item.name.length * 0.15 + 0.2, 0.4]} />
                <meshBasicMaterial color="black" transparent opacity={0.7} />
             </mesh>
            <Text fontSize={0.15} color="white" anchorX="center" anchorY="middle" fontWeight={600}>
                {item.name.toUpperCase()}
            </Text>
         </Billboard>
      </group>
    </group>
  );
};

export default Block;
