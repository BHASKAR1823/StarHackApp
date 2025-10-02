import { ThemedText } from '@/components/themed-text';
import { Confetti } from '@/components/ui/confetti';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
    goldChestAnimation,
    mysteryBoxReveal,
    triggerMajorAchievementHaptics,
    triggerStreakHaptics,
    variableRewardAnimation
} from '@/utils/animations';
import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, View } from 'react-native';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';

interface RewardNotificationProps {
  visible: boolean;
  rewardType: 'coins' | 'level' | 'badge' | 'streak' | 'mystery' | 'tier';
  title: string;
  subtitle?: string;
  amount?: number;
  icon?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  onClose: () => void;
}

export const RewardNotification: React.FC<RewardNotificationProps> = ({
  visible,
  rewardType,
  title,
  subtitle,
  amount,
  icon,
  rarity = 'common',
  onClose
}) => {
  const colorScheme = useColorScheme();
  const [showConfetti, setShowConfetti] = useState(false);
  
  const scale = useSharedValue(0);
  const rotation = useSharedValue(0);
  const iconScale = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const sparkleOpacity = useSharedValue(0);
  const backgroundOpacity = useSharedValue(0);

  const getRarityColor = () => {
    switch (rarity) {
      case 'common': return '#4ECDC4';
      case 'rare': return '#45B7D1';
      case 'epic': return '#9B59B6';
      case 'legendary': return '#FFD700';
      default: return Colors[colorScheme ?? 'light'].tint;
    }
  };

  const getRewardIcon = (): any => {
    if (icon) return icon;
    
    switch (rewardType) {
      case 'coins': return 'dollarsign.circle.fill';
      case 'level': return 'star.fill';
      case 'badge': return 'checkmark.circle.fill';
      case 'streak': return 'flame.fill';
      case 'mystery': return 'gift.fill';
      case 'tier': return 'star.fill'; // Using star instead of crown as it's available
      default: return 'gift.fill';
    }
  };

  const triggerHapticFeedback = () => {
    switch (rewardType) {
      case 'level':
      case 'tier':
        triggerMajorAchievementHaptics();
        break;
      case 'streak':
        triggerStreakHaptics(amount || 1);
        break;
      case 'mystery':
        if (rarity === 'legendary') {
          triggerMajorAchievementHaptics();
        } else {
          import('expo-haptics').then(Haptics => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          });
        }
        break;
      default:
        import('expo-haptics').then(Haptics => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        });
    }
  };

  useEffect(() => {
    if (visible) {
      // Trigger haptic feedback
      triggerHapticFeedback();
      
      // Background fade in
      backgroundOpacity.value = withTiming(1, { duration: 300 });
      
      // Main animation based on reward type and value
      if (rewardType === 'mystery' && rarity === 'legendary') {
        scale.value = mysteryBoxReveal();
        setShowConfetti(true);
      } else if (rewardType === 'level' || rewardType === 'tier') {
        scale.value = goldChestAnimation();
        setShowConfetti(true);
      } else if ((amount && amount > 200) || rarity === 'epic') {
        scale.value = goldChestAnimation();
        setShowConfetti(true);
      } else {
        scale.value = variableRewardAnimation(amount || 50);
      }
      
      // Icon animation with delay
      iconScale.value = withDelay(200, withSpring(1, { damping: 8, stiffness: 200 }));
      
      // Rotation for coins
      if (rewardType === 'coins') {
        rotation.value = withSequence(
          withDelay(300, withTiming(180, { duration: 300 })),
          withTiming(360, { duration: 300 }),
          withTiming(0, { duration: 0 })
        );
      }
      
      // Continuous pulse for rare items
      if (rarity === 'epic' || rarity === 'legendary') {
        const pulse = () => {
          pulseScale.value = withSequence(
            withTiming(1.1, { duration: 400 }),
            withTiming(1, { duration: 400 }, (finished) => {
              if (finished && visible) {
                runOnJS(pulse)();
              }
            })
          );
        };
        pulse();
      }
      
      // Sparkle effect for special rewards
      if (rarity === 'rare' || rarity === 'epic' || rarity === 'legendary') {
        sparkleOpacity.value = withSequence(
          withDelay(500, withTiming(1, { duration: 200 })),
          withTiming(0, { duration: 200 }),
          withTiming(1, { duration: 200 }),
          withTiming(0, { duration: 200 })
        );
      }
      
      // Auto close after delay
      const closeDelay = showConfetti ? 4000 : 2500;
      setTimeout(() => {
        if (visible) {
          handleClose();
        }
      }, closeDelay);
    }
  }, [visible, rewardType, amount, rarity]);

  const handleClose = () => {
    backgroundOpacity.value = withTiming(0, { duration: 300 });
    scale.value = withTiming(0, { duration: 300 }, (finished) => {
      if (finished) {
        runOnJS(onClose)();
        setShowConfetti(false);
      }
    });
  };

  const modalAnimatedStyle = useAnimatedStyle(() => ({
    backgroundColor: `rgba(0, 0, 0, ${0.7 * backgroundOpacity.value})`,
  }));

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` }
    ],
  }));

  const iconAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value * pulseScale.value }],
  }));

  const sparkleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: sparkleOpacity.value,
  }));

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <Animated.View style={[styles.overlay, modalAnimatedStyle]}>
        <Animated.View 
          style={[
            styles.container, 
            { backgroundColor: Colors[colorScheme ?? 'light'].background },
            containerAnimatedStyle
          ]}
        >
          {/* Sparkle effects for rare items */}
          {(rarity === 'rare' || rarity === 'epic' || rarity === 'legendary') && (
            <>
              <Animated.View style={[styles.sparkle, styles.sparkle1, sparkleAnimatedStyle]}>
                <IconSymbol name="star.fill" size={16} color="#FFD700" />
              </Animated.View>
              <Animated.View style={[styles.sparkle, styles.sparkle2, sparkleAnimatedStyle]}>
                <IconSymbol name="star.fill" size={12} color="#FFD700" />
              </Animated.View>
              <Animated.View style={[styles.sparkle, styles.sparkle3, sparkleAnimatedStyle]}>
                <IconSymbol name="star.fill" size={14} color="#FFD700" />
              </Animated.View>
            </>
          )}
          
          {/* Main reward display */}
          <View style={[styles.iconContainer, { backgroundColor: getRarityColor() + '20' }]}>
            <Animated.View style={iconAnimatedStyle}>
              <IconSymbol 
                name={getRewardIcon()} 
                size={64} 
                color={getRarityColor()} 
              />
            </Animated.View>
          </View>
          
          <ThemedText type="title" style={[styles.title, { color: getRarityColor() }]}>
            {title}
          </ThemedText>
          
          {subtitle && (
            <ThemedText style={styles.subtitle}>
              {subtitle}
            </ThemedText>
          )}
          
          {amount && (
            <View style={styles.amountContainer}>
              <ThemedText style={[styles.amount, { color: getRarityColor() }]}>
                +{amount}
              </ThemedText>
              <ThemedText style={styles.amountUnit}>
                {rewardType === 'coins' ? 'coins' : rewardType === 'streak' ? 'day streak' : ''}
              </ThemedText>
            </View>
          )}
          
          {rarity !== 'common' && (
            <View style={[styles.rarityBadge, { backgroundColor: getRarityColor() }]}>
              <ThemedText style={styles.rarityText}>
                {rarity.toUpperCase()}
              </ThemedText>
            </View>
          )}
        </Animated.View>
        
        {showConfetti && (
          <Confetti
            active={showConfetti}
            particleCount={rarity === 'legendary' ? 30 : 20}
            onComplete={() => setShowConfetti(false)}
          />
        )}
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 20,
    marginHorizontal: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
    position: 'relative',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
    marginBottom: 16,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  amount: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  amountUnit: {
    fontSize: 16,
    opacity: 0.7,
  },
  rarityBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  rarityText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  sparkle: {
    position: 'absolute',
  },
  sparkle1: {
    top: 20,
    right: 30,
  },
  sparkle2: {
    bottom: 40,
    left: 20,
  },
  sparkle3: {
    top: 60,
    left: 40,
  },
});