import React from 'react';
import { Html } from '@react-three/drei';
import * as Icons from 'lucide-react';

export const AlertSignal = ({ height, label }: { height: number, label: string }) => (
  <group position={[0, height, 0]}>

    {/* 3D Bulb (Floating Orb) */}
    <mesh position={[0.2, 0.5, -0.2]}>
      <sphereGeometry args={[0.06]} />
      <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} toneMapped={false} />
    </mesh>

    {/* 2D HTML Signal Effect */}
    <Html position={[0.2, 0.65, -0.2]} center zIndexRange={[100, 0]}>
      <div className="relative flex items-center justify-center w-12 h-12 pointer-events-none">
        {/* Pulsing Ripple */}
        <div className="absolute inset-0 bg-red-500 rounded-full opacity-20 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
        <div className="absolute inset-2 bg-red-500 rounded-full opacity-40 animate-[ping_1.5s_cubic-bezier(0,0,0.2,1)_infinite_200ms]"></div>

        {/* Icon Container */}
        <div className="relative z-10 p-1.5 bg-red-500 rounded-full shadow-lg border-2 border-white">
          <Icons.AlertTriangle size={14} className="text-white stroke-[3px]" />
        </div>
      </div>
      {/* Tooltip Title */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        <div className="px-2 py-1 bg-red-600 text-white text-[10px] font-bold rounded shadow-lg whitespace-nowrap">
          {label}
        </div>
      </div>
    </Html>
  </group>
);
