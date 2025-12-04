import React, { useMemo } from 'react';
import * as THREE from 'three';

export const LandAsset = ({ color }: { color: string }) => {
  const grassMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#4ade80', roughness: 0.8 }), []);
  const fenceMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.9 }), []);
  const signMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#fef3c7', roughness: 0.5 }), []);

  return (
    <group position={[0, 0.1, 0]}>
      {/* Grass Plot */}
      <mesh>
        <boxGeometry args={[1.4, 0.1, 1.4]} />
        <primitive object={grassMaterial} />
      </mesh>

      {/* Fence Posts */}
      {[
        [-0.6, -0.6], [0.6, -0.6], [0.6, 0.6], [-0.6, 0.6]
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.2, z]}>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <primitive object={fenceMaterial} />
        </mesh>
      ))}

      {/* Fence Rails */}
      <mesh position={[0, 0.3, -0.6]}>
        <boxGeometry args={[1.2, 0.05, 0.05]} />
        <primitive object={fenceMaterial} />
      </mesh>
      <mesh position={[0, 0.3, 0.6]}>
        <boxGeometry args={[1.2, 0.05, 0.05]} />
        <primitive object={fenceMaterial} />
      </mesh>
      <mesh position={[-0.6, 0.3, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[1.2, 0.05, 0.05]} />
        <primitive object={fenceMaterial} />
      </mesh>

      {/* For Sale Sign */}
      <group position={[0.3, 0.3, 0.3]} rotation={[0, -0.2, 0]}>
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.05, 0.6, 0.05]} />
          <primitive object={fenceMaterial} />
        </mesh>
        <mesh position={[0, 0.4, 0.05]}>
          <boxGeometry args={[0.4, 0.3, 0.02]} />
          <primitive object={signMaterial} />
        </mesh>
        <mesh position={[0, 0.4, 0.06]}>
          <boxGeometry args={[0.3, 0.05, 0.02]} />
          <meshStandardMaterial color={color} />
        </mesh>
      </group>
    </group>
  );
};
