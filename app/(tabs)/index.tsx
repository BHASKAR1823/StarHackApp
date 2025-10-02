import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { gamificationService } from '@/services/gamificationService';
import { dummyUser, dummyDailyTasks, dummyMissions } from '@/services/dummyData';
import { DailyTask, Mission, User } from '@/types/app';
import { triggerHapticFeedback, celebrationScale, bounceIn } from '@/utils/animations';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [user, setUser] = useState<User>(dummyUser);
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(dummyDailyTasks);
  const [missions, setMissions] = useState<Mission[]>(dummyMissions);
  const [surpriseEvent, setSurpriseEvent] = useState<any>(null);

  const coinScale = useSharedValue(1);
  const levelScale = useSharedValue(1);
  const streakScale = useSharedValue(1);

  const coinAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: coinScale.value }],
  }));

  const levelAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: levelScale.value }],
  }));

  const streakAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: streakScale.value }],
  }));

  useEffect(() => {
    // Check for surprise events
    const event = gamificationService.generateSurpriseEvent();
    if (event) {
      setSurpriseEvent(event);
    }

    // Animate elements on load
    levelScale.value = withSpring(1, { damping: 15, stiffness: 150 });
    streakScale.value = withSpring(1, { damping: 15, stiffness: 150 });
  }, []);

  const handleTaskComplete = async (taskId: string) => {
    const result = await gamificationService.completeTask(taskId);
    
    if (result.success) {
      // Update local state
      setDailyTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, isCompleted: true, completedDate: new Date() } : task
      ));
      
      setUser(prev => ({ ...prev, coins: prev.coins + result.coinsAwarded }));
      
      // Trigger celebration animation
      coinScale.value = celebrationScale();
      triggerHapticFeedback('success');
      
      if (result.levelUp) {
        levelScale.value = celebrationScale();
        Alert.alert('🎉 Level Up!', `Congratulations! You've reached level ${gamificationService.calculateLevel(user.coins + result.coinsAwarded)}!`);
      }

      Alert.alert('🎉 Task Complete!', `You earned ${result.coinsAwarded} coins!`);
    }
  };

  const getLevelProgress = () => {
    return gamificationService.getLevelProgress(user.coins);
  };

  const getCoinsForNextLevel = () => {
    return gamificationService.getCoinsForNextLevel(user.coins);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Header Section */}
      <ThemedView style={styles.header}>
        <View style={styles.welcomeContainer}>
          <ThemedText type="title" style={styles.welcomeText}>
            Welcome back, {user.name.split(' ')[0]}! 👋
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Let's make today matter
          </ThemedText>
        </View>
      </ThemedView>

      {/* Surprise Event Banner */}
      {surpriseEvent && (
        <ThemedView style={[styles.surpriseEvent, { backgroundColor: Colors[colorScheme ?? 'light'].tint + '20' }]}>
          <IconSymbol name="gift.fill" size={24} color={Colors[colorScheme ?? 'light'].tint} />
          <View style={styles.surpriseContent}>
            <ThemedText type="defaultSemiBold">{surpriseEvent.title}</ThemedText>
            <ThemedText style={styles.surpriseDescription}>{surpriseEvent.description}</ThemedText>
          </View>
        </ThemedView>
      )}

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Animated.View style={[styles.statCard, coinAnimatedStyle, { backgroundColor: '#4CAF50' }]}>
          <IconSymbol name="dollarsign.circle.fill" size={32} color="white" />
          <ThemedText style={styles.statNumber}>{user.coins}</ThemedText>
          <ThemedText style={styles.statLabel}>Coins</ThemedText>
        </Animated.View>

        <Animated.View style={[styles.statCard, levelAnimatedStyle, { backgroundColor: '#FF9800' }]}>
          <IconSymbol name="star.fill" size={32} color="white" />
          <ThemedText style={styles.statNumber}>Level {user.level}</ThemedText>
          <ThemedText style={styles.statLabel}>{getCoinsForNextLevel()} to next</ThemedText>
        </Animated.View>

        <Animated.View style={[styles.statCard, streakAnimatedStyle, { backgroundColor: '#F44336' }]}>
          <IconSymbol name="flame.fill" size={32} color="white" />
          <ThemedText style={styles.statNumber}>{user.streaks.daily}</ThemedText>
          <ThemedText style={styles.statLabel}>Day Streak</ThemedText>
        </Animated.View>
      </View>

      {/* Level Progress Bar */}
      <ThemedView style={styles.progressContainer}>
        <ThemedText type="defaultSemiBold">Level Progress</ThemedText>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: `${getLevelProgress()}%`,
                backgroundColor: Colors[colorScheme ?? 'light'].tint 
              }
            ]} 
          />
        </View>
        <ThemedText style={styles.progressText}>{Math.round(getLevelProgress())}%</ThemedText>
      </ThemedView>

      {/* Daily Focus Card */}
      <ThemedView style={styles.focusCard}>
        <View style={styles.focusHeader}>
          <IconSymbol name="scope" size={24} color={Colors[colorScheme ?? 'light'].tint} />
          <ThemedText type="subtitle">Today's Focus</ThemedText>
        </View>
        <ThemedText style={styles.focusTask}>
          Complete 3 wellness activities to maintain your streak! 🎯
        </ThemedText>
      </ThemedView>

      {/* Daily Tasks */}
      <ThemedView style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Daily Tasks</ThemedText>
          <ThemedText style={styles.sectionCount}>
            {dailyTasks.filter(t => t.isCompleted).length}/{dailyTasks.length}
          </ThemedText>
        </View>
        
        {dailyTasks.map((task) => (
          <TouchableOpacity
            key={task.id}
            style={[
              styles.taskCard,
              task.isCompleted && styles.completedTask
            ]}
            onPress={() => !task.isCompleted && handleTaskComplete(task.id)}
            disabled={task.isCompleted}
          >
            <View style={styles.taskLeft}>
              <View style={[
                styles.taskIcon,
                task.isCompleted && styles.completedIcon
              ]}>
                <ThemedText style={styles.taskEmoji}>{task.icon}</ThemedText>
              </View>
              <View style={styles.taskContent}>
                <ThemedText 
                  type="defaultSemiBold" 
                  style={[task.isCompleted && styles.completedText]}
                >
                  {task.title}
                </ThemedText>
                <ThemedText 
                  style={[styles.taskDescription, task.isCompleted && styles.completedText]}
                >
                  {task.description}
                </ThemedText>
              </View>
            </View>
            <View style={styles.taskRight}>
              {task.isCompleted ? (
                <IconSymbol name="checkmark.circle.fill" size={24} color="#4CAF50" />
              ) : (
                <View style={styles.coinReward}>
                  <IconSymbol name="dollarsign.circle" size={16} color={Colors[colorScheme ?? 'light'].tint} />
                  <ThemedText style={styles.coinText}>{task.coinReward}</ThemedText>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </ThemedView>

      {/* Active Missions */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Active Missions</ThemedText>
        
        {missions.filter(m => !m.isCompleted).slice(0, 2).map((mission) => (
          <View key={mission.id} style={styles.missionCard}>
            <View style={styles.missionHeader}>
              <ThemedText type="defaultSemiBold">{mission.title}</ThemedText>
              <View style={styles.missionReward}>
                <IconSymbol name="dollarsign.circle" size={16} color="#FFD700" />
                <ThemedText style={styles.missionCoinText}>{mission.coinReward}</ThemedText>
              </View>
            </View>
            <ThemedText style={styles.missionDescription}>{mission.description}</ThemedText>
            
            <View style={styles.missionProgress}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${(mission.progress / mission.target) * 100}%`,
                      backgroundColor: Colors[colorScheme ?? 'light'].tint 
                    }
                  ]} 
                />
              </View>
              <ThemedText style={styles.progressText}>
                {mission.progress}/{mission.target}
              </ThemedText>
            </View>
            
            <ThemedText style={styles.missionExpiry}>
              Expires: {mission.expiryDate.toLocaleDateString()}
            </ThemedText>
          </View>
        ))}
      </ThemedView>

      {/* Recent Badges */}
      {user.badges.length > 0 && (
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>Recent Badges</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgesScroll}>
            {user.badges.slice(-3).map((badge) => (
              <View key={badge.id} style={styles.badgeCard}>
                <ThemedText style={styles.badgeIcon}>{badge.icon}</ThemedText>
                <ThemedText style={styles.badgeName}>{badge.name}</ThemedText>
                <ThemedText style={styles.badgeDate}>
                  {badge.earnedDate.toLocaleDateString()}
                </ThemedText>
              </View>
            ))}
          </ScrollView>
        </ThemedView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  welcomeContainer: {
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 4,
  },
  surpriseEvent: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  surpriseContent: {
    marginLeft: 12,
    flex: 1,
  },
  surpriseDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
    marginTop: 2,
  },
  progressContainer: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginVertical: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
    opacity: 0.7,
  },
  focusCard: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  focusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  focusTask: {
    fontSize: 16,
    marginLeft: 32,
  },
  section: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  sectionCount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  completedTask: {
    opacity: 0.7,
    backgroundColor: '#F0F0F0',
  },
  taskLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  taskIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  completedIcon: {
    backgroundColor: '#E8F5E8',
  },
  taskEmoji: {
    fontSize: 18,
  },
  taskContent: {
    flex: 1,
  },
  taskDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  taskRight: {
    alignItems: 'center',
  },
  coinReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  coinText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#FF9800',
    fontWeight: 'bold',
  },
  missionCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  missionReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  missionCoinText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  missionDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 12,
  },
  missionProgress: {
    marginBottom: 8,
  },
  missionExpiry: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: 'italic',
  },
  badgesScroll: {
    marginTop: 8,
  },
  badgeCard: {
    alignItems: 'center',
    padding: 12,
    marginRight: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minWidth: 80,
  },
  badgeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  badgeDate: {
    fontSize: 10,
    opacity: 0.6,
  },
});
