import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Center, Text, Html, useCursor } from '@react-three/drei';
import * as THREE from 'three';
import { AssetOption, GLB_ASSET_CONFIG } from '../utils/assetMapping';
import { AssetRenderer } from './AssetRenderer';
import { AssetType } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Helper to get preview scale from centralized config
const getPreviewScale = (assetType: AssetType): number => {
  return GLB_ASSET_CONFIG[assetType]?.previewScale || 1.0;
};


interface AssetCarouselProps {
  assets: AssetOption[];
  selectedAsset: AssetType;
  onSelect: (asset: AssetType) => void;
  color: string;
}

const CarouselItem = ({
  asset,
  index,
  selectedIndex,
  color,
  onClick
}: {
  asset: AssetOption,
  index: number,
  selectedIndex: number,
  color: string,
  onClick: () => void
}) => {
  const group = useRef<THREE.Group>(null);
  const isSelected = index === selectedIndex;
  const [hovered, setHover] = React.useState(false);

  useCursor(hovered);

  useFrame((state, delta) => {
    if (group.current) {
      // Target position: Center is 0, others are spaced out
      const spacing = 2.5;
      const targetX = (index - selectedIndex) * spacing;

      // Smoothly interpolate position
      group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, targetX, delta * 5);

      // Scale effect: Selected is bigger
      const baseScale = getPreviewScale(asset.value);
      const targetScale = isSelected ? 1.2 * baseScale : 0.8 * baseScale;
      const currentScale = group.current.scale.x;
      const newScale = THREE.MathUtils.lerp(currentScale, targetScale, delta * 5);
      group.current.scale.set(newScale, newScale, newScale);

      // Rotation effect: Rotate selected slowly
      if (isSelected) {
        group.current.rotation.y += delta * 0.5;
      } else {
        // Reset rotation for others
        group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, 0, delta * 5);
      }

      // Opacity/Fade effect for distant items could be done with fog or material props, 
      // but simpler to just let them be smaller.
    }
  });

  return (
    <group
      ref={group}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      <Center top>
        <AssetRenderer type={asset.value} color={color} />
      </Center>
    </group>
  );
};

const AssetCarousel: React.FC<AssetCarouselProps> = ({ assets, selectedAsset, onSelect, color }) => {
  const selectedIndex = assets.findIndex(a => a.value === selectedAsset);

  const handleNext = () => {
    const nextIndex = (selectedIndex + 1) % assets.length;
    onSelect(assets[nextIndex].value);
  };

  const handlePrev = () => {
    const prevIndex = (selectedIndex - 1 + assets.length) % assets.length;
    onSelect(assets[prevIndex].value);
  };

  return (
    <div className="relative w-full h-full overflow-hidden group">
      <Canvas shadows camera={{ position: [0, 1.5, 4], fov: 40 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow />
        <spotLight position={[-5, 5, 2]} intensity={0.5} />

        <group position={[0, -0.5, 0]}>
          {assets.map((asset, i) => (
            <CarouselItem
              key={asset.value}
              asset={asset}
              index={i}
              selectedIndex={selectedIndex}
              color={color}
              onClick={() => onSelect(asset.value)}
            />
          ))}
        </group>
      </Canvas>

      {/* Navigation Arrows */}
      <button
        type="button"
        onClick={handlePrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg text-gray-700 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        type="button"
        onClick={handleNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg text-gray-700 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
      >
        <ChevronRight size={20} />
      </button>

      {/* Current Label Overlay */}
      <div className="absolute bottom-2 left-0 w-full text-center pointer-events-none">
        <span className="px-3 py-1 bg-white/90 dark:bg-slate-900/90 rounded-full text-xs font-bold text-indigo-600 dark:text-indigo-400 shadow-sm">
          {assets[selectedIndex]?.label}
        </span>
      </div>
    </div>
  );
};

export default AssetCarousel;
