
import React, { useMemo } from 'react';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import Block from './Block';
import { Category, SelectionState, LifeItem } from '../types';
import { getItemLocalPosition, ITEM_SPACING } from '../utils/layout';

interface IslandProps {
  category: Category;
  position: [number, number, number];
  selection: SelectionState | null;
  onSelect: (categoryName: string, item: LifeItem) => void;
}

const Island: React.FC<IslandProps> = ({ category, position, selection, onSelect }) => {
  const MIN_SIZE = 4.5; // Minimum width/height for the island to look good with label
  const PADDING = 2.8; // Space around the grid of items

  // 1. Calculate Grid Dimensions for the Shape
  const itemCount = category.items.length;
  const cols = Math.ceil(Math.sqrt(itemCount)) || 1;
  const rows = Math.ceil(itemCount / cols) || 1;

  // 2. Calculate Physical Island Dimensions
  const islandWidth = Math.max(MIN_SIZE, (cols * ITEM_SPACING) + PADDING);
  const islandDepth = Math.max(MIN_SIZE, (rows * ITEM_SPACING) + PADDING);

  // 3. Get Item Positions from Utility
  const itemPositions = useMemo(() => {
    return category.items.map((_, index) => {
      // Use the shared utility to ensure blocks align with connections
      const localPos = getItemLocalPosition(index, itemCount);
      // Add a small Y offset for the block to sit on top
      return [localPos[0], 0.01, localPos[2]] as [number, number, number];
    });
  }, [category.items.length, itemCount]);

  const isCategorySelected = selection?.categoryName === category.name;

  // 4. Create Dynamic Shape based on calculated dimensions
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const r = 0.3; // Corner radius

    const w = islandWidth;
    const h = islandDepth;

    const x = -w / 2;
    const y = -h / 2;

    s.moveTo(x + r, y);
    s.lineTo(x + w - r, y);
    s.quadraticCurveTo(x + w, y, x + w, y + r);
    s.lineTo(x + w, y + h - r);
    s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    s.lineTo(x + r, y + h);
    s.quadraticCurveTo(x, y + h, x, y + h - r);
    s.lineTo(x, y + r);
    s.quadraticCurveTo(x, y, x + r, y);

    return s;
  }, [islandWidth, islandDepth]);

  return (
    <group position={position}>
      {/* Pure 2D Plane Surface - Dynamically Sized */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <shapeGeometry args={[shape]} />
        <meshStandardMaterial
          color={'#cbd5e1'} // Slate-300 for better visibility
          roughness={0.4}
          metalness={0.1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Category Label - Anchored to bottom-left corner dynamically */}
      <group
        position={[(-islandWidth / 2) + 0.3, 0.02, (islandDepth / 2) - 0.3]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <Text
          position={[0, 0, 0]}
          fontSize={0.18}
          color={category.color}
          anchorX="left"
          anchorY="bottom" // Align to bottom-left inside the group
          fontWeight={800}
          letterSpacing={0.05}
        >
          {category.name.toUpperCase()}
        </Text>
      </group>

      {/* Items */}
      {category.items.map((item, index) => (
        <Block
          // Use ID if available for stable reconciliation during deletes, fallback to name/index
          key={item.id || `${item.name}-${index}`}
          item={item}
          color={category.color}
          position={itemPositions[index]}
          categoryName={category.name}
          isSelected={selection?.item.name === item.name && isCategorySelected}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
};

export default Island;
