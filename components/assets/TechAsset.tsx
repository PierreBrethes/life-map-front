import React from 'react';

export const TechAsset = ({ color }: { color: string }) => (
  <group>
    {/* Server Base */}
    <mesh position={[0, 0.1, 0]} castShadow>
      <boxGeometry args={[0.8, 0.2, 0.6]} />
      <meshStandardMaterial color="#1e293b" />
    </mesh>
    {/* Monitor Stand */}
    <mesh position={[0, 0.5, -0.1]}>
      <boxGeometry args={[0.1, 0.6, 0.05]} />
      <meshStandardMaterial color="#94a3b8" />
    </mesh>
    {/* Monitor Screen */}
    <mesh position={[0, 0.8, 0]} rotation={[-0.1, 0, 0]} castShadow>
      <boxGeometry args={[1.0, 0.6, 0.05]} />
      <meshStandardMaterial color="#0f172a" />
    </mesh>
    {/* Screen Glow */}
    <mesh position={[0, 0.8, 0.03]} rotation={[-0.1, 0, 0]}>
      <planeGeometry args={[0.9, 0.5]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
    </mesh>
  </group>
);
