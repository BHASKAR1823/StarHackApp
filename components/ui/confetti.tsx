import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withTiming
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ConfettiPiece {
  id: number;
  color: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

interface ConfettiProps {
  active: boolean;
  particleCount?: number;
  colors?: string[];
  duration?: number;
  onComplete?: () => void;
}

const ConfettiParticle: React.FC<{ piece: ConfettiPiece; active: boolean; onComplete?: () => void }> = ({ 
  piece, 
  active, 
  onComplete 
}) => {
  const translateX = useSharedValue(SCREEN_WIDTH / 2);
  const translateY = useSharedValue(-50);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (active) {
      const angle = (piece.id / 20) * 2 * Math.PI;
      const velocity = 150 + Math.random() * 100;
      const fallDistance = SCREEN_HEIGHT + 100;
      
      // Start animation
      scale.value = withTiming(1, { duration: 100 });
      
      // Horizontal movement with air resistance
      translateX.value = withSequence(
        withTiming(SCREEN_WIDTH / 2 + Math.cos(angle) * velocity, { duration: 800 }),
        withTiming(SCREEN_WIDTH / 2 + Math.cos(angle) * velocity * 0.3, { duration: 1200 })
      );
      
      // Vertical movement with gravity
      translateY.value = withSequence(
        withTiming(Math.sin(angle) * velocity * 0.5, { duration: 400 }),
        withTiming(fallDistance, { duration: 1600 }, (finished) => {
          if (finished && onComplete) {
            runOnJS(onComplete)();
          }
        })
      );
      
      // Rotation
      rotation.value = withTiming(piece.rotation + 720, { duration: 2000 });
      
      // Fade out towards the end
      opacity.value = withSequence(
        withDelay(1200, withTiming(0, { duration: 800 }))
      );
    }
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value }
    ],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          backgroundColor: piece.color,
        },
        animatedStyle,
      ]}
    />
  );
};

export const Confetti: React.FC<ConfettiProps> = ({
  active,
  particleCount = 20,
  colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'],
  duration = 2000,
  onComplete
}) => {
  const [particles, setParticles] = useState<ConfettiPiece[]>([]);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (active) {
      const newParticles: ConfettiPiece[] = [];
      
      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          color: colors[Math.floor(Math.random() * colors.length)],
          x: SCREEN_WIDTH / 2,
          y: -50,
          rotation: Math.random() * 360,
          scale: 0.5 + Math.random() * 0.5,
        });
      }
      
      setParticles(newParticles);
      setCompletedCount(0);
    }
  }, [active, particleCount, colors]);

  const handleParticleComplete = () => {
    setCompletedCount(prev => {
      const newCount = prev + 1;
      if (newCount >= particleCount && onComplete) {
        onComplete();
      }
      return newCount;
    });
  };

  if (!active) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {particles.map((piece, index) => (
        <ConfettiParticle
          key={`${piece.id}-${active}`}
          piece={piece}
          active={active}
          onComplete={index === 0 ? handleParticleComplete : undefined}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});