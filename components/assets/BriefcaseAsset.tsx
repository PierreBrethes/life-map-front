import React, { useMemo } from 'react';
import * as THREE from 'three';

export const BriefcaseAsset = ({ color }: { color: string }) => {
  const leatherMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.6 }), []); // Brown leather
  const handleMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.5 }), []);
  const metalMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#fbbf24', metalness: 0.8, roughness: 0.2 }), []); // Gold buckles

  return (
    <group position={[0, 0.3, 0]}>
      {/* Main Case Body */}
      <mesh>
        <boxGeometry args={[0.9, 0.6, 0.25]} />
        <primitive object={leatherMaterial} />
      </mesh>

      {/* Handle */}
      <mesh position={[0, 0.35, 0]}>
        <torusGeometry args={[0.1, 0.03, 8, 16, Math.PI]} />
        <primitive object={handleMaterial} />
      </mesh>

      {/* Buckles */}
      <mesh position={[-0.25, 0.1, 0.13]}>
        <boxGeometry args={[0.08, 0.15, 0.02]} />
        <primitive object={metalMaterial} />
      </mesh>
      <mesh position={[0.25, 0.1, 0.13]}>
        <boxGeometry args={[0.08, 0.15, 0.02]} />
        <primitive object={metalMaterial} />
      </mesh>
    </group>
  );
};
