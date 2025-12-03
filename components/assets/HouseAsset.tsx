import React from 'react';

export const HouseAsset = ({ color }: { color: string }) => (
  <group>
    <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
      <boxGeometry args={[1, 0.8, 1]} />
      <meshStandardMaterial color={color} roughness={0.3} />
    </mesh>
    <mesh position={[0, 1.1, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
      <coneGeometry args={[0.9, 0.6, 4]} />
      <meshStandardMaterial color="#333" roughness={0.5} />
    </mesh>
    {/* Windows */}
    <mesh position={[0.51, 0.4, 0.2]}>
      <planeGeometry args={[0.2, 0.3]} />
      <meshStandardMaterial color="#bae6fd" emissive="#bae6fd" emissiveIntensity={0.5} />
    </mesh>
    <mesh position={[0.51, 0.4, -0.2]}>
      <planeGeometry args={[0.2, 0.3]} />
      <meshStandardMaterial color="#bae6fd" emissive="#bae6fd" emissiveIntensity={0.5} />
    </mesh>
  </group>
);
