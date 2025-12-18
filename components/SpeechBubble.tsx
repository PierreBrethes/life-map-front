import React from 'react';
import { Html } from '@react-three/drei';

interface SpeechBubbleProps {
  message: string;
  position?: [number, number, number];
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  message,
  position = [1.5, 2, 0]
}) => {
  return (
    <group position={position}>
      <Html
        distanceFactor={8}
        transform
        occlude={false}
        style={{
          pointerEvents: 'none',
          // Anchor from bottom-left, so it grows upward
          transform: 'translateY(-100%)',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%)',
            borderRadius: '20px',
            padding: '16px 24px',
            boxShadow: '0 8px 32px rgba(99, 102, 241, 0.25), 0 4px 12px rgba(0,0,0,0.1)',
            border: '2px solid rgba(99, 102, 241, 0.3)',
            maxWidth: '280px',
            position: 'relative',
            fontFamily: "'Inter', 'Segoe UI', sans-serif",
          }}
        >
          {/* Speech bubble tail */}
          <div
            style={{
              position: 'absolute',
              bottom: '-12px',
              left: '30px',
              width: 0,
              height: 0,
              borderLeft: '12px solid transparent',
              borderRight: '12px solid transparent',
              borderTop: '14px solid #f0f4ff',
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-8px',
              left: '32px',
              width: 0,
              height: 0,
              borderLeft: '10px solid transparent',
              borderRight: '10px solid transparent',
              borderTop: '12px solid #ffffff',
            }}
          />

          {/* Message text */}
          <p
            style={{
              margin: 0,
              fontSize: '15px',
              lineHeight: 1.5,
              color: '#1e293b',
              fontWeight: 500,
            }}
          >
            {message}
          </p>
        </div>
      </Html>
    </group>
  );
};
