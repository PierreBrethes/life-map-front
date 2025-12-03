import React from 'react';

export const GenericAsset = ({ color }: { color: string }) => (
  <group>
    <mesh position={[0, 0.01, 0]} receiveShadow>
      <cylinderGeometry args={[0.6, 0.6, 0.02, 64]} />
      <meshStandardMaterial color={color} roughness={0.2} />
    </mesh>
    <mesh position={[0, 0.4, 0]} castShadow>
      <boxGeometry args={[0.6, 0.6, 0.6]} />
      <meshStandardMaterial color={color} opacity={0.8} transparent />
    </mesh>
  </group>
);
