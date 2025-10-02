import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withDelay,
  interpolate
} from 'react-native-reanimated';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { dummyKPIMetrics, dummyCommunityChallenge } from '@/services/dummyData';
import { KPIMetrics, CommunityChallenge } from '@/types/app';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const [metrics, setMetrics] = useState<KPIMetrics>(dummyKPIMetrics[0]);
  const [communityChallenge, setCommunityChallenge] = useState<CommunityChallenge>(dummyCommunityChallenge);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  const chartScale = useSharedValue(0);
  const kpiScale = useSharedValue(0);
  const communityScale = useSharedValue(0);

  const chartAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: chartScale.value }],
    opacity: chartScale.value,
  }));

  const kpiAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: kpiScale.value }],
    opacity: kpiScale.value,
  }));

  const communityAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: communityScale.value }],
    opacity: communityScale.value,
  }));

  useEffect(() => {
    // Animate elements on load
    chartScale.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 150 }));
    kpiScale.value = withDelay(400, withSpring(1, { damping: 15, stiffness: 150 }));
    communityScale.value = withDelay(600, withSpring(1, { damping: 15, stiffness: 150 }));
  }, []);

  const getMetricColor = (value: number, max: number) => {
    const percentage = value / max;
    if (percentage >= 0.8) return '#4CAF50';
    if (percentage >= 0.6) return '#FF9800';
    return '#F44336';
  };

  const ProgressChart = ({ data, title, color }: { data: number[]; title: string; color: string }) => {
    const maxValue = Math.max(...data);
    
    return (
      <View style={styles.chartContainer}>
        <ThemedText style={styles.chartTitle}>{title}</ThemedText>
        <View style={styles.chart}>
          {data.map((value, index) => {
            const height = (value / maxValue) * 80;
            return (
              <View key={index} style={styles.barContainer}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: height,
                      backgroundColor: color,
                    },
                  ]}
                />
                <ThemedText style={styles.barLabel}>
                  {index + 1}
                </ThemedText>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  const CircularProgress = ({ value, max, color, label }: { value: number; max: number; color: string; label: string }) => {
    const percentage = (value / max) * 100;
    const radius = 45;
    const strokeWidth = 8;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    return (
      <View style={styles.circularProgress}>
        <View style={styles.progressCircle}>
          <View style={[styles.progressBackground, { borderColor: color + '20' }]} />
          <View 
            style={[
              styles.progressForeground, 
              { 
                borderColor: color,
                transform: [{ rotate: `${percentage * 3.6}deg` }]
              }
            ]} 
          />
          <View style={styles.progressCenter}>
            <ThemedText style={[styles.progressValue, { color }]}>
              {Math.round(percentage)}%
            </ThemedText>
          </View>
        </View>
        <ThemedText style={styles.progressLabel}>{label}</ThemedText>
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type="title">Analytics Dashboard 📊</ThemedText>
        <ThemedText style={styles.subtitle}>
          Track your wellness journey and app engagement
        </ThemedText>
      </ThemedView>

      {/* Time Frame Selector */}
      <ThemedView style={styles.timeframeSelector}>
        {['daily', 'weekly', 'monthly'].map((timeframe) => (
          <TouchableOpacity
            key={timeframe}
            style={[
              styles.timeframeButton,
              selectedTimeframe === timeframe && {
                backgroundColor: Colors[colorScheme ?? 'light'].tint,
              },
            ]}
            onPress={() => setSelectedTimeframe(timeframe as any)}
          >
            <ThemedText
              style={[
                styles.timeframeText,
                selectedTimeframe === timeframe && { color: 'white' },
              ]}
            >
              {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>

      {/* Key Metrics */}
      <Animated.View style={[styles.section, kpiAnimatedStyle]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Key Performance Indicators</ThemedText>
        
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, { backgroundColor: '#E3F2FD' }]}>
            <IconSymbol name="person.3" size={32} color="#2196F3" />
            <ThemedText style={styles.metricNumber}>
              {metrics.dau.toLocaleString()}
            </ThemedText>
            <ThemedText style={styles.metricLabel}>Daily Active Users</ThemedText>
            <View style={styles.metricChange}>
              <IconSymbol name="arrow.up" size={12} color="#4CAF50" />
              <ThemedText style={[styles.changeText, { color: '#4CAF50' }]}>
                +5.2%
              </ThemedText>
            </View>
          </View>

          <View style={[styles.metricCard, { backgroundColor: '#E8F5E8' }]}>
            <IconSymbol name="calendar" size={32} color="#4CAF50" />
            <ThemedText style={styles.metricNumber}>
              {(metrics.mau / 1000).toFixed(1)}K
            </ThemedText>
            <ThemedText style={styles.metricLabel}>Monthly Active Users</ThemedText>
            <View style={styles.metricChange}>
              <IconSymbol name="arrow.up" size={12} color="#4CAF50" />
              <ThemedText style={[styles.changeText, { color: '#4CAF50' }]}>
                +12.8%
              </ThemedText>
            </View>
          </View>

          <View style={[styles.metricCard, { backgroundColor: '#FFF3E0' }]}>
            <IconSymbol name="flame.fill" size={32} color="#FF9800" />
            <ThemedText style={styles.metricNumber}>
              {metrics.averageStreak.toFixed(1)}
            </ThemedText>
            <ThemedText style={styles.metricLabel}>Average Streak</ThemedText>
            <View style={styles.metricChange}>
              <IconSymbol name="arrow.up" size={12} color="#4CAF50" />
              <ThemedText style={[styles.changeText, { color: '#4CAF50' }]}>
                +0.4
              </ThemedText>
            </View>
          </View>

          <View style={[styles.metricCard, { backgroundColor: '#F3E5F5' }]}>
            <IconSymbol name="percent" size={32} color="#9C27B0" />
            <ThemedText style={styles.metricNumber}>
              {metrics.retentionRate}%
            </ThemedText>
            <ThemedText style={styles.metricLabel}>Retention Rate</ThemedText>
            <View style={styles.metricChange}>
              <IconSymbol name="arrow.up" size={12} color="#4CAF50" />
              <ThemedText style={[styles.changeText, { color: '#4CAF50' }]}>
                +3%
              </ThemedText>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Feature Adoption */}
      <Animated.View style={[styles.section, chartAnimatedStyle]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Feature Adoption</ThemedText>
        
        <View style={styles.adoptionGrid}>
          <CircularProgress
            value={metrics.featureAdoption.yoga}
            max={100}
            color="#FF6B6B"
            label="Yoga"
          />
          <CircularProgress
            value={metrics.featureAdoption.meditation}
            max={100}
            color="#4ECDC4"
            label="Meditation"
          />
          <CircularProgress
            value={metrics.featureAdoption.insurance}
            max={100}
            color="#45B7D1"
            label="Insurance"
          />
          <CircularProgress
            value={metrics.featureAdoption.chat}
            max={100}
            color="#96CEB4"
            label="AI Chat"
          />
        </View>
      </Animated.View>

      {/* Usage Trends */}
      <Animated.View style={[styles.section, chartAnimatedStyle]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Usage Trends</ThemedText>
        
        <View style={styles.trendsContainer}>
          <ProgressChart
            data={[1200, 1180, 1350, 1250, 1400, 1300, 1250]}
            title="Daily Active Users"
            color="#2196F3"
          />
          
          <View style={styles.trendsList}>
            <View style={styles.trendItem}>
              <View style={styles.trendIcon}>
                <IconSymbol name="arrow.up" size={16} color="#4CAF50" />
              </View>
              <View style={styles.trendContent}>
                <ThemedText style={styles.trendTitle}>Peak Usage Hours</ThemedText>
                <ThemedText style={styles.trendValue}>7-9 AM & 6-8 PM</ThemedText>
              </View>
            </View>
            
            <View style={styles.trendItem}>
              <View style={styles.trendIcon}>
                <IconSymbol name="clock" size={16} color="#FF9800" />
              </View>
              <View style={styles.trendContent}>
                <ThemedText style={styles.trendTitle}>Avg. Session Duration</ThemedText>
                <ThemedText style={styles.trendValue}>12.5 minutes</ThemedText>
              </View>
            </View>
            
            <View style={styles.trendItem}>
              <View style={styles.trendIcon}>
                <IconSymbol name="repeat" size={16} color="#9C27B0" />
              </View>
              <View style={styles.trendContent}>
                <ThemedText style={styles.trendTitle}>Return Rate</ThemedText>
                <ThemedText style={styles.trendValue}>78.5%</ThemedText>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Community Challenge */}
      <Animated.View style={[styles.section, communityAnimatedStyle]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Global Community Challenge</ThemedText>
        
        <View style={styles.communityCard}>
          <View style={styles.communityHeader}>
            <IconSymbol name="globe" size={32} color="#4CAF50" />
            <View style={styles.communityInfo}>
              <ThemedText type="defaultSemiBold">{communityChallenge.title}</ThemedText>
              <ThemedText style={styles.communityDescription}>
                {communityChallenge.description}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.communityStats}>
            <View style={styles.communityStat}>
              <ThemedText style={styles.communityStatNumber}>
                {communityChallenge.participants.toLocaleString()}
              </ThemedText>
              <ThemedText style={styles.communityStatLabel}>Participants</ThemedText>
            </View>
            
            <View style={styles.communityStat}>
              <ThemedText style={styles.communityStatNumber}>
                {((communityChallenge.progress / communityChallenge.target) * 100).toFixed(1)}%
              </ThemedText>
              <ThemedText style={styles.communityStatLabel}>Complete</ThemedText>
            </View>
            
            <View style={styles.communityStat}>
              <ThemedText style={styles.communityStatNumber}>
                {Math.ceil((new Date(communityChallenge.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}
              </ThemedText>
              <ThemedText style={styles.communityStatLabel}>Days Left</ThemedText>
            </View>
          </View>
          
          <View style={styles.communityProgress}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${(communityChallenge.progress / communityChallenge.target) * 100}%`,
                    backgroundColor: '#4CAF50' 
                  }
                ]} 
              />
            </View>
            <ThemedText style={styles.communityProgressText}>
              {communityChallenge.progress.toLocaleString()} / {communityChallenge.target.toLocaleString()} steps
            </ThemedText>
          </View>
        </View>
      </Animated.View>

      {/* Business Impact */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Business Impact</ThemedText>
        
        <View style={styles.impactGrid}>
          <View style={styles.impactCard}>
            <IconSymbol name="shield" size={24} color="#4CAF50" />
            <ThemedText style={styles.impactTitle}>Policy Engagement</ThemedText>
            <ThemedText style={styles.impactValue}>{metrics.policyEngagement}%</ThemedText>
            <ThemedText style={styles.impactChange}>+5% this month</ThemedText>
          </View>
          
          <View style={styles.impactCard}>
            <IconSymbol name="arrow.up.circle" size={24} color="#2196F3" />
            <ThemedText style={styles.impactTitle}>Premium Optimization</ThemedText>
            <ThemedText style={styles.impactValue}>$2.3M</ThemedText>
            <ThemedText style={styles.impactChange}>Potential savings</ThemedText>
          </View>
          
          <View style={styles.impactCard}>
            <IconSymbol name="heart" size={24} color="#FF6B6B" />
            <ThemedText style={styles.impactTitle}>Health Score</ThemedText>
            <ThemedText style={styles.impactValue}>8.2/10</ThemedText>
            <ThemedText style={styles.impactChange}>Community avg</ThemedText>
          </View>
          
          <View style={styles.impactCard}>
            <IconSymbol name="crown" size={24} color="#FFD700" />
            <ThemedText style={styles.impactTitle}>User Satisfaction</ThemedText>
            <ThemedText style={styles.impactValue}>4.8★</ThemedText>
            <ThemedText style={styles.impactChange}>App store rating</ThemedText>
          </View>
        </View>
      </ThemedView>
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
  timeframeSelector: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 4,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  timeframeText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    marginBottom: 16,
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
    textAlign: 'center',
  },
  metricChange: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  changeText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  adoptionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  circularProgress: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressCircle: {
    width: 100,
    height: 100,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBackground: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 8,
  },
  progressForeground: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 8,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  progressCenter: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressLabel: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  trendsContainer: {
    gap: 20,
  },
  chartContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    padding: 16,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 100,
  },
  barContainer: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 20,
    borderRadius: 2,
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 10,
    opacity: 0.7,
  },
  trendsList: {
    gap: 12,
  },
  trendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
  },
  trendIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  trendContent: {
    flex: 1,
  },
  trendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  trendValue: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  communityCard: {
    backgroundColor: '#F0F8F0',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  communityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  communityInfo: {
    marginLeft: 16,
    flex: 1,
  },
  communityDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginTop: 4,
  },
  communityStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  communityStat: {
    alignItems: 'center',
  },
  communityStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  communityStatLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  communityProgress: {
    marginTop: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  communityProgressText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  impactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  impactCard: {
    width: '48%',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    marginBottom: 12,
  },
  impactTitle: {
    fontSize: 12,
    opacity: 0.8,
    marginTop: 8,
    textAlign: 'center',
  },
  impactValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  impactChange: {
    fontSize: 10,
    opacity: 0.6,
    marginTop: 2,
  },
});