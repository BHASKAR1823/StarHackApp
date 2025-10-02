import LottieView from 'lottie-react-native';
import React, { useEffect, useRef } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LottieConfettiProps {
  visible: boolean;
  type?: 'success' | 'celebration' | 'steps';
  onAnimationFinish?: () => void;
  autoPlay?: boolean;
  loop?: boolean;
  speed?: number;
}

export const LottieConfetti: React.FC<LottieConfettiProps> = ({
  visible,
  type = 'success',
  onAnimationFinish,
  autoPlay = true,
  loop = false,
  speed = 1,
}) => {
  const animationRef = useRef<LottieView>(null);

  const getAnimationSource = () => {
    switch (type) {
      case 'success':
        return require('../../assets/lottie/success-confetti.json');
      case 'celebration':
        return require('../../assets/lottie/confetti-transparent.json');
      case 'steps':
        return require('../../assets/lottie/success-confetti.json');
      default:
        return require('../../assets/lottie/success-confetti.json');
    }
  };

  useEffect(() => {
    if (visible && animationRef.current) {
      animationRef.current.play();
    } else if (!visible && animationRef.current) {
      animationRef.current.reset();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      <LottieView
        ref={animationRef}
        source={getAnimationSource()}
        autoPlay={autoPlay}
        loop={loop}
        speed={speed}
        style={styles.animation}
        onAnimationFinish={onAnimationFinish}
        resizeMode="cover"
      />
    </View>
  );
};

// Enhanced Confetti with multiple layers for bigger celebrations
export const LottieConfettiExplosion: React.FC<LottieConfettiProps> = ({
  visible,
  onAnimationFinish,
}) => {
  if (!visible) return null;

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Main confetti burst */}
      <LottieView
        source={require('../../assets/lottie/success-confetti.json')}
        autoPlay={visible}
        loop={false}
        speed={1.2}
        style={styles.animation}
        onAnimationFinish={onAnimationFinish}
        resizeMode="cover"
      />
      
      {/* Background particles */}
      <LottieView
        source={require('../../assets/lottie/confetti-transparent.json')}
        autoPlay={visible}
        loop={false}
        speed={0.8}
        style={[styles.animation, { opacity: 0.7 }]}
        resizeMode="cover"
      />
      
      {/* Delayed second burst */}
      <LottieView
        source={require('../../assets/lottie/success-confetti.json')}
        autoPlay={visible}
        loop={false}
        speed={1.5}
        style={[styles.animation, { opacity: 0.8 }]}
        resizeMode="cover"
      />
    </View>
  );
};

// Step completion celebration
export const StepCelebration: React.FC<{ visible: boolean; stepCount: number; onComplete?: () => void }> = ({
  visible,
  stepCount,
  onComplete,
}) => {
  // Determine celebration intensity based on step milestones
  const getCelebrationType = () => {
    if (stepCount >= 10000) return 'explosion'; // 10k+ steps - big celebration
    if (stepCount >= 5000) return 'success'; // 5k+ steps - medium celebration
    return 'celebration'; // Regular celebration
  };

  const celebrationType = getCelebrationType();

  if (!visible) return null;

  if (celebrationType === 'explosion') {
    return <LottieConfettiExplosion visible={visible} onAnimationFinish={onComplete} />;
  }

  return (
    <LottieConfetti 
      visible={visible}
      type={celebrationType as 'success' | 'celebration'}
      onAnimationFinish={onComplete}
      speed={celebrationType === 'success' ? 1.3 : 1.0}
    />
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
    justifyContent: 'center',
    alignItems: 'center',
  },
  animation: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});