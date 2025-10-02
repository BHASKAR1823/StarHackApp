import { Colors } from '@/constants/theme';
import { triggerHapticFeedback } from '@/utils/animations';
import { hp, rfs, wp } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { useEffect, useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface MeditationSessionProps {
  onBack: () => void;
  onComplete: (duration: number, coins: number) => void;
}

interface MeditationProgram {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  category: 'focus' | 'sleep' | 'stress' | 'mindfulness';
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

const MEDITATION_PROGRAMS: MeditationProgram[] = [
  {
    id: 'quick-breath',
    title: '5-Min Breathing',
    description: 'Quick stress relief breathing exercise',
    duration: 5,
    category: 'stress',
    icon: 'leaf',
    color: '#4CAF50',
  },
  {
    id: 'focus-boost',
    title: 'Focus Enhancer',
    description: 'Improve concentration and mental clarity',
    duration: 10,
    category: 'focus',
    icon: 'eye',
    color: '#2196F3',
  },
  {
    id: 'sleep-prep',
    title: 'Sleep Preparation',
    description: 'Wind down for better sleep quality',
    duration: 15,
    category: 'sleep',
    icon: 'moon',
    color: '#9C27B0',
  },
  {
    id: 'mindful-moment',
    title: 'Mindful Awareness',
    description: 'Present moment awareness practice',
    duration: 8,
    category: 'mindfulness',
    icon: 'flower',
    color: '#FF9800',
  },
];

export default function MeditationSession({ onBack, onComplete }: MeditationSessionProps) {
  const [selectedProgram, setSelectedProgram] = useState<MeditationProgram | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [phase, setPhase] = useState<'select' | 'prepare' | 'meditate' | 'complete'>('select');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            completeMeditation();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const startMeditation = (program: MeditationProgram) => {
    setSelectedProgram(program);
    setTimeLeft(program.duration * 60); // Convert minutes to seconds
    setPhase('prepare');
    triggerHapticFeedback('medium');

    // Short preparation period
    setTimeout(() => {
      setPhase('meditate');
      setIsActive(true);
      triggerHapticFeedback('light');
    }, 3000);
  };

  const completeMeditation = () => {
    if (!selectedProgram) return;

    setIsActive(false);
    setPhase('complete');

    const coins = selectedProgram.duration * 5; // 5 coins per minute
    
    triggerHapticFeedback('success');
    
    setTimeout(() => {
      onComplete(selectedProgram.duration, coins);
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'prepare':
        return 'Get comfortable and close your eyes...';
      case 'meditate':
        return 'Focus on your breath and stay present';
      case 'complete':
        return 'Meditation complete! Well done.';
      default:
        return '';
    }
  };

  const getBreathingCue = () => {
    const cycle = Math.floor((selectedProgram?.duration * 60 - timeLeft) / 8) % 2;
    return cycle === 0 ? 'Breathe in...' : 'Breathe out...';
  };

  if (phase !== 'select') {
    return (
      <View style={styles.sessionContainer}>
        {/* Session Header */}
        <View style={styles.sessionHeader}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="close" size={wp(6)} color="white" />
          </TouchableOpacity>
          <Text style={styles.sessionTitle}>{selectedProgram?.title}</Text>
          <View style={styles.timerDisplay}>
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
        </View>

        {/* Session Content */}
        <View style={styles.sessionContent}>
          {phase === 'prepare' && (
            <View style={styles.prepareContent}>
              <LottieView
                source={require('@/assets/lottie/confetti-transparent.json')}
                autoPlay
                loop
                style={styles.prepareAnimation}
              />
              <Text style={styles.prepareText}>Preparing your meditation...</Text>
              <Text style={styles.instructionText}>Find a comfortable position</Text>
            </View>
          )}

          {phase === 'meditate' && (
            <View style={styles.meditateContent}>
              <View style={[styles.breathingCircle, { backgroundColor: selectedProgram?.color }]}>
                <View style={styles.breathingInner}>
                  <Ionicons name={selectedProgram?.icon} size={wp(12)} color="white" />
                </View>
              </View>
              <Text style={styles.phaseText}>{getPhaseText()}</Text>
              <Text style={styles.breathingCue}>{getBreathingCue()}</Text>
            </View>
          )}

          {phase === 'complete' && (
            <View style={styles.completeContent}>
              <LottieView
                source={require('@/assets/lottie/success-confetti.json')}
                autoPlay
                loop={false}
                style={styles.successAnimation}
              />
              <Text style={styles.completeText}>Meditation Complete!</Text>
              <Text style={styles.rewardText}>
                +{selectedProgram?.duration * 5} coins earned
              </Text>
            </View>
          )}
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${((selectedProgram?.duration * 60 - timeLeft) / (selectedProgram?.duration * 60)) * 100}%`,
                  backgroundColor: selectedProgram?.color 
                }
              ]} 
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={wp(6)} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Meditation</Text>
        <View style={styles.meditationIcon}>
          <Ionicons name="leaf" size={wp(6)} color="#4CAF50" />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Meditation Programs */}
        <View style={styles.programsContainer}>
          <Text style={styles.sectionTitle}>Choose Your Session</Text>
          <Text style={styles.sectionDescription}>
            Select a meditation program that fits your current needs
          </Text>

          {MEDITATION_PROGRAMS.map((program) => (
            <TouchableOpacity
              key={program.id}
              style={[styles.programCard, { borderLeftColor: program.color }]}
              onPress={() => startMeditation(program)}
            >
              <View style={styles.programContent}>
                <View style={[styles.programIcon, { backgroundColor: program.color }]}>
                  <Ionicons name={program.icon} size={wp(6)} color="white" />
                </View>
                <View style={styles.programInfo}>
                  <Text style={styles.programTitle}>{program.title}</Text>
                  <Text style={styles.programDescription}>{program.description}</Text>
                  <View style={styles.programMeta}>
                    <View style={styles.durationBadge}>
                      <Ionicons name="time" size={wp(3)} color={program.color} />
                      <Text style={[styles.durationText, { color: program.color }]}>
                        {program.duration} min
                      </Text>
                    </View>
                    <View style={styles.coinsBadge}>
                      <Ionicons name="diamond" size={wp(3)} color="#FFD700" />
                      <Text style={styles.coinsText}>+{program.duration * 5}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.startButton}>
                  <Ionicons name="play" size={wp(5)} color={program.color} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsContainer}>
          <Text style={styles.sectionTitle}>Meditation Benefits</Text>
          <View style={styles.benefitsList}>
            {[
              { icon: 'happy', title: 'Reduces Stress', desc: 'Lower cortisol levels' },
              { icon: 'eye', title: 'Improves Focus', desc: 'Enhanced concentration' },
              { icon: 'heart', title: 'Better Sleep', desc: 'Deeper rest quality' },
              { icon: 'trending-up', title: 'Mental Clarity', desc: 'Clearer thinking' },
            ].map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Ionicons name={benefit.icon} size={wp(4)} color="#4CAF50" />
                </View>
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  <Text style={styles.benefitDesc}>{benefit.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const { width, height } = Dimensions.get('window');

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
  meditationIcon: {
    padding: wp(2),
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  programsContainer: {
    paddingVertical: hp(3),
  },
  sectionTitle: {
    fontSize: rfs(20),
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: hp(1),
  },
  sectionDescription: {
    fontSize: rfs(14),
    color: Colors.light.tabIconDefault,
    marginBottom: hp(3),
    lineHeight: rfs(20),
  },
  programCard: {
    backgroundColor: 'white',
    borderRadius: wp(4),
    marginBottom: hp(2),
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  programContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(4),
  },
  programIcon: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  programInfo: {
    flex: 1,
  },
  programTitle: {
    fontSize: rfs(16),
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: hp(0.5),
  },
  programDescription: {
    fontSize: rfs(12),
    color: Colors.light.tabIconDefault,
    marginBottom: hp(1),
  },
  programMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.3),
    borderRadius: wp(3),
    marginRight: wp(2),
  },
  durationText: {
    fontSize: rfs(10),
    fontWeight: 'bold',
    marginLeft: wp(0.5),
  },
  coinsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinsText: {
    fontSize: rfs(10),
    fontWeight: 'bold',
    color: '#FFD700',
    marginLeft: wp(0.5),
  },
  startButton: {
    width: wp(10),
    height: wp(10),
    borderRadius: wp(5),
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitsContainer: {
    backgroundColor: 'white',
    borderRadius: wp(4),
    padding: wp(4),
    marginBottom: hp(4),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  benefitsList: {
    marginTop: hp(1),
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  benefitIcon: {
    width: wp(8),
    height: wp(8),
    borderRadius: wp(4),
    backgroundColor: Colors.light.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: rfs(14),
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  benefitDesc: {
    fontSize: rfs(12),
    color: Colors.light.tabIconDefault,
  },
  // Session Styles
  sessionContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: wp(4),
    paddingVertical: hp(2),
    paddingTop: hp(6),
  },
  sessionTitle: {
    fontSize: rfs(18),
    fontWeight: 'bold',
    color: 'white',
  },
  timerDisplay: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: wp(3),
    paddingVertical: hp(0.5),
    borderRadius: wp(4),
  },
  timerText: {
    fontSize: rfs(16),
    fontWeight: 'bold',
    color: 'white',
  },
  sessionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: wp(6),
  },
  prepareContent: {
    alignItems: 'center',
  },
  prepareAnimation: {
    width: wp(40),
    height: wp(40),
    marginBottom: hp(2),
  },
  prepareText: {
    fontSize: rfs(20),
    fontWeight: 'bold',
    color: 'white',
    marginBottom: hp(1),
  },
  instructionText: {
    fontSize: rfs(14),
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  meditateContent: {
    alignItems: 'center',
  },
  breathingCircle: {
    width: wp(50),
    height: wp(50),
    borderRadius: wp(25),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp(4),
    opacity: 0.8,
  },
  breathingInner: {
    width: wp(40),
    height: wp(40),
    borderRadius: wp(20),
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  phaseText: {
    fontSize: rfs(18),
    fontWeight: 'bold',
    color: 'white',
    marginBottom: hp(2),
    textAlign: 'center',
  },
  breathingCue: {
    fontSize: rfs(16),
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  completeContent: {
    alignItems: 'center',
  },
  successAnimation: {
    width: wp(60),
    height: wp(60),
    marginBottom: hp(2),
  },
  completeText: {
    fontSize: rfs(24),
    fontWeight: 'bold',
    color: 'white',
    marginBottom: hp(1),
  },
  rewardText: {
    fontSize: rfs(16),
    color: '#FFD700',
    fontWeight: 'bold',
  },
  progressContainer: {
    paddingHorizontal: wp(4),
    paddingBottom: hp(4),
  },
  progressBar: {
    height: hp(0.5),
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: hp(0.25),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: hp(0.25),
  },
});