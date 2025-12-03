import React from 'react';

export const TreeAsset = ({ color }: { color: string }) => (
  <group>
    <mesh position={[0, 0.3, 0]} castShadow>
      <cylinderGeometry args={[0.1, 0.15, 0.6, 8]} />
      <meshStandardMaterial color="#78350f" />
    </mesh>
    <mesh position={[0, 0.9, 0]} castShadow>
      <dodecahedronGeometry args={[0.6, 0]} />
      <meshStandardMaterial color={color} roughness={0.8} />
    </mesh>
  </group>
);
