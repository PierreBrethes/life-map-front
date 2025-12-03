import React from 'react';

export const SportAsset = ({ color }: { color: string }) => (
  <group>
    {/* Yoga Mat / Base */}
    <mesh position={[0, 0.02, 0]}>
      <boxGeometry args={[0.6, 0.04, 1.2]} />
      <meshStandardMaterial color="#334155" />
    </mesh>
    {/* Ball */}
    <mesh position={[0, 0.4, 0.2]} castShadow>
      <sphereGeometry args={[0.35]} />
      <meshStandardMaterial color={color} roughness={0.4} />
    </mesh>
    {/* Dumbbell */}
    <group position={[0.3, 0.1, -0.3]} rotation={[0, 0.5, 0]}>
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.6]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[-0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  </group>
);
