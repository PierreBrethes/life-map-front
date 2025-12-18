
import React, { useState, useEffect, useCallback } from 'react';
import { GlbAsset, AnimationInfo } from './assets/GlbAsset';
import { Float } from '@react-three/drei';
import { SpeechBubble } from './SpeechBubble';

const RANDOM_ANIMATIONS = [
  'RobotArmature|Robot_Wave',
  'RobotArmature|Robot_ThumbsUp',
  'RobotArmature|Robot_Yes',
  'RobotArmature|Robot_No',
  'RobotArmature|Robot_Jump',
  'RobotArmature|Robot_Dance'
];

const IDLE_ANIMATION = 'RobotArmature|Robot_Idle';
const WAVE_ANIMATION = 'RobotArmature|Robot_Wave';

// Onboarding messages
const ONBOARDING_MESSAGES = [
  "Salut ! 👋 Bienvenue dans LifeMap, ton espace de vie personnalisé !",
  "Je suis ton assistant personnel. Je t'aiderai à organiser ta vie, tes finances, ta santé... tout ! 🚀",
  "Pour commencer, clique sur le bouton '+' pour créer ta première île. C'est parti ! ✨"
];

interface FloatingRobotProps {
  onOnboardingComplete?: () => void;
}

export const FloatingRobot: React.FC<FloatingRobotProps> = ({ onOnboardingComplete }) => {
  const [currentAnimation, setCurrentAnimation] = useState(WAVE_ANIMATION);
  const [animationDurations, setAnimationDurations] = useState<Record<string, number>>({});
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isOnboarding, setIsOnboarding] = useState(true);

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
    return (animationDurations[animName] || 2) * 1000; // Convert to ms
  };

  // Onboarding sequence: Show messages one by one
  useEffect(() => {
    if (!isOnboarding) return;
    if (Object.keys(animationDurations).length === 0) return;

    let timeoutId: NodeJS.Timeout;

    const showNextMessage = () => {
      if (currentMessageIndex < ONBOARDING_MESSAGES.length - 1) {
        // Move to next message after 5 seconds
        timeoutId = setTimeout(() => {
          setCurrentMessageIndex(prev => prev + 1);
          // Play a random animation with each new message
          const anim = RANDOM_ANIMATIONS[Math.floor(Math.random() * RANDOM_ANIMATIONS.length)];
          setCurrentAnimation(anim);

          // Return to idle after animation
          setTimeout(() => {
            setCurrentAnimation(IDLE_ANIMATION);
          }, getDuration(anim));
        }, 5000);
      } else {
        // Last message - end onboarding after 5 seconds
        timeoutId = setTimeout(() => {
          setIsOnboarding(false);
          onOnboardingComplete?.();
        }, 5000);
      }
    };

    showNextMessage();

    return () => clearTimeout(timeoutId);
  }, [currentMessageIndex, isOnboarding, animationDurations, onOnboardingComplete]);

  // Initial wave animation
  useEffect(() => {
    if (Object.keys(animationDurations).length === 0) return;

    const waveDuration = getDuration(WAVE_ANIMATION);
    const timeout = setTimeout(() => {
      setCurrentAnimation(IDLE_ANIMATION);
    }, waveDuration);

    return () => clearTimeout(timeout);
  }, [animationDurations]);

  // Random animations after onboarding
  useEffect(() => {
    if (isOnboarding) return;
    if (Object.keys(animationDurations).length === 0) return;

    let timeoutId: NodeJS.Timeout;
    let isActive = true;

    const scheduleNextAnimation = () => {
      if (!isActive) return;

      const delay = Math.random() * (10000 - 4000) + 4000;

      timeoutId = setTimeout(() => {
        if (!isActive) return;

        const nextAnim = RANDOM_ANIMATIONS[Math.floor(Math.random() * RANDOM_ANIMATIONS.length)];
        setCurrentAnimation(nextAnim);

        const animDuration = getDuration(nextAnim);

        setTimeout(() => {
          if (!isActive) return;
          setCurrentAnimation(IDLE_ANIMATION);
          scheduleNextAnimation();
        }, animDuration);

      }, delay);
    };

    scheduleNextAnimation();

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, [isOnboarding, animationDurations]);

  return (
    <Float
      speed={2}
      rotationIntensity={0.5}
      floatIntensity={1}
      floatingRange={[0.5, 1]}
    >
      <group position={[0, 1, 0]}>
        <GlbAsset
          assetType="robot"
          color="#6366f1"
          currentAnimation={currentAnimation}
          onAnimationsLoaded={handleAnimationsLoaded}
        />

        {/* Speech Bubble - only during onboarding */}
        {isOnboarding && (
          <SpeechBubble
            message={ONBOARDING_MESSAGES[currentMessageIndex]}
            position={[1.8, 2.5, 0]}
          />
        )}
      </group>
    </Float>
  );
};
