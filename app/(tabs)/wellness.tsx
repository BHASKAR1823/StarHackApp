import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence, 
  withTiming 
} from 'react-native-reanimated';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { dummyYogaPoses, dummyHealthMetrics } from '@/services/dummyData';
import { YogaPose, HealthMetrics } from '@/types/app';
import { gamificationService } from '@/services/gamificationService';
import { triggerHapticFeedback, celebrationScale } from '@/utils/animations';

export default function WellnessScreen() {
  const colorScheme = useColorScheme();
  const [selectedPose, setSelectedPose] = useState<YogaPose | null>(null);
  const [showARModal, setShowARModal] = useState(false);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics>(dummyHealthMetrics[0]);
  const [isPoseActive, setIsPoseActive] = useState(false);
  const [poseTimer, setPoseTimer] = useState(0);
  const [sessionCoins, setSessionCoins] = useState(0);

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
    let interval: NodeJS.Timeout;
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

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
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
});