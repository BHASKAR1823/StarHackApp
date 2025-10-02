import { Colors } from '@/constants/theme';
import { gamificationService } from '@/services/gamificationService';
import { triggerHapticFeedback } from '@/utils/animations';
import { hp, rfs, wp } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
    Animated,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface TopQuickActionsProps {
  onActionPress: (actionId: string) => void;
}

interface DailyTask {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  coins: number;
  isCompleted: boolean;
}

const DAILY_TASKS: Omit<DailyTask, 'isCompleted'>[] = [
  {
    id: 'water',
    title: 'Drink 8 Glasses of Water',
    description: 'Stay hydrated for better health',
    icon: 'water',
    color: '#2196F3',
    coins: 25,
  },
  {
    id: 'steps',
    title: 'Walk 5,000 Steps',
    description: 'Get moving for cardiovascular health',
    icon: 'footsteps',
    color: '#4CAF50',
    coins: 30,
  },
  {
    id: 'meditate',
    title: '5-Min Meditation',
    description: 'Calm your mind and reduce stress',
    icon: 'leaf',
    color: '#9C27B0',
    coins: 20,
  },
  {
    id: 'check-premium',
    title: 'Check Insurance Benefits',
    description: 'Stay informed about your coverage',
    icon: 'shield-checkmark',
    color: '#FF9800',
    coins: 15,
  },
  {
    id: 'journal',
    title: 'Write 3 Gratitudes',
    description: 'Reflect on positive moments',
    icon: 'journal',
    color: '#E91E63',
    coins: 20,
  },
];

export default function TopQuickActions({ onActionPress }: TopQuickActionsProps) {
  const [dailyTask, setDailyTask] = useState<DailyTask | null>(null);
  const [quickActions] = useState([
    { id: 'brain-games', icon: 'bulb' as const, label: 'Brain Games', color: '#FF6B6B' },
    { id: 'ar-yoga', icon: 'body' as const, label: 'AR Yoga', color: '#4ECDC4' },
    { id: 'meditation', icon: 'leaf' as const, label: 'Meditate', color: '#9C27B0' },
    { id: 'reward-store', icon: 'gift' as const, label: 'Rewards', color: '#FFD700' },
  ]);

  const scaleAnim = new Animated.Value(1);

  useEffect(() => {
    // Select daily task based on current date to ensure consistency
    const today = new Date().getDate();
    const taskIndex = today % DAILY_TASKS.length;
    const selectedTask = DAILY_TASKS[taskIndex];
    
    // Check if task was completed today (simulate with localStorage/AsyncStorage)
    setDailyTask({
      ...selectedTask,
      isCompleted: false, // In real app, check from storage
    });
  }, []);

  const completeDailyTask = async () => {
    if (!dailyTask || dailyTask.isCompleted) return;

    setDailyTask(prev => prev ? { ...prev, isCompleted: true } : null);
    
    // Award coins and trigger celebration
    await gamificationService.awardCoins(dailyTask.coins, `Daily Focus: ${dailyTask.title}`);
    
    triggerHapticFeedback('success');
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleQuickAction = (actionId: string) => {
    triggerHapticFeedback('light');
    onActionPress(actionId);
  };

  if (!dailyTask) return null;

  return (
    <View style={styles.container}>
      {/* Daily Focus Card */}
      <View style={styles.dailyFocusContainer}>
        <View style={styles.dailyFocusHeader}>
          <View style={styles.focusIcon}>
            <Ionicons name="flash" size={wp(5)} color="#FFD700" />
          </View>
          <Text style={styles.dailyFocusTitle}>Today's Focus</Text>
          <Text style={styles.dailyFocusSubtitle}>Simple. Effective. Rewarding.</Text>
        </View>

        <Animated.View 
          style={[
            styles.dailyTaskCard, 
            { 
              backgroundColor: dailyTask.color + '15',
              borderColor: dailyTask.color,
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          <View style={styles.taskContent}>
            <View style={[styles.taskIcon, { backgroundColor: dailyTask.color }]}>
              <Ionicons name={dailyTask.icon} size={wp(6)} color="white" />
            </View>
            <View style={styles.taskInfo}>
              <Text style={styles.taskTitle}>{dailyTask.title}</Text>
              <Text style={styles.taskDescription}>{dailyTask.description}</Text>
              <View style={styles.taskReward}>
                <Ionicons name="diamond" size={wp(4)} color="#FFD700" />
                <Text style={styles.taskCoins}>+{dailyTask.coins} coins</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.taskButton,
              { backgroundColor: dailyTask.isCompleted ? '#4CAF50' : dailyTask.color }
            ]}
            onPress={completeDailyTask}
            disabled={dailyTask.isCompleted}
          >
            {dailyTask.isCompleted ? (
              <Ionicons name="checkmark" size={wp(5)} color="white" />
            ) : (
              <Text style={styles.taskButtonText}>Start</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Quick Actions Row */}
      <View style={styles.quickActionsContainer}>
        <Text style={styles.quickActionsTitle}>Quick Actions</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.quickActionsScroll}
        >
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              style={[styles.quickActionButton, { backgroundColor: action.color + '20' }]}
              onPress={() => handleQuickAction(action.id)}
            >
              <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
                <Ionicons name={action.icon} size={wp(5)} color="white" />
              </View>
              <Text style={styles.quickActionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    paddingVertical: hp(2),
    paddingHorizontal: wp(4),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dailyFocusContainer: {
    marginBottom: hp(2),
  },
  dailyFocusHeader: {
    alignItems: 'center',
    marginBottom: hp(2),
  },
  focusIcon: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: '#FFF8E1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  dailyFocusTitle: {
    fontSize: rfs(18),
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  dailyFocusSubtitle: {
    fontSize: rfs(12),
    color: Colors.light.tabIconDefault,
    marginTop: hp(0.5),
  },
  dailyTaskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(4),
    borderRadius: wp(4),
    borderWidth: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  taskContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskIcon: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    fontSize: rfs(16),
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: hp(0.5),
  },
  taskDescription: {
    fontSize: rfs(12),
    color: Colors.light.tabIconDefault,
    marginBottom: hp(0.5),
  },
  taskReward: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskCoins: {
    fontSize: rfs(12),
    fontWeight: 'bold',
    color: '#FFD700',
    marginLeft: wp(1),
  },
  taskButton: {
    paddingHorizontal: wp(6),
    paddingVertical: hp(1.5),
    borderRadius: wp(6),
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: wp(16),
  },
  taskButtonText: {
    color: 'white',
    fontSize: rfs(14),
    fontWeight: 'bold',
  },
  quickActionsContainer: {
    marginTop: hp(1),
  },
  quickActionsTitle: {
    fontSize: rfs(16),
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: hp(1.5),
  },
  quickActionsScroll: {
    flexDirection: 'row',
  },
  quickActionButton: {
    alignItems: 'center',
    paddingVertical: hp(1.5),
    paddingHorizontal: wp(4),
    borderRadius: wp(3),
    marginRight: wp(3),
    minWidth: wp(20),
  },
  quickActionIcon: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  quickActionLabel: {
    fontSize: rfs(11),
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
  },
});