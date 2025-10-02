import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ARPlankDetection } from '@/components/ui/ar-plank-detection';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { dummyHealthMetrics, dummyWellnessBingo, dummyYogaPoses } from '@/services/dummyData';
import { gamificationService } from '@/services/gamificationService';
import { BingoRow, HealthMetrics, YogaPose } from '@/types/app';
import { celebrationScale, triggerHapticFeedback } from '@/utils/animations';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WellnessScreen() {
  const colorScheme = useColorScheme();
  const [selectedPose, setSelectedPose] = useState<YogaPose | null>(null);
  const [showARModal, setShowARModal] = useState(false);
  const [showARPlank, setShowARPlank] = useState(false);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics>(dummyHealthMetrics[0]);
  const [isPoseActive, setIsPoseActive] = useState(false);
  const [poseTimer, setPoseTimer] = useState(0);
  const [sessionCoins, setSessionCoins] = useState(0);
  const [bingoData, setBingoData] = useState<BingoRow[]>(dummyWellnessBingo);

  const poseScale = useSharedValue(1);
  const coinScale = useSharedValue(1);
  const progressScale = useSharedValue(1);

  const poseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: poseScale.value }],
  }));

  const coinAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: coinScale.value }],
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: progressScale.value }],
  }));

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPoseActive && poseTimer > 0) {
      interval = setInterval(() => {
        setPoseTimer(prev => prev - 1);
      }, 1000);
    } else if (poseTimer === 0 && isPoseActive) {
      completePose();
    }
    return () => clearInterval(interval);
  }, [isPoseActive, poseTimer]);

  const startPose = (pose: YogaPose) => {
    setSelectedPose(pose);
    setShowARModal(true);
    setPoseTimer(pose.duration);
    setIsPoseActive(true);
    poseScale.value = withSpring(1.1, { damping: 15, stiffness: 150 });
    triggerHapticFeedback('medium');
  };

  const completePose = async () => {
    if (!selectedPose) return;
    
    setIsPoseActive(false);
    
    // Calculate coins based on pose difficulty
    const coins = selectedPose.difficulty === 'beginner' ? 30 : 
                  selectedPose.difficulty === 'intermediate' ? 50 : 70;
    
    setSessionCoins(prev => prev + coins);
    
    // Award coins and trigger animations
    await gamificationService.awardCoins(coins, `Completed ${selectedPose.name}`);
    
    coinScale.value = celebrationScale();
    progressScale.value = celebrationScale();
    
    triggerHapticFeedback('success');
    
    Alert.alert(
      '🎉 Pose Complete!', 
      `Great job! You earned ${coins} coins for completing ${selectedPose.name}!`,
      [
        { text: 'Continue', onPress: () => setShowARModal(false) }
      ]
    );
    
    // Update health metrics
    setHealthMetrics(prev => ({
      ...prev,
      workoutSessions: prev.workoutSessions + 1
    }));
  };

  const getBingoTaskColor = (category: string) => {
    switch (category) {
      case 'physical': return '#E3F2FD';
      case 'mental': return '#F3E5F5';
      case 'nutrition': return '#E8F5E8';
      case 'social': return '#FFF3E0';
      case 'bonus': return '#FCE4EC';
      default: return '#F5F5F5';
    }
  };

  const completeBingoTask = async (taskId: string, rowId: string) => {
    const updatedBingo = bingoData.map(row => {
      if (row.id === rowId) {
        const updatedTasks = row.tasks.map(task => {
          if (task.id === taskId) {
            return { ...task, isCompleted: true };
          }
          return task;
        });
        
        const completedTasks = updatedTasks.filter(t => t.isCompleted).length;
        const isRowCompleted = completedTasks === updatedTasks.length;
        
        return { ...row, tasks: updatedTasks, isCompleted: isRowCompleted };
      }
      return row;
    });
    
    setBingoData(updatedBingo);
    
    // Find the completed task and award coins
    const task = bingoData.find(r => r.id === rowId)?.tasks.find(t => t.id === taskId);
    const row = updatedBingo.find(r => r.id === rowId);
    
    if (task) {
      await gamificationService.awardCoins(task.coinReward, `Bingo: ${task.title}`);
      
      // If row is completed, award bonus
      if (row?.isCompleted && !bingoData.find(r => r.id === rowId)?.isCompleted) {
        await gamificationService.awardCoins(row.bonusReward, `Row Complete: ${row.name}`);
        
        triggerHapticFeedback('success');
        coinScale.value = celebrationScale();
        
        Alert.alert(
          '🏆 Row Complete!', 
          `Amazing! You completed "${row.name}" and earned ${row.bonusReward} bonus coins!`,
          [{ text: 'Awesome!', style: 'default' }]
        );
      } else {
        triggerHapticFeedback('medium');
        coinScale.value = withSpring(1.1, { damping: 15, stiffness: 150 });
      }
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#F44336';
      default: return Colors[colorScheme ?? 'light'].tint;
    }
  };

  const getHealthProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const handleARPlankComplete = async (duration: number, coins: number) => {
    setShowARPlank(false);
    setSessionCoins(prev => prev + coins);
    
    // Award coins and trigger animations
    await gamificationService.awardCoins(coins, `AR Plank Challenge - ${duration.toFixed(1)}s`);
    
    coinScale.value = celebrationScale();
    progressScale.value = celebrationScale();
    
    triggerHapticFeedback('success');
    
    Alert.alert(
      '🎉 AR Plank Complete!', 
      `Incredible! You held a plank for ${duration.toFixed(1)} seconds and earned ${coins} coins!`,
      [
        { text: 'Awesome!', onPress: () => {} }
      ]
    );
    
    // Update health metrics
    setHealthMetrics(prev => ({
      ...prev,
      workoutSessions: prev.workoutSessions + 1
    }));
  };

  const startARPlankChallenge = () => {
    setShowARPlank(true);
    triggerHapticFeedback('medium');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ScrollView 
        style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type="title">Wellness Hub 🧘‍♀️</ThemedText>
        <ThemedText style={styles.subtitle}>
          Your journey to better health starts here
        </ThemedText>
      </ThemedView>

      {/* Today's Progress */}
      <Animated.View style={[styles.section, progressAnimatedStyle]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Today's Progress</ThemedText>
        
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: '#E3F2FD' }]}>
            <IconSymbol name="figure.walk" size={24} color="#2196F3" />
            <ThemedText style={styles.metricNumber}>{healthMetrics.steps.toLocaleString()}</ThemedText>
            <ThemedText style={styles.metricLabel}>Steps</ThemedText>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${getHealthProgress(healthMetrics.steps, 10000)}%`,
                    backgroundColor: '#2196F3' 
                  }
                ]} 
              />
            </View>
          </View>

          <View style={[styles.metricCard, { backgroundColor: '#E8F5E8' }]}>
            <IconSymbol name="drop.fill" size={24} color="#4CAF50" />
            <ThemedText style={styles.metricNumber}>{healthMetrics.waterIntake}</ThemedText>
            <ThemedText style={styles.metricLabel}>Glasses</ThemedText>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${getHealthProgress(healthMetrics.waterIntake, 8)}%`,
                    backgroundColor: '#4CAF50' 
                  }
                ]} 
              />
            </View>
          </View>

          <View style={[styles.metricCard, { backgroundColor: '#FFF3E0' }]}>
            <IconSymbol name="moon.fill" size={24} color="#FF9800" />
            <ThemedText style={styles.metricNumber}>{healthMetrics.sleepHours}h</ThemedText>
            <ThemedText style={styles.metricLabel}>Sleep</ThemedText>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${getHealthProgress(healthMetrics.sleepHours, 8)}%`,
                    backgroundColor: '#FF9800' 
                  }
                ]} 
              />
            </View>
          </View>

          <View style={[styles.metricCard, { backgroundColor: '#F3E5F5' }]}>
            <IconSymbol name="heart.fill" size={24} color="#9C27B0" />
            <ThemedText style={styles.metricNumber}>{healthMetrics.meditationMinutes}</ThemedText>
            <ThemedText style={styles.metricLabel}>Min Meditation</ThemedText>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${getHealthProgress(healthMetrics.meditationMinutes, 30)}%`,
                    backgroundColor: '#9C27B0' 
                  }
                ]} 
              />
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Session Stats */}
      {sessionCoins > 0 && (
        <Animated.View style={[styles.sessionStats, coinAnimatedStyle]}>
          <IconSymbol name="star.fill" size={20} color="#FFD700" />
          <ThemedText style={styles.sessionText}>
            Session Coins: {sessionCoins}
          </ThemedText>
        </Animated.View>
      )}

      {/* Wellness Bingo */}
      <ThemedView style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">🏆 Wellness Bingo</ThemedText>
          <View style={styles.bingoProgressBadge}>
            <ThemedText style={styles.bingoProgressText}>
              {bingoData.reduce((acc, row) => acc + row.tasks.filter(t => t.isCompleted).length, 0)}/15
            </ThemedText>
          </View>
        </View>
        
        <ThemedText style={styles.sectionDescription}>
          Complete rows for bonus rewards! 🎯
        </ThemedText>

        {bingoData.map((row) => (
          <View key={row.id} style={styles.bingoRow}>
            <View style={styles.bingoRowHeader}>
              <ThemedText type="defaultSemiBold" style={styles.bingoRowTitle}>
                {row.name}
              </ThemedText>
              <View style={styles.bingoRowReward}>
                <IconSymbol name="gift.fill" size={16} color="#FFD700" />
                <ThemedText style={styles.bingoRewardText}>
                  +{row.bonusReward} coins
                </ThemedText>
              </View>
              {row.isCompleted && (
                <View style={styles.completedRowBadge}>
                  <IconSymbol name="checkmark.circle.fill" size={20} color="#4CAF50" />
                </View>
              )}
            </View>
            
            <View style={styles.bingoTasksGrid}>
              {row.tasks.map((task, index) => (
                <TouchableOpacity
                  key={task.id}
                  style={[
                    styles.bingoTask,
                    task.isCompleted && styles.completedBingoTask,
                    { backgroundColor: getBingoTaskColor(task.category) }
                  ]}
                  onPress={() => !task.isCompleted && completeBingoTask(task.id, row.id)}
                  disabled={task.isCompleted}
                >
                  <ThemedText style={styles.bingoTaskIcon}>{task.icon}</ThemedText>
                  <ThemedText 
                    style={[
                      styles.bingoTaskTitle,
                      task.isCompleted && styles.completedTaskText
                    ]}
                    numberOfLines={2}
                  >
                    {task.title}
                  </ThemedText>
                  <ThemedText 
                    style={[
                      styles.bingoTaskDescription,
                      task.isCompleted && styles.completedTaskText
                    ]}
                    numberOfLines={1}
                  >
                    {task.description}
                  </ThemedText>
                  <View style={styles.bingoTaskReward}>
                    <IconSymbol name="dollarsign.circle" size={14} color="#FFD700" />
                    <ThemedText style={styles.bingoTaskCoin}>{task.coinReward}</ThemedText>
                  </View>
                  {task.isCompleted && (
                    <View style={styles.bingoTaskCheck}>
                      <IconSymbol name="checkmark.circle.fill" size={20} color="#4CAF50" />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.bingoProgress}>
              <View style={styles.bingoProgressBar}>
                <View 
                  style={[
                    styles.bingoProgressFill, 
                    { 
                      width: `${(row.tasks.filter(t => t.isCompleted).length / row.tasks.length) * 100}%`,
                      backgroundColor: row.isCompleted ? '#4CAF50' : Colors[colorScheme ?? 'light'].tint 
                    }
                  ]} 
                />
              </View>
              <ThemedText style={styles.bingoProgressLabel}>
                {row.tasks.filter(t => t.isCompleted).length}/{row.tasks.length} completed
              </ThemedText>
            </View>
          </View>
        ))}
      </ThemedView>

      {/* AR Yoga Poses */}
      <ThemedView style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">AR Yoga Studio</ThemedText>
          <View style={styles.arBadge}>
            <IconSymbol name="arkit" size={16} color="white" />
            <ThemedText style={styles.arText}>AR</ThemedText>
          </View>
        </View>
        
        <ThemedText style={styles.sectionDescription}>
          Practice yoga with real-time pose detection and instant feedback
        </ThemedText>

        {/* AR Plank Challenge */}
        <Animated.View style={[styles.arPlankCard, poseAnimatedStyle]}>
          <View style={styles.poseHeader}>
            <View style={styles.poseInfo}>
              <ThemedText type="defaultSemiBold" style={styles.poseName}>
                🏋️ AR Plank Challenge
              </ThemedText>
              <View style={styles.poseMeta}>
                <View style={[styles.difficultyBadge, { backgroundColor: '#FF9800' }]}>
                  <ThemedText style={styles.difficultyText}>
                    CHALLENGE
                  </ThemedText>
                </View>
                <ThemedText style={styles.duration}>
                  30s+
                </ThemedText>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.startButton, { backgroundColor: '#FF6B6B' }]}
              onPress={startARPlankChallenge}
            >
              <IconSymbol name="play.fill" size={20} color="white" />
            </TouchableOpacity>
          </View>
          
          <ThemedText style={styles.poseDescription}>
            Test your core strength with AI-powered plank detection. Hold the perfect plank position while our camera tracks your form in real-time!
          </ThemedText>
          
          <View style={styles.benefitsContainer}>
            <ThemedText style={styles.benefitsTitle}>Features:</ThemedText>
            <ThemedText style={styles.benefit}>• Real-time pose detection with MediaPipe</ThemedText>
            <ThemedText style={styles.benefit}>• Live form feedback and corrections</ThemedText>
            <ThemedText style={styles.benefit}>• Automatic timer when perfect form detected</ThemedText>
            <ThemedText style={styles.benefit}>• Earn 2 coins per second held</ThemedText>
          </View>
        </Animated.View>

        {dummyYogaPoses.map((pose) => (
          <Animated.View key={pose.id} style={[styles.poseCard, poseAnimatedStyle]}>
            <View style={styles.poseHeader}>
              <View style={styles.poseInfo}>
                <ThemedText type="defaultSemiBold" style={styles.poseName}>
                  {pose.name}
                </ThemedText>
                <View style={styles.poseMeta}>
                  <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(pose.difficulty) }]}>
                    <ThemedText style={styles.difficultyText}>
                      {pose.difficulty.toUpperCase()}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.duration}>
                    {pose.duration}s
                  </ThemedText>
                </View>
              </View>
              
              <TouchableOpacity 
                style={[styles.startButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
                onPress={() => startPose(pose)}
              >
                <IconSymbol name="play.fill" size={20} color="white" />
              </TouchableOpacity>
            </View>
            
            <ThemedText style={styles.poseDescription}>
              {pose.description}
            </ThemedText>
            
            <View style={styles.benefitsContainer}>
              <ThemedText style={styles.benefitsTitle}>Benefits:</ThemedText>
              {pose.benefits.slice(0, 2).map((benefit, index) => (
                <ThemedText key={index} style={styles.benefit}>
                  • {benefit}
                </ThemedText>
              ))}
            </View>
          </Animated.View>
        ))}
      </ThemedView>

      {/* Quick Actions */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Quick Actions</ThemedText>
        
        <View style={styles.actionsGrid}>
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#E3F2FD' }]}>
            <IconSymbol name="timer" size={32} color="#2196F3" />
            <ThemedText style={styles.actionTitle}>5-Min Meditation</ThemedText>
            <ThemedText style={styles.actionSubtitle}>Quick mindfulness</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#E8F5E8' }]}>
            <IconSymbol name="figure.run" size={32} color="#4CAF50" />
            <ThemedText style={styles.actionTitle}>Daily Walk</ThemedText>
            <ThemedText style={styles.actionSubtitle}>Track your steps</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#FFF3E0' }]}>
            <IconSymbol name="brain" size={32} color="#FF9800" />
            <ThemedText style={styles.actionTitle}>Brain Games</ThemedText>
            <ThemedText style={styles.actionSubtitle}>Mental sharpness</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#F3E5F5' }]}>
            <IconSymbol name="book.fill" size={32} color="#9C27B0" />
            <ThemedText style={styles.actionTitle}>Mind Journal</ThemedText>
            <ThemedText style={styles.actionSubtitle}>Daily reflection</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>

      {/* AR Yoga Modal */}
      <Modal
        visible={showARModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => {
                setShowARModal(false);
                setIsPoseActive(false);
              }}
              style={styles.closeButton}
            >
              <IconSymbol name="xmark" size={24} color={Colors[colorScheme ?? 'light'].text} />
            </TouchableOpacity>
            <ThemedText type="subtitle">AR Yoga Session</ThemedText>
            <View style={styles.timerContainer}>
              <ThemedText style={styles.timer}>{poseTimer}s</ThemedText>
            </View>
          </View>

          {selectedPose && (
            <View style={styles.modalContent}>
              <View style={styles.cameraPlaceholder}>
                <IconSymbol name="camera.fill" size={64} color="#E0E0E0" />
                <ThemedText style={styles.cameraText}>Camera View</ThemedText>
                <ThemedText style={styles.cameraSubtext}>
                  AR pose detection would appear here
                </ThemedText>
              </View>

              <View style={styles.poseInstructions}>
                <ThemedText type="defaultSemiBold" style={styles.currentPose}>
                  {selectedPose.name}
                </ThemedText>
                
                {isPoseActive && (
                  <View style={styles.feedback}>
                    <IconSymbol name="checkmark.circle.fill" size={24} color="#4CAF50" />
                    <ThemedText style={styles.feedbackText}>Great posture! Keep it up!</ThemedText>
                  </View>
                )}

                <View style={styles.instructionsList}>
                  <ThemedText style={styles.instructionsTitle}>Instructions:</ThemedText>
                  {selectedPose.instructions.slice(0, 3).map((instruction, index) => (
                    <ThemedText key={index} style={styles.instruction}>
                      {index + 1}. {instruction}
                    </ThemedText>
                  ))}
                </View>
              </View>
            </View>
          )}
        </View>
      </Modal>

      {/* AR Plank Detection Modal */}
      <ARPlankDetection
        visible={showARPlank}
        onComplete={handleARPlankComplete}
        onClose={() => setShowARPlank(false)}
      />
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
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  arBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  arText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  metricNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  metricLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  sessionStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    padding: 12,
    backgroundColor: '#FFF8E1',
    borderRadius: 8,
    marginBottom: 10,
  },
  sessionText: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: '#F57F17',
  },
  poseCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
  },
  poseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  poseInfo: {
    flex: 1,
  },
  poseName: {
    fontSize: 18,
    marginBottom: 8,
  },
  poseMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  difficultyText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  duration: {
    fontSize: 12,
    opacity: 0.7,
  },
  startButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  poseDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 12,
  },
  benefitsContainer: {
    marginTop: 8,
  },
  benefitsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  benefit: {
    fontSize: 12,
    opacity: 0.7,
    marginLeft: 8,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
  },
  closeButton: {
    padding: 8,
  },
  timerContainer: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timer: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalContent: {
    flex: 1,
  },
  cameraPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  cameraText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    color: '#666',
  },
  cameraSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  poseInstructions: {
    backgroundColor: 'white',
    padding: 20,
  },
  currentPose: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 16,
  },
  feedback: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
  },
  feedbackText: {
    marginLeft: 8,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  instructionsList: {
    marginTop: 16,
  },
  instructionsTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 14,
    marginBottom: 4,
    paddingLeft: 8,
  },
  // Bingo Styles
  bingoProgressBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  bingoProgressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  bingoRow: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  bingoRowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  bingoRowTitle: {
    flex: 1,
    fontSize: 16,
  },
  bingoRowReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  bingoRewardText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#F57C00',
    marginLeft: 4,
  },
  completedRowBadge: {
    marginLeft: 8,
  },
  bingoTasksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  bingoTask: {
    width: '19%',
    aspectRatio: 1,
    padding: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
    marginBottom: 8,
  },
  completedBingoTask: {
    opacity: 0.7,
  },
  bingoTaskIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  bingoTaskTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 1,
    lineHeight: 11,
  },
  bingoTaskDescription: {
    fontSize: 7,
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 2,
    lineHeight: 8,
  },
  completedTaskText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  bingoTaskReward: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 1,
    right: 1,
  },
  bingoTaskCoin: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#F57C00',
    marginLeft: 1,
  },
  bingoTaskCheck: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: 'white',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bingoProgress: {
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  bingoProgressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 6,
    overflow: 'hidden',
  },
  bingoProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  bingoProgressLabel: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.7,
    fontWeight: '500',
  },
  arPlankCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
  },
});