import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { dummyInsurancePolicies } from '@/services/dummyData';
import { InsurancePolicy } from '@/types/app';
import { celebrationScale, triggerHapticFeedback } from '@/utils/animations';
import React, { useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function InsuranceScreen() {
  const colorScheme = useColorScheme();
  const [policies, setPolicies] = useState<InsurancePolicy[]>(dummyInsurancePolicies);
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null);
  const [showRenewal, setShowRenewal] = useState(false);
  const [wellnessScore, setWellnessScore] = useState(87);
  const [currentSteps, setCurrentSteps] = useState(42350);
  const [currentBMI, setCurrentBMI] = useState(22.8);
  
  // Dropdown states
  const [showAllPolicies, setShowAllPolicies] = useState(false);
  const [showAllGoals, setShowAllGoals] = useState(false);

  const cardScale = useSharedValue(1);
  const policyScale = useSharedValue(1);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
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

  const getDaysUntilRenewal = (renewalDate: Date) => {
    const today = new Date();
    const diffTime = renewalDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateWellnessDiscount = () => {
    let discount = 0;
    
    // 5% for steps goal (50,000 steps monthly)
    if (currentSteps >= 50000) discount += 5;
    
    // 5% for healthy BMI (18.5-24.9)
    if (currentBMI >= 18.5 && currentBMI <= 24.9) discount += 5;
    
    // Additional discount based on wellness score
    if (wellnessScore >= 80) discount += 5;
    
    return Math.min(discount, 15); // Cap at 15%
  };

  const renewPolicy = (policy: InsurancePolicy) => {
    policyScale.value = celebrationScale();
    triggerHapticFeedback('light');
    
    // Show wellness status first, then apply discount
    const discount = calculateWellnessDiscount();
    const stepsStatus = currentSteps >= 50000 ? '✅' : '❌';
    const bmiStatus = (currentBMI >= 18.5 && currentBMI <= 24.9) ? '✅' : '❌';
    const scoreStatus = wellnessScore >= 80 ? '✅' : '❌';
    
    const newPremium = Math.round(policy.premium * (1 - discount / 100));
    
    Alert.alert(
      '🏥 Wellness Status Review',
      `Wellness Score: ${wellnessScore}/100 ${scoreStatus}\nSteps Goal (50K): ${currentSteps.toLocaleString()} ${stepsStatus}\nHealthy BMI: ${currentBMI} ${bmiStatus}\n\nDiscount Earned: ${discount}%\n\nOriginal Premium: ₹${policy.premium.toLocaleString()}\nNew Premium: ₹${newPremium.toLocaleString()}\nYou saved: ₹${(policy.premium - newPremium).toLocaleString()}!`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Renew Policy', 
          onPress: () => {
            triggerHapticFeedback('success');
            setPolicies(prev => prev.map(p => 
              p.id === policy.id ? { 
                ...p, 
                renewalDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                premium: newPremium,
                status: 'active' as const
              } : p
            ));
            Alert.alert('✅ Success!', 'Policy renewed successfully with wellness discount applied!');
          }
        }
      ]
    );
  };

  const viewPolicyDetails = (policy: InsurancePolicy) => {
    setSelectedPolicy(policy.id);
    cardScale.value = celebrationScale();
    triggerHapticFeedback('light');
    
    Alert.alert(
      `📋 ${policy.type.charAt(0).toUpperCase() + policy.type.slice(1)} Insurance Details`,
      `Provider: ${policy.provider}\nCoverage: ₹${policy.coverage.toLocaleString()}\nPremium: ₹${policy.premium.toLocaleString()}/year\nStatus: ${policy.status.toUpperCase()}\nRenewal: ${policy.renewalDate.toLocaleDateString()}\n\nPolicy Number: ${policy.id.toUpperCase()}\nStart Date: ${new Date(policy.renewalDate.getTime() - 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}`,
      [{ text: 'Close', onPress: () => setSelectedPolicy(null) }]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ScrollView 
        style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
      <ThemedView style={styles.header}>
        <ThemedText type="title">Insurance Hub 🛡️</ThemedText>
        <ThemedText style={styles.subtitle}>
          Manage policies and maximize your wellness discounts
        </ThemedText>
      </ThemedView>

      {/* Your Insurance Policies - Top Priority */}
      <Animated.View style={[styles.section, policyAnimatedStyle]}>
        <TouchableOpacity 
          style={styles.sectionHeader}
          onPress={() => setShowAllPolicies(!showAllPolicies)}
        >
          <ThemedText type="subtitle" style={styles.sectionTitle}>Your Insurance Policies</ThemedText>
          <IconSymbol 
            name={showAllPolicies ? "chevron.up" : "chevron.down"} 
            size={20} 
            color={Colors[colorScheme ?? 'light'].text} 
          />
        </TouchableOpacity>
        
        {policies.slice(0, showAllPolicies ? policies.length : 1).map((policy, index) => {
          const daysLeft = getDaysUntilRenewal(policy.renewalDate);
          const isExpiringSoon = daysLeft <= 30 && policy.status !== 'expired';
          const isExpired = policy.status === 'expired' || daysLeft <= 0;
          
          return (
            <View 
              key={policy.id}
              style={[
                styles.policyCard,
                selectedPolicy === policy.id && styles.selectedPolicyCard
              ]}
            >
              <View style={styles.policyHeader}>
                <View style={styles.policyLeft}>
                  <View style={[styles.policyIcon, { backgroundColor: getPolicyStatusColor(policy.status) }]}>
                    <IconSymbol name={getPolicyIcon(policy.type)} size={18} color="white" />
                  </View>
                  <View style={styles.policyInfo}>
                    <ThemedText type="defaultSemiBold" style={styles.policyTitle}>
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
                    ₹{policy.premium.toLocaleString()}/year
                  </ThemedText>
                </View>
                
                <View style={styles.policyDetail}>
                  <ThemedText style={styles.detailLabel}>Coverage</ThemedText>
                  <ThemedText style={styles.detailValue}>
                    ₹{policy.coverage.toLocaleString()}
                  </ThemedText>
                </View>
                
                <View style={styles.policyDetail}>
                  <ThemedText style={styles.detailLabel}>Renewal</ThemedText>
                  <ThemedText style={[
                    styles.detailValue,
                    (isExpiringSoon || isExpired) && { color: isExpired ? '#F44336' : '#FF9800' }
                  ]}>
                    {isExpired ? 'Expired' : daysLeft > 0 ? `${daysLeft} days` : 'Expired'}
                  </ThemedText>
                </View>
              </View>

              {/* Policy Actions */}
              <View style={styles.policyActions}>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => viewPolicyDetails(policy)}
                >
                  <IconSymbol name="doc.text" size={16} color={Colors[colorScheme ?? 'light'].primary} />
                  <ThemedText style={styles.actionButtonText}>
                    View Policy
                  </ThemedText>
                </TouchableOpacity>

                {(isExpiringSoon || isExpired) && (
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.renewActionButton]}
                    onPress={() => renewPolicy(policy)}
                  >
                    <IconSymbol name="arrow.clockwise" size={16} color="white" />
                    <ThemedText style={styles.renewActionButtonText}>
                      Renew
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
        
        {!showAllPolicies && policies.length > 1 && (
          <TouchableOpacity 
            style={styles.showMoreButton}
            onPress={() => setShowAllPolicies(true)}
          >
            <ThemedText style={styles.showMoreText}>
              +{policies.length - 1} more policies
            </ThemedText>
            <IconSymbol name="chevron.down" size={16} color={Colors[colorScheme ?? 'light'].primary} />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Wellness Discount Goals */}
      <ThemedView style={styles.section}>
        <TouchableOpacity 
          style={styles.sectionHeader}
          onPress={() => setShowAllGoals(!showAllGoals)}
        >
          <ThemedText type="subtitle" style={styles.sectionTitle}>Wellness Discount Goals</ThemedText>
          <IconSymbol 
            name={showAllGoals ? "chevron.up" : "chevron.down"} 
            size={20} 
            color={Colors[colorScheme ?? 'light'].text} 
          />
        </TouchableOpacity>
        
        {/* Always show first goal */}
        <View style={styles.goalCard}>
          <View style={styles.goalHeader}>
            <View style={styles.goalIconContainer}>
              <IconSymbol name="figure.walk" size={20} color="#4CAF50" />
            </View>
            <View style={styles.goalInfo}>
              <ThemedText type="defaultSemiBold" style={styles.goalTitle}>50,000 Steps Challenge</ThemedText>
              <ThemedText style={styles.goalReward}>5% Premium Reduction</ThemedText>
            </View>
            <View style={[styles.goalBadge, { backgroundColor: currentSteps >= 50000 ? '#4CAF50' : '#FF9800' }]}>
              <ThemedText style={styles.goalBadgeText}>
                {currentSteps >= 50000 ? 'EARNED' : 'ACTIVE'}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${Math.min((currentSteps / 50000) * 100, 100)}%`,
                    backgroundColor: Colors[colorScheme ?? 'light'].tint 
                  }
                ]} 
              />
            </View>
            
            <ThemedText style={styles.progressText}>
              {currentSteps.toLocaleString()} / 50,000 steps ({Math.min(Math.round((currentSteps / 50000) * 100), 100)}%)
            </ThemedText>
          </View>
        </View>

        {/* Show additional goals when expanded */}
        {showAllGoals && (
          <View style={styles.goalCard}>
            <View style={styles.goalHeader}>
              <View style={styles.goalIconContainer}>
                <IconSymbol name="heart.fill" size={20} color="#FF5722" />
              </View>
              <View style={styles.goalInfo}>
                <ThemedText type="defaultSemiBold" style={styles.goalTitle}>Healthy BMI Goal</ThemedText>
                <ThemedText style={styles.goalReward}>5% Premium Reduction</ThemedText>
              </View>
              <View style={[styles.goalBadge, { backgroundColor: (currentBMI >= 18.5 && currentBMI <= 24.9) ? '#4CAF50' : '#FF9800' }]}>
                <ThemedText style={styles.goalBadgeText}>
                  {(currentBMI >= 18.5 && currentBMI <= 24.9) ? 'EARNED' : 'TRACK'}
                </ThemedText>
              </View>
            </View>
            
            <View style={styles.bmiContainer}>
              <ThemedText style={styles.bmiText}>
                Current BMI: {currentBMI} (Target: 18.5 - 24.9)
              </ThemedText>
              <ThemedText style={styles.bmiStatus}>
                {(currentBMI >= 18.5 && currentBMI <= 24.9) ? '✅ Healthy BMI range achieved!' : '⚠️ Maintain a healthy lifestyle to reach target BMI'}
              </ThemedText>
            </View>
          </View>
        )}
        
        {!showAllGoals && (
          <TouchableOpacity 
            style={styles.showMoreButton}
            onPress={() => setShowAllGoals(true)}
          >
            <ThemedText style={styles.showMoreText}>
              +1 more wellness goal
            </ThemedText>
            <IconSymbol name="chevron.down" size={16} color={Colors[colorScheme ?? 'light'].primary} />
          </TouchableOpacity>
        )}
      </ThemedView>

      {/* Wellness Score & Impact Card */}
      <Animated.View style={[styles.wellnessCard, cardAnimatedStyle]}>
        <View style={styles.wellnessHeader}>
          <View style={styles.scoreContainer}>
            <ThemedText style={styles.scoreNumber}>{wellnessScore}</ThemedText>
            <ThemedText style={styles.scoreLabel}>Wellness Score</ThemedText>
          </View>
          <View style={styles.discountContainer}>
            <ThemedText style={styles.discountNumber}>{calculateWellnessDiscount()}%</ThemedText>
            <ThemedText style={styles.discountLabel}>Discount</ThemedText>
          </View>
        </View>
        
        <View style={styles.wellnessMetrics}>
          <View style={styles.metric}>
            <IconSymbol name="figure.walk" size={18} color="white" />
            <ThemedText style={styles.metricText}>
              {currentSteps.toLocaleString()}
            </ThemedText>
            <IconSymbol 
              name={currentSteps >= 50000 ? "checkmark.circle.fill" : "circle"} 
              size={14} 
              color={currentSteps >= 50000 ? "#FFD700" : "rgba(255,255,255,0.7)"} 
            />
          </View>
          
          <View style={styles.metric}>
            <IconSymbol name="heart.fill" size={18} color="white" />
            <ThemedText style={styles.metricText}>
              BMI {currentBMI}
            </ThemedText>
            <IconSymbol 
              name={currentBMI >= 18.5 && currentBMI <= 24.9 ? "checkmark.circle.fill" : "circle"} 
              size={14} 
              color={currentBMI >= 18.5 && currentBMI <= 24.9 ? "#FFD700" : "rgba(255,255,255,0.7)"} 
            />
          </View>
        </View>

        <View style={styles.savingsContainer}>
          <ThemedText style={styles.savingsLabel}>Annual Savings</ThemedText>
          <ThemedText style={styles.savingsAmount}>
            ₹{Math.round(policies.reduce((sum, p) => sum + p.premium, 0) * calculateWellnessDiscount() / 100).toLocaleString()}
          </ThemedText>
        </View>

        <ThemedText style={styles.wellnessDescription}>
          Your healthy lifestyle activities have earned you significant premium discounts!
        </ThemedText>
      </Animated.View>

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
    paddingBottom: 140, // Extra bottom padding to prevent bottom bar overlap
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
    marginBottom: 16,
    paddingVertical: 4,
  },
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    marginTop: 8,
  },
  showMoreText: {
    fontSize: 14,
    color: Colors.light.primary,
    marginRight: 8,
    fontWeight: '500',
  },
  
  // Wellness Card Styles
  wellnessCard: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    backgroundColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  wellnessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'center',
  },
  scoreNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  scoreLabel: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 2,
  },
  discountContainer: {
    alignItems: 'center',
    minWidth: 80,
  },
  discountNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
  },
  discountLabel: {
    fontSize: 12,
    color: 'white',
    opacity: 0.9,
    textAlign: 'center',
    marginTop: 2,
  },
  wellnessMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    flex: 0.48,
    justifyContent: 'center',
  },
  metricText: {
    color: 'white',
    marginHorizontal: 6,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  savingsContainer: {
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 12,
  },
  savingsLabel: {
    color: 'white',
    fontSize: 12,
    opacity: 0.9,
  },
  savingsAmount: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 2,
  },
  wellnessDescription: {
    color: 'white',
    textAlign: 'center',
    opacity: 0.9,
    fontSize: 13,
    lineHeight: 18,
  },

  // Goal Card Styles
  goalCard: {
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  goalIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalInfo: {
    flex: 1,
    marginLeft: 12,
  },
  goalTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  goalReward: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
    marginTop: 2,
  },
  progressContainer: {
    marginTop: 4,
  },
  goalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  goalBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
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
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  bmiContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  bmiText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  bmiStatus: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },

  // Policy Card Styles
  policyCard: {
    padding: 18,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  policyTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectedPolicyCard: {
    borderColor: '#4CAF50',
    borderWidth: 2,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
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
    marginBottom: 16,
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

  policyActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    backgroundColor: 'transparent',
  },
  actionButtonText: {
    color: Colors.light.primary,
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },
  renewActionButton: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  renewActionButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 14,
  },

  // Impact Card Styles
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
  impactAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  impactDescription: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 16,
    lineHeight: 20,
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