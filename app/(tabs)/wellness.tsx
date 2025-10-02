import BrainGamesMenu from '@/components/games/BrainGamesMenu';
import RewardStore from '@/components/rewards/RewardStore';
import { ThemedText } from '@/components/themed-text';
import { ARPlankDetection } from '@/components/ui/ar-plank-detection';
import CollapsibleSection from '@/components/ui/CollapsibleSection';
import CrossPoseDetection from '@/components/ui/CrossPoseDetection';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ARYogaStudio } from '@/components/wellness/ARYogaStudio';
import MeditationSession from '@/components/wellness/MeditationSession';
import { QuickActions } from '@/components/wellness/QuickActions';
import TopQuickActions from '@/components/wellness/TopQuickActions';
import { WellnessOverview } from '@/components/wellness/WellnessOverview';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { dummyHealthMetrics, dummyUser, dummyWellnessBingo } from '@/services/dummyData';
import { gamificationService } from '@/services/gamificationService';
import { BingoRow, HealthMetrics, YogaPose } from '@/types/app';
import { celebrationScale, triggerHapticFeedback } from '@/utils/animations';
import {
  hp,
  rfs,
  rs,
  useResponsiveDimensions,
} from '@/utils/responsive';
import { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';

export default function WellnessScreen() {
  const colorScheme = useColorScheme();
  const { deviceInfo } = useResponsiveDimensions();
  const [selectedPose, setSelectedPose] = useState<YogaPose | null>(null);
  const [showARModal, setShowARModal] = useState(false);
  const [showARPlank, setShowARPlank] = useState(false);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics>(dummyHealthMetrics[0]);
  const [isPoseActive, setIsPoseActive] = useState(false);
  const [poseTimer, setPoseTimer] = useState(0);
  const [sessionCoins, setSessionCoins] = useState(0);
  const [bingoData, setBingoData] = useState<BingoRow[]>(dummyWellnessBingo);
  const [showBrainGames, setShowBrainGames] = useState(false);
  const [showRewardStore, setShowRewardStore] = useState(false);
  const [showMeditation, setShowMeditation] = useState(false);
  const [showCrossPose, setShowCrossPose] = useState(false);

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

    const handleMeditationComplete = async (duration: number, coins: number) => {
    setShowMeditation(false);
    setSessionCoins(prev => prev + coins);
    
    // Award coins and trigger animations
    await gamificationService.awardCoins(coins, `Meditation Session - ${duration} minutes`);
    
    coinScale.value = celebrationScale();
    progressScale.value = celebrationScale();
    
    triggerHapticFeedback('success');
    
    Alert.alert(
      '🧘 Meditation Complete!',
      `Great session! You meditated for ${duration} minutes and earned ${coins} coins.`,
      [{ text: 'Namaste', onPress: () => {} }]
    );
  };

  const handleCrossPoseComplete = async (duration: number, coins: number) => {
    setShowCrossPose(false);
    setSessionCoins(prev => prev + coins);
    
    // Award coins and trigger animations
    await gamificationService.awardCoins(coins, `Cross Pose Challenge - ${duration.toFixed(1)}s`);
    
    coinScale.value = celebrationScale();
    progressScale.value = celebrationScale();
    
    triggerHapticFeedback('success');
    
    Alert.alert(
      '✝️ Cross Pose Mastered!',
      `Perfect form! You held the pose for ${duration.toFixed(1)} seconds and earned ${coins} coins!`,
      [{ text: 'Amazing!', onPress: () => {} }]
    );
    
    // Update health metrics
    setHealthMetrics(prev => ({
      ...prev,
      workoutSessions: prev.workoutSessions + 1
    }));
  };

  const startCrossPoseChallenge = () => {
    setShowCrossPose(true);
    triggerHapticFeedback('medium');
  };

  const handleQuickAction = (actionId: string) => {
    console.log('Quick action pressed:', actionId);
    
    if (actionId === 'brain-games') {
      setShowBrainGames(true);
    } else if (actionId === 'reward-store') {
      setShowRewardStore(true);
    } else if (actionId === 'meditation') {
      setShowMeditation(true);
    } else if (actionId === 'ar-yoga') {
      setShowARPlank(true);
    } else if (actionId === 'steps-tracker') {
      // For now, show an alert. In a real app, you'd navigate to a steps tracker
      Alert.alert('Steps Tracker', 'Keep walking! Track your daily steps here.', [{ text: 'OK' }]);
    } else if (actionId === 'water-tracker') {
      // For now, show an alert. In a real app, you'd navigate to a water tracker
      Alert.alert('Water Tracker', 'Stay hydrated! Track your water intake here.', [{ text: 'OK' }]);
    } else if (actionId === 'insurance') {
      // For now, show an alert. In a real app, you'd navigate to insurance tab
      Alert.alert('Insurance Benefits', 'Check your insurance benefits and coverage.', [{ text: 'OK' }]);
    } else if (actionId === 'journal') {
      // For now, show an alert. In a real app, you'd navigate to a journaling screen
      Alert.alert('Gratitude Journal', 'Write down 3 things you\'re grateful for today.', [{ text: 'OK' }]);
    }
    
    triggerHapticFeedback('light');
  };

  // Calculate combined wellness score (0-100)
  const calculateWellnessScore = () => {
    const stepsScore = Math.min((healthMetrics.steps / 10000) * 100, 100);
    const waterScore = Math.min((healthMetrics.waterIntake / 8) * 100, 100);
    const sleepScore = Math.min((healthMetrics.sleepHours / 8) * 100, 100);
    const meditationScore = Math.min((healthMetrics.meditationMinutes / 30) * 100, 100);
    const workoutScore = Math.min((healthMetrics.workoutSessions / 1) * 100, 100);
    
    // Weighted average: steps 25%, water 15%, sleep 25%, meditation 20%, workout 15%
    const totalScore = (
      (stepsScore * 0.25) +
      (waterScore * 0.15) +
      (sleepScore * 0.25) +
      (meditationScore * 0.20) +
      (workoutScore * 0.15)
    );
    
    return Math.round(totalScore);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#4CAF50'; // Green - Excellent
    if (score >= 60) return '#FF9800'; // Orange - Good
    if (score >= 40) return '#2196F3'; // Blue - Fair
    return '#F44336'; // Red - Needs improvement
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Focus';
  };

  if (showBrainGames) {
    return <BrainGamesMenu onBack={() => setShowBrainGames(false)} />;
  }

  if (showRewardStore) {
    return (
      <RewardStore 
        onBack={() => setShowRewardStore(false)} 
        userCoins={dummyUser.coins + sessionCoins} 
      />
    );
  }

  if (showMeditation) {
    return (
      <MeditationSession
        onBack={() => setShowMeditation(false)}
        onComplete={handleMeditationComplete}
      />
    );
  }

  if (showCrossPose) {
    return (
      <CrossPoseDetection
        visible={showCrossPose}
        onComplete={handleCrossPoseComplete}
        onClose={() => setShowCrossPose(false)}
      />
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Top Quick Actions & Daily Focus */}
      <TopQuickActions onActionPress={handleQuickAction} />
      
      {/* Today's Progress Grid */}
      <CollapsibleSection 
        title="Today's Progress" 
        subtitle="Track your daily wellness goals"
        icon="trending-up"
        defaultExpanded={true}
      >
        <View style={styles.progressGrid}>
          {[
            { title: 'Steps', current: healthMetrics.steps, target: 10000, icon: 'footsteps', color: '#4CAF50' },
            { title: 'Water', current: healthMetrics.waterIntake, target: 8, icon: 'water', color: '#2196F3' },
            { title: 'Sleep', current: healthMetrics.sleepHours, target: 8, icon: 'moon', color: '#6B46C1' },
            { title: 'Meditation', current: healthMetrics.meditationMinutes, target: 30, icon: 'leaf', color: '#10B981' },
          ].map((item, index) => {
            const percentage = Math.min((item.current / item.target) * 100, 100);
            const isCompleted = percentage >= 100;
            
            return (
              <View key={index} style={styles.progressItem}>
                <View style={[styles.progressIcon, { backgroundColor: item.color + '20' }]}>
                  <IconSymbol name={item.icon} size={24} color={item.color} />
                </View>
                <ThemedText style={styles.progressTitle}>{item.title}</ThemedText>
                <View style={styles.progressBarContainer}>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { width: `${percentage}%`, backgroundColor: item.color }
                      ]} 
                    />
                  </View>
                  <ThemedText style={styles.progressValue}>
                    {item.current}/{item.target}
                  </ThemedText>
                </View>
                {isCompleted && (
                  <View style={styles.completedBadge}>
                    <IconSymbol name="checkmark.circle.fill" size={16} color="#4CAF50" />
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </CollapsibleSection>

      {/* Wellness Overview */}
      <CollapsibleSection 
        title="Wellness Score" 
        subtitle="Your overall health score today"
        icon="heart"
        badge={`${calculateWellnessScore()}/100`}
        defaultExpanded={true}
      >
        <WellnessOverview
          healthMetrics={healthMetrics}
          sessionCoins={sessionCoins}
          progressAnimatedStyle={progressAnimatedStyle}
          coinAnimatedStyle={coinAnimatedStyle}
          wellnessScore={calculateWellnessScore()}
          getScoreColor={getScoreColor}
          getScoreLabel={getScoreLabel}
        />
      </CollapsibleSection>

      {/* Wellness Bingo - 2x3 Grid Layout */}
      <CollapsibleSection 
        title="🏆 Wellness Bingo" 
        subtitle="Complete challenges for bonus rewards!"
        icon="trophy"
        badge={`${bingoData.reduce((acc, row) => acc + row.tasks.filter(t => t.isCompleted).length, 0)}/15`}
        defaultExpanded={false}
      >
        <View style={styles.bingoGridContainer}>
          {bingoData.slice(0, 2).map((row) => (
            <View key={row.id} style={styles.compactBingoRow}>
              <View style={styles.bingoRowHeader}>
                <ThemedText type="defaultSemiBold" style={styles.bingoRowTitle}>
                  {row.name}
                </ThemedText>
                <View style={styles.bingoRowReward}>
                  <IconSymbol name="gift.fill" size={14} color="#FFD700" />
                  <ThemedText style={styles.bingoRewardText}>
                    +{row.bonusReward}
                  </ThemedText>
                </View>
              </View>
              
              <View style={styles.compactBingoGrid}>
                {row.tasks.slice(0, 3).map((task) => (
                  <TouchableOpacity
                    key={task.id}
                    style={[
                      styles.compactBingoTask,
                      task.isCompleted && styles.completedBingoTask,
                    ]}
                    onPress={() => !task.isCompleted && completeBingoTask(task.id, row.id)}
                    disabled={task.isCompleted}
                  >
                    <ThemedText style={styles.bingoTaskIcon}>{task.icon}</ThemedText>
                    <ThemedText 
                      style={[
                        styles.compactTaskTitle,
                        task.isCompleted && styles.completedTaskText
                      ]}
                      numberOfLines={1}
                    >
                      {task.title}
                    </ThemedText>
                    {task.isCompleted && (
                      <View style={styles.bingoTaskCheck}>
                        <IconSymbol name="checkmark.circle.fill" size={16} color="#4CAF50" />
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
              </View>
            </View>
          ))}
        </View>
      </CollapsibleSection>



      {/* AR Yoga Studio */}
      <CollapsibleSection 
        title="🧘 AR Yoga Studio" 
        subtitle="Interactive poses with real-time feedback"
        icon="body"
        defaultExpanded={false}
      >
        <ARYogaStudio
          onStartPose={startPose}
          onStartARPlank={startARPlankChallenge}
          onStartCrossPose={startCrossPoseChallenge}
          poseAnimatedStyle={poseAnimatedStyle}
        />
      </CollapsibleSection>

      {/* Additional Actions */}
      <CollapsibleSection 
        title="⚡ More Activities" 
        subtitle="Explore additional wellness features"
        icon="grid"
        defaultExpanded={false}
      >
        <QuickActions onActionPress={handleQuickAction} />
      </CollapsibleSection>

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

      {/* Cross Pose Detection Modal */}
      <CrossPoseDetection
        visible={showCrossPose}
        onComplete={handleCrossPoseComplete}
        onClose={() => setShowCrossPose(false)}
      />
    </ScrollView>
  );
}

// Create responsive styles
const createResponsiveStyles = () => {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: hp(8),
    },
    section: {
      margin: rs(20),
      padding: rs(16),
      borderRadius: rs(12),
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: rs(8),
    },
    sectionDescription: {
      fontSize: rfs(14),
      opacity: 0.7,
      marginBottom: rs(16),
    },
    modalContainer: {
      flex: 1,
      backgroundColor: '#000',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: rs(20),
      paddingTop: rs(60),
      backgroundColor: 'white',
    },
    closeButton: {
      padding: rs(8),
    },
    timerContainer: {
      backgroundColor: '#4CAF50',
      paddingHorizontal: rs(12),
      paddingVertical: rs(6),
      borderRadius: rs(16),
    },
    timer: {
      color: 'white',
      fontWeight: 'bold',
      fontSize: rfs(16),
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
      fontSize: rfs(18),
      fontWeight: 'bold',
      marginTop: rs(16),
      color: '#666',
    },
    cameraSubtext: {
      fontSize: rfs(14),
      color: '#999',
      marginTop: rs(8),
      textAlign: 'center',
    },
    poseInstructions: {
      backgroundColor: 'white',
      padding: rs(20),
    },
    currentPose: {
      fontSize: rfs(20),
      textAlign: 'center',
      marginBottom: rs(16),
    },
    feedback: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: rs(16),
      padding: rs(12),
      backgroundColor: '#E8F5E8',
      borderRadius: rs(8),
    },
    feedbackText: {
      marginLeft: rs(8),
      color: '#4CAF50',
      fontWeight: 'bold',
    },
    instructionsList: {
      marginTop: rs(16),
    },
    instructionsTitle: {
      fontWeight: 'bold',
      marginBottom: rs(8),
    },
    instruction: {
      fontSize: rfs(14),
      marginBottom: rs(4),
      paddingLeft: rs(8),
    },
    // Bingo Styles
    bingoProgressBadge: {
      backgroundColor: '#E3F2FD',
      paddingHorizontal: rs(12),
      paddingVertical: rs(6),
      borderRadius: rs(16),
    },
    bingoProgressText: {
      fontSize: rfs(14),
      fontWeight: 'bold',
      color: '#1976D2',
    },
    bingoRow: {
      marginBottom: rs(24),
      padding: rs(16),
      borderRadius: rs(12),
      borderWidth: 1,
      borderColor: '#E0E0E0',
      backgroundColor: '#FAFAFA',
    },
    bingoRowHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: rs(16),
      flexWrap: 'wrap',
    },
    bingoRowTitle: {
      flex: 1,
      fontSize: rfs(16),
    },
    bingoRowReward: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFF8E1',
      paddingHorizontal: rs(8),
      paddingVertical: rs(4),
      borderRadius: rs(12),
      marginLeft: rs(8),
    },
    bingoRewardText: {
      fontSize: rfs(12),
      fontWeight: 'bold',
      color: '#F57C00',
      marginLeft: rs(4),
    },
    completedRowBadge: {
      marginLeft: rs(8),
    },
    bingoTasksGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: rs(16),
    },
    bingoTask: {
      padding: rs(6),
      borderRadius: rs(8),
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'relative',
      marginBottom: rs(8),
    },
    completedBingoTask: {
      opacity: 0.7,
    },
    bingoTaskIcon: {
      fontSize: rfs(18),
      marginBottom: rs(2),
    },
    bingoTaskTitle: {
      fontSize: rfs(9),
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: rs(1),
      lineHeight: rfs(11),
    },
    bingoTaskDescription: {
      fontSize: rfs(7),
      textAlign: 'center',
      opacity: 0.7,
      marginBottom: rs(2),
      lineHeight: rfs(8),
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
      fontSize: rfs(8),
      fontWeight: 'bold',
      color: '#F57C00',
      marginLeft: 1,
    },
    bingoTaskCheck: {
      position: 'absolute',
      top: -2,
      right: -2,
      backgroundColor: 'white',
      borderRadius: rs(10),
      width: rs(20),
      height: rs(20),
      alignItems: 'center',
      justifyContent: 'center',
    },
    bingoProgress: {
      marginTop: rs(12),
      paddingTop: rs(8),
      borderTopWidth: 1,
      borderTopColor: '#F0F0F0',
    },
    bingoProgressBar: {
      height: rs(8),
      backgroundColor: '#E0E0E0',
      borderRadius: rs(4),
      marginBottom: rs(6),
      overflow: 'hidden',
    },
    bingoProgressFill: {
      height: '100%',
      borderRadius: rs(4),
    },
    bingoProgressLabel: {
      fontSize: rfs(12),
      textAlign: 'center',
      opacity: 0.7,
      fontWeight: '500',
    },

    // Progress Grid Styles
    progressGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      padding: rs(16),
      paddingBottom: rs(8),
    },
    progressItem: {
      width: '48%',
      backgroundColor: '#FFFFFF',
      borderRadius: rs(12),
      padding: rs(16),
      alignItems: 'center',
      marginBottom: rs(12),
      position: 'relative',
      borderWidth: 1,
      borderColor: '#E5E7EB',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    progressIcon: {
      width: rs(48),
      height: rs(48),
      borderRadius: rs(24),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: rs(8),
    },
    progressTitle: {
      fontSize: rfs(13),
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: rs(8),
      color: Colors.light.text,
    },
    progressBarContainer: {
      width: '100%',
      alignItems: 'center',
    },
    progressBar: {
      width: '100%',
      height: rs(6),
      backgroundColor: '#E5E7EB',
      borderRadius: rs(3),
      overflow: 'hidden',
      marginBottom: rs(6),
    },
    progressFill: {
      height: '100%',
      borderRadius: rs(3),
    },
    progressValue: {
      fontSize: rfs(12),
      fontWeight: 'bold',
      color: Colors.light.text,
    },
    completedBadge: {
      position: 'absolute',
      top: rs(8),
      right: rs(8),
    },

    // Compact Bingo Styles
    bingoGridContainer: {
      padding: rs(16),
    },
    compactBingoRow: {
      backgroundColor: '#F8F9FA',
      borderRadius: rs(12),
      padding: rs(12),
      marginBottom: rs(16),
    },
    compactBingoGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: rs(8),
    },
    compactBingoTask: {
      width: '30%',
      aspectRatio: 1,
      backgroundColor: 'white',
      borderRadius: rs(8),
      padding: rs(8),
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      elevation: 1,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
    },
    compactTaskTitle: {
      fontSize: rfs(10),
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: rs(4),
    },

  });
};

// Use responsive styles
const styles = createResponsiveStyles();