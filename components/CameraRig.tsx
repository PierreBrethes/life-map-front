import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface CameraRigProps {
  targetPosition: [number, number, number] | null;
}

const CameraRig: React.FC<CameraRigProps> = ({ targetPosition }) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const cameraRef = useRef<THREE.OrthographicCamera>(null);
  
  // State to manage the transition back to overview
  const [isResetting, setIsResetting] = useState(false);
  const prevTargetRef = useRef(targetPosition);

  useEffect(() => {
      // Detect deselect (Value -> Null)
      if (prevTargetRef.current && !targetPosition) {
          setIsResetting(true);
      }
      // Detect select (Null -> Value) - Stop resetting immediately
      if (targetPosition) {
          setIsResetting(false);
      }
      prevTargetRef.current = targetPosition;
  }, [targetPosition]);

  useFrame((state, delta) => {
    const damp = 4 * delta;

    if (controlsRef.current && cameraRef.current) {
      if (targetPosition) {
          // --- FOCUS MODE ---
          controlsRef.current.target.lerp(
            new THREE.Vector3(targetPosition[0], 0, targetPosition[2]), 
            damp
          );
          cameraRef.current.zoom = THREE.MathUtils.lerp(cameraRef.current.zoom, 90, damp);
          cameraRef.current.updateProjectionMatrix();
      } else if (isResetting) {
          // --- TRANSITION TO OVERVIEW ---
          controlsRef.current.target.lerp(new THREE.Vector3(0, 0, 0), damp);
          cameraRef.current.zoom = THREE.MathUtils.lerp(cameraRef.current.zoom, 50, damp);
          cameraRef.current.updateProjectionMatrix();

          // Check if transition is complete
          const dist = controlsRef.current.target.distanceTo(new THREE.Vector3(0,0,0));
          const zoomDiff = Math.abs(cameraRef.current.zoom - 50);
          
          if (dist < 0.1 && zoomDiff < 0.5) {
              setIsResetting(false);
          }
      }
      // --- IDLE OVERVIEW ---
      // If !targetPosition and !isResetting, we do nothing.
      // This allows the user to pan and zoom freely in overview mode.
      
      controlsRef.current.update();
    }
  });

  return (
    <>
      <OrthographicCamera
        ref={cameraRef}
        makeDefault
        position={[20, 20, 20]}
        zoom={50}
        near={-50}
        far={200}
        onUpdate={c => c.lookAt(0, 0, 0)}
      />
      <OrbitControls 
        ref={controlsRef}
        enableZoom={true} 
        enablePan={true} 
        minZoom={30}
        maxZoom={120}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2.2}
        enableDamping={true} 
        dampingFactor={0.05}
      />
    </>
  );
};

export default CameraRig;