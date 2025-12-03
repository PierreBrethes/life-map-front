import React from 'react';

export const PeopleAsset = ({ color }: { color: string }) => (
  <group>
    {/* Body */}
    <mesh position={[0, 0.35, 0]} castShadow>
      <cylinderGeometry args={[0.15, 0.25, 0.5, 16]} />
      <meshStandardMaterial color={color} />
    </mesh>
    {/* Head */}
    <mesh position={[0, 0.75, 0]} castShadow>
      <sphereGeometry args={[0.18, 16, 16]} />
      <meshStandardMaterial color="#fde6d9" roughness={0.5} />
    </mesh>
    {/* Arms (Abstract) */}
    <mesh position={[0, 0.45, 0]}>
      <capsuleGeometry args={[0.06, 0.6, 4, 8]} />
      <meshStandardMaterial color={color} />
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <capsuleGeometry args={[0.06, 0.6, 4, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </mesh>
  </group>
);
