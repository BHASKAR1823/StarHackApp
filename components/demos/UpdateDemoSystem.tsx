import { Colors } from '@/constants/theme';
import { hp, rfs, wp } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { useState } from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface UpdateDemo {
  id: string;
  version: string;
  title: string;
  description: string;
  features: string[];
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  demoType: 'ar-yoga' | 'brain-games' | 'ai-chat' | 'insurance';
}

interface UpdateDemoSystemProps {
  onBack: () => void;
}

const UPDATE_DEMOS: UpdateDemo[] = [
  {
    id: 'update-1',
    version: 'v1.1.0',
    title: 'AR Wellness Studio',
    description: 'Experience immersive yoga and fitness with AR pose detection',
    features: [
      'Real-time pose detection with AR camera',
      'Interactive plank challenges with scoring',
      'Professional feedback and corrections',
      'Earn coins for completed poses',
      'Progress tracking and achievements'
    ],
    icon: 'body',
    color: '#4ECDC4',
    demoType: 'ar-yoga',
  },
  {
    id: 'update-2',
    version: 'v1.2.0',
    title: 'Brain Training Games',
    description: 'Boost cognitive function with engaging brain exercises',
    features: [
      'Memory match challenges',
      'Reaction time training',
      'Color pattern recognition',
      'Performance analytics and scoring',
      'Celebration animations and rewards'
    ],
    icon: 'brain',
    color: '#FF6B6B',
    demoType: 'brain-games',
  },
  {
    id: 'update-3',
    version: 'v1.3.0',
    title: 'AI Wellness Assistant',
    description: 'Context-aware chat for personalized wellness guidance',
    features: [
      'Intelligent wellness recommendations',
      'Meditation and mindfulness guidance',
      'Personalized health insights',
      'Privacy-focused in-house AI model',
      '24/7 wellness support'
    ],
    icon: 'chatbubbles',
    color: '#9C27B0',
    demoType: 'ai-chat',
  },
  {
    id: 'update-4',
    version: 'v1.4.0',
    title: 'Insurance Integration',
    description: 'Gamified insurance engagement with premium rewards',
    features: [
      'Premium reduction challenges',
      'Insurance literacy quests and quizzes',
      'Health goal-based discounts',
      'Policy management gamification',
      'Reward coins for policy activities'
    ],
    icon: 'shield-checkmark',
    color: '#FF9800',
    demoType: 'insurance',
  },
];

export default function UpdateDemoSystem({ onBack }: UpdateDemoSystemProps) {
  const [selectedDemo, setSelectedDemo] = useState<UpdateDemo | null>(null);
  const [showDemoModal, setShowDemoModal] = useState(false);

  const handleDemoSelect = (demo: UpdateDemo) => {
    setSelectedDemo(demo);
    setShowDemoModal(true);
  };

  const closeDemoModal = () => {
    setShowDemoModal(false);
    setSelectedDemo(null);
  };

  const renderDemoContent = () => {
    if (!selectedDemo) return null;

    switch (selectedDemo.demoType) {
      case 'ar-yoga':
        return (
          <View style={styles.demoContent}>
            <View style={styles.mockARScreen}>
              <View style={styles.arGrid}>
                {[...Array(16)].map((_, i) => (
                  <View key={i} style={styles.gridDot} />
                ))}
              </View>
              <View style={styles.arOverlay}>
                <View style={styles.poseIndicator}>
                  <Ionicons name="body" size={wp(12)} color="#4ECDC4" />
                  <Text style={styles.poseText}>Plank Detected!</Text>
                </View>
                <View style={styles.stabilityMeter}>
                  <Text style={styles.meterLabel}>Stability: 92%</Text>
                  <View style={styles.meterBar}>
                    <View style={[styles.meterFill, { width: '92%' }]} />
                  </View>
                </View>
              </View>
            </View>
            <Text style={styles.demoDescription}>
              Real-time AR tracking provides instant feedback on your yoga poses and fitness exercises.
            </Text>
          </View>
        );

      case 'brain-games':
        return (
          <View style={styles.demoContent}>
            <View style={styles.gamePreview}>
              <View style={styles.memoryCards}>
                {[1, 2, 3, 4].map((card) => (
                  <View key={card} style={styles.memoryCard}>
                    <Ionicons name="star" size={wp(6)} color="#FFD700" />
                  </View>
                ))}
              </View>
              <View style={styles.gameStats}>
                <Text style={styles.statText}>Memory Match • Level 3</Text>
                <Text style={styles.scoreText}>Score: 850 pts</Text>
              </View>
            </View>
            <LottieView
              source={require('@/assets/lottie/confetti-transparent.json')}
              autoPlay
              loop={false}
              style={styles.celebrationAnim}
            />
            <Text style={styles.demoDescription}>
              Train your brain with engaging games that improve memory, reaction time, and cognitive skills.
            </Text>
          </View>
        );

      case 'ai-chat':
        return (
          <View style={styles.demoContent}>
            <View style={styles.chatPreview}>
              <View style={styles.chatBubble}>
                <Text style={styles.chatText}>
                  "How can I improve my sleep quality?"
                </Text>
              </View>
              <View style={[styles.chatBubble, styles.aiResponse]}>
                <Text style={styles.chatText}>
                  Based on your activity, I recommend a 10-minute meditation before bed and avoiding screens 1 hour before sleep. Would you like a guided sleep meditation?
                </Text>
              </View>
            </View>
            <Text style={styles.demoDescription}>
              Get personalized wellness advice from our AI assistant trained on health and wellness best practices.
            </Text>
          </View>
        );

      case 'insurance':
        return (
          <View style={styles.demoContent}>
            <View style={styles.insuranceGoal}>
              <View style={styles.goalHeader}>
                <Ionicons name="shield-checkmark" size={wp(8)} color="#FF9800" />
                <Text style={styles.goalTitle}>Premium Reduction Challenge</Text>
              </View>
              <Text style={styles.goalDesc}>Walk 150,000 steps this month</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '67%' }]} />
              </View>
              <Text style={styles.progressText}>67% Complete • Save $25/month</Text>
            </View>
            <Text style={styles.demoDescription}>
              Complete health challenges to earn real premium discounts and improve your insurance benefits.
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={wp(6)} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Feature Updates</Text>
        <View style={styles.updateBadge}>
          <Ionicons name="sparkles" size={wp(4)} color="#FFD700" />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerInfo}>
          <Text style={styles.subtitle}>Discover What's New</Text>
          <Text style={styles.description}>
            Explore the latest features and improvements in YouMatter. 
            Try each demo to see how we're making wellness more engaging!
          </Text>
        </View>

        {UPDATE_DEMOS.map((demo) => (
          <TouchableOpacity
            key={demo.id}
            style={[styles.updateCard, { borderLeftColor: demo.color }]}
            onPress={() => handleDemoSelect(demo)}
          >
            <View style={styles.cardHeader}>
              <View style={[styles.cardIcon, { backgroundColor: demo.color }]}>
                <Ionicons name={demo.icon} size={wp(6)} color="white" />
              </View>
              <View style={styles.cardInfo}>
                <View style={styles.versionBadge}>
                  <Text style={styles.versionText}>{demo.version}</Text>
                </View>
                <Text style={styles.cardTitle}>{demo.title}</Text>
                <Text style={styles.cardDescription}>{demo.description}</Text>
              </View>
              <View style={styles.playButton}>
                <Ionicons name="play-circle" size={wp(8)} color={demo.color} />
              </View>
            </View>

            <View style={styles.featuresList}>
              {demo.features.slice(0, 3).map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <Ionicons name="checkmark-circle" size={wp(4)} color="#4CAF50" />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
              {demo.features.length > 3 && (
                <Text style={styles.moreFeatures}>
                  +{demo.features.length - 3} more features
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}

        <View style={styles.footerInfo}>
          <LottieView
            source={require('@/assets/lottie/success-confetti.json')}
            autoPlay={false}
            loop={false}
            style={styles.footerAnimation}
          />
          <Text style={styles.footerTitle}>Stay Updated!</Text>
          <Text style={styles.footerText}>
            New features are added regularly to enhance your wellness journey. 
            Check back here to discover the latest innovations!
          </Text>
        </View>
      </ScrollView>

      {/* Demo Modal */}
      <Modal
        visible={showDemoModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeDemoModal} style={styles.closeButton}>
              <Ionicons name="close" size={wp(6)} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedDemo?.title}</Text>
            <View style={[styles.modalBadge, { backgroundColor: selectedDemo?.color }]}>
              <Text style={styles.modalVersion}>{selectedDemo?.version}</Text>
            </View>
          </View>

          <ScrollView style={styles.modalContent}>
            {renderDemoContent()}
            
            {selectedDemo && (
              <View style={styles.allFeatures}>
                <Text style={styles.allFeaturesTitle}>All Features:</Text>
                {selectedDemo.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Ionicons name="checkmark-circle" size={wp(4)} color="#4CAF50" />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    paddingTop: hp(6),
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: wp(2),
  },
  title: {
    fontSize: rfs(24),
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  updateBadge: {
    padding: wp(2),
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  headerInfo: {
    paddingVertical: hp(3),
    alignItems: 'center',
  },
  subtitle: {
    fontSize: rfs(20),
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: hp(1),
  },
  description: {
    fontSize: rfs(14),
    color: Colors.light.tabIconDefault,
    textAlign: 'center',
    lineHeight: rfs(20),
    paddingHorizontal: wp(4),
  },
  updateCard: {
    backgroundColor: 'white',
    borderRadius: wp(4),
    padding: wp(4),
    marginBottom: hp(3),
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  cardIcon: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  cardInfo: {
    flex: 1,
  },
  versionBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
    borderRadius: wp(2),
    alignSelf: 'flex-start',
    marginBottom: hp(0.5),
  },
  versionText: {
    fontSize: rfs(10),
    color: '#1976D2',
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: rfs(16),
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: hp(0.5),
  },
  cardDescription: {
    fontSize: rfs(12),
    color: Colors.light.tabIconDefault,
  },
  playButton: {
    marginLeft: wp(2),
  },
  featuresList: {
    marginTop: hp(1),
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(0.5),
  },
  featureText: {
    fontSize: rfs(12),
    color: Colors.light.text,
    marginLeft: wp(2),
    flex: 1,
  },
  moreFeatures: {
    fontSize: rfs(11),
    color: Colors.light.tabIconDefault,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: hp(0.5),
  },
  footerInfo: {
    alignItems: 'center',
    paddingVertical: hp(4),
    backgroundColor: 'white',
    borderRadius: wp(4),
    marginBottom: hp(4),
  },
  footerAnimation: {
    width: wp(20),
    height: wp(20),
  },
  footerTitle: {
    fontSize: rfs(18),
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: hp(1),
  },
  footerText: {
    fontSize: rfs(14),
    color: Colors.light.tabIconDefault,
    textAlign: 'center',
    paddingHorizontal: wp(6),
    lineHeight: rfs(20),
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    paddingTop: hp(6),
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  closeButton: {
    padding: wp(2),
  },
  modalTitle: {
    fontSize: rfs(18),
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  modalBadge: {
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
    borderRadius: wp(2),
  },
  modalVersion: {
    fontSize: rfs(10),
    color: 'white',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: wp(4),
  },
  demoContent: {
    backgroundColor: 'white',
    borderRadius: wp(4),
    padding: wp(4),
    marginBottom: hp(3),
  },
  mockARScreen: {
    height: hp(25),
    backgroundColor: '#000',
    borderRadius: wp(2),
    position: 'relative',
    marginBottom: hp(2),
  },
  arGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: wp(4),
  },
  gridDot: {
    width: 2,
    height: 2,
    backgroundColor: '#4ECDC4',
    borderRadius: 1,
    opacity: 0.6,
  },
  arOverlay: {
    position: 'absolute',
    bottom: wp(4),
    left: wp(4),
    right: wp(4),
  },
  poseIndicator: {
    alignItems: 'center',
    marginBottom: hp(1),
  },
  poseText: {
    color: 'white',
    fontSize: rfs(16),
    fontWeight: 'bold',
    marginTop: hp(0.5),
  },
  stabilityMeter: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: wp(2),
    borderRadius: wp(2),
  },
  meterLabel: {
    fontSize: rfs(12),
    fontWeight: 'bold',
    marginBottom: hp(0.5),
  },
  meterBar: {
    height: hp(0.8),
    backgroundColor: '#E0E0E0',
    borderRadius: hp(0.4),
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: hp(0.4),
  },
  demoDescription: {
    fontSize: rfs(14),
    color: Colors.light.tabIconDefault,
    textAlign: 'center',
    lineHeight: rfs(20),
  },
  gamePreview: {
    alignItems: 'center',
    marginBottom: hp(2),
  },
  memoryCards: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: hp(2),
  },
  memoryCard: {
    width: wp(12),
    height: wp(12),
    backgroundColor: '#FF6B6B',
    borderRadius: wp(2),
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: wp(1),
  },
  gameStats: {
    alignItems: 'center',
  },
  statText: {
    fontSize: rfs(16),
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  scoreText: {
    fontSize: rfs(14),
    color: '#FFD700',
    fontWeight: 'bold',
  },
  celebrationAnim: {
    width: wp(30),
    height: wp(30),
    alignSelf: 'center',
  },
  chatPreview: {
    marginBottom: hp(2),
  },
  chatBubble: {
    backgroundColor: '#E3F2FD',
    padding: wp(3),
    borderRadius: wp(4),
    marginBottom: hp(1),
    alignSelf: 'flex-end',
    maxWidth: '80%',
  },
  aiResponse: {
    backgroundColor: '#F3E5F5',
    alignSelf: 'flex-start',
  },
  chatText: {
    fontSize: rfs(14),
    color: Colors.light.text,
  },
  insuranceGoal: {
    backgroundColor: '#FFF3E0',
    padding: wp(4),
    borderRadius: wp(3),
    marginBottom: hp(2),
  },
  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(1),
  },
  goalTitle: {
    fontSize: rfs(16),
    fontWeight: 'bold',
    color: Colors.light.text,
    marginLeft: wp(2),
  },
  goalDesc: {
    fontSize: rfs(14),
    color: Colors.light.tabIconDefault,
    marginBottom: hp(1),
  },
  progressBar: {
    height: hp(1),
    backgroundColor: '#E0E0E0',
    borderRadius: hp(0.5),
    overflow: 'hidden',
    marginBottom: hp(0.5),
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF9800',
    borderRadius: hp(0.5),
  },
  progressText: {
    fontSize: rfs(12),
    color: '#FF9800',
    fontWeight: 'bold',
  },
  allFeatures: {
    backgroundColor: 'white',
    borderRadius: wp(4),
    padding: wp(4),
  },
  allFeaturesTitle: {
    fontSize: rfs(16),
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: hp(1.5),
  },
});