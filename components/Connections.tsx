import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { QuadraticBezierLine, Html } from '@react-three/drei';
import * as THREE from 'three';
import { Category, Dependency } from '../types';
import { getItemWorldPosition } from '../utils/layout';

interface ConnectionsProps {
  data: Category[];
  dependencies: Dependency[];
}

const AnimatedLine = ({ start, end, color, dep }: { start: THREE.Vector3, end: THREE.Vector3, color: string, dep: Dependency }) => {
    const lineRef = useRef<any>(null);
    const [hovered, setHovered] = useState(false);
    
    // Calculate mid-point with a high arc for the "cable" look
    const mid = useMemo(() => {
        const v = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        // The height of the arc depends on the distance
        const dist = start.distanceTo(end);
        v.y += Math.min(dist * 0.5, 4); 
        return v;
    }, [start, end]);

    useFrame((state, delta) => {
        if (lineRef.current?.material) {
            // Animate the dash offset to create a flow effect
            lineRef.current.material.dashOffset -= delta * 2;
        }
    });

    return (
        <group>
            <QuadraticBezierLine
                ref={lineRef}
                start={start}
                end={end}
                mid={mid}
                color={hovered ? '#6366f1' : color} // Indigo if hovered
                lineWidth={hovered ? 4 : 2}
                dashed={true}
                dashScale={2}
                gapSize={0.5}
                dashSize={0.5}
                transparent
                opacity={hovered ? 1 : 0.6}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    setHovered(true);
                    document.body.style.cursor = 'pointer';
                }}
                onPointerOut={(e) => {
                    setHovered(false);
                    document.body.style.cursor = 'auto';
                }}
            />

            {/* Tooltip Hover */}
            {hovered && (
                <Html position={mid} center style={{ pointerEvents: 'none' }} zIndexRange={[100, 0]}>
                     <div className="flex items-center gap-2 px-3 py-2 bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-lg shadow-xl text-xs whitespace-nowrap transform -translate-y-4 transition-all animate-in fade-in zoom-in-95 duration-200">
                        <span className="text-gray-300 font-medium">{dep.fromItem}</span>
                        <span className="text-indigo-400 font-bold">→</span>
                        <span className="text-white font-semibold">{dep.toItem}</span>
                     </div>
                </Html>
            )}
        </group>
    );
};

const Connections: React.FC<ConnectionsProps> = ({ data, dependencies }) => {
  return (
    <group>
      {dependencies.map((dep) => {
        // Calculate start and end positions
        const startPos = getItemWorldPosition(dep.fromCategory, dep.fromItem, data);
        const endPos = getItemWorldPosition(dep.toCategory, dep.toItem, data);

        if (!startPos || !endPos) return null;

        // Convert to Vector3 and lift them slightly so they come out of the top of the blocks
        const startVec = new THREE.Vector3(startPos[0], 0.5, startPos[2]);
        const endVec = new THREE.Vector3(endPos[0], 0.5, endPos[2]);

        return (
            <AnimatedLine 
                key={dep.id} 
                start={startVec} 
                end={endVec} 
                color="#9ca3af" // Cool Gray
                dep={dep}
            />
        );
      })}
    </group>
  );
};

export default Connections;