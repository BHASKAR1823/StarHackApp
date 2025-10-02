import { 
  withSpring, 
  withTiming, 
  withSequence, 
  withDelay,
  runOnJS,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

// Animation configurations
export const SPRING_CONFIG = {
  damping: 15,
  stiffness: 150,
  mass: 1,
};

export const TIMING_CONFIG = {
  duration: 300,
};

// Celebration animations
export const celebrationScale = () => {
  'worklet';
  return withSequence(
    withTiming(1.2, { duration: 150 }),
    withTiming(1, { duration: 150 })
  );
};

export const coinFlip = () => {
  'worklet';
  return withSequence(
    withTiming(180, { duration: 200 }),
    withTiming(360, { duration: 200 }),
    withTiming(0, { duration: 0 })
  );
};

export const bounceIn = () => {
  'worklet';
  return withSequence(
    withTiming(1.1, { duration: 200 }),
    withSpring(1, SPRING_CONFIG)
  );
};

// Progress bar animation
export const animatedProgress = (progress: number) => {
  'worklet';
  return withTiming(progress, { duration: 1000 });
};

// Slide animations
export const slideInLeft = () => {
  'worklet';
  return withSpring(0, SPRING_CONFIG);
};

export const slideInRight = () => {
  'worklet';
  return withSpring(0, SPRING_CONFIG);
};

export const fadeIn = () => {
  'worklet';
  return withTiming(1, { duration: 500 });
};

export const fadeOut = () => {
  'worklet';
  return withTiming(0, { duration: 300 });
};

// Pulse animation for notifications
export const pulseAnimation = () => {
  'worklet';
  return withSequence(
    withTiming(1.05, { duration: 300 }),
    withTiming(1, { duration: 300 })
  );
};

// Shake animation for errors
export const shakeAnimation = () => {
  'worklet';
  return withSequence(
    withTiming(-10, { duration: 50 }),
    withTiming(10, { duration: 50 }),
    withTiming(-10, { duration: 50 }),
    withTiming(10, { duration: 50 }),
    withTiming(0, { duration: 50 })
  );
};

// Confetti effect animation
export const confettiAnimation = (delay: number = 0) => {
  'worklet';
  return withDelay(
    delay,
    withSequence(
      withTiming(Math.random() * 300 - 150, { duration: 1000 }),
      withTiming(600, { duration: 1000 })
    )
  );
};

// Level up animation
export const levelUpScale = () => {
  'worklet';
  return withSequence(
    withTiming(0, { duration: 0 }),
    withDelay(200, withSpring(1, { ...SPRING_CONFIG, stiffness: 200 }))
  );
};

// Card flip animation
export const cardFlip = () => {
  'worklet';
  return withSequence(
    withTiming(90, { duration: 150 }),
    withTiming(0, { duration: 150 })
  );
};

// Utility functions for haptic feedback
export const triggerHapticFeedback = (type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'light') => {
  switch (type) {
    case 'light':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      break;
    case 'medium':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      break;
    case 'heavy':
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      break;
    case 'success':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      break;
    case 'warning':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      break;
    case 'error':
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      break;
  }
};

// Custom hooks for common animations
export const useScaleAnimation = (initialValue: number = 1) => {
  const scale = useSharedValue(initialValue);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const animate = (toValue: number, config = SPRING_CONFIG) => {
    scale.value = withSpring(toValue, config);
  };

  return { scale, animatedStyle, animate };
};

export const useFadeAnimation = (initialValue: number = 0) => {
  const opacity = useSharedValue(initialValue);
  
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const animate = (toValue: number, config = TIMING_CONFIG) => {
    opacity.value = withTiming(toValue, config);
  };

  return { opacity, animatedStyle, animate };
};

export const useSlideAnimation = (initialValue: number = 100) => {
  const translateX = useSharedValue(initialValue);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const animate = (toValue: number, config = SPRING_CONFIG) => {
    translateX.value = withSpring(toValue, config);
  };

  return { translateX, animatedStyle, animate };
};

export const useProgressAnimation = (initialValue: number = 0) => {
  const progress = useSharedValue(initialValue);
  
  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value}%`,
  }));

  const animate = (toValue: number) => {
    progress.value = withTiming(toValue, { duration: 1000 });
  };

  return { progress, animatedStyle, animate };
};

// Reward animation sequence
export const rewardAnimationSequence = (
  scale: any,
  rotation: any,
  onComplete?: () => void
) => {
  'worklet';
  
  // Scale up with rotation
  scale.value = withSequence(
    withTiming(1.3, { duration: 200 }),
    withSpring(1, SPRING_CONFIG)
  );
  
  // Coin flip effect
  rotation.value = withSequence(
    withTiming(180, { duration: 300 }),
    withTiming(360, { duration: 300 }),
    withTiming(0, { duration: 0 }, (finished) => {
      if (finished && onComplete) {
        runOnJS(onComplete)();
      }
    })
  );
};

// Streak fire animation
export const streakFireAnimation = () => {
  'worklet';
  return withSequence(
    withTiming(1.2, { duration: 100 }),
    withTiming(0.9, { duration: 100 }),
    withTiming(1.1, { duration: 100 }),
    withTiming(1, { duration: 100 })
  );
};