import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { StepCelebration } from '@/components/ui/lottie-confetti';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { dummyDailyTasks, dummyMissions, dummySurpriseEvents, dummyUser } from '@/services/dummyData';
import { gamificationService } from '@/services/gamificationService';
import { UserProfile, userService } from '@/services/userService';
import { DailyTask, Mission, SurpriseEvent, User } from '@/types/app';
import { celebrationScale, triggerHapticFeedback } from '@/utils/animations';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(dummyDailyTasks);
  const [missions, setMissions] = useState<Mission[]>(dummyMissions);
  const [user, setUser] = useState<User>(dummyUser);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [surpriseEvents, setSurpriseEvents] = useState<SurpriseEvent[]>(dummySurpriseEvents);
  const [activeEvents, setActiveEvents] = useState<SurpriseEvent[]>([]);
  const [showStepCelebration, setShowStepCelebration] = useState(false);
  const [celebrationStepCount, setCelebrationStepCount] = useState(0);
  const [surpriseEvent, setSurpriseEvent] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);

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

  // Load user profile on mount and when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      loadUserProfile();
    }, [])
  );

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

  const loadUserProfile = async () => {
    const profile = await userService.getProfile();
    setUserProfile(profile);
  };

  const handleTaskComplete = async (taskId: string) => {
    const task = dailyTasks.find(t => t.id === taskId);
    const result = await gamificationService.completeTask(taskId);
    
    if (result.success) {
      // Update local state
      setDailyTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, isCompleted: true, completedDate: new Date() } : task
      ));
      
      setUser(prev => ({ ...prev, coins: prev.coins + result.coinsAwarded }));

      // Trigger step celebration for step-related tasks
      if (task && (task.title.toLowerCase().includes('steps') || task.title.toLowerCase().includes('walk'))) {
        const stepCount = Math.floor(Math.random() * 8000) + 2000; // Simulate step count
        setCelebrationStepCount(stepCount);
        setShowStepCelebration(true);
      }
      
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

  useEffect(() => {
    const checkActiveEvents = () => {
      const now = new Date();
      const currentActiveEvents = surpriseEvents.filter(event => 
        now >= event.startTime && now <= event.endTime
      );
      setActiveEvents(currentActiveEvents);
    };

    checkActiveEvents();
    const interval = setInterval(checkActiveEvents, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [surpriseEvents]);

  const getEventTimeRemaining = (event: SurpriseEvent) => {
    const now = new Date();
    const timeLeft = event.endTime.getTime() - now.getTime();
    const hours = Math.floor(timeLeft / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m left`;
    } else if (minutes > 0) {
      return `${minutes}m left`;
    } else {
      return 'Ending soon!';
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'step_challenge': return '#E3F2FD';
      case 'double_coins': return '#FFF3E0';
      case 'mystery_box': return '#F3E5F5';
      case 'streak_bonus': return '#FFEBEE';
      case 'flash_reward': return '#FFF8E1';
      default: return '#F5F5F5';
    }
  };

  const handleEventParticipation = async (eventId: string) => {
    const event = activeEvents.find(e => e.id === eventId);
    if (!event) return;

    triggerHapticFeedback('success');
    coinScale.value = celebrationScale();

    Alert.alert(
      '🎉 Event Joined!',
      `You're now participating in "${event.title}"! Complete the requirements to earn bonus rewards.`,
      [{ text: 'Let\'s Go!', style: 'default' }]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ScrollView 
        style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
      {/* Header Section */}
      <ThemedView style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setShowMenu(true)}
        >
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
        </TouchableOpacity>
        
        <View style={styles.welcomeContainer}>
          <ThemedText type="title" style={styles.welcomeText}>
            Welcome back, {userService.getDisplayName(userProfile)}! 👋
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Let's make today matter
          </ThemedText>
        </View>
      </ThemedView>

      {/* Active Events */}
      {activeEvents.length > 0 && (
        <View style={styles.eventsContainer}>
          {activeEvents.map((event) => (
            <Animated.View 
              key={event.id} 
              style={[
                styles.eventBanner, 
                { backgroundColor: getEventColor(event.type) },
                coinAnimatedStyle
              ]}
            >
              <View style={styles.eventIcon}>
                <ThemedText style={styles.eventEmoji}>{event.icon}</ThemedText>
              </View>
              <View style={styles.eventContent}>
                <ThemedText type="defaultSemiBold" style={styles.eventTitle}>
                  {event.title}
                </ThemedText>
                <ThemedText style={styles.eventDescription}>
                  {event.description}
                </ThemedText>
                <View style={styles.eventMeta}>
                  <View style={styles.eventTimer}>
                    <IconSymbol name="clock" size={12} color="#666" />
                    <ThemedText style={styles.eventTimeText}>
                      {getEventTimeRemaining(event)}
                    </ThemedText>
                  </View>
                  {event.bonusMultiplier && (
                    <View style={styles.eventBonus}>
                      <ThemedText style={styles.eventBonusText}>
                        {event.bonusMultiplier}x Bonus!
                      </ThemedText>
                    </View>
                  )}
                </View>
              </View>
              <View style={styles.eventActions}>
                <TouchableOpacity 
                  style={styles.participateButton}
                  onPress={() => handleEventParticipation(event.id)}
                >
                  <ThemedText style={styles.participateButtonText}>Join</ThemedText>
                </TouchableOpacity>
              </View>
            </Animated.View>
          ))}
        </View>
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

      {/* Step Celebration */}
      <StepCelebration
        visible={showStepCelebration}
        stepCount={celebrationStepCount}
        onComplete={() => setShowStepCelebration(false)}
      />

      {/* Hamburger Menu Modal */}
      <Modal
        visible={showMenu}
        animationType="slide"
        transparent
        onRequestClose={() => setShowMenu(false)}
      >
        <View style={styles.menuOverlay}>
          <TouchableOpacity 
            style={styles.menuBackdrop} 
            onPress={() => setShowMenu(false)}
          />
          <Animated.View style={styles.menuContent}>
            <View style={styles.menuHeader}>
              <View style={styles.menuUserInfo}>
                <View style={[styles.menuAvatar, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
                  <ThemedText style={styles.menuAvatarText}>
                    {userService.getFullName(userProfile).charAt(0).toUpperCase()}
                  </ThemedText>
                </View>
                <View>
                  <ThemedText type="defaultSemiBold" style={styles.menuUserName}>
                    {userService.getFullName(userProfile)}
                  </ThemedText>
                  <ThemedText style={styles.menuUserEmail}>{userService.getEmail(userProfile)}</ThemedText>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.closeMenuButton}
                onPress={() => setShowMenu(false)}
              >
                <IconSymbol name="xmark" size={24} color={Colors[colorScheme ?? 'light'].text} />
              </TouchableOpacity>
            </View>

            <View style={styles.menuItems}>
              <TouchableOpacity 
                style={styles.menuItem}
                onPress={() => {
                  setShowMenu(false);
                  router.push('/profile');
                }}
              >
                <IconSymbol name="person.fill" size={20} color={Colors[colorScheme ?? 'light'].primary} />
                <ThemedText style={styles.menuItemText}>Profile</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem}>
                <IconSymbol name="gear" size={20} color={Colors[colorScheme ?? 'light'].primary} />
                <ThemedText style={styles.menuItemText}>Settings</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem}>
                <IconSymbol name="globe" size={20} color={Colors[colorScheme ?? 'light'].primary} />
                <ThemedText style={styles.menuItemText}>Language</ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.menuItem}>
                <IconSymbol name="info.circle" size={20} color={Colors[colorScheme ?? 'light'].primary} />
                <ThemedText style={styles.menuItemText}>About</ThemedText>
              </TouchableOpacity>
              
              <View style={styles.menuDivider} />
              
              <TouchableOpacity style={[styles.menuItem, styles.logoutItem]}>
                <IconSymbol name="arrow.right.square" size={20} color="#FF3B30" />
                <ThemedText style={[styles.menuItemText, { color: '#FF3B30' }]}>Logout</ThemedText>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 140,
  },
  header: {
    padding: 20,
    paddingBottom: 16,
    position: 'relative',
  },
  welcomeContainer: {
    alignItems: 'center',
    marginTop: 20,
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
  // Surprise Events Styles
  eventsContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  eventBanner: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  eventIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  eventEmoji: {
    fontSize: 24,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    marginBottom: 4,
  },
  eventDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  eventMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventTimer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventTimeText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  eventBonus: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  eventBonusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  eventActions: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  participateButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  participateButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Hamburger Menu Styles
  menuButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    padding: 8,
    zIndex: 10,
  },
  hamburgerLine: {
    width: 20,
    height: 2,
    backgroundColor: '#333',
    marginVertical: 2,
    borderRadius: 1,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  menuBackdrop: {
    flex: 1,
  },
  menuContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuAvatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuUserName: {
    fontSize: 16,
    marginBottom: 2,
  },
  menuUserEmail: {
    fontSize: 14,
    opacity: 0.6,
  },
  closeMenuButton: {
    padding: 8,
  },
  menuItems: {
    padding: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 16,
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  logoutItem: {
    marginTop: 8,
  },
});
