import React, { useMemo } from 'react';
import * as THREE from 'three';

export const DebtAsset = ({ color }: { color: string }) => {
  const ballMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.4, metalness: 0.6 }), []);
  const chainMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.5, metalness: 0.5 }), []);

  return (
    <group position={[0, 0.4, 0]}>
      {/* Iron Ball */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <primitive object={ballMaterial} />
      </mesh>

      {/* Chain Links (Vertical rising) */}
      {[0.4, 0.6, 0.8, 1.0].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[0, i % 2 ? Math.PI / 2 : 0, 0]}>
          <torusGeometry args={[0.08, 0.03, 8, 16]} />
          <primitive object={chainMaterial} />
        </mesh>
      ))}

      {/* Broken shackle at top? Or just chain fading up */}
    </group>
  );
};
