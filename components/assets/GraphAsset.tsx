import React, { useMemo } from 'react';
import * as THREE from 'three';

export const GraphAsset = ({ color }: { color: string }) => {
  const barMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 0.2 }), [color]);
  const baseMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.8 }), []);
  const arrowMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#10b981', roughness: 0.2, emissive: '#059669', emissiveIntensity: 0.2 }), []);

  return (
    <group position={[0, 0, 0]}>
      {/* Base Plate */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[1.2, 0.1, 0.8]} />
        <primitive object={baseMaterial} />
      </mesh>

      {/* Bars (Rising) */}
      <mesh position={[-0.4, 0.3, 0]}>
        <boxGeometry args={[0.2, 0.4, 0.2]} />
        <primitive object={barMaterial} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <primitive object={barMaterial} />
      </mesh>
      <mesh position={[0.4, 0.7, 0]}>
        <boxGeometry args={[0.2, 1.2, 0.2]} />
        <primitive object={barMaterial} />
      </mesh>

      {/* Trend Arrow */}
      <group position={[0, 0.2, 0.3]} rotation={[0, 0, Math.PI / 4]}>
        <mesh position={[0, 0.6, 0]}>
          <boxGeometry args={[0.08, 1.0, 0.05]} />
          <primitive object={arrowMaterial} />
        </mesh>
        <mesh position={[0, 1.1, 0]}>
          <coneGeometry args={[0.15, 0.3, 4]} />
          <primitive object={arrowMaterial} />
        </mesh>
      </group>
    </group>
  );
};
