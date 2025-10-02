import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { dummyOnboardingSteps, dummyRewardItems } from '@/services/dummyData';
import { gamificationService } from '@/services/gamificationService';
import { OnboardingStep, RewardItem } from '@/types/app';
import { celebrationScale, triggerHapticFeedback } from '@/utils/animations';
import React, { useState } from 'react';
import { Alert, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  const colorScheme = useColorScheme();
  const [onboardingSteps, setOnboardingSteps] = useState<OnboardingStep[]>(dummyOnboardingSteps);
  const [rewardItems, setRewardItems] = useState<RewardItem[]>(dummyRewardItems);
  const [showFeatureDemo, setShowFeatureDemo] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [userCoins, setUserCoins] = useState(1250);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [rewardItemScales] = useState<Record<string, any>>({});

  const stepScale = useSharedValue(1);
  const rewardScale = useSharedValue(1);
  const demoScale = useSharedValue(1);

  const stepAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: stepScale.value }],
  }));

  const rewardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rewardScale.value }],
  }));

  const demoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: demoScale.value }],
  }));

  const completeOnboardingStep = async (stepId: string) => {
    const step = onboardingSteps.find(s => s.id === stepId);
    if (!step || step.isCompleted) return;

    setOnboardingSteps(prev => prev.map(s => 
      s.id === stepId ? { ...s, isCompleted: true } : s
    ));

    await gamificationService.awardCoins(step.coinReward, `Completed onboarding: ${step.title}`);
    setUserCoins(prev => prev + step.coinReward);

    stepScale.value = celebrationScale();
    triggerHapticFeedback('success');

    Alert.alert(
      '🎉 Step Complete!',
      `Great job! You earned ${step.coinReward} coins for completing "${step.title}"!`,
      [{ text: 'Continue!', onPress: () => {} }]
    );
  };

  const purchaseRewardItem = async (itemId: string) => {
    const item = rewardItems.find(r => r.id === itemId);
    if (!item || item.isPurchased || userCoins < item.cost) return;

    if (userCoins < item.cost) {
      Alert.alert('Insufficient Coins', `You need ${item.cost - userCoins} more coins to purchase this item.`);
      return;
    }

    setRewardItems(prev => prev.map(r => 
      r.id === itemId ? { ...r, isPurchased: true } : r
    ));

    setUserCoins(prev => prev - item.cost);
    rewardScale.value = celebrationScale();
    triggerHapticFeedback('success');

    Alert.alert(
      '🛍️ Purchase Successful!',
      `You've successfully purchased "${item.name}"! It's now available in your account.`,
      [{ text: 'Amazing!', onPress: () => {} }]
    );
  };

  const startFeatureDemo = (featureName: string) => {
    setSelectedFeature(featureName);
    setShowFeatureDemo(true);
    demoScale.value = celebrationScale();
    triggerHapticFeedback('medium');
  };

  const completeFeatureDemo = async () => {
    if (!selectedFeature) return;

    await gamificationService.awardCoins(50, `Completed feature demo: ${selectedFeature}`);
    setUserCoins(prev => prev + 50);
    
    setShowFeatureDemo(false);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'premium_content': return '#E3F2FD';
      case 'ar_poses': return '#E8F5E8';
      case 'insurance_perks': return '#FFF3E0';
      case 'customization': return '#F3E5F5';
      default: return '#F5F5F5';
    }
  };

  const filteredRewardItems = selectedCategory === 'all' 
    ? rewardItems 
    : rewardItems.filter(item => item.category === selectedCategory);

  const features = [
    {
      name: 'AR Yoga Studio',
      description: 'Experience yoga poses with real-time feedback',
      icon: 'arkit' as const,
      color: '#FF6B6B',
      demoContent: 'Our AR Yoga Studio uses advanced pose detection to guide you through yoga sessions. Simply point your camera and follow along as the AI provides real-time feedback on your form!'
    },
    {
      name: 'AI Wellness Chat',
      description: 'Get personalized health advice 24/7',
      icon: 'brain' as const,
      color: '#4ECDC4',
      demoContent: 'Chat with our AI wellness assistant for personalized advice on meditation, nutrition, sleep, and more. The AI learns from your habits to provide tailored recommendations!'
    },
    {
      name: 'Insurance Integration',
      description: 'Reduce premiums through wellness activities',
      icon: 'shield.fill' as const,
      color: '#45B7D1',
      demoContent: 'Connect your wellness activities to your insurance policy. Complete challenges and maintain healthy habits to unlock premium discounts and exclusive benefits!'
    },
    {
      name: 'Gamification Engine',
      description: 'Earn coins, badges, and level up',
      icon: 'gamecontroller.fill' as const,
      color: '#96CEB4',
      demoContent: 'Every healthy action earns you coins and XP. Complete daily tasks, maintain streaks, and unlock achievements. Use coins in our reward store for premium content!'
    },
  ];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ScrollView 
        style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type="title">Explore YouMatter 🌟</ThemedText>
        <ThemedText style={styles.subtitle}>
          Discover features and earn rewards
        </ThemedText>
        
        <View style={styles.coinBalance}>
          <IconSymbol name="dollarsign.circle.fill" size={20} color="#FFD700" />
          <ThemedText style={styles.coinText}>{userCoins} coins</ThemedText>
        </View>
      </ThemedView>

      {/* Onboarding Progress */}
      <Animated.View style={[styles.section, stepAnimatedStyle]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Getting Started</ThemedText>
        
        <View style={styles.progressOverview}>
          <ThemedText style={styles.progressText}>
            {onboardingSteps.filter(step => step.isCompleted).length} of {onboardingSteps.length} steps completed
          </ThemedText>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${(onboardingSteps.filter(step => step.isCompleted).length / onboardingSteps.length) * 100}%`,
                  backgroundColor: Colors[colorScheme ?? 'light'].tint 
                }
              ]} 
            />
          </View>
        </View>

        {onboardingSteps.map((step) => (
          <TouchableOpacity 
            key={step.id}
            style={[
              styles.stepCard,
              step.isCompleted && styles.completedStep
            ]}
            onPress={() => !step.isCompleted && completeOnboardingStep(step.id)}
            disabled={step.isCompleted}
          >
            <View style={styles.stepLeft}>
              <View style={[
                styles.stepIcon,
                step.isCompleted && styles.completedIcon
              ]}>
                {step.isCompleted ? (
                  <IconSymbol name="checkmark" size={20} color="white" />
                ) : (
                  <ThemedText style={styles.stepNumber}>{step.id}</ThemedText>
                )}
              </View>
              <View style={styles.stepContent}>
                <ThemedText 
                  type="defaultSemiBold" 
                  style={[step.isCompleted && styles.completedText]}
                >
                  {step.title}
                </ThemedText>
                <ThemedText 
                  style={[styles.stepDescription, step.isCompleted && styles.completedText]}
                >
                  {step.description}
                </ThemedText>
              </View>
            </View>
            <View style={styles.stepRight}>
              {!step.isCompleted && (
                <View style={styles.coinReward}>
                  <IconSymbol name="dollarsign.circle" size={16} color="#FFD700" />
                  <ThemedText style={styles.coinRewardText}>{step.coinReward}</ThemedText>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* Feature Demos */}
      <Animated.View style={[styles.section, demoAnimatedStyle]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Feature Demos</ThemedText>
        <ThemedText style={styles.sectionDescription}>
          Learn about our key features and earn coins for each demo you watch
        </ThemedText>

        <View style={styles.featuresGrid}>
          {features.map((feature, index) => (
            <TouchableOpacity 
              key={index}
              style={[styles.featureCard, { borderColor: feature.color }]}
              onPress={() => startFeatureDemo(feature.name)}
            >
              <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                <IconSymbol name={feature.icon} size={24} color="white" />
              </View>
              <ThemedText type="defaultSemiBold" style={styles.featureName}>
                {feature.name}
              </ThemedText>
              <ThemedText style={styles.featureDescription}>
                {feature.description}
              </ThemedText>
              
              <View style={styles.demoButton}>
                <IconSymbol name="play.fill" size={12} color={feature.color} />
                <ThemedText style={[styles.demoButtonText, { color: feature.color }]}>
                  Watch Demo (+50 coins)
                </ThemedText>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Reward Store */}
      <Animated.View style={[styles.section, rewardAnimatedStyle]}>
        <View style={styles.rewardStoreHeader}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>🏆 Reward Store</ThemedText>
          <View style={styles.coinBalance}>
            <IconSymbol name="dollarsign.circle.fill" size={20} color="#FFD700" />
            <ThemedText style={styles.coinText}>{userCoins}</ThemedText>
          </View>
        </View>
        <ThemedText style={styles.sectionDescription}>
          Spend your coins on premium content and exclusive perks
        </ThemedText>

        {rewardItems.map((item) => (
          <Animated.View key={item.id} style={[styles.rewardCard, rewardAnimatedStyle]}>
            <View style={styles.rewardLeft}>
              <View style={[styles.rewardIcon, { backgroundColor: getCategoryColor(item.category) }]}>
                <ThemedText style={styles.rewardEmoji}>{item.icon}</ThemedText>
              </View>
              <View style={styles.rewardContent}>
                <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                <ThemedText style={styles.rewardDescription}>
                  {item.description}
                </ThemedText>
                <View style={styles.rewardMeta}>
                  <View style={[styles.categoryTag, { backgroundColor: getCategoryColor(item.category) }]}>
                    <ThemedText style={styles.categoryTagText}>
                      {item.category.replace('_', ' ').toUpperCase()}
                    </ThemedText>
                  </View>
                  <View style={styles.priceTag}>
                    <IconSymbol name="dollarsign.circle" size={14} color="#FFD700" />
                    <ThemedText style={styles.priceText}>{item.cost}</ThemedText>
                  </View>
                </View>
              </View>
            </View>
            
            <View style={styles.rewardRight}>
              {item.isPurchased ? (
                <View style={styles.purchasedBadge}>
                  <IconSymbol name="checkmark.circle.fill" size={20} color="#4CAF50" />
                  <ThemedText style={styles.purchasedText}>Owned</ThemedText>
                </View>
              ) : (
                <TouchableOpacity 
                  style={[
                    styles.purchaseButton,
                    userCoins < item.cost && styles.insufficientFunds
                  ]}
                  onPress={() => purchaseRewardItem(item.id)}
                  disabled={userCoins < item.cost}
                >
                  <ThemedText style={styles.purchaseButtonText}>
                    {userCoins < item.cost ? 'Need More' : 'Buy Now'}
                  </ThemedText>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        ))}
      </Animated.View>

      {/* Feature Demo Modal */}
      <Modal
        visible={showFeatureDemo}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowFeatureDemo(false)}
              style={styles.closeButton}
            >
              <IconSymbol name="xmark" size={24} color={Colors[colorScheme ?? 'light'].text} />
            </TouchableOpacity>
            <ThemedText type="subtitle">{selectedFeature} Demo</ThemedText>
            <View />
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedFeature && (
              <>
                <View style={styles.demoVideo}>
                  <IconSymbol name="play.circle.fill" size={64} color={Colors[colorScheme ?? 'light'].tint} />
                  <ThemedText style={styles.demoVideoText}>Feature Demo Video</ThemedText>
                  <ThemedText style={styles.demoVideoSubtext}>
                    Interactive demo would play here
                  </ThemedText>
                </View>

                <View style={styles.demoDetails}>
                  <ThemedText type="defaultSemiBold" style={styles.demoTitle}>
                    About {selectedFeature}
                  </ThemedText>
                  
                  <ThemedText style={styles.demoDescription}>
                    {features.find(f => f.name === selectedFeature)?.demoContent}
                  </ThemedText>

                  <View style={styles.demoFeatures}>
                    <ThemedText style={styles.demoFeaturesTitle}>Key Features:</ThemedText>
                    <View style={styles.demoFeature}>
                      <IconSymbol name="checkmark.circle.fill" size={16} color="#4CAF50" />
                      <ThemedText style={styles.demoFeatureText}>Real-time feedback</ThemedText>
                    </View>
                    <View style={styles.demoFeature}>
                      <IconSymbol name="checkmark.circle.fill" size={16} color="#4CAF50" />
                      <ThemedText style={styles.demoFeatureText}>Personalized recommendations</ThemedText>
                    </View>
                    <View style={styles.demoFeature}>
                      <IconSymbol name="checkmark.circle.fill" size={16} color="#4CAF50" />
                      <ThemedText style={styles.demoFeatureText}>Progress tracking</ThemedText>
                    </View>
                  </View>

                  <TouchableOpacity 
                    style={[styles.completeButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
                    onPress={completeFeatureDemo}
                  >
                    <IconSymbol name="checkmark" size={20} color="white" />
                    <ThemedText style={styles.completeButtonText}>Complete Demo (+50 coins)</ThemedText>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingBottom: 140,
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
  coinBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  section: {
    margin: 20,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  progressOverview: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E0E0E0',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  completedStep: {
    backgroundColor: '#F0F8F0',
    borderColor: '#4CAF50',
  },
  stepLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  completedIcon: {
    backgroundColor: '#4CAF50',
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepContent: {
    flex: 1,
  },
  stepDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  completedText: {
    opacity: 0.7,
  },
  stepRight: {
    alignItems: 'center',
  },
  coinReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  coinRewardText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#F57F17',
    fontWeight: 'bold',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 16,
    alignItems: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureName: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 12,
  },
  demoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  demoButtonText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  rewardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rewardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  rewardEmoji: {
    fontSize: 20,
  },
  rewardContent: {
    flex: 1,
  },
  rewardDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  rewardCategory: {
    fontSize: 10,
    opacity: 0.5,
    marginTop: 4,
  },
  rewardRight: {
    alignItems: 'center',
  },
  purchasedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  purchasedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  purchaseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  insufficientFunds: {
    backgroundColor: '#E0E0E0',
  },
  purchaseButtonText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  closeButton: {
    padding: 8,
  },
  modalContent: {
    flex: 1,
  },
  demoVideo: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    backgroundColor: '#F5F5F5',
    margin: 20,
    borderRadius: 12,
  },
  demoVideoText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  demoVideoSubtext: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 8,
  },
  demoDetails: {
    padding: 20,
  },
  demoTitle: {
    fontSize: 20,
    marginBottom: 16,
  },
  demoDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  demoFeatures: {
    marginBottom: 20,
  },
  demoFeaturesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  demoFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  demoFeatureText: {
    fontSize: 14,
    marginLeft: 8,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  completeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  // Enhanced Reward Store Styles
  rewardStoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  coinText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginLeft: 8,
  },
  rewardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryTagText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
    marginLeft: 4,
  },
});
