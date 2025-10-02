import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { dummyYogaPoses } from '@/services/dummyData';
import { YogaPose } from '@/types/app';
import { triggerHapticFeedback } from '@/utils/animations';
import { rfs, rs, useResponsiveDimensions } from '@/utils/responsive';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import Animated from 'react-native-reanimated';

interface ARYogaStudioProps {
  onStartPose: (pose: YogaPose) => void;
  onStartARPlank: () => void;
  poseAnimatedStyle: any;
}

export const ARYogaStudio: React.FC<ARYogaStudioProps> = ({
  onStartPose,
  onStartARPlank,
  poseAnimatedStyle,
}) => {
  const colorScheme = useColorScheme();
  const { deviceInfo } = useResponsiveDimensions();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#F44336';
      default: return Colors[colorScheme ?? 'light'].tint;
    }
  };

  const startARPlankChallenge = () => {
    onStartARPlank();
    triggerHapticFeedback('medium');
  };

  return (
    <ThemedView style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText type="subtitle">🧘 AR Yoga Studio</ThemedText>
        <View style={styles.arBadge}>
          <IconSymbol name="arkit" size={rfs(16)} color="white" />
          <ThemedText style={styles.arText}>AR</ThemedText>
        </View>
      </View>
      
      <ThemedText style={styles.sectionDescription}>
        Practice yoga with real-time pose detection and instant feedback using advanced AR technology
      </ThemedText>

      {/* AR Plank Challenge - Featured */}
      <Animated.View style={[styles.featuredCard, poseAnimatedStyle]}>
        <View style={styles.featuredHeader}>
          <View style={styles.featuredBadge}>
            <ThemedText style={styles.featuredBadgeText}>FEATURED</ThemedText>
          </View>
          <TouchableOpacity 
            style={[styles.startButton, { backgroundColor: '#FF6B6B' }]}
            onPress={startARPlankChallenge}
          >
            <IconSymbol name="play.fill" size={rfs(20)} color="white" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.poseInfo}>
          <ThemedText type="defaultSemiBold" style={styles.featuredTitle}>
            🏋️ AR Plank Challenge
          </ThemedText>
          <View style={styles.poseMeta}>
            <View style={[styles.difficultyBadge, { backgroundColor: '#FF6B6B' }]}>
              <ThemedText style={styles.difficultyText}>CHALLENGE</ThemedText>
            </View>
            <ThemedText style={styles.duration}>30s Target</ThemedText>
          </View>
        </View>
        
        <ThemedText style={styles.featuredDescription}>
          Test your core strength with AI-powered pose detection. Hold the perfect plank position while our camera tracks your form in real-time!
        </ThemedText>
        
        <View style={styles.featuresGrid}>
          <View style={styles.featureItem}>
            <IconSymbol name="camera.viewfinder" size={rfs(16)} color="#FF6B6B" />
            <ThemedText style={styles.featureText}>Real-time Detection</ThemedText>
          </View>
          <View style={styles.featureItem}>
            <IconSymbol name="chart.line.uptrend.xyaxis" size={rfs(16)} color="#FF6B6B" />
            <ThemedText style={styles.featureText}>Form Feedback</ThemedText>
          </View>
          <View style={styles.featureItem}>
            <IconSymbol name="timer" size={rfs(16)} color="#FF6B6B" />
            <ThemedText style={styles.featureText}>Auto Timer</ThemedText>
          </View>
          <View style={styles.featureItem}>
            <IconSymbol name="star.fill" size={rfs(16)} color="#FFD700" />
            <ThemedText style={styles.featureText}>2 Coins/Sec</ThemedText>
          </View>
        </View>
      </Animated.View>

      {/* Yoga Poses Grid */}
      <View style={styles.posesHeader}>
        <ThemedText type="defaultSemiBold" style={styles.posesTitle}>
          Available Poses
        </ThemedText>
        <ThemedText style={styles.posesSubtitle}>
          Choose from our curated selection of yoga poses
        </ThemedText>
      </View>

      <View style={styles.posesGrid}>
        {dummyYogaPoses.map((pose) => (
          <Animated.View key={pose.id} style={[styles.poseCard, poseAnimatedStyle]}>
            <View style={styles.poseCardHeader}>
              <View style={styles.poseCardInfo}>
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
                style={[styles.startButton, { backgroundColor: getDifficultyColor(pose.difficulty) }]}
                onPress={() => onStartPose(pose)}
              >
                <IconSymbol name="play.fill" size={rfs(16)} color="white" />
              </TouchableOpacity>
            </View>
            
            <ThemedText style={styles.poseDescription}>
              {pose.description}
            </ThemedText>
            
            <View style={styles.benefitsContainer}>
              <ThemedText style={styles.benefitsTitle}>Key Benefits:</ThemedText>
              <View style={styles.benefitsList}>
                {pose.benefits.slice(0, 2).map((benefit, index) => (
                  <View key={index} style={styles.benefitItem}>
                    <View style={styles.benefitBullet} />
                    <ThemedText style={styles.benefitText}>{benefit}</ThemedText>
                  </View>
                ))}
              </View>
            </View>
          </Animated.View>
        ))}
      </View>

      {/* AR Technology Info */}
      <View style={styles.techInfo}>
        <View style={styles.techHeader}>
          <IconSymbol name="sparkles" size={rfs(20)} color="#FF6B6B" />
          <ThemedText style={styles.techTitle}>Powered by Advanced AR</ThemedText>
        </View>
        <ThemedText style={styles.techDescription}>
          Our yoga studio uses MediaPipe and computer vision to analyze your poses in real-time, 
          providing instant feedback to help you achieve perfect form and maximize your practice.
        </ThemedText>
      </View>
    </ThemedView>
  );
};

const styles = {
  section: {
    margin: rs(20),
    padding: rs(16),
    borderRadius: rs(12),
  },
  sectionHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: rs(8),
  },
  sectionDescription: {
    fontSize: rfs(14),
    opacity: 0.7,
    marginBottom: rs(20),
    lineHeight: rfs(20),
  },
  arBadge: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: rs(8),
    paddingVertical: rs(4),
    borderRadius: rs(12),
  },
  arText: {
    color: 'white',
    fontSize: rfs(12),
    fontWeight: 'bold' as const,
    marginLeft: rs(4),
  },
  featuredCard: {
    padding: rs(20),
    borderRadius: rs(16),
    borderWidth: 2,
    borderColor: '#FF6B6B',
    marginBottom: rs(24),
    backgroundColor: 'rgba(255, 107, 107, 0.05)',
  },
  featuredHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: rs(16),
  },
  featuredBadge: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: rs(8),
    paddingVertical: rs(4),
    borderRadius: rs(8),
  },
  featuredBadgeText: {
    color: 'white',
    fontSize: rfs(10),
    fontWeight: 'bold' as const,
    letterSpacing: 1,
  },
  featuredTitle: {
    fontSize: rfs(20),
    marginBottom: rs(8),
    color: '#FF6B6B',
  },
  featuredDescription: {
    fontSize: rfs(14),
    opacity: 0.8,
    marginBottom: rs(16),
    lineHeight: rfs(20),
  },
  featuresGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between' as const,
  },
  featureItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    width: '48%',
    marginBottom: rs(8),
  },
  featureText: {
    fontSize: rfs(12),
    marginLeft: rs(6),
    fontWeight: '500' as const,
  },
  posesHeader: {
    marginBottom: rs(16),
  },
  posesTitle: {
    fontSize: rfs(18),
    marginBottom: rs(4),
  },
  posesSubtitle: {
    fontSize: rfs(14),
    opacity: 0.6,
  },
  posesGrid: {
    gap: rs(16),
  },
  poseCard: {
    padding: rs(16),
    borderRadius: rs(12),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },
  poseCardHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: rs(12),
  },
  poseCardInfo: {
    flex: 1,
  },
  poseInfo: {
    flex: 1,
  },
  poseName: {
    fontSize: rfs(16),
    marginBottom: rs(8),
  },
  poseMeta: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  difficultyBadge: {
    paddingHorizontal: rs(8),
    paddingVertical: rs(4),
    borderRadius: rs(8),
    marginRight: rs(8),
  },
  difficultyText: {
    color: 'white',
    fontSize: rfs(10),
    fontWeight: 'bold' as const,
  },
  duration: {
    fontSize: rfs(12),
    opacity: 0.7,
    fontWeight: '500' as const,
  },
  startButton: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  poseDescription: {
    fontSize: rfs(14),
    opacity: 0.8,
    marginBottom: rs(12),
    lineHeight: rfs(18),
  },
  benefitsContainer: {
    marginTop: rs(8),
  },
  benefitsTitle: {
    fontSize: rfs(12),
    fontWeight: 'bold' as const,
    marginBottom: rs(6),
    color: '#666',
  },
  benefitsList: {
    gap: rs(4),
  },
  benefitItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  benefitBullet: {
    width: rs(4),
    height: rs(4),
    borderRadius: rs(2),
    backgroundColor: '#4CAF50',
    marginRight: rs(8),
  },
  benefitText: {
    fontSize: rfs(12),
    opacity: 0.7,
    flex: 1,
  },
  techInfo: {
    marginTop: rs(24),
    padding: rs(16),
    backgroundColor: '#F8F9FA',
    borderRadius: rs(12),
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  techHeader: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: rs(8),
  },
  techTitle: {
    fontSize: rfs(16),
    fontWeight: 'bold' as const,
    marginLeft: rs(8),
    color: '#FF6B6B',
  },
  techDescription: {
    fontSize: rfs(13),
    opacity: 0.7,
    lineHeight: rfs(18),
  },
};