import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { HealthMetrics } from '@/types/app';
import {
    getCardWidth,
    getGridColumns,
    hp,
    rfs,
    rs,
    useResponsiveDimensions
} from '@/utils/responsive';
import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

interface WellnessOverviewProps {
  healthMetrics: HealthMetrics;
  sessionCoins: number;
  progressAnimatedStyle: any;
  coinAnimatedStyle: any;
  wellnessScore: number;
  getScoreColor: (score: number) => string;
  getScoreLabel: (score: number) => string;
}

export const WellnessOverview: React.FC<WellnessOverviewProps> = ({
  healthMetrics,
  sessionCoins,
  progressAnimatedStyle,
  coinAnimatedStyle,
  wellnessScore,
  getScoreColor,
  getScoreLabel,
}) => {
  const colorScheme = useColorScheme();
  const { deviceInfo } = useResponsiveDimensions();

  const getHealthProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <>
      {/* Header */}
      <ThemedView style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <ThemedText type="title">Wellness Hub 🧘‍♀️</ThemedText>
            <ThemedText style={styles.subtitle}>
              Your journey to better health starts here
            </ThemedText>
          </View>
          <View style={[styles.activoScore, { backgroundColor: getScoreColor(wellnessScore) + '20', borderColor: getScoreColor(wellnessScore) }]}>
            <ThemedText style={[styles.activoLabel, { color: getScoreColor(wellnessScore) }]}>ACTIVO</ThemedText>
            <ThemedText style={[styles.activoNumber, { color: getScoreColor(wellnessScore) }]}>{wellnessScore}</ThemedText>
          </View>
        </View>
      </ThemedView>

      {/* Combined Wellness Score */}
      <Animated.View style={[styles.scoreSection, progressAnimatedStyle]}>
        <View style={styles.scoreContainer}>
          <View style={[styles.scoreCircle, { borderColor: getScoreColor(wellnessScore) }]}>
            <ThemedText style={[styles.scoreNumber, { color: getScoreColor(wellnessScore) }]}>
              {wellnessScore}
            </ThemedText>
            <ThemedText style={styles.scoreOutOf}>/ 100</ThemedText>
          </View>
          <View style={styles.scoreInfo}>
            <ThemedText type="defaultSemiBold" style={styles.scoreTitle}>
              Wellness Score
            </ThemedText>
            <ThemedText style={[styles.scoreLabel, { color: getScoreColor(wellnessScore) }]}>
              {getScoreLabel(wellnessScore)}
            </ThemedText>
            <ThemedText style={styles.scoreDescription}>
              Based on your daily activities and goals
            </ThemedText>
          </View>
        </View>
        
        {/* Score Breakdown */}
        <View style={styles.scoreBreakdown}>
          <View style={styles.breakdownItem}>
            <IconSymbol name="figure.walk" size={rfs(16)} color="#2196F3" />
            <ThemedText style={styles.breakdownText}>Steps (25%)</ThemedText>
          </View>
          <View style={styles.breakdownItem}>
            <IconSymbol name="moon.fill" size={rfs(16)} color="#FF9800" />
            <ThemedText style={styles.breakdownText}>Sleep (25%)</ThemedText>
          </View>
          <View style={styles.breakdownItem}>
            <IconSymbol name="heart.fill" size={rfs(16)} color="#9C27B0" />
            <ThemedText style={styles.breakdownText}>Meditation (20%)</ThemedText>
          </View>
          <View style={styles.breakdownItem}>
            <IconSymbol name="drop.fill" size={rfs(16)} color="#4CAF50" />
            <ThemedText style={styles.breakdownText}>Hydration (15%)</ThemedText>
          </View>
          <View style={styles.breakdownItem}>
            <IconSymbol name="figure.strengthtraining.functional" size={rfs(16)} color="#F44336" />
            <ThemedText style={styles.breakdownText}>Workout (15%)</ThemedText>
          </View>
        </View>
      </Animated.View>

      {/* Today's Progress */}
      <Animated.View style={[styles.section, progressAnimatedStyle]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Today&apos;s Progress</ThemedText>
        
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { 
            backgroundColor: '#E3F2FD',
            width: getCardWidth(getGridColumns(2), rs(16))
          }]}>
            <IconSymbol name="figure.walk" size={deviceInfo.isTablet ? 32 : 24} color="#2196F3" />
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

          <View style={[styles.metricCard, { 
            backgroundColor: '#E8F5E8',
            width: getCardWidth(getGridColumns(2), rs(16))
          }]}>
            <IconSymbol name="drop.fill" size={deviceInfo.isTablet ? 32 : 24} color="#4CAF50" />
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

          <View style={[styles.metricCard, { 
            backgroundColor: '#FFF3E0',
            width: getCardWidth(getGridColumns(2), rs(16))
          }]}>
            <IconSymbol name="moon.fill" size={deviceInfo.isTablet ? 32 : 24} color="#FF9800" />
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

          <View style={[styles.metricCard, { 
            backgroundColor: '#F3E5F5',
            width: getCardWidth(getGridColumns(2), rs(16))
          }]}>
            <IconSymbol name="heart.fill" size={deviceInfo.isTablet ? 32 : 24} color="#9C27B0" />
            <ThemedText style={styles.metricNumber}>{healthMetrics.meditationMinutes}</ThemedText>
            <ThemedText style={styles.metricLabel}>Meditation</ThemedText>
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
    </>
  );
};

const styles = {
  header: {
    padding: rs(20),
  },
  headerTop: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
  },
  activoScore: {
    borderWidth: 2,
    borderRadius: rs(12),
    paddingHorizontal: rs(12),
    paddingVertical: rs(8),
    alignItems: 'center' as const,
    minWidth: rs(70),
  },
  activoLabel: {
    fontSize: rfs(10),
    fontWeight: 'bold' as const,
    letterSpacing: 1,
  },
  activoNumber: {
    fontSize: rfs(20),
    fontWeight: 'bold' as const,
  },
  subtitle: {
    fontSize: rfs(14),
    opacity: 0.7,
    marginTop: rs(4),
  },
  section: {
    margin: rs(20),
    padding: rs(16),
    borderRadius: rs(12),
  },
  sectionTitle: {
    marginBottom: rs(16),
  },
  metricsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between' as const,
    gap: rs(8),
  },
  metricCard: {
    padding: rs(16),
    borderRadius: rs(12),
    alignItems: 'center' as const,
    marginBottom: rs(12),
    minHeight: hp(12),
    justifyContent: 'center' as const,
  },
  metricNumber: {
    fontSize: rfs(24),
    fontWeight: 'bold' as const,
    marginTop: rs(8),
  },
  metricLabel: {
    fontSize: rfs(12),
    opacity: 0.7,
    marginTop: rs(4),
    textAlign: 'center' as const,
  },
  progressBar: {
    width: '100%',
    height: rs(4),
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: rs(2),
    marginTop: rs(8),
  },
  progressFill: {
    height: '100%',
    borderRadius: rs(2),
  },
  sessionStats: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginHorizontal: rs(20),
    padding: rs(12),
    backgroundColor: '#FFF8E1',
    borderRadius: rs(8),
    marginBottom: rs(10),
  },
  sessionText: {
    marginLeft: rs(8),
    fontWeight: 'bold' as const,
    color: '#F57F17',
  },
  // Wellness Score Styles
  scoreSection: {
    margin: rs(20),
    padding: rs(20),
    borderRadius: rs(16),
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  scoreContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    marginBottom: rs(16),
  },
  scoreCircle: {
    width: rs(80),
    height: rs(80),
    borderRadius: rs(40),
    borderWidth: 4,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    marginRight: rs(16),
  },
  scoreNumber: {
    fontSize: rfs(28),
    fontWeight: 'bold' as const,
    lineHeight: rfs(32),
  },
  scoreOutOf: {
    fontSize: rfs(12),
    opacity: 0.6,
    fontWeight: '500' as const,
  },
  scoreInfo: {
    flex: 1,
  },
  scoreTitle: {
    fontSize: rfs(18),
    marginBottom: rs(4),
  },
  scoreLabel: {
    fontSize: rfs(14),
    fontWeight: 'bold' as const,
    marginBottom: rs(4),
  },
  scoreDescription: {
    fontSize: rfs(12),
    opacity: 0.6,
    lineHeight: rfs(16),
  },
  scoreBreakdown: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between' as const,
    paddingTop: rs(16),
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  breakdownItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    width: '48%',
    marginBottom: rs(8),
  },
  breakdownText: {
    fontSize: rfs(11),
    marginLeft: rs(6),
    opacity: 0.7,
    fontWeight: '500' as const,
  },
};