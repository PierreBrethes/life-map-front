import React, { useMemo } from 'react';
import * as THREE from 'three';

export const SafeAsset = ({ color }: { color: string }) => {
  const bodyMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.7 }), []);
  const doorMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: color, roughness: 0.5, metalness: 0.2 }), [color]);
  const metalMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.3, metalness: 0.8 }), []);

  return (
    <group position={[0, 0.4, 0]}>
      {/* Main Box */}
      <mesh>
        <boxGeometry args={[0.8, 0.8, 0.8]} />
        <primitive object={bodyMaterial} />
      </mesh>

      {/* Door */}
      <mesh position={[0, 0, 0.41]}>
        <boxGeometry args={[0.7, 0.7, 0.05]} />
        <primitive object={doorMaterial} />
      </mesh>

      {/* Dial / Handle */}
      <mesh position={[0.2, 0, 0.45]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.05, 16]} />
        <primitive object={metalMaterial} />
      </mesh>

      {/* Small Handle */}
      <mesh position={[0.2, 0, 0.48]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.08, 8]} />
        <primitive object={metalMaterial} />
      </mesh>

      {/* Keypad */}
      <mesh position={[-0.2, 0.1, 0.44]}>
        <boxGeometry args={[0.2, 0.3, 0.02]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
};
