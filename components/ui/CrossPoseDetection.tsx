import { triggerHapticFeedback } from '@/utils/animations';
import { hp, rfs, wp } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View,
} from 'react-native';

interface CrossPoseDetectionProps {
  visible: boolean;
  onComplete: (duration: number, coins: number) => void;
  onClose: () => void;
}

interface PoseMetrics {
  armAngleAccuracy: number;
  positionStability: number;
  overallScore: number;
}

export default function CrossPoseDetection({ 
  visible, 
  onComplete, 
  onClose 
}: CrossPoseDetectionProps) {
  const [isActive, setIsActive] = useState(false);
  const [timeHeld, setTimeHeld] = useState(0);
  const [targetDuration] = useState(15); // 15 seconds target
  const [poseMetrics, setPoseMetrics] = useState<PoseMetrics>({
    armAngleAccuracy: 0,
    positionStability: 0,
    overallScore: 0,
  });
  const [isPoseDetected, setIsPoseDetected] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  // Animation values
  const progressAnim = useRef(new Animated.Value(0)).current;
  const accuracyAnim = useRef(new Animated.Value(0)).current;
  const stabilityAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      resetPose();
      startPoseDetection();
    }
  }, [visible]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && isPoseDetected) {
      interval = setInterval(() => {
        setTimeHeld(prev => {
          const newTime = prev + 0.1;
          if (newTime >= targetDuration) {
            completePose();
            return targetDuration;
          }
          return newTime;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isActive, isPoseDetected, targetDuration]);

  // Simulate pose detection with high accuracy
  useEffect(() => {
    if (!visible || !isActive) return;

    const detectionInterval = setInterval(() => {
      // Simulate cross pose detection (arms extended horizontally)
      const armAngle = Math.random() * 20 + 85; // 85-105 degrees (close to 90)
      const stability = Math.random() * 30 + 70; // 70-100% stability
      const poseDetected = armAngle >= 80 && armAngle <= 100 && stability >= 75;

      const newMetrics = {
        armAngleAccuracy: Math.min(100, Math.max(0, 100 - Math.abs(90 - armAngle) * 2)),
        positionStability: stability,
        overallScore: poseDetected ? (armAngle + stability) / 2 : 0,
      };

      setPoseMetrics(newMetrics);
      setIsPoseDetected(poseDetected);

      // Animate metrics
      Animated.parallel([
        Animated.timing(accuracyAnim, {
          toValue: newMetrics.armAngleAccuracy / 100,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(stabilityAnim, {
          toValue: newMetrics.positionStability / 100,
          duration: 200,
          useNativeDriver: false,
        }),
      ]).start();

      // Pulse animation when pose is detected correctly
      if (poseDetected) {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, 200);

    return () => clearInterval(detectionInterval);
  }, [visible, isActive]);

  // Progress animation
  useEffect(() => {
    const progress = timeHeld / targetDuration;
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 100,
      useNativeDriver: false,
    }).start();
  }, [timeHeld, targetDuration]);

  const startPoseDetection = () => {
    setTimeout(() => {
      setIsActive(true);
      triggerHapticFeedback('light');
    }, 2000); // 2 second preparation
  };

  const resetPose = () => {
    setIsActive(false);
    setTimeHeld(0);
    setIsPoseDetected(false);
    setShowCelebration(false);
    progressAnim.setValue(0);
    accuracyAnim.setValue(0);
    stabilityAnim.setValue(0);
    pulseAnim.setValue(1);
  };

  const completePose = () => {
    setIsActive(false);
    setShowCelebration(true);
    
    const baseCoins = 40;
    const accuracyBonus = Math.round(poseMetrics.overallScore / 5);
    const totalCoins = baseCoins + accuracyBonus;
    
    triggerHapticFeedback('success');
    Vibration.vibrate([100, 50, 100]);

    setTimeout(() => {
      onComplete(timeHeld, totalCoins);
    }, 3000);
  };

  const handleClose = () => {
    resetPose();
    onClose();
  };

  const getInstructionText = () => {
    if (!isActive) {
      return "Get ready! Stand with arms extended to your sides";
    }
    if (!isPoseDetected) {
      return "Extend your arms horizontally like a cross ✝️";
    }
    return `Hold steady! ${(targetDuration - timeHeld).toFixed(1)}s remaining`;
  };

  const getAccuracyColor = (value: number) => {
    if (value >= 80) return '#4CAF50';
    if (value >= 60) return '#FF9800';
    return '#F44336';
  };

  return (
    <Modal visible={visible} animationType="fade" statusBarBackgroundColor="#000">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={wp(6)} color="white" />
          </TouchableOpacity>
          <Text style={styles.title}>Cross Pose Challenge</Text>
          <View style={styles.timerDisplay}>
            <Text style={styles.timerText}>{timeHeld.toFixed(1)}s</Text>
          </View>
        </View>

        {/* Main Camera View */}
        <View style={styles.cameraView}>
          {/* Simulated Camera Background */}
          <View style={styles.cameraBackground}>
            <View style={styles.gridOverlay}>
              {[...Array(16)].map((_, i) => (
                <View key={i} style={styles.gridDot} />
              ))}
            </View>
          </View>

          {/* Pose Guide Overlay */}
          <Animated.View 
            style={[
              styles.poseGuide,
              {
                transform: [{ scale: pulseAnim }],
                borderColor: isPoseDetected ? '#4CAF50' : '#FF9800',
              }
            ]}
          >
            <View style={styles.bodyCenter} />
            <View style={[styles.armLeft, { backgroundColor: isPoseDetected ? '#4CAF50' : '#FF9800' }]} />
            <View style={[styles.armRight, { backgroundColor: isPoseDetected ? '#4CAF50' : '#FF9800' }]} />
            <Text style={styles.poseLabel}>Cross Pose</Text>
          </Animated.View>

          {/* Metrics Panel */}
          <View style={styles.metricsPanel}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Arm Angle</Text>
              <View style={styles.metricBar}>
                <Animated.View 
                  style={[
                    styles.metricFill,
                    {
                      width: accuracyAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                      backgroundColor: getAccuracyColor(poseMetrics.armAngleAccuracy),
                    }
                  ]}
                />
              </View>
              <Text style={styles.metricValue}>
                {Math.round(poseMetrics.armAngleAccuracy)}%
              </Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Stability</Text>
              <View style={styles.metricBar}>
                <Animated.View 
                  style={[
                    styles.metricFill,
                    {
                      width: stabilityAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                      backgroundColor: getAccuracyColor(poseMetrics.positionStability),
                    }
                  ]}
                />
              </View>
              <Text style={styles.metricValue}>
                {Math.round(poseMetrics.positionStability)}%
              </Text>
            </View>
          </View>

          {/* Progress Circle */}
          <View style={styles.progressContainer}>
            <View style={styles.progressCircle}>
              <Animated.View
                style={[
                  styles.progressFill,
                  {
                    height: progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    }),
                  }
                ]}
              />
              <View style={styles.progressContent}>
                <Text style={styles.progressPercentage}>
                  {Math.round((timeHeld / targetDuration) * 100)}%
                </Text>
                <Text style={styles.progressLabel}>Complete</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsPanel}>
          <Text style={styles.instructionText}>{getInstructionText()}</Text>
          
          <View style={styles.poseStatus}>
            <View style={[
              styles.statusIndicator,
              { backgroundColor: isPoseDetected ? '#4CAF50' : '#FF9800' }
            ]}>
              <Ionicons 
                name={isPoseDetected ? 'checkmark' : 'body'} 
                size={wp(4)} 
                color="white" 
              />
            </View>
            <Text style={[
              styles.statusText,
              { color: isPoseDetected ? '#4CAF50' : '#FF9800' }
            ]}>
              {isPoseDetected ? 'Perfect Cross Pose!' : 'Adjust Your Position'}
            </Text>
          </View>
        </View>

        {/* Celebration */}
        {showCelebration && (
          <View style={styles.celebrationOverlay}>
            <LottieView
              source={require('@/assets/lottie/success-confetti.json')}
              autoPlay
              loop={false}
              style={styles.celebrationAnimation}
            />
            <Text style={styles.celebrationTitle}>Cross Pose Mastered! ✝️</Text>
            <Text style={styles.celebrationScore}>
              +{40 + Math.round(poseMetrics.overallScore / 5)} coins earned!
            </Text>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    paddingTop: hp(7),
  },
  closeButton: {
    padding: wp(2),
  },
  title: {
    fontSize: rfs(20),
    fontWeight: 'bold',
    color: 'white',
  },
  timerDisplay: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: wp(4),
  },
  timerText: {
    fontSize: rfs(16),
    fontWeight: 'bold',
    color: 'white',
  },
  cameraView: {
    flex: 1,
    position: 'relative',
  },
  cameraBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#1a1a1a',
  },
  gridOverlay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignContent: 'space-around',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: wp(4),
  },
  gridDot: {
    width: 2,
    height: 2,
    backgroundColor: '#4CAF50',
    borderRadius: 1,
    opacity: 0.3,
  },
  poseGuide: {
    position: 'absolute',
    top: '25%',
    alignSelf: 'center',
    width: wp(40),
    height: hp(25),
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: wp(4),
    borderStyle: 'dashed',
  },
  bodyCenter: {
    width: wp(3),
    height: hp(12),
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: wp(1.5),
  },
  armLeft: {
    position: 'absolute',
    left: -wp(8),
    top: '30%',
    width: wp(15),
    height: wp(2),
    borderRadius: wp(1),
  },
  armRight: {
    position: 'absolute',
    right: -wp(8),
    top: '30%',
    width: wp(15),
    height: wp(2),
    borderRadius: wp(1),
  },
  poseLabel: {
    position: 'absolute',
    bottom: -hp(4),
    fontSize: rfs(14),
    fontWeight: 'bold',
    color: 'white',
  },
  metricsPanel: {
    position: 'absolute',
    top: hp(12),
    left: wp(4),
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: wp(3),
    padding: wp(3),
    minWidth: wp(35),
  },
  metricItem: {
    marginBottom: hp(1.5),
  },
  metricLabel: {
    fontSize: rfs(12),
    color: 'white',
    marginBottom: hp(0.5),
  },
  metricBar: {
    width: wp(25),
    height: hp(0.8),
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: hp(0.4),
    overflow: 'hidden',
    marginBottom: hp(0.5),
  },
  metricFill: {
    height: '100%',
    borderRadius: hp(0.4),
  },
  metricValue: {
    fontSize: rfs(11),
    color: 'white',
    fontWeight: 'bold',
  },
  progressContainer: {
    position: 'absolute',
    bottom: hp(15),
    right: wp(4),
  },
  progressCircle: {
    width: wp(20),
    height: wp(20),
    borderRadius: wp(10),
    backgroundColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#4CAF50',
  },
  progressContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressPercentage: {
    fontSize: rfs(14),
    fontWeight: 'bold',
    color: 'white',
  },
  progressLabel: {
    fontSize: rfs(9),
    color: 'rgba(255,255,255,0.8)',
  },
  instructionsPanel: {
    backgroundColor: 'rgba(0,0,0,0.9)',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    alignItems: 'center',
  },
  instructionText: {
    fontSize: rfs(16),
    color: 'white',
    textAlign: 'center',
    marginBottom: hp(1.5),
    lineHeight: rfs(22),
  },
  poseStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: wp(4),
    paddingVertical: hp(1),
    borderRadius: wp(6),
  },
  statusIndicator: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(2),
  },
  statusText: {
    fontSize: rfs(14),
    fontWeight: 'bold',
  },
  celebrationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  celebrationAnimation: {
    width: wp(80),
    height: hp(40),
  },
  celebrationTitle: {
    fontSize: rfs(28),
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginTop: hp(2),
  },
  celebrationScore: {
    fontSize: rfs(20),
    color: '#FFD700',
    fontWeight: 'bold',
    marginTop: hp(1),
  },
});