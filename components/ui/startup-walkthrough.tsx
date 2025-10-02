import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors, WellnessColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import LottieView from 'lottie-react-native';
import React, { useEffect, useState } from 'react';
import {
    Dimensions,
    Modal,
    StatusBar,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { LottieConfetti } from './lottie-confetti';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  animation?: any;
  tips?: string[];
}

interface StartupWalkthroughProps {
  visible: boolean;
  onComplete: () => void;
}

const walkthroughSteps: WalkthroughStep[] = [
  {
    id: '1',
    title: 'Welcome to YouMatter! 🌟',
    description: 'Your personal wellness companion that makes healthy living fun and rewarding.',
    icon: 'heart.fill',
    color: WellnessColors.physical,
    tips: ['Earn coins for every healthy action', 'Build streaks to multiply rewards', 'Level up and unlock premium features']
  },
  {
    id: '2',
    title: 'Gamified Wellness Journey 🎮',
    description: 'Complete daily tasks, maintain streaks, and level up your wellness game!',
    icon: 'star.fill',
    color: WellnessColors.coins,
    tips: ['Daily tasks refresh every 24 hours', 'Streaks multiply your coin rewards', 'Higher levels unlock exclusive content']
  },
  {
    id: '3',
    title: 'AI Wellness Coach 🤖',
    description: 'Chat with our AI assistant for personalized health advice 24/7.',
    icon: 'message.fill',
    color: WellnessColors.mental,
    tips: ['Ask about nutrition, exercise, sleep', 'Get personalized recommendations', 'Earn coins for chat interactions']
  },
  {
    id: '4',
    title: 'AR Yoga Studio 🧘‍♀️',
    description: 'Experience immersive yoga sessions with real-time pose detection.',
    icon: 'figure.walk',
    color: WellnessColors.yoga,
    tips: ['Real-time pose feedback', 'Multiple difficulty levels', 'Earn more coins for perfect poses']
  },
  {
    id: '5',
    title: 'Insurance Integration 🛡️',
    description: 'Connect your wellness activities to reduce insurance premiums.',
    icon: 'shield.fill',
    color: WellnessColors.social,
    tips: ['Complete challenges for discounts', 'Track your premium savings', 'Access exclusive insurance perks']
  },
  {
    id: '6',
    title: 'Ready to Start! 🚀',
    description: 'Your wellness journey begins now. Let\'s make every day matter!',
    icon: 'gift.fill',
    color: WellnessColors.premium,
    tips: ['Start with simple daily tasks', 'Check the reward store regularly', 'Join surprise events for bonus rewards']
  },
];

export const StartupWalkthrough: React.FC<StartupWalkthroughProps> = ({
  visible,
  onComplete,
}) => {
  const colorScheme = useColorScheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const slideOpacity = useSharedValue(0);
  const slideTranslateY = useSharedValue(50);
  const iconScale = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  const slideAnimatedStyle = useAnimatedStyle(() => ({
    opacity: slideOpacity.value,
    transform: [{ translateY: slideTranslateY.value }],
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  useEffect(() => {
    if (visible) {
      animateSlideIn();
    }
  }, [visible, currentStep]);

  const animateSlideIn = () => {
    // Reset values
    slideOpacity.value = 0;
    slideTranslateY.value = 50;
    iconScale.value = 0;

    // Animate in
    slideOpacity.value = withTiming(1, { duration: 500 });
    slideTranslateY.value = withSpring(0, { damping: 15, stiffness: 150 });
    iconScale.value = withDelay(200, withSpring(1, { damping: 10, stiffness: 200 }));
  };

  const animateSlideOut = (callback: () => void) => {
    slideOpacity.value = withTiming(0, { duration: 300 });
    slideTranslateY.value = withTiming(-50, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(callback)();
      }
    });
  };

  const handleNext = () => {
    if (currentStep < walkthroughSteps.length - 1) {
      animateSlideOut(() => {
        setCurrentStep(prev => prev + 1);
      });
    } else {
      // Show completion celebration
      setShowConfetti(true);
      setTimeout(() => {
        onComplete();
      }, 2000);
    }

    // Button press animation
    buttonScale.value = withSpring(0.95, { damping: 15, stiffness: 150 }, () => {
      buttonScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    });
  };

  const handleSkip = () => {
    onComplete();
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      animateSlideOut(() => {
        setCurrentStep(prev => prev - 1);
      });
    }
  };

  if (!visible) return null;

  const currentStepData = walkthroughSteps[currentStep];
  const isLastStep = currentStep === walkthroughSteps.length - 1;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      transparent
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.8)" barStyle="light-content" />
      <View style={styles.overlay}>
        {/* Background Animation */}
        <View style={styles.backgroundAnimation}>
          <LottieView
            source={require('../../assets/lottie/confetti-transparent.json')}
            autoPlay
            loop
            speed={0.3}
            style={styles.backgroundLottie}
            resizeMode="cover"
          />
        </View>

        {/* Main Content */}
        <Animated.View style={[styles.content, slideAnimatedStyle]}>
          {/* Icon */}
          <Animated.View 
            style={[
              styles.iconContainer, 
              { backgroundColor: currentStepData.color + '20' },
              iconAnimatedStyle
            ]}
          >
            <IconSymbol 
              name={currentStepData.icon as any} 
              size={64} 
              color={currentStepData.color} 
            />
          </Animated.View>

          {/* Title */}
          <ThemedText type="title" style={[styles.title, { color: currentStepData.color }]}>
            {currentStepData.title}
          </ThemedText>

          {/* Description */}
          <ThemedText style={styles.description}>
            {currentStepData.description}
          </ThemedText>

          {/* Tips */}
          {currentStepData.tips && (
            <View style={styles.tipsContainer}>
              {currentStepData.tips.map((tip, index) => (
                <View key={index} style={styles.tipItem}>
                  <View style={[styles.tipBullet, { backgroundColor: currentStepData.color }]} />
                  <ThemedText style={styles.tipText}>{tip}</ThemedText>
                </View>
              ))}
            </View>
          )}

          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            {walkthroughSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor: index <= currentStep 
                      ? currentStepData.color 
                      : Colors[colorScheme ?? 'light'].outline
                  }
                ]}
              />
            ))}
          </View>

          {/* Navigation */}
          <View style={styles.navigationContainer}>
            {currentStep > 0 && (
              <TouchableOpacity style={styles.previousButton} onPress={handlePrevious}>
                <IconSymbol name="chevron.left" size={20} color={Colors[colorScheme ?? 'light'].text} />
                <ThemedText style={styles.previousText}>Previous</ThemedText>
              </TouchableOpacity>
            )}

            <View style={styles.spacer} />

            <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
              <ThemedText style={styles.skipText}>Skip</ThemedText>
            </TouchableOpacity>

            <Animated.View style={buttonAnimatedStyle}>
              <TouchableOpacity
                style={[styles.nextButton, { backgroundColor: currentStepData.color }]}
                onPress={handleNext}
              >
                <ThemedText style={styles.nextText}>
                  {isLastStep ? 'Let\'s Go!' : 'Next'}
                </ThemedText>
                {!isLastStep && (
                  <IconSymbol name="chevron.right" size={20} color="white" />
                )}
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Animated.View>

        {/* Confetti for completion */}
        <LottieConfetti
          visible={showConfetti}
          type="success"
          onAnimationFinish={() => setShowConfetti(false)}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundAnimation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundLottie: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    opacity: 0.1,
  },
  content: {
    width: SCREEN_WIDTH - 40,
    alignItems: 'center',
    padding: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 24,
    lineHeight: 26,
  },
  tipsContainer: {
    width: '100%',
    marginBottom: 24,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    opacity: 0.7,
  },
  progressContainer: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  previousButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  previousText: {
    marginLeft: 4,
    fontSize: 16,
  },
  spacer: {
    flex: 1,
  },
  skipButton: {
    padding: 12,
    marginRight: 16,
  },
  skipText: {
    fontSize: 16,
    opacity: 0.7,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  nextText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
});