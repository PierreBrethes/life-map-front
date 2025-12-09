
import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { QuadraticBezierLine, Html } from '@react-three/drei';
import * as THREE from 'three';
import * as Icons from 'lucide-react';
import { Category, Dependency } from '../types';
import { getItemWorldPosition } from '../utils/layout';

interface ConnectionsProps {
    data: Category[];
    dependencies: Dependency[];
    selectedId: string | null;
    onSelect: (id: string | null) => void;
    onDelete: (id: string) => void;
}

interface AnimatedLineProps {
    start: THREE.Vector3;
    end: THREE.Vector3;
    color: string;
    dep: Dependency;
    data: Category[];
    isSelected: boolean;
    onSelect: () => void;
    onDelete: () => void;
}

const AnimatedLine: React.FC<AnimatedLineProps> = ({ start, end, color, dep, data, isSelected, onSelect, onDelete }) => {
    const lineRef = useRef<any>(null);
    const [hovered, setHovered] = useState(false);

    // Resolve item names from IDs
    const getItemName = (categoryId: string, itemId: string): string => {
        const category = data.find(c => c.id === categoryId);
        if (!category) return itemId.slice(0, 8) + '...';
        const item = category.items.find(i => i.id === itemId);
        return item?.name || itemId.slice(0, 8) + '...';
    };

    const fromName = getItemName(dep.fromCategoryId, dep.fromItemId);
    const toName = getItemName(dep.toCategoryId, dep.toItemId);

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

    const activeColor = isSelected ? '#ef4444' : '#6366f1'; // Red if selected, Indigo if hovered
    const baseColor = isSelected ? '#fca5a5' : color;

    return (
        <group>
            <QuadraticBezierLine
                ref={lineRef}
                start={start}
                end={end}
                mid={mid}
                color={hovered || isSelected ? activeColor : baseColor}
                lineWidth={hovered || isSelected ? 5 : 2}
                dashed={true}
                dashScale={2}
                gapSize={0.5}
                dashSize={0.5}
                transparent
                opacity={hovered || isSelected ? 1 : 0.6}
                onPointerOver={(e) => {
                    e.stopPropagation();
                    setHovered(true);
                    document.body.style.cursor = 'pointer';
                }}
                onPointerOut={(e) => {
                    setHovered(false);
                    document.body.style.cursor = 'auto';
                }}
                onClick={(e) => {
                    e.stopPropagation();
                    onSelect();
                }}
            />

            {/* Hover Tooltip (Only if not selected) */}
            {hovered && !isSelected && (
                <Html position={mid} center style={{ pointerEvents: 'none' }} zIndexRange={[100, 0]}>
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-lg shadow-xl text-xs whitespace-nowrap transform -translate-y-4 transition-all animate-in fade-in zoom-in-95 duration-200">
                        <span className="text-gray-300 font-medium">{fromName}</span>
                        <span className="text-indigo-400 font-bold">→</span>
                        <span className="text-white font-semibold">{toName}</span>
                    </div>
                </Html>
            )}

            {/* Action Popup (If Selected) */}
            {isSelected && (
                <Html position={mid} center zIndexRange={[110, 0]}>
                    <div className="flex flex-col items-center gap-2 transform -translate-y-8 animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border dark:border-slate-600 border-gray-200 p-2 flex items-center gap-1">
                            <div className="px-2 text-xs font-bold text-gray-500 uppercase tracking-wider border-r dark:border-slate-600 border-gray-200 mr-1">
                                Lien
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                                className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                            >
                                <Icons.Trash2 size={14} />
                                <span>Supprimer</span>
                            </button>
                        </div>
                        {/* Little triangle arrow pointing down */}
                        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white dark:border-t-slate-800 shadow-sm"></div>
                    </div>
                </Html>
            )}
        </group>
    );
};

const Connections: React.FC<ConnectionsProps> = ({ data, dependencies, selectedId, onSelect, onDelete }) => {
    return (
        <group>
            {dependencies.map((dep) => {
                // Calculate start and end positions using IDs
                const startPos = getItemWorldPosition(dep.fromCategoryId, dep.fromItemId, data);
                const endPos = getItemWorldPosition(dep.toCategoryId, dep.toItemId, data);

                if (!startPos || !endPos) return null;

                // Convert to Vector3 and lift them slightly
                const startVec = new THREE.Vector3(startPos[0], 0.5, startPos[2]);
                const endVec = new THREE.Vector3(endPos[0], 0.5, endPos[2]);

                return (
                    <AnimatedLine
                        key={dep.id}
                        start={startVec}
                        end={endVec}
                        color="#9ca3af" // Cool Gray
                        dep={dep}
                        data={data}
                        isSelected={selectedId === dep.id}
                        onSelect={() => onSelect(dep.id)}
                        onDelete={() => onDelete(dep.id)}
                    />
                );
            })}
        </group>
    );
};

export default Connections;
