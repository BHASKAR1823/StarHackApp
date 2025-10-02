import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { triggerHapticFeedback } from '@/utils/animations';
import { Camera, CameraView } from 'expo-camera';
import LottieView from 'lottie-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    Modal,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ARPlankDetectionProps {
  visible: boolean;
  onComplete: (duration: number, coins: number) => void;
  onClose: () => void;
}

interface PoseKeypoint {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

interface PoseDetectionResult {
  landmarks: PoseKeypoint[];
  isPlankPosition: boolean;
  confidence: number;
}

export const ARPlankDetection: React.FC<ARPlankDetectionProps> = ({
  visible,
  onComplete,
  onClose,
}) => {
  const colorScheme = useColorScheme();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isInPlank, setIsInPlank] = useState(false);
  const [timer, setTimer] = useState(0);
  const [countdown, setCountdown] = useState(3);
  const [showCountdown, setShowCountdown] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [poseConfidence, setPoseConfidence] = useState(0);
  const [poseFeedback, setPoseFeedback] = useState("Position yourself for plank");
  const [stabilityBuffer, setStabilityBuffer] = useState<boolean[]>([]);
  const [poseHoldFrames, setPoseHoldFrames] = useState(0);
  const [lastValidPose, setLastValidPose] = useState<Date | null>(null);
  
  const POSE_HOLD_THRESHOLD = 15; // Frames to hold pose before counting as valid
  const BUFFER_SIZE = 8; // Number of frames to consider for stability
  
  const cameraRef = useRef<CameraView>(null);
  const detectionIntervalRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  // Animation values
  const timerScale = useSharedValue(1);
  const confidenceOpacity = useSharedValue(0);
  const successScale = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  const timerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: timerScale.value }],
  }));

  const confidenceAnimatedStyle = useAnimatedStyle(() => ({
    opacity: confidenceOpacity.value,
  }));

  const successAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  useEffect(() => {
    if (visible && hasPermission) {
      startDetection();
    } else {
      stopDetection();
    }

    return () => {
      stopDetection();
    };
  }, [visible, hasPermission]);

  useEffect(() => {
    if (isInPlank && !timerIntervalRef.current) {
      startTimer();
    } else if (!isInPlank && timerIntervalRef.current) {
      pauseTimer();
    }
  }, [isInPlank]);

  const startDetection = () => {
    setIsDetecting(true);
    setTimer(0);
    setIsInPlank(false);
    resetPoseTracking();
    
    // Start pose detection simulation (replace with actual MediaPipe integration)
    detectionIntervalRef.current = setInterval(() => {
      simulatePoseDetection();
    }, 100) as any;

    // Pulse animation for camera overlay
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  };

  const resetPoseTracking = () => {
    setPoseHoldFrames(0);
    setLastValidPose(null);
    setStabilityBuffer([]);
    setPoseConfidence(0);
    setPoseFeedback("Position yourself for plank");
  };

  const stopDetection = () => {
    setIsDetecting(false);
    setIsInPlank(false);
    resetPoseTracking();
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const startTimer = () => {
    if (!showCountdown) {
      setShowCountdown(true);
      setCountdown(3);
      
      const countdownInterval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            setShowCountdown(false);
            startActualTimer();
            return 0;
          }
          triggerHapticFeedback('medium');
          return prev - 1;
        });
      }, 1000);
    }
  };

  const startActualTimer = () => {
    timerIntervalRef.current = setInterval(() => {
      setTimer(prev => {
        const newTime = prev + 0.1;
        
        // Animate timer
        timerScale.value = withSpring(1.1, { damping: 15, stiffness: 300 }, () => {
          timerScale.value = withSpring(1, { damping: 15, stiffness: 300 });
        });

        // Check for completion milestones
        if (newTime >= 30) { // 30 second plank completed
          completeWorkout(newTime);
          return newTime;
        }

        return newTime;
      });
    }, 100);
  };

  const pauseTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const completeWorkout = (finalTime: number) => {
    setIsInPlank(false);
    stopDetection();
    
    // Calculate coins based on duration
    const coins = Math.floor(finalTime * 2); // 2 coins per second
    
    // Show success animation
    setShowSuccess(true);
    successScale.value = withSpring(1, { damping: 10, stiffness: 150 });
    triggerHapticFeedback('success');

    setTimeout(() => {
      onComplete(finalTime, coins);
    }, 3000);
  };

  // Enhanced plank pose detection with more reliable algorithm
  const simulatePoseDetection = () => {
    // Simulate more realistic pose detection with multiple criteria
    const poseAnalysis = analyzeDetailedPlankPose();
    
    setPoseConfidence(poseAnalysis.overallConfidence);
    const isValidPlank = poseAnalysis.isValidPlank && poseAnalysis.overallConfidence > 0.8;
    
    // Update pose buffer for stability
    const newBuffer = [...stabilityBuffer, isValidPlank].slice(-BUFFER_SIZE);
    setStabilityBuffer(newBuffer);

    // Check for pose stability - require consistent detection
    const stableFrames = newBuffer.filter(Boolean).length;
    const isStablePlank = stableFrames >= Math.floor(BUFFER_SIZE * 0.75);

    // Update pose hold counter
    if (isStablePlank) {
      setPoseHoldFrames(prev => prev + 1);
      setLastValidPose(new Date());
    } else {
      setPoseHoldFrames(0);
    }

    // Only consider it a valid plank if held for minimum duration
    const finalIsPlank = isStablePlank && poseHoldFrames >= POSE_HOLD_THRESHOLD;
    setIsInPlank(finalIsPlank);

    // Update feedback based on pose hold progress
    if (isStablePlank && poseHoldFrames > 0 && poseHoldFrames < POSE_HOLD_THRESHOLD) {
      const progress = (poseHoldFrames / POSE_HOLD_THRESHOLD) * 100;
      setPoseFeedback(`Stabilizing pose... ${Math.round(progress)}%`);
    } else if (finalIsPlank) {
      setPoseFeedback("Perfect form! Timer active");
    } else {
      setPoseFeedback(poseAnalysis.feedback || generatePoseHoldFeedback());
    }

    // Animate confidence indicator
    confidenceOpacity.value = withTiming(isStablePlank ? 1 : 0.5, { duration: 200 });
    
    if (finalIsPlank && !isInPlank) {
      triggerHapticFeedback('medium');
    } else if (isStablePlank && poseHoldFrames > 0) {
      triggerHapticFeedback('light');
    }
  };

  // Detailed plank analysis simulation (replace with actual pose detection)
  const analyzeDetailedPlankPose = () => {
    // Simulate realistic plank detection criteria
    const timeBasedStability = Math.min(timer / 5, 1); // Increases over time
    const baseStability = 0.4 + (Math.random() * 0.4); // Random base between 0.4-0.8
    
    // Multiple criteria for plank detection
    const criteria = {
      bodyAlignment: 0.6 + (Math.random() * 0.3), // Body straightness
      armPosition: 0.7 + (Math.random() * 0.2), // Proper arm support
      coreEngagement: 0.5 + (Math.random() * 0.4), // Core stability
      legPosition: 0.6 + (Math.random() * 0.3), // Leg extension
      overallStability: baseStability + (timeBasedStability * 0.2)
    };

    // Calculate weighted average
    const weights = {
      bodyAlignment: 0.3,
      armPosition: 0.25,
      coreEngagement: 0.2,
      legPosition: 0.15,
      overallStability: 0.1
    };

    const overallConfidence = 
      (criteria.bodyAlignment * weights.bodyAlignment) +
      (criteria.armPosition * weights.armPosition) +
      (criteria.coreEngagement * weights.coreEngagement) +
      (criteria.legPosition * weights.legPosition) +
      (criteria.overallStability * weights.overallStability);

    const isValidPlank = 
      criteria.bodyAlignment > 0.7 &&
      criteria.armPosition > 0.75 &&
      criteria.coreEngagement > 0.6 &&
      overallConfidence > 0.7;

    return {
      criteria,
      overallConfidence: Math.min(overallConfidence, 1),
      isValidPlank,
      feedback: generatePlankFeedback(criteria)
    };
  };

  // Generate specific feedback for plank form
  const generatePlankFeedback = (criteria: any) => {
    const issues = [];
    
    if (criteria.bodyAlignment < 0.7) {
      issues.push("Keep your body straight - avoid sagging hips");
    }
    if (criteria.armPosition < 0.75) {
      issues.push("Position arms directly under shoulders");
    }
    if (criteria.coreEngagement < 0.6) {
      issues.push("Engage your core muscles more");
    }
    if (criteria.legPosition < 0.6) {
      issues.push("Keep legs straight and together");
    }

    if (issues.length === 0) {
      return "Perfect plank form! Keep it up!";
    }
    
    return issues[0]; // Return the most critical feedback
  };

  // Generate feedback based on pose hold progress
  const generatePoseHoldFeedback = () => {
    if (poseHoldFrames === 0) {
      return "Position yourself for plank";
    } else if (poseHoldFrames < POSE_HOLD_THRESHOLD / 3) {
      return "Good start! Hold steady...";
    } else if (poseHoldFrames < (POSE_HOLD_THRESHOLD * 2) / 3) {
      return "Keep holding... almost stable!";
    } else {
      return "Perfect stability! Timer starting soon...";
    }
  };

  // Enhanced MediaPipe pose detection function with reliable plank analysis
  const detectPlankPose = (landmarks: PoseKeypoint[]): PoseDetectionResult => {
    // MediaPipe pose landmarks indices
    const LEFT_SHOULDER = 11;
    const RIGHT_SHOULDER = 12;
    const LEFT_ELBOW = 13;
    const RIGHT_ELBOW = 14;
    const LEFT_WRIST = 15;
    const RIGHT_WRIST = 16;
    const LEFT_HIP = 23;
    const RIGHT_HIP = 24;
    const LEFT_KNEE = 25;
    const RIGHT_KNEE = 26;
    const LEFT_ANKLE = 27;
    const RIGHT_ANKLE = 28;

    if (!landmarks || landmarks.length < 33) {
      return { landmarks, isPlankPosition: false, confidence: 0 };
    }

    try {
      // Get key body points
      const leftShoulder = landmarks[LEFT_SHOULDER];
      const rightShoulder = landmarks[RIGHT_SHOULDER];
      const leftElbow = landmarks[LEFT_ELBOW];
      const rightElbow = landmarks[RIGHT_ELBOW];
      const leftWrist = landmarks[LEFT_WRIST];
      const rightWrist = landmarks[RIGHT_WRIST];
      const leftHip = landmarks[LEFT_HIP];
      const rightHip = landmarks[RIGHT_HIP];
      const leftKnee = landmarks[LEFT_KNEE];
      const rightKnee = landmarks[RIGHT_KNEE];
      const leftAnkle = landmarks[LEFT_ANKLE];
      const rightAnkle = landmarks[RIGHT_ANKLE];

      // Helper function to calculate angle between three points
      const calculateAngle = (p1: PoseKeypoint, p2: PoseKeypoint, p3: PoseKeypoint): number => {
        const v1 = { x: p1.x - p2.x, y: p1.y - p2.y };
        const v2 = { x: p3.x - p2.x, y: p3.y - p2.y };
        
        const dot = v1.x * v2.x + v1.y * v2.y;
        const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
        const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);
        
        if (mag1 === 0 || mag2 === 0) return 0;
        
        const cosAngle = dot / (mag1 * mag2);
        return Math.acos(Math.max(-1, Math.min(1, cosAngle))) * (180 / Math.PI);
      };

      // Helper function to calculate distance between two points
      const calculateDistance = (p1: PoseKeypoint, p2: PoseKeypoint): number => {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
      };

      // 1. Body Alignment Check (Shoulder-Hip-Ankle alignment)
      const shoulderMidpoint = {
        x: (leftShoulder.x + rightShoulder.x) / 2,
        y: (leftShoulder.y + rightShoulder.y) / 2
      };
      const hipMidpoint = {
        x: (leftHip.x + rightHip.x) / 2,
        y: (leftHip.y + rightHip.y) / 2
      };
      const ankleMidpoint = {
        x: (leftAnkle.x + rightAnkle.x) / 2,
        y: (leftAnkle.y + rightAnkle.y) / 2
      };

      // Calculate body line deviation (should be straight)
      const shoulderHipAngle = Math.abs(Math.atan2(
        hipMidpoint.y - shoulderMidpoint.y,
        hipMidpoint.x - shoulderMidpoint.x
      ) * (180 / Math.PI));
      
      const hipAnkleAngle = Math.abs(Math.atan2(
        ankleMidpoint.y - hipMidpoint.y,
        ankleMidpoint.x - hipMidpoint.x
      ) * (180 / Math.PI));

      const bodyAlignment = Math.abs(shoulderHipAngle - hipAnkleAngle) < 15; // Within 15 degrees
      const bodyAlignmentScore = Math.max(0, 1 - (Math.abs(shoulderHipAngle - hipAnkleAngle) / 30));

      // 2. Arm Position Check (Forearm plank)
      const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
      const rightElbowAngle = calculateAngle(rightShoulder, rightElbow, rightWrist);
      
      // For plank, elbows should be around 90 degrees (forearm plank) or 180 degrees (high plank)
      const isValidElbowAngle = (angle: number) => {
        return (angle > 70 && angle < 110) || (angle > 160 && angle < 200);
      };
      
      const armPositionValid = isValidElbowAngle(leftElbowAngle) && isValidElbowAngle(rightElbowAngle);
      const armPositionScore = armPositionValid ? 1 : 0.3;

      // 3. Core/Hip Position Check (no sagging)
      const shoulderHipDistance = Math.abs(shoulderMidpoint.y - hipMidpoint.y);
      const hipAnkleDistance = Math.abs(hipMidpoint.y - ankleMidpoint.y);
      
      // Hips shouldn't sag below or rise above the body line significantly
      const hipSagCheck = shoulderHipDistance < 0.1 && hipAnkleDistance < 0.1;
      const coreEngagementScore = hipSagCheck ? 1 : Math.max(0, 1 - (shoulderHipDistance + hipAnkleDistance) * 5);

      // 4. Leg Position Check (straight legs)
      const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
      const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
      
      // Legs should be relatively straight (160-200 degrees)
      const isLegStraight = (angle: number) => angle > 160 && angle < 200;
      const legPositionValid = isLegStraight(leftKneeAngle) && isLegStraight(rightKneeAngle);
      const legPositionScore = legPositionValid ? 1 : 0.5;

      // 5. Overall pose stability (check for trembling/movement)
      const wristDistance = calculateDistance(leftWrist, rightWrist);
      const ankleDistance = calculateDistance(leftAnkle, rightAnkle);
      
      // Reasonable distances for a stable plank
      const stabilityCheck = wristDistance > 0.2 && wristDistance < 0.8 && 
                           ankleDistance > 0.3 && ankleDistance < 1.2;
      const stabilityScore = stabilityCheck ? 1 : 0.6;

      // 6. Height/Orientation check (person should be horizontal-ish)
      const bodyHeight = Math.abs(shoulderMidpoint.y - ankleMidpoint.y);
      const bodyWidth = Math.abs(shoulderMidpoint.x - ankleMidpoint.x);
      const isHorizontalOriented = bodyWidth > bodyHeight * 0.5; // More horizontal than vertical
      const orientationScore = isHorizontalOriented ? 1 : 0.4;

      // Calculate weighted confidence score
      const weights = {
        bodyAlignment: 0.25,
        armPosition: 0.25,
        coreEngagement: 0.2,
        legPosition: 0.15,
        stability: 0.1,
        orientation: 0.05
      };

      const overallConfidence = 
        (bodyAlignmentScore * weights.bodyAlignment) +
        (armPositionScore * weights.armPosition) +
        (coreEngagementScore * weights.coreEngagement) +
        (legPositionScore * weights.legPosition) +
        (stabilityScore * weights.stability) +
        (orientationScore * weights.orientation);

      // Require multiple criteria to be met for valid plank
      const isPlankPosition = 
        bodyAlignment &&
        armPositionValid &&
        coreEngagementScore > 0.7 &&
        legPositionValid &&
        isHorizontalOriented &&
        overallConfidence > 0.8;

      // Update pose buffer for stability
      const newBuffer = [...stabilityBuffer, isPlankPosition].slice(-BUFFER_SIZE);
      setStabilityBuffer(newBuffer);

      // Check for pose stability - require consistent detection
      const stableFrames = newBuffer.filter(Boolean).length;
      const isStablePlank = stableFrames >= Math.floor(BUFFER_SIZE * 0.75);

      // Update pose hold counter
      if (isStablePlank) {
        setPoseHoldFrames(prev => prev + 1);
        setLastValidPose(new Date());
      } else {
        setPoseHoldFrames(0);
      }

      // Only consider it a valid plank if held for minimum duration
      const finalIsPlank = isStablePlank && poseHoldFrames >= POSE_HOLD_THRESHOLD;

      return {
        landmarks,
        isPlankPosition: finalIsPlank,
        confidence: Math.min(overallConfidence, 1)
      };

    } catch (error) {
      console.error('Enhanced pose detection error:', error);
      return { landmarks, isPlankPosition: false, confidence: 0 };
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  if (hasPermission === null) {
    return null;
  }

  if (hasPermission === false) {
    return (
      <Modal visible={visible} animationType="slide">
        <View style={styles.permissionContainer}>
          <IconSymbol name="camera.fill" size={64} color={Colors[colorScheme ?? 'light'].text} />
          <ThemedText type="title" style={styles.permissionTitle}>
            Camera Permission Required
          </ThemedText>
          <ThemedText style={styles.permissionText}>
            We need access to your camera to detect your plank pose using AR technology.
          </ThemedText>
          <TouchableOpacity 
            style={[styles.permissionButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
            onPress={() => Camera.requestCameraPermissionsAsync()}
          >
            <ThemedText style={styles.permissionButtonText}>Grant Permission</ThemedText>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        {/* Camera View */}
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="front"
        >
          {/* Overlay */}
          <View style={styles.overlay}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <IconSymbol name="xmark" size={24} color="white" />
              </TouchableOpacity>
              <ThemedText style={styles.headerTitle}>AR Plank Challenge</ThemedText>
              <View style={styles.headerSpacer} />
            </View>

            {/* Enhanced AR Pose Detection Indicator */}
            <View style={styles.arInterface}>
              <Animated.View style={[styles.poseIndicator, pulseAnimatedStyle]}>
                <View style={[
                  styles.poseCircle,
                  { 
                    backgroundColor: isInPlank ? 'rgba(76, 175, 80, 0.9)' : 'rgba(255, 87, 34, 0.9)',
                    borderColor: isInPlank ? '#4CAF50' : '#FF5722',
                    borderWidth: 3,
                    shadowColor: isInPlank ? '#4CAF50' : '#FF5722',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 0.8,
                    shadowRadius: 10,
                    elevation: 20
                  }
                ]}>
                  <View style={[
                    styles.poseInnerCircle,
                    { backgroundColor: isInPlank ? '#4CAF50' : '#FF5722' }
                  ]}>
                    <IconSymbol 
                      name={isInPlank ? "checkmark" : "figure.walk"} 
                      size={32} 
                      color="white" 
                    />
                  </View>
                </View>
                <View style={styles.poseTextContainer}>
                  <ThemedText style={[styles.poseText, { color: isInPlank ? '#4CAF50' : '#FF5722' }]}>
                    {isInPlank ? 'PERFECT PLANK!' : 'POSITION FOR PLANK'}
                  </ThemedText>
                  <ThemedText style={styles.poseSubtext}>
                    {poseFeedback}
                  </ThemedText>
                </View>
              </Animated.View>

              {/* AR Grid Overlay */}
              <View style={styles.arGrid}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <View
                    key={i}
                    style={[
                      styles.gridLine,
                      {
                        opacity: isInPlank ? 0.8 : 0.3,
                        backgroundColor: isInPlank ? '#4CAF50' : '#FFF',
                        top: (i * (SCREEN_HEIGHT / 12)) + 100
                      }
                    ]}
                  />
                ))}
                {Array.from({ length: 8 }).map((_, i) => (
                  <View
                    key={`v-${i}`}
                    style={[
                      styles.gridLineVertical,
                      {
                        opacity: isInPlank ? 0.8 : 0.3,
                        backgroundColor: isInPlank ? '#4CAF50' : '#FFF',
                        left: i * (SCREEN_WIDTH / 8)
                      }
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* Enhanced Confidence HUD */}
            <Animated.View style={[styles.confidenceHUD, confidenceAnimatedStyle]}>
              <View style={styles.hudContainer}>
                <View style={styles.confidenceSection}>
                  <ThemedText style={styles.hudLabel}>POSE ACCURACY</ThemedText>
                  <View style={styles.confidenceBarContainer}>
                    <View style={styles.confidenceBar}>
                      <Animated.View 
                        style={[
                          styles.confidenceFill,
                          { 
                            width: `${poseConfidence * 100}%`,
                            backgroundColor: poseConfidence > 0.8 ? '#00FF88' : poseConfidence > 0.6 ? '#FFD700' : '#FF4444'
                          }
                        ]}
                      />
                    </View>
                    <ThemedText style={[
                      styles.confidencePercentage,
                      { color: poseConfidence > 0.8 ? '#00FF88' : poseConfidence > 0.6 ? '#FFD700' : '#FF4444' }
                    ]}>
                      {Math.round(poseConfidence * 100)}%
                    </ThemedText>
                  </View>
                </View>

                {/* Pose Hold Progress */}
                {poseHoldFrames > 0 && poseHoldFrames < POSE_HOLD_THRESHOLD && (
                  <View style={styles.stabilitySection}>
                    <ThemedText style={styles.hudLabel}>STABILITY LOCK</ThemedText>
                    <View style={styles.stabilityBar}>
                      <View 
                        style={[
                          styles.stabilityFill,
                          { 
                            width: `${(poseHoldFrames / POSE_HOLD_THRESHOLD) * 100}%`,
                            backgroundColor: poseHoldFrames > POSE_HOLD_THRESHOLD * 0.7 ? '#00FF88' : '#00BFFF'
                          }
                        ]} 
                      />
                    </View>
                  </View>
                )}
              </View>
            </Animated.View>

            {/* Enhanced AR Countdown */}
            {showCountdown && (
              <View style={styles.arCountdownContainer}>
                <Animated.View style={[styles.countdownCircle, pulseAnimatedStyle]}>
                  <View style={styles.countdownInner}>
                    <ThemedText style={styles.countdownText}>{countdown}</ThemedText>
                  </View>
                  <View style={styles.countdownRings}>
                    <View style={[styles.countdownRing, styles.ring1]} />
                    <View style={[styles.countdownRing, styles.ring2]} />
                    <View style={[styles.countdownRing, styles.ring3]} />
                  </View>
                </Animated.View>
                <ThemedText style={styles.countdownLabel}>PREPARE FOR PLANK</ThemedText>
              </View>
            )}

            {/* Enhanced AR Timer Display */}
            {!showCountdown && (
              <View style={styles.arTimerDisplay}>
                <Animated.View style={[styles.timerHUD, timerAnimatedStyle]}>
                  <View style={styles.timerHeader}>
                    <ThemedText style={styles.timerLabel}>ACTIVE SESSION</ThemedText>
                    <View style={styles.recordingIndicator}>
                      <View style={styles.recordingDot} />
                      <ThemedText style={styles.recordingText}>REC</ThemedText>
                    </View>
                  </View>
                  <ThemedText style={styles.timerText}>
                    {formatTime(timer)}
                  </ThemedText>
                  <View style={styles.timerProgress}>
                    <View style={styles.progressTrack}>
                      <View 
                        style={[
                          styles.progressFill,
                          { width: `${Math.min((timer / 30) * 100, 100)}%` }
                        ]}
                      />
                    </View>
                    <ThemedText style={styles.timerProgressText}>
                      {Math.round(Math.min((timer / 30) * 100, 100))}% Complete
                    </ThemedText>
                  </View>
                </Animated.View>
              </View>
            )}

            {/* Enhanced AR Instructions Panel */}
            <View style={styles.arInstructionsPanel}>
              <View style={styles.instructionsHeader}>
                <IconSymbol name="info.circle.fill" size={16} color="#00FF88" />
                <ThemedText style={styles.instructionTitle}>FORM GUIDANCE</ThemedText>
              </View>
              <View style={styles.instructionsList}>
                <View style={styles.instructionItem}>
                  <View style={styles.instructionBullet} />
                  <ThemedText style={styles.instructionText}>Keep body aligned: shoulders to ankles</ThemedText>
                </View>
                <View style={styles.instructionItem}>
                  <View style={styles.instructionBullet} />
                  <ThemedText style={styles.instructionText}>Engage core muscles for stability</ThemedText>
                </View>
                <View style={styles.instructionItem}>
                  <View style={styles.instructionBullet} />
                  <ThemedText style={styles.instructionText}>Maintain steady breathing pattern</ThemedText>
                </View>
                <View style={styles.instructionItem}>
                  <View style={styles.instructionBullet} />
                  <ThemedText style={styles.instructionText}>Target: 30 seconds for completion</ThemedText>
                </View>
              </View>
            </View>
          </View>
        </CameraView>

        {/* Enhanced AR Success Animation */}
        {showSuccess && (
          <View style={styles.successOverlay}>
            <Animated.View style={[styles.arSuccessContainer, successAnimatedStyle]}>
              <View style={styles.successIconContainer}>
                <IconSymbol name="checkmark.circle.fill" size={80} color="#00FF88" />
                <View style={styles.successGlow} />
              </View>
              <LottieView
                source={require('../../assets/lottie/confetti-transparent.json')}
                autoPlay
                loop={false}
                style={styles.successLottie}
              />
              <ThemedText style={styles.arSuccessTitle}>MISSION ACCOMPLISHED</ThemedText>
              <View style={styles.successStats}>
                <View style={styles.statItem}>
                  <ThemedText style={styles.statLabel}>DURATION</ThemedText>
                  <ThemedText style={styles.statValue}>{formatTime(timer)}</ThemedText>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <ThemedText style={styles.statLabel}>REWARD</ThemedText>
                  <ThemedText style={styles.statValue}>{Math.floor(timer * 2)} coins</ThemedText>
                </View>
              </View>
              <TouchableOpacity style={styles.continueButton} onPress={() => onComplete(timer, Math.floor(timer * 2))}>
                <ThemedText style={styles.continueButtonText}>CONTINUE</ThemedText>
              </TouchableOpacity>
            </Animated.View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    padding: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSpacer: {
    width: 40,
  },
  poseIndicator: {
    alignItems: 'center',
    marginTop: 50,
  },
  poseCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  poseStatus: {
    fontSize: 32,
    color: 'white',
    fontWeight: 'bold',
  },
  poseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  confidenceMeter: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 40,
  },
  confidenceBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceText: {
    color: 'white',
    fontSize: 14,
    marginTop: 8,
  },
  countdownContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 72,
    fontWeight: 'bold',
    color: 'white',
  },
  countdownLabel: {
    fontSize: 18,
    color: 'white',
    marginTop: 10,
  },
  timerContainer: {
    position: 'absolute',
    top: '45%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    borderRadius: 15,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  timerLabel: {
    fontSize: 16,
    color: 'white',
    marginTop: 5,
  },
  instructions: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 10,
  },
  instructionTitle: {
    color: '#00FF88',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginLeft: 8,
  },
  instructionText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    flex: 1,
    fontWeight: '500',
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successContainer: {
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 30,
    borderRadius: 20,
    margin: 20,
  },
  successLottie: {
    width: 200,
    height: 200,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  successTime: {
    fontSize: 18,
    marginBottom: 5,
  },
  successCoins: {
    fontSize: 18,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  permissionTitle: {
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionText: {
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.8,
  },
  permissionButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    marginVertical: 8,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 12,
    marginBottom: 4,
    color: '#2196F3',
    fontWeight: '600',
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressIndicator: {
    height: '100%',
    borderRadius: 3,
  },

  // Enhanced AR Interface Styles
  arInterface: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },

  arGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },

  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    opacity: 0.3,
  },

  gridLineVertical: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    opacity: 0.3,
  },

  poseInnerCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  poseTextContainer: {
    alignItems: 'center',
    marginTop: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  poseSubtext: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Enhanced HUD Styles
  confidenceHUD: {
    position: 'absolute',
    top: 120,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
    shadowColor: '#00FF88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },

  hudContainer: {
    minWidth: 150,
  },

  confidenceSection: {
    marginBottom: 15,
  },

  stabilitySection: {
    marginTop: 10,
  },

  hudLabel: {
    color: '#00FF88',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
    textAlign: 'center',
  },

  confidenceBarContainer: {
    alignItems: 'center',
  },

  confidencePercentage: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },

  stabilityBar: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
  },

  stabilityFill: {
    height: '100%',
    borderRadius: 3,
  },

  // Enhanced AR Countdown Styles
  arCountdownContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -80 }, { translateY: -80 }],
    alignItems: 'center',
  },

  countdownCircle: {
    width: 160,
    height: 160,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  countdownInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 255, 136, 0.2)',
    borderWidth: 2,
    borderColor: '#00FF88',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  countdownRings: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  countdownRing: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: '#00FF88',
    borderRadius: 80,
  },

  ring1: {
    width: 120,
    height: 120,
    opacity: 0.8,
  },

  ring2: {
    width: 140,
    height: 140,
    opacity: 0.6,
  },

  ring3: {
    width: 160,
    height: 160,
    opacity: 0.4,
  },

  // Enhanced AR Timer Styles
  arTimerDisplay: {
    position: 'absolute',
    bottom: 180,
    left: 20,
    right: 20,
    alignItems: 'center',
  },

  timerHUD: {
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.5)',
    shadowColor: '#00FF88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 20,
    minWidth: 250,
  },

  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF4444',
    marginRight: 6,
  },

  recordingText: {
    color: '#FF4444',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },

  timerProgress: {
    marginTop: 15,
    alignItems: 'center',
  },

  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },

  progressFill: {
    height: '100%',
    backgroundColor: '#00FF88',
    borderRadius: 3,
  },

  timerProgressText: {
    color: '#00FF88',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // Enhanced AR Instructions Panel
  arInstructionsPanel: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    borderRadius: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
    shadowColor: '#00FF88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 15,
  },

  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  instructionsList: {
    gap: 8,
  },

  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  instructionBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#00FF88',
    marginRight: 12,
  },

  // Enhanced AR Success Overlay
  arSuccessContainer: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    padding: 40,
    borderRadius: 25,
    margin: 20,
    borderWidth: 2,
    borderColor: '#00FF88',
    shadowColor: '#00FF88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 25,
  },

  successIconContainer: {
    position: 'relative',
    marginBottom: 20,
  },

  successGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#00FF88',
    opacity: 0.2,
    top: -20,
    left: -20,
  },

  arSuccessTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00FF88',
    marginBottom: 25,
    letterSpacing: 2,
    textAlign: 'center',
  },

  successStats: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: 'rgba(0, 255, 136, 0.1)',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 136, 0.3)',
  },

  statItem: {
    alignItems: 'center',
    flex: 1,
  },

  statLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 8,
  },

  statValue: {
    color: '#00FF88',
    fontSize: 18,
    fontWeight: 'bold',
  },

  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(0, 255, 136, 0.3)',
    marginHorizontal: 20,
  },

  continueButton: {
    backgroundColor: '#00FF88',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#00FF88',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },

  continueButtonText: {
    color: 'black',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
});