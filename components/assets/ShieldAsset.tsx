import React, { useMemo } from 'react';
import * as THREE from 'three';

export const ShieldAsset = ({ color }: { color: string }) => {
  const shieldMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: color, roughness: 0.3, metalness: 0.5 }), [color]);
  const rimMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.2, metalness: 0.8 }), []);
  const crossMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.5 }), []);

  return (
    <group position={[0, 0.5, 0]}>
      {/* Shield Shape */}
      <mesh scale={[1, 1.2, 0.2]}>
        <cylinderGeometry args={[0.4, 0.05, 1, 6]} /> {/* Hexagonal shield base */}
        <primitive object={shieldMaterial} />
      </mesh>

      {/* Rim */}
      <mesh position={[0, 0.45, 0.05]}>
        <boxGeometry args={[0.7, 0.1, 0.1]} />
        <primitive object={rimMaterial} />
      </mesh>

      {/* Cross Symbol */}
      <group position={[0, 0.1, 0.11]}>
        <mesh>
          <boxGeometry args={[0.15, 0.4, 0.02]} />
          <primitive object={crossMaterial} />
        </mesh>
        <mesh>
          <boxGeometry args={[0.4, 0.15, 0.02]} />
          <primitive object={crossMaterial} />
        </mesh>
      </group>
    </group>
  );
};
