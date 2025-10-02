import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence 
} from 'react-native-reanimated';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { dummyInsurancePolicies, dummyInsuranceChallenges } from '@/services/dummyData';
import { InsurancePolicy, InsuranceChallenge } from '@/types/app';
import { gamificationService } from '@/services/gamificationService';
import { triggerHapticFeedback, celebrationScale } from '@/utils/animations';

export default function InsuranceScreen() {
  const colorScheme = useColorScheme();
  const [policies, setPolicies] = useState<InsurancePolicy[]>(dummyInsurancePolicies);
  const [challenges, setChallenges] = useState<InsuranceChallenge[]>(dummyInsuranceChallenges);
  const [selectedQuiz, setSelectedQuiz] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);

  const challengeScale = useSharedValue(1);
  const rewardScale = useSharedValue(1);
  const policyScale = useSharedValue(1);

  const challengeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: challengeScale.value }],
  }));

  const rewardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rewardScale.value }],
  }));

  const policyAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: policyScale.value }],
  }));

  const getPolicyStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'expired': return '#F44336';
      case 'pending': return '#FF9800';
      default: return Colors[colorScheme ?? 'light'].tint;
    }
  };

  const getPolicyIcon = (type: string) => {
    switch (type) {
      case 'health': return 'heart.fill';
      case 'life': return 'person.fill';
      case 'auto': return 'car.fill';
      case 'home': return 'house.fill';
      default: return 'shield.fill';
    }
  };

  const completeChallenge = async (challengeId: string) => {
    const challenge = challenges.find(c => c.id === challengeId);
    if (!challenge) return;

    setChallenges(prev => prev.map(c => 
      c.id === challengeId ? { ...c, isCompleted: true, progress: c.target } : c
    ));

    const coinsAwarded = typeof challenge.reward === 'number' ? challenge.reward : 100;
    await gamificationService.awardCoins(coinsAwarded, `Completed ${challenge.title}`);

    challengeScale.value = celebrationScale();
    rewardScale.value = celebrationScale();
    triggerHapticFeedback('success');

    Alert.alert(
      '🎉 Challenge Complete!',
      `Congratulations! You earned ${coinsAwarded} coins for completing "${challenge.title}"!`,
      [{ text: 'Awesome!', onPress: () => {} }]
    );
  };

  const explorePolicy = (policyId: string) => {
    policyScale.value = celebrationScale();
    triggerHapticFeedback('light');
    
    Alert.alert(
      'Policy Explored! 🔍',
      'You earned 25 coins for exploring your policy benefits!',
      [{ text: 'Great!', onPress: () => {} }]
    );

    gamificationService.awardCoins(25, 'Explored insurance policy');
  };

  const quizQuestions = [
    {
      question: "What does a deductible mean in insurance?",
      options: [
        "The amount you pay before insurance covers costs",
        "The monthly payment amount",
        "The maximum coverage limit",
        "The insurance company's profit"
      ],
      correct: 0
    },
    {
      question: "Which factor can help reduce your health insurance premium?",
      options: [
        "Smoking regularly",
        "Avoiding exercise",
        "Maintaining a healthy lifestyle",
        "Skipping preventive care"
      ],
      correct: 2
    },
    {
      question: "What is the benefit of having a higher deductible?",
      options: [
        "Higher monthly premiums",
        "Lower monthly premiums",
        "No coverage until met",
        "Better doctor access"
      ],
      correct: 1
    }
  ];

  const startQuiz = () => {
    setSelectedQuiz(0);
    setQuizScore(0);
  };

  const answerQuiz = (answerIndex: number) => {
    const isCorrect = quizQuestions[selectedQuiz!].correct === answerIndex;
    
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
      triggerHapticFeedback('success');
    } else {
      triggerHapticFeedback('error');
    }

    if (selectedQuiz! < quizQuestions.length - 1) {
      setSelectedQuiz(prev => prev! + 1);
    } else {
      // Quiz complete
      const coinsEarned = quizScore * 50 + (isCorrect ? 50 : 0);
      gamificationService.awardCoins(coinsEarned, 'Insurance literacy quiz');
      
      Alert.alert(
        '🎓 Quiz Complete!',
        `You scored ${quizScore + (isCorrect ? 1 : 0)}/${quizQuestions.length} and earned ${coinsEarned} coins!`,
        [{ text: 'Excellent!', onPress: () => setSelectedQuiz(null) }]
      );
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type="title">Insurance Hub 🛡️</ThemedText>
        <ThemedText style={styles.subtitle}>
          Manage policies and earn rewards through wellness
        </ThemedText>
      </ThemedView>

      {/* Premium Reduction Goal */}
      <Animated.View style={[styles.section, challengeAnimatedStyle]}>
        <View style={styles.sectionHeader}>
          <ThemedText type="subtitle">Premium Reduction Goal</ThemedText>
          <View style={styles.discountBadge}>
            <IconSymbol name="percent" size={16} color="white" />
            <ThemedText style={styles.discountText}>5% OFF</ThemedText>
          </View>
        </View>
        
        <ThemedText style={styles.sectionDescription}>
          Walk 50,000 steps this month to unlock a premium discount!
        </ThemedText>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <ThemedText style={styles.progressLabel}>Progress</ThemedText>
            <ThemedText style={styles.progressText}>32,000 / 50,000 steps</ThemedText>
          </View>
          
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: '64%',
                  backgroundColor: Colors[colorScheme ?? 'light'].tint 
                }
              ]} 
            />
          </View>
          
          <View style={styles.progressDetails}>
            <ThemedText style={styles.remainingText}>
              18,000 steps remaining
            </ThemedText>
            <ThemedText style={styles.timeLeft}>
              15 days left
            </ThemedText>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
          onPress={() => Alert.alert('🚶‍♀️', 'Keep walking! Every step counts towards your discount!')}
        >
          <IconSymbol name="figure.walk" size={20} color="white" />
          <ThemedText style={styles.actionButtonText}>Start Walking</ThemedText>
        </TouchableOpacity>
      </Animated.View>

      {/* Insurance Challenges */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Active Challenges</ThemedText>
        
        {challenges.filter(c => !c.isCompleted).map((challenge) => (
          <Animated.View key={challenge.id} style={[styles.challengeCard, rewardAnimatedStyle]}>
            <View style={styles.challengeHeader}>
              <ThemedText type="defaultSemiBold">{challenge.title}</ThemedText>
              <View style={styles.challengeReward}>
                <IconSymbol name="dollarsign.circle" size={16} color="#FFD700" />
                <ThemedText style={styles.rewardText}>
                  {typeof challenge.reward === 'number' ? challenge.reward : '5%'}
                </ThemedText>
              </View>
            </View>
            
            <ThemedText style={styles.challengeDescription}>
              {challenge.description}
            </ThemedText>
            
            <View style={styles.challengeProgress}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: `${(challenge.progress / challenge.target) * 100}%`,
                      backgroundColor: Colors[colorScheme ?? 'light'].tint 
                    }
                  ]} 
                />
              </View>
              <ThemedText style={styles.challengeProgressText}>
                {challenge.progress}/{challenge.target}
              </ThemedText>
            </View>

            <TouchableOpacity 
              style={[
                styles.challengeButton,
                challenge.progress >= challenge.target ? 
                  { backgroundColor: '#4CAF50' } : 
                  { backgroundColor: '#E0E0E0' }
              ]}
              onPress={() => challenge.progress >= challenge.target && completeChallenge(challenge.id)}
              disabled={challenge.progress < challenge.target}
            >
              <ThemedText style={[
                styles.challengeButtonText,
                challenge.progress >= challenge.target ? 
                  { color: 'white' } : 
                  { color: '#999' }
              ]}>
                {challenge.progress >= challenge.target ? 'Claim Reward' : 'In Progress'}
              </ThemedText>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ThemedView>

      {/* Insurance Literacy Quiz */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Insurance Literacy Quiz</ThemedText>
        
        {selectedQuiz === null ? (
          <View style={styles.quizIntro}>
            <IconSymbol name="brain" size={48} color={Colors[colorScheme ?? 'light'].tint} />
            <ThemedText style={styles.quizTitle}>Test Your Knowledge!</ThemedText>
            <ThemedText style={styles.quizDescription}>
              Answer questions about insurance to earn coins and improve your knowledge
            </ThemedText>
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}
              onPress={startQuiz}
            >
              <IconSymbol name="play.fill" size={20} color="white" />
              <ThemedText style={styles.actionButtonText}>Start Quiz</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.quizContainer}>
            <View style={styles.quizHeader}>
              <ThemedText style={styles.quizProgress}>
                Question {selectedQuiz + 1} of {quizQuestions.length}
              </ThemedText>
              <ThemedText style={styles.quizScore}>
                Score: {quizScore}/{selectedQuiz}
              </ThemedText>
            </View>
            
            <ThemedText style={styles.question}>
              {quizQuestions[selectedQuiz].question}
            </ThemedText>
            
            <View style={styles.options}>
              {quizQuestions[selectedQuiz].options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.option}
                  onPress={() => answerQuiz(index)}
                >
                  <ThemedText style={styles.optionText}>{option}</ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ThemedView>

      {/* Your Policies */}
      <Animated.View style={[styles.section, policyAnimatedStyle]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Your Policies</ThemedText>
        
        {policies.map((policy) => (
          <TouchableOpacity 
            key={policy.id}
            style={styles.policyCard}
            onPress={() => explorePolicy(policy.id)}
          >
            <View style={styles.policyHeader}>
              <View style={styles.policyLeft}>
                <View style={[styles.policyIcon, { backgroundColor: getPolicyStatusColor(policy.status) }]}>
                  <IconSymbol name={getPolicyIcon(policy.type)} size={24} color="white" />
                </View>
                <View style={styles.policyInfo}>
                  <ThemedText type="defaultSemiBold">
                    {policy.type.charAt(0).toUpperCase() + policy.type.slice(1)} Insurance
                  </ThemedText>
                  <ThemedText style={styles.policyProvider}>
                    {policy.provider}
                  </ThemedText>
                </View>
              </View>
              
              <View style={styles.policyRight}>
                <View style={[styles.statusBadge, { backgroundColor: getPolicyStatusColor(policy.status) }]}>
                  <ThemedText style={styles.statusText}>
                    {policy.status.toUpperCase()}
                  </ThemedText>
                </View>
              </View>
            </View>
            
            <View style={styles.policyDetails}>
              <View style={styles.policyDetail}>
                <ThemedText style={styles.detailLabel}>Premium</ThemedText>
                <ThemedText style={styles.detailValue}>
                  ${policy.premium.toLocaleString()}/year
                </ThemedText>
              </View>
              
              <View style={styles.policyDetail}>
                <ThemedText style={styles.detailLabel}>Coverage</ThemedText>
                <ThemedText style={styles.detailValue}>
                  ${policy.coverage.toLocaleString()}
                </ThemedText>
              </View>
              
              <View style={styles.policyDetail}>
                <ThemedText style={styles.detailLabel}>Renewal</ThemedText>
                <ThemedText style={styles.detailValue}>
                  {policy.renewalDate.toLocaleDateString()}
                </ThemedText>
              </View>
            </View>
            
            <View style={styles.exploreHint}>
              <IconSymbol name="info.circle" size={16} color={Colors[colorScheme ?? 'light'].tint} />
              <ThemedText style={styles.exploreText}>
                Tap to explore benefits and earn coins
              </ThemedText>
            </View>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* Wellness Impact */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Wellness Impact</ThemedText>
        
        <View style={styles.impactCard}>
          <View style={styles.impactHeader}>
            <IconSymbol name="chart.xyaxis.line" size={32} color="#4CAF50" />
            <View style={styles.impactText}>
              <ThemedText type="defaultSemiBold">Your Wellness Score</ThemedText>
              <ThemedText style={styles.impactScore}>85/100</ThemedText>
            </View>
          </View>
          
          <ThemedText style={styles.impactDescription}>
            Your healthy lifestyle activities could help reduce premiums by up to 15%!
          </ThemedText>
          
          <View style={styles.impactBenefits}>
            <View style={styles.impactBenefit}>
              <IconSymbol name="checkmark.circle.fill" size={16} color="#4CAF50" />
              <ThemedText style={styles.benefitText}>Regular exercise</ThemedText>
            </View>
            
            <View style={styles.impactBenefit}>
              <IconSymbol name="checkmark.circle.fill" size={16} color="#4CAF50" />
              <ThemedText style={styles.benefitText}>Preventive care</ThemedText>
            </View>
            
            <View style={styles.impactBenefit}>
              <IconSymbol name="checkmark.circle.fill" size={16} color="#4CAF50" />
              <ThemedText style={styles.benefitText}>Stress management</ThemedText>
            </View>
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
    opacity: 0.8,
    marginBottom: 16,
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  progressText: {
    fontSize: 14,
    color: '#666',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  remainingText: {
    fontSize: 12,
    color: '#666',
  },
  timeLeft: {
    fontSize: 12,
    color: '#FF9800',
    fontWeight: 'bold',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  challengeCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  challengeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  challengeReward: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rewardText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#F57F17',
    fontWeight: 'bold',
  },
  challengeDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 12,
  },
  challengeProgress: {
    marginBottom: 12,
  },
  challengeProgressText: {
    fontSize: 12,
    textAlign: 'right',
    opacity: 0.7,
    marginTop: 4,
  },
  challengeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: 'center',
  },
  challengeButtonText: {
    fontWeight: 'bold',
  },
  quizIntro: {
    alignItems: 'center',
    padding: 20,
  },
  quizTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  quizDescription: {
    fontSize: 14,
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 20,
  },
  quizContainer: {
    padding: 16,
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  quizProgress: {
    fontSize: 14,
    color: '#666',
  },
  quizScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  question: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    lineHeight: 24,
  },
  options: {
    gap: 12,
  },
  option: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F9F9F9',
  },
  optionText: {
    fontSize: 16,
  },
  policyCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
  },
  policyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  policyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  policyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  policyInfo: {
    flex: 1,
  },
  policyProvider: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  policyRight: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  policyDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  policyDetail: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  exploreHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  exploreText: {
    fontSize: 12,
    opacity: 0.7,
    marginLeft: 6,
  },
  impactCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F0F8F0',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  impactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  impactText: {
    marginLeft: 16,
    flex: 1,
  },
  impactScore: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  impactDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 16,
  },
  impactBenefits: {
    gap: 8,
  },
  impactBenefit: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  benefitText: {
    fontSize: 14,
    marginLeft: 8,
  },
});