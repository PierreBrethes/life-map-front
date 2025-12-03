import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { LifeItem } from '../types';
import { parseValueToNumber, formatDisplayValue, getStatusColor } from '../utils/formatters';
import { getAssetMetadata } from '../utils/assetMapping';

// Assets
import { PeopleAsset } from './assets/PeopleAsset';
import { HouseAsset } from './assets/HouseAsset';
import { TechAsset } from './assets/TechAsset';
import { SportAsset } from './assets/SportAsset';
import { TravelAsset } from './assets/TravelAsset';
import { FinanceStackAsset } from './assets/FinanceStackAsset';
import { TreeAsset } from './assets/TreeAsset';
import { HealthAsset } from './assets/HealthAsset';
import { GenericAsset } from './assets/GenericAsset';
import { AlertSignal } from './assets/AlertSignal';

interface BlockProps {
    item: LifeItem;
    color: string;
    position: [number, number, number];
    categoryName: string;
    isSelected: boolean;
    onSelect: (categoryName: string, item: LifeItem) => void;
}

// --- Main Component ---

const Block: React.FC<BlockProps> = ({ item, color, position, categoryName, isSelected, onSelect }) => {
    const groupRef = useRef<THREE.Group>(null);
    const [hovered, setHovered] = useState(false);
    const effectiveColor = useMemo(() => getStatusColor(color, item.status), [color, item.status]);

    // Determine Asset Properties
    let assetElement = <GenericAsset color={effectiveColor} />;
    let topOffset = getAssetMetadata(item.assetType).topOffset;

    // Asset rendering based on assetType
    switch (item.assetType) {
        case 'people':
            assetElement = <PeopleAsset color={effectiveColor} />;
            break;
        case 'sport':
            assetElement = <SportAsset color={effectiveColor} />;
            break;
        case 'tech':
            assetElement = <TechAsset color={effectiveColor} />;
            break;
        case 'travel':
            assetElement = <TravelAsset color={effectiveColor} />;
            break;
        case 'home':
            assetElement = <HouseAsset color={effectiveColor} />;
            break;
        case 'health':
            assetElement = <HealthAsset color={effectiveColor} />;
            break;
        case 'nature':
            assetElement = <TreeAsset color={effectiveColor} />;
            break;
        case 'finance':
            // Finance Stack has dynamic height based on value
            const numValue = parseValueToNumber(item.value);
            const financeHeight = Math.min(Math.max(numValue / 5000, 0.6), 5.0);
            assetElement = <FinanceStackAsset color={color} height={financeHeight} value={formatDisplayValue(item.value, item.type)} status={item.status} />;
            // Calculate topOffset based on stack height
            const segmentHeight = 0.2;
            const gap = 0.05;
            const stackCount = Math.max(2, Math.floor(financeHeight / (segmentHeight + gap)));
            topOffset = 0.1 + (stackCount * (segmentHeight + gap)) + 0.3;
            break;
        default:
            // 'default' assetType
            assetElement = <GenericAsset color={effectiveColor} />;
            break;
    }

    useFrame((state, delta) => {
        if (groupRef.current) {
            const t = state.clock.getElapsedTime();
            let floatY = Math.sin(t * 2 + position[0] * 10) * 0.03;
            // Finance stacks don't float (they're grounded)
            if (item.assetType === 'finance') floatY = 0;

            const targetY = position[1] + Math.max(0, floatY) + (hovered || isSelected ? 0.2 : 0);
            groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, targetY, 0.1);

            if (isSelected) groupRef.current.rotation.y += delta;
            else groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, delta * 2);
        }
    });

    // Only show AlertSignal if critical AND not dismissed
    const showNotification = item.status === 'critical' && !item.notificationDismissed;

    return (
        <group
            ref={groupRef}
            position={position}
            onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
            onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
            onClick={(e) => { e.stopPropagation(); onSelect(categoryName, item); }}
        >
            {assetElement}

            {/* ALERT SIGNAL for Critical Items */}
            {showNotification && (
                <AlertSignal height={topOffset} label={item.notificationLabel || item.name} />
            )}

            {/* Hover Label (HTML Overlay) */}
            {(hovered || isSelected) && (
                <Html position={[0, topOffset + 0.5, 0]} center style={{ pointerEvents: 'none' }} zIndexRange={[100, 0]}>
                    <div className="px-3 py-1.5 bg-gray-900/90 text-white text-xs font-bold rounded-lg shadow-xl backdrop-blur-md border border-white/20 whitespace-nowrap transform -translate-y-2 transition-all">
                        {item.name.toUpperCase()}
                    </div>
                </Html>
            )}
        </group>
    );
};

export default Block;
