import { Colors } from '@/constants/theme';
import { HealthMetrics } from '@/types/app';
import { hp, rfs, wp } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import {
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface TodaysProgressGridProps {
  healthMetrics: HealthMetrics;
}

interface ProgressItem {
  id: string;
  title: string;
  current: number;
  target: number;
  unit: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export default function TodaysProgressGrid({ healthMetrics }: TodaysProgressGridProps) {
  const progressItems: ProgressItem[] = [
    {
      id: 'steps',
      title: 'Steps',
      current: healthMetrics.steps,
      target: 10000,
      unit: '',
      icon: 'footsteps',
      color: '#4CAF50',
    },
    {
      id: 'water',
      title: 'Water',
      current: healthMetrics.waterIntake,
      target: 8,
      unit: 'glasses',
      icon: 'water',
      color: '#2196F3',
    },
    {
      id: 'sleep',
      title: 'Sleep',
      current: healthMetrics.sleepHours,
      target: 8,
      unit: 'hrs',
      icon: 'moon',
      color: '#9C27B0',
    },
    {
      id: 'meditation',
      title: 'Meditation',
      current: healthMetrics.meditationMinutes,
      target: 30,
      unit: 'min',
      icon: 'leaf',
      color: '#FF9800',
    },
  ];

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const formatValue = (value: number, unit: string) => {
    if (unit === '') {
      return value.toLocaleString();
    }
    return `${value}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Today's Progress</Text>
        <Text style={styles.subtitle}>Keep up the great work! 💪</Text>
      </View>
      
      <View style={styles.grid}>
        {progressItems.map((item) => {
          const percentage = getProgressPercentage(item.current, item.target);
          const isCompleted = percentage >= 100;
          
          return (
            <View key={item.id} style={styles.gridItem}>
              <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                <Ionicons name={item.icon} size={wp(6)} color={item.color} />
              </View>
              
              <Text style={styles.itemTitle}>{item.title}</Text>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${percentage}%`,
                        backgroundColor: item.color 
                      }
                    ]} 
                  />
                </View>
                
                <View style={styles.valueContainer}>
                  <Text style={styles.currentValue}>
                    {formatValue(item.current, item.unit)}
                  </Text>
                  <Text style={styles.targetValue}>
                    /{item.target} {item.unit}
                  </Text>
                </View>
              </View>
              
              {isCompleted && (
                <View style={styles.completedBadge}>
                  <Ionicons name="checkmark-circle" size={wp(4)} color="#4CAF50" />
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    margin: wp(4),
    borderRadius: wp(4),
    padding: wp(4),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    marginBottom: hp(2),
    alignItems: 'center',
  },
  title: {
    fontSize: rfs(18),
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: rfs(12),
    color: Colors.light.tabIconDefault,
    marginTop: hp(0.5),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    backgroundColor: Colors.light.background,
    borderRadius: wp(3),
    padding: wp(3),
    marginBottom: hp(2),
    alignItems: 'center',
    position: 'relative',
  },
  iconContainer: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  itemTitle: {
    fontSize: rfs(12),
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: hp(1),
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: hp(0.8),
    backgroundColor: '#E0E0E0',
    borderRadius: hp(0.4),
    overflow: 'hidden',
    marginBottom: hp(0.5),
  },
  progressFill: {
    height: '100%',
    borderRadius: hp(0.4),
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currentValue: {
    fontSize: rfs(14),
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  targetValue: {
    fontSize: rfs(10),
    color: Colors.light.tabIconDefault,
  },
  completedBadge: {
    position: 'absolute',
    top: wp(1),
    right: wp(1),
  },
});