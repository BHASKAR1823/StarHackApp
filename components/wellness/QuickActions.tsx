import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
    getCardWidth,
    getGridColumns,
    rfs,
    rs,
    useResponsiveDimensions
} from '@/utils/responsive';
import React from 'react';
import { TouchableOpacity, View } from 'react-native';

interface QuickActionsProps {
  onActionPress: (action: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onActionPress,
}) => {
  const { deviceInfo } = useResponsiveDimensions();

  const actions = [
    {
      id: 'meditation',
      title: '5-Min Meditation',
      subtitle: 'Quick mindfulness',
      icon: 'timer',
      color: '#2196F3',
      backgroundColor: '#E3F2FD',
    },
    {
      id: 'walk',
      title: 'Daily Walk',
      subtitle: 'Track your steps',
      icon: 'figure.run',
      color: '#4CAF50',
      backgroundColor: '#E8F5E8',
    },
    {
      id: 'brain-games',
      title: 'Brain Games',
      subtitle: 'Mental sharpness',
      icon: 'brain',
      color: '#FF9800',
      backgroundColor: '#FFF3E0',
    },
    {
      id: 'journal',
      title: 'Mind Journal',
      subtitle: 'Daily reflection',
      icon: 'book.fill',
      color: '#9C27B0',
      backgroundColor: '#F3E5F5',
    },
    {
      id: 'workout',
      title: 'Quick Workout',
      subtitle: '15-min fitness',
      icon: 'figure.strengthtraining.functional',
      color: '#F44336',
      backgroundColor: '#FFEBEE',
    },
    {
      id: 'breathing',
      title: 'Breathing Exercise',
      subtitle: 'Calm your mind',
      icon: 'wind',
      color: '#00BCD4',
      backgroundColor: '#E0F2F1',
    },
  ];

  return (
    <ThemedView style={styles.section}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          ⚡ Quick Actions
        </ThemedText>
        <ThemedText style={styles.sectionSubtitle}>
          Start your wellness journey in minutes
        </ThemedText>
      </View>
      
      <View style={styles.actionsGrid}>
        {actions.map((action) => (
          <TouchableOpacity 
            key={action.id}
            style={[
              styles.actionCard, 
              { 
                backgroundColor: action.backgroundColor,
                width: getCardWidth(getGridColumns(deviceInfo.isTablet ? 3 : 2), rs(16))
              }
            ]}
            onPress={() => onActionPress(action.id)}
          >
            <View style={styles.iconContainer}>
              <IconSymbol 
                name={action.icon as any} 
                size={deviceInfo.isTablet ? rfs(32) : rfs(28)} 
                color={action.color} 
              />
            </View>
            <ThemedText style={styles.actionTitle}>{action.title}</ThemedText>
            <ThemedText style={styles.actionSubtitle}>{action.subtitle}</ThemedText>
            
            <View style={[styles.actionIndicator, { backgroundColor: action.color }]} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Coming Soon Actions */}
      <View style={styles.comingSoonSection}>
        <ThemedText style={styles.comingSoonTitle}>🚀 Coming Soon</ThemedText>
        <View style={styles.comingSoonGrid}>
          <View style={[styles.comingSoonCard, { opacity: 0.6 }]}>
            <IconSymbol name="heart.text.square" size={rfs(24)} color="#666" />
            <ThemedText style={styles.comingSoonText}>Mood Tracker</ThemedText>
          </View>
          <View style={[styles.comingSoonCard, { opacity: 0.6 }]}>
            <IconSymbol name="chart.bar.fill" size={rfs(24)} color="#666" />
            <ThemedText style={styles.comingSoonText}>Progress Reports</ThemedText>
          </View>
          <View style={[styles.comingSoonCard, { opacity: 0.6 }]}>
            <IconSymbol name="person.2.fill" size={rfs(24)} color="#666" />
            <ThemedText style={styles.comingSoonText}>Social Challenges</ThemedText>
          </View>
        </View>
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
  header: {
    marginBottom: rs(20),
  },
  sectionTitle: {
    marginBottom: rs(4),
  },
  sectionSubtitle: {
    fontSize: rfs(14),
    opacity: 0.6,
  },
  actionsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between' as const,
    gap: rs(12),
  },
  actionCard: {
    padding: rs(16),
    borderRadius: rs(12),
    alignItems: 'center' as const,
    marginBottom: rs(12),
    minHeight: rs(120),
    justifyContent: 'center' as const,
    position: 'relative' as const,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginBottom: rs(12),
  },
  actionTitle: {
    fontSize: rfs(14),
    fontWeight: 'bold' as const,
    marginBottom: rs(4),
    textAlign: 'center' as const,
  },
  actionSubtitle: {
    fontSize: rfs(12),
    opacity: 0.7,
    textAlign: 'center' as const,
  },
  actionIndicator: {
    position: 'absolute' as const,
    top: rs(8),
    right: rs(8),
    width: rs(8),
    height: rs(8),
    borderRadius: rs(4),
  },
  comingSoonSection: {
    marginTop: rs(32),
    padding: rs(16),
    backgroundColor: '#F8F9FA',
    borderRadius: rs(12),
    borderWidth: 1,
    borderColor: '#E9ECEF',
    borderStyle: 'dashed' as const,
  },
  comingSoonTitle: {
    fontSize: rfs(16),
    fontWeight: 'bold' as const,
    marginBottom: rs(12),
    textAlign: 'center' as const,
    color: '#666',
  },
  comingSoonGrid: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    flexWrap: 'wrap' as const,
  },
  comingSoonCard: {
    alignItems: 'center' as const,
    padding: rs(12),
    minWidth: rs(80),
  },
  comingSoonText: {
    fontSize: rfs(10),
    marginTop: rs(6),
    textAlign: 'center' as const,
    color: '#666',
    fontWeight: '500' as const,
  },
};