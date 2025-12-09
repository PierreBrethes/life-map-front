import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { LifeItem } from '../types';
import { parseValueToNumber, formatDisplayValue, getStatusColor } from '../utils/formatters';
import { getAssetMetadata } from '../utils/assetMapping';
import { AssetRenderer } from './AssetRenderer';
import { FinanceStackAsset } from './assets/FinanceStackAsset';
import { AlertSignal } from './assets/AlertSignal';
import { isFinanceAssetType, formatCurrency } from '../hooks/useFinanceBalance';

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

    // Check if this is a finance-type item
    const isFinanceType = isFinanceAssetType(item.assetType);

    // Get asset metadata for positioning
    let topOffset = getAssetMetadata(item.assetType).topOffset;

    // Determine the display value for the block
    // Uses item.value which is synced from the sidebar when syncBalanceWithBlock is enabled
    const displayValue = item.value;

    // Special case for FinanceStackAsset which needs dynamic height calculation
    let assetElement: React.ReactNode;
    if (item.assetType === 'finance') {
        const numValue = parseValueToNumber(item.value);
        const financeHeight = Math.min(Math.max(numValue / 5000, 0.6), 5.0);
        // FinanceStackAsset always shows the current item.value (which is synced when sync is enabled)
        assetElement = <FinanceStackAsset color={color} height={financeHeight} value={formatDisplayValue(item.value, item.type)} status={item.status} />;
        // Calculate topOffset based on stack height
        const segmentHeight = 0.2;
        const gap = 0.05;
        const stackCount = Math.max(2, Math.floor(financeHeight / (segmentHeight + gap)));
        topOffset = 0.1 + (stackCount * (segmentHeight + gap)) + 0.3;
    } else {
        // Use unified AssetRenderer for all other assets
        assetElement = <AssetRenderer type={item.assetType} color={effectiveColor} />;
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

    // Show value label for finance types when sync is enabled
    // For 'finance' type (coin stack), the value is already shown by FinanceStackAsset
    // For other finance types (card, safe, etc.), we show an HTML label
    const showValueLabel = isFinanceType && item.syncBalanceWithBlock && item.assetType !== 'finance';

    return (
        <group
            ref={groupRef}
            position={position}
            onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
            onPointerOut={(e) => { e.stopPropagation(); setHovered(false); document.body.style.cursor = 'auto'; }}
            onClick={(e) => { e.stopPropagation(); onSelect(categoryName, item); }}
        >
            {assetElement}

            {/* VALUE LABEL for Finance Items with sync enabled (except coin stack which shows it natively) */}
            {showValueLabel && (
                <Html position={[0, topOffset + 0.3, 0]} center zIndexRange={[50, 0]} style={{ pointerEvents: 'none' }}>
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-3 py-1.5 rounded-lg text-sm font-bold whitespace-nowrap shadow-lg border border-emerald-500/30">
                        {displayValue}
                    </div>
                </Html>
            )}

            {/* ALERT SIGNAL for Critical Items */}
            {showNotification && (
                <group position={[0, topOffset + (showValueLabel ? 1.0 : 0.5), 0]}>
                    <AlertSignal height={0} label={item.notificationLabel || 'Attention'} />
                </group>
            )}

            {/* Hover Label */}
            {hovered && !isSelected && (
                <Html position={[0, topOffset + (showValueLabel ? 1.0 : 0.5), 0]} center zIndexRange={[100, 0]} style={{ pointerEvents: 'none' }}>
                    <div className="bg-black/80 text-white px-2 py-1 rounded text-xs whitespace-nowrap backdrop-blur-sm shadow-lg">
                        {item.name}
                    </div>
                </Html>
            )}
        </group>
    );
};

export default Block;
