import React, { useMemo } from 'react';
import * as THREE from 'three';

export const DiplomaAsset = ({ color }: { color: string }) => {
  const hatMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.8 }), []); // Black hat
  const tasselMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: color, roughness: 0.5 }), [color]); // Colored tassel
  const scrollMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#fef3c7', roughness: 0.6 }), []); // Paper scroll

  return (
    <group position={[0, 0.2, 0]}>
      {/* Mortarboard (Hat Top) */}
      <mesh position={[0, 0.4, 0]} rotation={[0.2, 0, 0]}>
        <boxGeometry args={[0.7, 0.05, 0.7]} />
        <primitive object={hatMaterial} />
      </mesh>

      {/* Hat Cap */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.25, 0.2, 0.3, 16]} />
        <primitive object={hatMaterial} />
      </mesh>

      {/* Tassel (String + End) */}
      <mesh position={[0.3, 0.35, 0.3]} rotation={[0, 0, -0.5]}>
        <cylinderGeometry args={[0.01, 0.01, 0.4, 8]} />
        <primitive object={tasselMaterial} />
      </mesh>
      <mesh position={[0.4, 0.15, 0.4]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <primitive object={tasselMaterial} />
      </mesh>

      {/* Rolled Diploma Scroll (Sitting next to it) */}
      <mesh position={[0.4, 0, -0.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 16]} />
        <primitive object={scrollMaterial} />
      </mesh>
      {/* Ribbon on scroll */}
      <mesh position={[0.4, 0, -0.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.085, 0.085, 0.1, 16]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
    </group>
  );
};
