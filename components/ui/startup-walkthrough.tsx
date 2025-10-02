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
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
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
  overlayType?: 'tab' | 'feature' | 'button' | 'area' | null;
  overlayPosition?: {
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    width?: number;
    height?: number;
  };
  highlightElement?: string;
}

interface StartupWalkthroughProps {
  visible: boolean;
  onComplete: () => void;
}

// Intro slides (no app interaction)
const introSlides: WalkthroughStep[] = [
  {
    id: 'intro-1',
    title: 'Welcome to YouMatter! 🌟',
    description: 'Your personal wellness companion that makes healthy living fun and rewarding.',
    icon: 'heart.fill',
    color: WellnessColors.physical,
    tips: ['Earn coins for every healthy action', 'Build streaks to multiply rewards', 'Level up and unlock premium features'],
    overlayType: null
  },
  {
    id: 'intro-2',
    title: 'Gamified Wellness Journey 🎮',
    description: 'Complete daily tasks, maintain streaks, and level up your wellness game!',
    icon: 'star.fill',
    color: WellnessColors.coins,
    tips: ['Daily tasks refresh every 24 hours', 'Streaks multiply your coin rewards', 'Higher levels unlock exclusive content'],
    overlayType: null
  },
  {
    id: 'intro-3',
    title: 'AI Wellness Coach 🤖',
    description: 'Chat with our AI assistant for personalized health advice 24/7.',
    icon: 'message.fill',
    color: WellnessColors.mental,
    tips: ['Ask about nutrition, exercise, sleep', 'Get personalized recommendations', 'Earn coins for chat interactions'],
    overlayType: null
  },
  {
    id: 'intro-4',
    title: 'AR Yoga Studio 🧘‍♀️',
    description: 'Experience immersive yoga sessions with real-time pose detection.',
    icon: 'figure.walk',
    color: WellnessColors.yoga,
    tips: ['Real-time pose feedback', 'Multiple difficulty levels', 'Earn more coins for perfect poses'],
    overlayType: null
  },
  {
    id: 'intro-5',
    title: 'Insurance Integration 🛡️',
    description: 'Connect your wellness activities to reduce insurance premiums.',
    icon: 'shield.fill',
    color: WellnessColors.social,
    tips: ['Complete challenges for discounts', 'Track your premium savings', 'Access exclusive insurance perks'],
    overlayType: null
  }
];

// No app tour - only intro slides

export const StartupWalkthrough: React.FC<StartupWalkthroughProps> = ({
  visible,
  onComplete,
}) => {
  const colorScheme = useColorScheme();
  const [currentStep, setCurrentStep] = useState(0);

  
  // Only intro slides
  const currentArray = introSlides;
  const totalSteps = currentArray.length;
  
  // Enhanced animation values
  const slideX = useSharedValue(0);
  const slideOpacity = useSharedValue(1);
  const contentScale = useSharedValue(1);
  const iconScale = useSharedValue(1);
  const iconRotate = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const overlayOpacity = useSharedValue(0);
  const overlayScale = useSharedValue(0.8);
  const pulseScale = useSharedValue(1);
  const backgroundOpacity = useSharedValue(0.9);
  const borderBlink = useSharedValue(1);
  const arrowBounce = useSharedValue(0);
  const arrowOpacity = useSharedValue(0);

  // Enhanced animated styles
  const slideAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: slideX.value },
      { scale: contentScale.value }
    ],
    opacity: slideOpacity.value,
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: iconScale.value },
      { rotateZ: `${iconRotate.value}deg` }
    ],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
    transform: [{ scale: overlayScale.value }],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value,
  }));

  const borderBlinkStyle = useAnimatedStyle(() => ({
    opacity: borderBlink.value,
  }));

  const arrowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: arrowOpacity.value,
    transform: [{ translateY: arrowBounce.value }],
  }));

  useEffect(() => {
    if (visible) {
      // Smooth initial animations
      backgroundOpacity.value = withTiming(1, { duration: 400 });
      contentScale.value = withTiming(1, { duration: 400, easing: Easing.out(Easing.quad) });
      iconScale.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) });
      iconRotate.value = withTiming(0, { duration: 300 });
    }
  }, [visible]);

  useEffect(() => {
    // Smooth step change animations
    if (visible && currentStep >= 0 && currentStep < totalSteps) {
      const currentStepData = currentArray[currentStep];
      
      // Simple, smooth icon animation
      iconScale.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) });
      iconRotate.value = withTiming(0, { duration: 300 });

      // Simplified overlay animations
      if (currentStepData?.overlayType) {
        overlayOpacity.value = withTiming(1, { duration: 300 });
        overlayScale.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.quad) });
        
        // Subtle pulse effect
        pulseScale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 1000 }),
            withTiming(1, { duration: 1000 })
          ),
          -1,
          true
        );

        // Smooth border animation
        borderBlink.value = withRepeat(
          withSequence(
            withTiming(0.7, { duration: 800 }),
            withTiming(1, { duration: 800 })
          ),
          -1,
          true
        );

        // Smooth arrow animation
        arrowOpacity.value = withTiming(1, { duration: 300 });
        arrowBounce.value = withRepeat(
          withSequence(
            withTiming(-5, { duration: 1000 }),
            withTiming(0, { duration: 1000 })
          ),
          -1,
          true
        );
      } else {
        overlayOpacity.value = withTiming(0, { duration: 200 });
        overlayScale.value = withTiming(0.8, { duration: 200 });
        borderBlink.value = withTiming(0, { duration: 200 });
        arrowOpacity.value = withTiming(0, { duration: 200 });
        arrowBounce.value = withTiming(0, { duration: 200 });
      }
    }
  }, [currentStep]);

  const animateToNextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const animateToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleNext = () => {
    // Smooth button press animation
    buttonScale.value = withTiming(0.95, { duration: 100 });
    setTimeout(() => {
      buttonScale.value = withTiming(1, { duration: 100 });
    }, 100);

    // Clear overlay animations smoothly
    overlayOpacity.value = withTiming(0, { duration: 200 });
    borderBlink.value = withTiming(0, { duration: 200 });
    arrowOpacity.value = withTiming(0, { duration: 200 });
    arrowBounce.value = withTiming(0, { duration: 200 });

    if (currentStep < totalSteps - 1) {
      // Smooth fade transition
      slideOpacity.value = withTiming(0, { duration: 250, easing: Easing.out(Easing.quad) });
      
      setTimeout(() => {
        runOnJS(animateToNextStep)();
        
        // Fade in new content
        slideOpacity.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.quad) });
      }, 250);
    } else {
      // Complete immediately without celebration animation
      onComplete();
    }
  };

  const handleSkip = () => {
    // Skip intro and complete
    onComplete();
  };

  // Calculate safe positioning within screen boundaries
  const getSafePosition = (position: any) => {
    const safeMargin = 20;
    const arrowHeight = 60;
    
    return {
      top: Math.max(safeMargin + arrowHeight, SCREEN_HEIGHT - (position.bottom || 0)),
      left: Math.max(safeMargin, Math.min(SCREEN_WIDTH - (position.width || 45) - safeMargin, position.left || 0)),
      width: Math.min(position.width || 45, SCREEN_WIDTH - (2 * safeMargin)),
      height: Math.min(position.height || 45, SCREEN_HEIGHT - (2 * safeMargin) - arrowHeight),
    };
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      // Smooth fade transition
      slideOpacity.value = withTiming(0, { duration: 250, easing: Easing.out(Easing.quad) });
      
      // Reset overlay animations
      overlayOpacity.value = withTiming(0, { duration: 200 });
      
      setTimeout(() => {
        runOnJS(animateToPreviousStep)();
        
        // Fade in new content
        slideOpacity.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.quad) });
      }, 250);
    }
  };

  if (!visible) return null;

  // Safety check to prevent crashes
  const safeCurrentStep = Math.max(0, Math.min(currentStep, totalSteps - 1));
  const currentStepData = currentArray[safeCurrentStep];
  const isLastStep = safeCurrentStep === totalSteps - 1;

  // Additional safety check
  if (!currentStepData) {
    console.warn('StartupWalkthrough: currentStepData is undefined');
    return null;
  }

  return (
    <Modal
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      transparent
    >
      <StatusBar backgroundColor="rgba(0,0,0,0.8)" barStyle="light-content" />
      <Animated.View style={[styles.overlay, backgroundAnimatedStyle]}>
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

        {/* Simple Centered Clickable Overlay */}
        {currentStepData?.overlayType && (
          <TouchableOpacity 
            style={styles.centeredOverlayContainer}
            onPress={handleNext}
            activeOpacity={0.9}
          >
            {/* Full Screen Background */}
            <View style={styles.fullScreenBackground} />
            
            {/* Centered Highlight Box */}
            <Animated.View 
              style={[styles.centeredHighlightBox, overlayAnimatedStyle, pulseAnimatedStyle]}
            >
              {/* Icon */}
              <View style={[styles.highlightIcon, { backgroundColor: currentStepData.color + '20' }]}>
                <IconSymbol 
                  name={(currentStepData.icon || 'heart.fill') as any} 
                  size={32} 
                  color={currentStepData.color} 
                />
              </View>
              
              {/* Title */}
              <ThemedText style={[styles.highlightTitle, { color: currentStepData.color }]}>
                {currentStepData.highlightElement}
              </ThemedText>
              
              {/* Animated Border */}
              <Animated.View style={[styles.animatedHighlightBorder, borderBlinkStyle]} />
              
              {/* Tap Instruction */}
              <ThemedText style={styles.tapInstruction}>
                Tap anywhere to continue
              </ThemedText>

              {/* Direction Arrow */}
              <Animated.View style={[{ marginTop: 8 }, arrowAnimatedStyle]}>
                <IconSymbol name="chevron.down" size={24} color={currentStepData.color} />
              </Animated.View>
              
              {/* Corner Decorations */}
              <View style={[styles.cornerDeco, styles.topLeftDeco]} />
              <View style={[styles.cornerDeco, styles.topRightDeco]} />
              <View style={[styles.cornerDeco, styles.bottomLeftDeco]} />
              <View style={[styles.cornerDeco, styles.bottomRightDeco]} />
            </Animated.View>
          </TouchableOpacity>
        )}

        {/* Main Content Container - Always Interactive */}
        <View style={[
          styles.content,
          { zIndex: currentStepData?.overlayType ? 10 : 5 }
        ]}>
          {/* Sliding Content */}
          <Animated.View style={[styles.slideContent, slideAnimatedStyle]}>
            <View style={styles.contentTop}>
              {/* Icon */}
              <Animated.View 
                style={[
                  styles.iconContainer, 
                  { backgroundColor: (currentStepData?.color || WellnessColors.physical) + '20' },
                  iconAnimatedStyle
                ]}
              >
                <IconSymbol 
                  name={(currentStepData?.icon || 'heart.fill') as any} 
                  size={64} 
                  color={currentStepData?.color || WellnessColors.physical} 
                />
              </Animated.View>

              {/* Title */}
              <ThemedText type="title" style={[styles.title, { color: currentStepData?.color || WellnessColors.physical }]}>
                {currentStepData?.title || 'Welcome!'}
              </ThemedText>

              {/* Description */}
              <ThemedText style={styles.description}>
                {currentStepData?.description || 'Loading...'}
              </ThemedText>
            </View>

            {/* Interactive Hint for Overlay Steps */}
            {currentStepData?.overlayType && (
              <View style={styles.interactiveHint}>
                <IconSymbol name="hand.tap.fill" size={20} color={currentStepData?.color || WellnessColors.physical} />
                <ThemedText style={[styles.hintText, { color: currentStepData?.color || WellnessColors.physical }]}>
                  Try tapping the highlighted {currentStepData.overlayType} above!
                </ThemedText>
              </View>
            )}

            {/* Tips */}
            {currentStepData?.tips && (
              <View style={styles.tipsContainer}>
                {currentStepData.tips.map((tip: string, index: number) => (
                  <View key={index} style={styles.tipItem}>
                    <View style={[styles.tipBullet, { backgroundColor: currentStepData?.color || WellnessColors.physical }]} />
                    <ThemedText style={styles.tipText}>{tip}</ThemedText>
                  </View>
                ))}
              </View>
            )}
          </Animated.View>

          {/* Fixed Progress Indicator */}
          <View style={styles.progressContainer}>
            {currentArray.map((_: any, index: number) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor: index <= safeCurrentStep 
                      ? (currentStepData?.color || WellnessColors.physical)
                      : Colors[colorScheme ?? 'light'].outline
                  }
                ]}
              />
            ))}
          </View>

          {/* Fixed Navigation */}
          <View style={styles.navigationContainer}>
            <View style={styles.leftNavigation}>
              {safeCurrentStep > 0 ? (
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Previous"
                  style={styles.previousButton}
                  onPress={handlePrevious}
                >
                  <IconSymbol name="chevron.left" size={20} color={Colors[colorScheme ?? 'light'].text} />
                  <ThemedText style={styles.previousText}>Previous</ThemedText>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel="Skip"
                  style={styles.skipButton}
                  onPress={handleSkip}
                >
                  <ThemedText style={styles.skipText}>
                    Skip
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.rightNavigation}>
              <Animated.View style={buttonAnimatedStyle}>
                <TouchableOpacity
                  accessibilityRole="button"
                  accessibilityLabel={isLastStep ? 'Get Started' : 'Next'}
                  style={[styles.nextButton, { backgroundColor: currentStepData?.color || WellnessColors.physical }]}
                  onPress={handleNext}
                >
                  <ThemedText style={styles.nextText}>
                    {isLastStep ? 'Get Started!' : 'Next'}
                  </ThemedText>
                  {!isLastStep && (
                    <IconSymbol name="chevron.right" size={20} color="white" />
                  )}
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </View>


      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 1)', // Changed to 100% opacity
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
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    overflow: 'hidden',
  },
  slideContent: {
    alignItems: 'center',
    padding: 32,
    width: SCREEN_WIDTH - 40,
    minHeight: SCREEN_HEIGHT * 0.6,
    justifyContent: 'space-between',
  },
  contentTop: {
    alignItems: 'center',
    width: '100%',
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
  phaseIndicator: {
    alignItems: 'center',
    marginBottom: 12,
  },
  phaseText: {
    fontSize: 12,
    opacity: 0.6,
    fontWeight: '500',
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 32,
    paddingHorizontal: 32,
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
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  leftNavigation: {
    flex: 1,
    alignItems: 'flex-start',
  },
  rightNavigation: {
    flex: 1,
    alignItems: 'flex-end',
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
  skipButton: {
    padding: 12,
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
  
  // Centered Overlay System Styles
  centeredOverlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  fullScreenBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 1)', // 100% opacity as requested
  },

  centeredHighlightBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 200,
    maxWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
    position: 'relative',
  },

  highlightIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  highlightTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },

  animatedHighlightBorder: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#FF6B6B',
    backgroundColor: 'transparent',
  },

  tapInstruction: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },

  cornerDeco: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderColor: '#00FF88',
    borderWidth: 3,
  },

  topLeftDeco: {
    top: -8,
    left: -8,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 8,
  },

  topRightDeco: {
    top: -8,
    right: -8,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 8,
  },

  bottomLeftDeco: {
    bottom: -8,
    left: -8,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 8,
  },

  bottomRightDeco: {
    bottom: -8,
    right: -8,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 8,
  },

  // Interactive Hint Styles
  interactiveHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  hintText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    textAlign: 'center',
  },
});