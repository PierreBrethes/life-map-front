import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

interface CameraRigProps {
  targetPosition: [number, number, number] | null;
  lockOnRobot?: boolean; // When true, camera locks on robot position at origin
}

// Robot position - centered and looking more at face level
const ROBOT_CAMERA_TARGET = new THREE.Vector3(0.5, 1.5, 0);
const ROBOT_ZOOM = 80;

const CameraRig: React.FC<CameraRigProps> = ({ targetPosition, lockOnRobot = false }) => {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const cameraRef = useRef<THREE.OrthographicCamera>(null);

  const [isResetting, setIsResetting] = useState(false);
  const prevTargetRef = useRef(targetPosition);

  // Track target changes to trigger smooth transitions between modes
  useEffect(() => {
    if (prevTargetRef.current && !targetPosition) setIsResetting(true);
    if (targetPosition) setIsResetting(false);
    prevTargetRef.current = targetPosition;
  }, [targetPosition]);

  useFrame((state, delta) => {
    const damp = 4 * delta;

    if (controlsRef.current && cameraRef.current) {
      // ROBOT LOCK MODE: Lock camera on robot during onboarding (face-to-face)
      if (lockOnRobot) {
        controlsRef.current.target.lerp(ROBOT_CAMERA_TARGET, damp);
        cameraRef.current.zoom = THREE.MathUtils.lerp(cameraRef.current.zoom, ROBOT_ZOOM, damp);

        // Move camera to be more face-to-face (front view, slightly elevated)
        const facePosition = new THREE.Vector3(0, 3, 12);
        cameraRef.current.position.lerp(facePosition, damp * 0.5);

        cameraRef.current.updateProjectionMatrix();
      }
      // FOCUS MODE: Zoom in and center on selected item
      else if (targetPosition) {
        controlsRef.current.target.lerp(
          new THREE.Vector3(targetPosition[0], 0, targetPosition[2]),
          damp
        );
        cameraRef.current.zoom = THREE.MathUtils.lerp(cameraRef.current.zoom, 90, damp);
        cameraRef.current.updateProjectionMatrix();
        // OVERVIEW TRANSITION: Return to default view
      } else if (isResetting) {
        controlsRef.current.target.lerp(new THREE.Vector3(0, 0, 0), damp);
        cameraRef.current.zoom = THREE.MathUtils.lerp(cameraRef.current.zoom, 50, damp);
        cameraRef.current.updateProjectionMatrix();

        const dist = controlsRef.current.target.distanceTo(new THREE.Vector3(0, 0, 0));
        const zoomDiff = Math.abs(cameraRef.current.zoom - 50);

        if (dist < 0.1 && zoomDiff < 0.5) {
          setIsResetting(false);
        }
      }
      // IDLE: No target, no transition - user can freely pan/zoom

      controlsRef.current.update();
    }
  });

  return (
    <>
      <OrthographicCamera
        ref={cameraRef}
        makeDefault
        position={[10, 5, 10]}
        zoom={50}
        near={-50}
        far={200}
        onUpdate={c => c.lookAt(0, 0, 0)}
      />
      <OrbitControls
        ref={controlsRef}
        enableZoom={!lockOnRobot}
        enablePan={!lockOnRobot}
        enableRotate={!lockOnRobot}
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