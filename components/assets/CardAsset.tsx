import React from 'react';
import { useMemo } from 'react';
import * as THREE from 'three';

export const CardAsset = ({ color }: { color: string }) => {
  const material = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.1 }), [color]);
  const chipMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#fbbf24', roughness: 0.2, metalness: 0.8 }), []);
  const stripMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.8 }), []);

  return (
    <group>
      {/* Card Body */}
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0.2]}>
        <boxGeometry args={[1.4, 0.9, 0.05]} />
        <primitive object={material} />
      </mesh>

      {/* Chip */}
      <mesh position={[-0.4, 0.13, 0.1]} rotation={[-Math.PI / 2, 0, 0.2]}>
        <planeGeometry args={[0.25, 0.2]} />
        <primitive object={chipMaterial} />
      </mesh>

      {/* Magnetic Strip (Back/Decoration) */}
      <mesh position={[0, 0.13, -0.2]} rotation={[-Math.PI / 2, 0, 0.2]}>
        <planeGeometry args={[1.4, 0.15]} />
        <primitive object={stripMaterial} />
      </mesh>

      {/* Floating effect shadow/base */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0.2]}>
        <planeGeometry args={[1.2, 0.8]} />
        <meshBasicMaterial color="#000000" opacity={0.2} transparent />
      </mesh>
    </group>
  );
};
