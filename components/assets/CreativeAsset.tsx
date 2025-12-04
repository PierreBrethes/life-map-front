import React, { useMemo } from 'react';
import * as THREE from 'three';

export const CreativeAsset = ({ color }: { color: string }) => {
  const woodMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#d4a373', roughness: 0.7 }), []);
  const paintMaterial1 = useMemo(() => new THREE.MeshStandardMaterial({ color: '#ef4444' }), []);
  const paintMaterial2 = useMemo(() => new THREE.MeshStandardMaterial({ color: '#3b82f6' }), []);
  const paintMaterial3 = useMemo(() => new THREE.MeshStandardMaterial({ color: '#10b981' }), []);
  const brushHandleMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#a16207' }), []);

  return (
    <group position={[0, 0.4, 0]} rotation={[0.5, 0, 0]}>
      {/* Palette Board */}
      <mesh>
        <cylinderGeometry args={[0.4, 0.4, 0.05, 32]} />
        <primitive object={woodMaterial} />
      </mesh>

      {/* Paint Blobs */}
      <mesh position={[-0.2, 0.03, -0.1]}>
        <sphereGeometry args={[0.08, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <primitive object={paintMaterial1} />
      </mesh>
      <mesh position={[0, 0.03, -0.2]}>
        <sphereGeometry args={[0.08, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <primitive object={paintMaterial2} />
      </mesh>
      <mesh position={[0.2, 0.03, -0.1]}>
        <sphereGeometry args={[0.08, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <primitive object={paintMaterial3} />
      </mesh>

      {/* Brush */}
      <group position={[0.3, 0.1, 0.2]} rotation={[0, 0, -0.5]}>
        <mesh position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
          <primitive object={brushHandleMaterial} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <coneGeometry args={[0.04, 0.1, 8]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
      </group>
    </group>
  );
};
