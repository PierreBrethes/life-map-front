
import React, { useState, useEffect, useCallback } from 'react';
import { GlbAsset, AnimationInfo } from './assets/GlbAsset';
import { Float } from '@react-three/drei';
import { SpeechBubble } from './SpeechBubble';
import { useAgentStream } from '../hooks/useAgentStream';
import { OnboardingInput } from './OnboardingInput';

const IDLE_ANIMATION = 'RobotArmature|Robot_Idle';
const WAVE_ANIMATION = 'RobotArmature|Robot_Wave';

interface FloatingRobotProps {
  onOnboardingComplete?: () => void;
  messages: string;
  robotAnimation?: string;
  isThinking?: boolean;
}

const ThinkingAssets = () => {
  return (
    <group position={[0, 3, 0]}>
      <Float speed={5} rotationIntensity={1} floatIntensity={0.5}>
        <group position={[-0.5, 0, 0]} rotation={[0, 0, 0.5]}>
          <GlbAsset assetType={"wrench" as any} />
        </group>
      </Float>
      <Float speed={4} rotationIntensity={2} floatIntensity={0.5} floatingRange={[0.1, 0.3]}>
        <group position={[0.5, 0.5, 0]} rotation={[0.5, 0, -0.5]}>
          <GlbAsset assetType={"screws" as any} />
        </group>
      </Float>
    </group>
  );
};

export const FloatingRobot: React.FC<FloatingRobotProps> = ({
  onOnboardingComplete,
  messages,
  robotAnimation,
  isThinking = false
}) => {
  const [currentAnimation, setCurrentAnimation] = useState(WAVE_ANIMATION);
  const [animationDurations, setAnimationDurations] = useState<Record<string, number>>({});

  // Callback to store animation durations when loaded
  const handleAnimationsLoaded = useCallback((animations: AnimationInfo[]) => {
    const durations: Record<string, number> = {};
    animations.forEach(anim => {
      durations[anim.name] = anim.duration;
    });
    setAnimationDurations(durations);
  }, []);

  // Get duration for an animation (default to 2s if unknown)
  const getDuration = (animName: string) => {
    return (animationDurations[animName] || 2) * 1000;
  };

  // Handle Robot Animation from Agent (Prop driven)
  useEffect(() => {
    if (robotAnimation) {
      // Try exact name or prefixed
      let animName = robotAnimation;
      if (!animationDurations[animName]) {
        animName = `RobotArmature|${robotAnimation}`;
      }

      if (animationDurations[animName]) {
        setCurrentAnimation(animName);
        const duration = getDuration(animName);

        const timeout = setTimeout(() => {
          setCurrentAnimation(IDLE_ANIMATION);
        }, duration);

        return () => clearTimeout(timeout);
      }
    }
  }, [robotAnimation, animationDurations]);

  // Initial wave animation
  useEffect(() => {
    if (Object.keys(animationDurations).length === 0) return;
    const waveDuration = getDuration(WAVE_ANIMATION);
    const timeout = setTimeout(() => {
      setCurrentAnimation(IDLE_ANIMATION);
    }, waveDuration);
    return () => clearTimeout(timeout);
  }, [animationDurations]);


  return (
    <>
      <Float
        speed={2}
        rotationIntensity={0.5}
        floatIntensity={1}
        floatingRange={[0.5, 1]}
      >
        <group position={[0, 1, 0]}>
          <GlbAsset
            assetType={"robot" as any}
            color="#6366f1"
            currentAnimation={currentAnimation}
            onAnimationsLoaded={handleAnimationsLoaded}
          />

          {isThinking && <ThinkingAssets />}

          {/* Speech Bubble displaying streaming message */}
          {messages && (
            <SpeechBubble
              message={messages}
              position={[1.8, 2.5, 0]}
            />
          )}
        </group>
      </Float>
    </>
  );
};
