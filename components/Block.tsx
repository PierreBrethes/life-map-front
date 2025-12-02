
import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard, Html } from '@react-three/drei';
import * as THREE from 'three';
import { LifeItem, ItemType, ItemStatus, AssetType } from '../types';
import * as Icons from 'lucide-react';

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

// --- ALERT SIGNAL (Floating Orb + 2D Notification) ---
const AlertSignal = ({ height, label }: { height: number, label: string }) => (
    <group position={[0, height, 0]}>
        
        {/* 3D Bulb (Floating Orb) */}
        <mesh position={[0.2, 0.5, -0.2]}>
             <sphereGeometry args={[0.06]} />
             <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} toneMapped={false} />
        </mesh>

        {/* 2D HTML Signal Effect */}
        <Html position={[0.2, 0.65, -0.2]} center zIndexRange={[100, 0]}>
            <div className="relative flex items-center justify-center w-12 h-12 pointer-events-none">
                {/* Pulsing Ripple */}
                <div className="absolute inset-0 bg-red-500 rounded-full opacity-20 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                <div className="absolute inset-2 bg-red-500 rounded-full opacity-40 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite_200ms]"></div>
                
                {/* Icon Container */}
                <div className="relative z-10 p-1.5 bg-red-500 rounded-full shadow-lg border-2 border-white">
                    <Icons.AlertTriangle size={14} className="text-white stroke-[3px]" />
                </div>
            </div>
             {/* Tooltip Title */}
             <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                <div className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded shadow-lg whitespace-nowrap">
                    {label}
                </div>
            </div>
        </Html>
    </group>
);

// --- 3D ASSETS ---

const PeopleAsset = ({ color }: { color: string }) => (
    <group>
        {/* Body */}
        <mesh position={[0, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.25, 0.5, 16]} />
            <meshStandardMaterial color={color} />
        </mesh>
        {/* Head */}
        <mesh position={[0, 0.75, 0]} castShadow>
            <sphereGeometry args={[0.18, 16, 16]} />
            <meshStandardMaterial color="#fde6d9" roughness={0.5} /> 
        </mesh>
        {/* Arms (Abstract) */}
         <mesh position={[0, 0.45, 0]}>
            <capsuleGeometry args={[0.06, 0.6, 4, 8]} />
             <meshStandardMaterial color={color} />
             <mesh rotation={[0,0,Math.PI/2]}>
                 <capsuleGeometry args={[0.06, 0.6, 4, 8]} />
                 <meshStandardMaterial color={color} />
             </mesh>
        </mesh>
    </group>
);

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
     {/* Windows */}
    <mesh position={[0.51, 0.4, 0.2]}>
        <planeGeometry args={[0.2, 0.3]} />
        <meshStandardMaterial color="#bae6fd" emissive="#bae6fd" emissiveIntensity={0.5} />
    </mesh>
    <mesh position={[0.51, 0.4, -0.2]}>
        <planeGeometry args={[0.2, 0.3]} />
        <meshStandardMaterial color="#bae6fd" emissive="#bae6fd" emissiveIntensity={0.5} />
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
  
  // Determine Asset Properties
  let assetElement = <GenericAsset color={effectiveColor} />;
  let topOffset = 0.8; // Default height for antenna/labels

  // 1. Calculate Finance Height specific logic
  const numValue = parseValueToNumber(item.value);
  const financeHeight = Math.min(Math.max(numValue / 5000, 0.6), 5.0);

  // 2. Asset Logic
  if (item.assetType === 'people' || (categoryName === 'Famille' && item.assetType === 'default')) {
      assetElement = <PeopleAsset color={effectiveColor} />;
      topOffset = 0.9;
  } else if (item.assetType === 'sport') {
      assetElement = <SportAsset color={effectiveColor} />;
      topOffset = 0.6;
  } else if (item.assetType === 'tech') {
      assetElement = <TechAsset color={effectiveColor} />;
      topOffset = 1.1;
  } else if (item.assetType === 'travel') {
      assetElement = <TravelAsset color={effectiveColor} />;
      topOffset = 1.0;
  } else if (item.assetType === 'home' || categoryName === 'Immobilier') {
      assetElement = <HouseAsset color={effectiveColor} />;
      topOffset = 1.4;
  } else if (item.assetType === 'health' || categoryName === 'Santé') {
      assetElement = <HealthAsset color={effectiveColor} />;
      topOffset = 0.8;
  } else if (item.assetType === 'nature') {
      assetElement = <TreeAsset color={effectiveColor} />;
      topOffset = 1.4;
  } else if (item.assetType === 'finance' || categoryName === 'Finances' || item.type === 'currency') {
      assetElement = <FinanceStackAsset color={color} height={financeHeight} value={formatDisplayValue(item.value, item.type)} status={item.status} />;
      // Finance Stack displays value on Billboard, so Antenna goes slightly higher
      const segmentHeight = 0.2;
      const gap = 0.05;
      const stackCount = Math.max(2, Math.floor(financeHeight / (segmentHeight + gap)));
      topOffset = 0.1 + (stackCount * (segmentHeight + gap)) + 0.3;
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

  // Only show AlertSignal if critical AND not dismissed
  const showNotification = item.status === 'critical' && !item.notificationDismissed;

  return (
    <group 
        ref={groupRef} 
        position={position}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
        onClick={(e) => { e.stopPropagation(); onSelect(categoryName, item); }}
    >
      {assetElement}

      {/* ALERT SIGNAL for Critical Items */}
      {showNotification && (
          <AlertSignal height={topOffset} label={item.notificationLabel || item.name} />
      )}
      
      {/* Hover Label (HTML Overlay) */}
      {(hovered || isSelected) && (
          <Html position={[0, topOffset + 0.5, 0]} center style={{ pointerEvents: 'none' }} zIndexRange={[100, 0]}>
              <div className="px-3 py-1.5 bg-gray-900/90 text-white text-xs font-bold rounded-lg shadow-xl backdrop-blur-md border border-white/20 whitespace-nowrap transform -translate-y-2 transition-all">
                  {item.name.toUpperCase()}
              </div>
          </Html>
      )}
    </group>
  );
};

export default Block;
