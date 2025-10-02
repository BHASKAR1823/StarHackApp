import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { dailyLoginService, LoginReward } from '@/services/dailyLoginService';
import { triggerHapticFeedback } from '@/utils/animations';
import { hp, rfs, wp } from '@/utils/responsive';
import LottieView from 'lottie-react-native';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Animated,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

interface DailyLoginStreakProps {
  onRewardClaimed?: (reward: LoginReward) => void;
}

export const DailyLoginStreak: React.FC<DailyLoginStreakProps> = ({ onRewardClaimed }) => {
  const colorScheme = useColorScheme();
  const [streakData, setStreakData] = useState({
    currentStreak: 3,
    nextMilestone: 5,
    progressPercentage: 60,
    daysUntilMilestone: 2,
    canClaimToday: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  
  const scaleAnim = new Animated.Value(1);
  const pulseAnim = new Animated.Value(1);
  const progressAnim = new Animated.Value(0);

  useEffect(() => {
    loadStreakData();
    startPulseAnimation();
    animateProgress();
  }, []);

  const loadStreakData = async () => {
    try {
      const data = await dailyLoginService.getStreakProgress();
      setStreakData(data);
    } catch (error) {
      console.error('Error loading streak data:', error);
    }
  };

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const animateProgress = () => {
    Animated.timing(progressAnim, {
      toValue: streakData.progressPercentage / 100,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  };

  const handleClaimReward = async () => {
    if (!streakData.canClaimToday || isLoading) return;

    setIsLoading(true);
    triggerHapticFeedback('medium');
    
    // Button press animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const reward = await dailyLoginService.checkDailyLogin();
      
      if (reward) {
        // Show celebration for milestone
        if (reward.milestone) {
          setShowCelebration(true);
          setTimeout(() => setShowCelebration(false), 3000);
        }

        // Update streak data
        await loadStreakData();
        
        // Show reward alert
        Alert.alert(
          reward.milestone ? '🎉 Milestone Reached!' : '💰 Daily Reward!',
          reward.message + (reward.bonusCoins ? `\n\n🎁 Bonus: +${reward.bonusCoins} coins!` : ''),
          [{ text: 'Awesome!', onPress: () => {} }]
        );

        // Callback for parent component
        onRewardClaimed?.(reward);
        
        triggerHapticFeedback('success');
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      Alert.alert('Error', 'Could not claim reward. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStreakPath = () => {
    const pathItems = [];
    const totalDays = Math.max(streakData.nextMilestone, 7);
    
    for (let day = 1; day <= totalDays; day++) {
      const isCompleted = day <= streakData.currentStreak;
      const isCurrent = day === streakData.currentStreak + 1 && streakData.canClaimToday;
      const isMilestone = [5, 10, 15, 20, 30].includes(day);
      
      pathItems.push(
        <View key={day} style={styles.pathItem}>
          {/* Connection Line */}
          {day > 1 && (
            <View 
              style={[
                styles.connectionLine,
                {
                  backgroundColor: isCompleted || (isCurrent && day <= streakData.currentStreak + 1)
                    ? '#FFD700'
                    : Colors[colorScheme ?? 'light'].outline
                }
              ]} 
            />
          )}
          
          {/* Day Node */}
          <Animated.View 
            style={[
              styles.dayNode,
              {
                backgroundColor: isCompleted 
                  ? '#FFD700' 
                  : isCurrent 
                    ? '#4CAF50' 
                    : Colors[colorScheme ?? 'light'].background,
                borderColor: isCompleted || isCurrent 
                  ? '#FFD700' 
                  : Colors[colorScheme ?? 'light'].outline,
                borderWidth: 2,
                transform: [{ scale: isCurrent ? pulseAnim : 1 }]
              },
              isMilestone && styles.milestoneNode
            ]}
          >
            {isCompleted ? (
              <IconSymbol name="checkmark" size={16} color="white" />
            ) : isCurrent ? (
              <IconSymbol name="gift.fill" size={16} color="white" />
            ) : isMilestone ? (
              <IconSymbol name="star.fill" size={16} color="#FFD700" />
            ) : (
              <ThemedText style={[styles.dayText, { color: Colors[colorScheme ?? 'light'].text }]}>
                {day}
              </ThemedText>
            )}
          </Animated.View>
          
          {/* Day Label */}
          <ThemedText style={[
            styles.dayLabel,
            { color: isCompleted || isCurrent ? '#FFD700' : Colors[colorScheme ?? 'light'].tabIconDefault }
          ]}>
            {isMilestone ? `🎁${day}` : day}
          </ThemedText>
        </View>
      );
    }
    
    return pathItems;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.streakIcon}>
            <IconSymbol name="flame.fill" size={24} color="#FF4500" />
          </View>
          <View>
            <ThemedText style={styles.streakTitle}>Daily Streak</ThemedText>
            <ThemedText style={styles.streakSubtitle}>
              {streakData.currentStreak} day{streakData.currentStreak !== 1 ? 's' : ''} in a row!
            </ThemedText>
          </View>
        </View>
        
        {streakData.canClaimToday && (
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
              style={[styles.claimButton, { backgroundColor: '#4CAF50' }]}
              onPress={handleClaimReward}
              disabled={isLoading}
            >
              {isLoading ? (
                <ThemedText style={styles.claimButtonText}>...</ThemedText>
              ) : (
                <>
                  <IconSymbol name="gift.fill" size={16} color="white" />
                  <ThemedText style={styles.claimButtonText}>Claim</ThemedText>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <ThemedText style={styles.progressText}>
            {streakData.daysUntilMilestone} days until next milestone
          </ThemedText>
          <ThemedText style={styles.milestoneText}>
            🎁 {streakData.nextMilestone} days
          </ThemedText>
        </View>
        
        <View style={styles.progressBarContainer}>
          <Animated.View
            style={[
              styles.progressBar,
              {
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
        </View>
      </View>

      {/* Streak Path */}
      <View style={styles.pathContainer}>
        <View style={styles.pathScroll}>
          {renderStreakPath()}
        </View>
      </View>

      {/* Next Reward Preview */}
      <View style={styles.rewardPreview}>
        <IconSymbol name="dollarsign.circle" size={20} color="#FFD700" />
        <ThemedText style={styles.rewardText}>
          Tomorrow: +{20 + (streakData.currentStreak + 1) * 2} coins
          {streakData.currentStreak + 1 === streakData.nextMilestone && ' + Milestone Bonus!'}
        </ThemedText>
      </View>

      {/* Celebration Overlay */}
      {showCelebration && (
        <View style={styles.celebrationOverlay}>
          <LottieView
            source={require('../../assets/lottie/success-confetti.json')}
            autoPlay
            loop={false}
            style={styles.celebrationLottie}
            onAnimationFinish={() => setShowCelebration(false)}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: wp(4),
    padding: wp(4),
    marginHorizontal: wp(4),
    marginVertical: hp(1),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  streakIcon: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  streakTitle: {
    fontSize: rfs(16),
    fontWeight: 'bold',
    color: '#333',
  },
  streakSubtitle: {
    fontSize: rfs(12),
    color: '#666',
    marginTop: hp(0.2),
  },
  claimButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: wp(6),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  claimButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: rfs(12),
    marginLeft: wp(1),
  },

  progressSection: {
    marginBottom: hp(2),
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  progressText: {
    fontSize: rfs(12),
    color: '#666',
  },
  milestoneText: {
    fontSize: rfs(12),
    fontWeight: 'bold',
    color: '#FFD700',
  },
  progressBarContainer: {
    height: hp(1),
    backgroundColor: '#E0E0E0',
    borderRadius: hp(0.5),
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: hp(0.5),
  },
  pathContainer: {
    marginBottom: hp(2),
  },
  pathScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp(1),
  },
  pathItem: {
    alignItems: 'center',
    marginRight: wp(2),
    position: 'relative',
  },
  connectionLine: {
    position: 'absolute',
    left: -wp(1),
    top: wp(4),
    width: wp(2),
    height: 2,
    zIndex: 0,
  },
  dayNode: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  milestoneNode: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  dayText: {
    fontSize: rfs(10),
    fontWeight: 'bold',
  },
  dayLabel: {
    fontSize: rfs(8),
    fontWeight: '600',
    marginTop: hp(0.5),
    textAlign: 'center',
  },
  rewardPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8E1',
    paddingVertical: hp(1),
    paddingHorizontal: wp(3),
    borderRadius: wp(3),
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  rewardText: {
    fontSize: rfs(11),
    fontWeight: '600',
    color: '#B8860B',
    marginLeft: wp(1),
    textAlign: 'center',
  },
  celebrationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: wp(4),
  },
  celebrationLottie: {
    width: wp(80),
    height: wp(80),
  },
});