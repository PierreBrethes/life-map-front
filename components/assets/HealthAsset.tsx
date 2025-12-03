import React from 'react';

export const HealthAsset = ({ color }: { color: string }) => (
  <group>
    <mesh position={[0, 0.35, 0]} castShadow>
      <boxGeometry args={[1, 0.7, 0.4]} />
      <meshStandardMaterial color="#fff" />
    </mesh>
    <mesh position={[0, 0.35, 0.21]}>
      <boxGeometry args={[0.4, 0.15, 0.05]} />
      <meshStandardMaterial color="#ef4444" />
    </mesh>
    <mesh position={[0, 0.35, 0.21]}>
      <boxGeometry args={[0.15, 0.4, 0.05]} />
      <meshStandardMaterial color="#ef4444" />
    </mesh>
  </group>
);
