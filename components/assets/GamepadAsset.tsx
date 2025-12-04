import React, { useMemo } from 'react';
import * as THREE from 'three';

export const GamepadAsset = ({ color }: { color: string }) => {
  const bodyMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.4 }), []);
  const buttonMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: color, emissive: color, emissiveIntensity: 0.2 }), [color]);
  const stickMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#475569' }), []);

  return (
    <group position={[0, 0.3, 0]} rotation={[0.5, 0, 0]}>
      {/* Main Body */}
      <mesh>
        <boxGeometry args={[0.8, 0.4, 0.15]} />
        <primitive object={bodyMaterial} />
      </mesh>

      {/* Handles */}
      <mesh position={[-0.3, -0.2, 0]} rotation={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.1, 0.08, 0.4, 16]} />
        <primitive object={bodyMaterial} />
      </mesh>
      <mesh position={[0.3, -0.2, 0]} rotation={[0, 0, -0.5]}>
        <cylinderGeometry args={[0.1, 0.08, 0.4, 16]} />
        <primitive object={bodyMaterial} />
      </mesh>

      {/* Screen / Touchpad */}
      <mesh position={[0, 0.05, 0.08]}>
        <boxGeometry args={[0.3, 0.2, 0.02]} />
        <meshStandardMaterial color="#0f172a" />
      </mesh>

      {/* Buttons */}
      <mesh position={[0.25, 0.05, 0.08]}>
        <cylinderGeometry args={[0.03, 0.03, 0.05, 8]} />
        <primitive object={buttonMaterial} />
      </mesh>
      <mesh position={[0.32, 0.1, 0.08]}>
        <cylinderGeometry args={[0.03, 0.03, 0.05, 8]} />
        <primitive object={buttonMaterial} />
      </mesh>

      {/* Joysticks */}
      <mesh position={[-0.2, -0.05, 0.1]} rotation={[0.2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.05, 16]} />
        <primitive object={stickMaterial} />
      </mesh>
      <mesh position={[0.2, -0.05, 0.1]} rotation={[0.2, 0, 0]}>
        <cylinderGeometry args={[0.06, 0.06, 0.05, 16]} />
        <primitive object={stickMaterial} />
      </mesh>
    </group>
  );
};
