import React from 'react';

export const TravelAsset = ({ color }: { color: string }) => (
  <group>
    {/* Suitcase */}
    <mesh position={[0, 0.4, 0]} castShadow>
      <boxGeometry args={[0.8, 0.6, 0.3]} />
      <meshStandardMaterial color={color} roughness={0.3} />
    </mesh>
    {/* Handle */}
    <mesh position={[0, 0.75, 0]}>
      <torusGeometry args={[0.1, 0.02, 8, 16, Math.PI]} />
      <meshStandardMaterial color="#333" />
    </mesh>
    {/* Stickers/Details */}
    <mesh position={[0.2, 0.4, 0.16]}>
      <circleGeometry args={[0.1]} />
      <meshStandardMaterial color="#fff" />
    </mesh>

    {/* Paper Plane floating above */}
    <group position={[0.4, 0.9, 0.2]} rotation={[0.5, 0.5, 0]}>
      <mesh>
        <coneGeometry args={[0.1, 0.3, 3]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
    </group>
  </group>
);
