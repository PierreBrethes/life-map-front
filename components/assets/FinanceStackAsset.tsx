import React from 'react';
import * as THREE from 'three';
import { Text, Billboard } from '@react-three/drei';
import { ItemStatus } from '../../types';
import { parseValueToNumber } from '../../utils/formatters';

export const FinanceStackAsset = ({ color, height, value, status, showLabel = true }: { color: string, height: number, value: string, status: ItemStatus, showLabel?: boolean }) => {
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
      {showLabel && (
        <group position={[0, totalStackHeight + 0.4, 0]}>
          <Billboard follow={true}>
            <Text fontSize={0.25} color="#1e1b4b" anchorX="center" anchorY="bottom" outlineWidth={0.02} outlineColor="white" fontWeight={800}>
              {value}
            </Text>
          </Billboard>
        </group>
      )}
    </group>
  );
};
