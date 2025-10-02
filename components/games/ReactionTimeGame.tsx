import { Colors } from '@/constants/theme';
import { hp, rfs, wp } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { useEffect, useRef, useState } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    Vibration,
    View,
} from 'react-native';

interface ReactionTimeGameProps {
  onGameComplete: (score: number) => void;
  onBack: () => void;
}

type GameState = 'ready' | 'waiting' | 'react' | 'result' | 'completed';

export default function ReactionTimeGame({ onGameComplete, onBack }: ReactionTimeGameProps) {
  const [gameState, setGameState] = useState<GameState>('ready');
  const [currentRound, setCurrentRound] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [waitStartTime, setWaitStartTime] = useState<number>(0);
  const [reactStartTime, setReactStartTime] = useState<number>(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [bestTime, setBestTime] = useState<number | null>(null);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const colorValue = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const totalRounds = 5;

  useEffect(() => {
    if (gameState === 'waiting') {
      startWaitingPhase();
    } else if (gameState === 'react') {
      startReactionPhase();
    }
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'react') {
      // Pulse animation for reaction phase
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [gameState]);

  const startWaitingPhase = () => {
    const waitTime = Math.random() * 3000 + 2000; // 2-5 seconds
    setWaitStartTime(Date.now());

    // Animate to red (waiting state)
    Animated.timing(colorValue, {
      toValue: 0,
      duration: 500,
      useNativeDriver: false,
    }).start();

    setTimeout(() => {
      if (gameState === 'waiting') { // Check if user didn't tap early
        setGameState('react');
      }
    }, waitTime);
  };

  const startReactionPhase = () => {
    setReactStartTime(Date.now());
    Vibration.vibrate(100);

    // Animate to green (react state)
    Animated.timing(colorValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleTap = () => {
    const currentTime = Date.now();

    switch (gameState) {
      case 'ready':
        setGameState('waiting');
        setCurrentRound(prev => prev + 1);
        break;

      case 'waiting':
        // Too early!
        setGameState('result');
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 0.8,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
        break;

      case 'react':
        // Calculate reaction time
        const reactionTime = currentTime - reactStartTime;
        const newTimes = [...reactionTimes, reactionTime];
        setReactionTimes(newTimes);
        
        if (!bestTime || reactionTime < bestTime) {
          setBestTime(reactionTime);
        }

        setGameState('result');
        
        // Success animation
        Animated.timing(scaleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
        });

        // Check if game is complete
        if (newTimes.length >= totalRounds) {
          setTimeout(() => completeGame(newTimes), 2000);
        }
        break;

      case 'result':
        if (reactionTimes.length < totalRounds) {
          setGameState('ready');
        }
        break;
    }
  };

  const completeGame = (times: number[]) => {
    setGameState('completed');
    setShowCelebration(true);

    const averageTime = times.reduce((a, b) => a + b, 0) / times.length;
    const score = Math.max(100, Math.round(1000 - averageTime / 2));

    setTimeout(() => {
      onGameComplete(score);
    }, 3000);
  };

  const getStateColor = () => {
    return colorValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['#FF6B6B', '#4ECDC4'], // Red to Green
    });
  };

  const getStateText = () => {
    switch (gameState) {
      case 'ready':
        return currentRound === 0 ? 'Tap to Start' : 'Tap for Next Round';
      case 'waiting':
        return 'Wait for Green...';
      case 'react':
        return 'TAP NOW!';
      case 'result':
        if (reactionTimes.length === 0) {
          return 'Too Early!\nWait for Green';
        }
        const lastTime = reactionTimes[reactionTimes.length - 1];
        return `${lastTime}ms\n${getReactionRating(lastTime)}`;
      case 'completed':
        const avg = reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length;
        return `Complete!\nAverage: ${Math.round(avg)}ms`;
      default:
        return '';
    }
  };

  const getReactionRating = (time: number): string => {
    if (time < 200) return 'Lightning Fast! ⚡';
    if (time < 300) return 'Excellent! 🎯';
    if (time < 400) return 'Good! 👍';
    if (time < 500) return 'Average 👌';
    return 'Keep Practicing! 💪';
  };

  const resetGame = () => {
    setGameState('ready');
    setCurrentRound(0);
    setReactionTimes([]);
    setShowCelebration(false);
    scaleAnim.setValue(1);
    colorValue.setValue(0);
    pulseAnim.setValue(1);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={wp(6)} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Reaction Time</Text>
        <TouchableOpacity onPress={resetGame} style={styles.resetButton}>
          <Ionicons name="refresh" size={wp(5)} color={Colors.light.tint} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Round</Text>
          <Text style={styles.statValue}>{currentRound}/{totalRounds}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Best Time</Text>
          <Text style={styles.statValue}>
            {bestTime ? `${bestTime}ms` : '--'}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Average</Text>
          <Text style={styles.statValue}>
            {reactionTimes.length > 0 
              ? `${Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length)}ms`
              : '--'
            }
          </Text>
        </View>
      </View>

      {/* Game Circle */}
      <View style={styles.gameContainer}>
        <TouchableOpacity
          onPress={handleTap}
          activeOpacity={0.9}
          style={styles.gameCircleContainer}
        >
          <Animated.View
            style={[
              styles.gameCircle,
              {
                backgroundColor: getStateColor(),
                transform: [
                  { scale: scaleAnim },
                  { scale: gameState === 'react' ? pulseAnim : 1 },
                ],
              },
            ]}
          >
            <Text style={styles.gameText}>{getStateText()}</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>How to Play:</Text>
        <Text style={styles.instructions}>
          1. Tap the circle to start{'\n'}
          2. Wait for the circle to turn GREEN{'\n'}
          3. Tap as quickly as possible when it turns green{'\n'}
          4. Complete 5 rounds to get your score
        </Text>
      </View>

      {/* Results List */}
      {reactionTimes.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Your Times:</Text>
          <View style={styles.resultsList}>
            {reactionTimes.map((time, index) => (
              <View key={index} style={styles.resultItem}>
                <Text style={styles.resultRound}>Round {index + 1}</Text>
                <Text style={styles.resultTime}>{time}ms</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Celebration Animation */}
      {showCelebration && (
        <View style={styles.celebrationOverlay}>
          <LottieView
            source={require('@/assets/lottie/confetti-transparent.json')}
            autoPlay
            loop={false}
            style={styles.celebrationAnimation}
          />
          <Text style={styles.celebrationText}>Great Reflexes!</Text>
          <Text style={styles.celebrationScore}>
            Score: {Math.max(100, Math.round(1000 - (reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length) / 2))}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
    paddingHorizontal: wp(4),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: hp(2),
    paddingTop: hp(6),
  },
  backButton: {
    padding: wp(2),
  },
  title: {
    fontSize: rfs(24),
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  resetButton: {
    padding: wp(2),
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: hp(2),
    backgroundColor: 'white',
    borderRadius: wp(4),
    marginVertical: hp(2),
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: rfs(12),
    color: Colors.light.tabIconDefault,
    marginBottom: hp(0.5),
  },
  statValue: {
    fontSize: rfs(16),
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  gameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: hp(4),
  },
  gameCircleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameCircle: {
    width: wp(60),
    height: wp(60),
    borderRadius: wp(30),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  gameText: {
    fontSize: rfs(18),
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    lineHeight: rfs(22),
  },
  instructionsContainer: {
    backgroundColor: 'white',
    borderRadius: wp(4),
    padding: wp(4),
    marginBottom: hp(2),
  },
  instructionsTitle: {
    fontSize: rfs(16),
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: hp(1),
  },
  instructions: {
    fontSize: rfs(14),
    color: Colors.light.tabIconDefault,
    lineHeight: rfs(20),
  },
  resultsContainer: {
    backgroundColor: 'white',
    borderRadius: wp(4),
    padding: wp(4),
    marginBottom: hp(2),
  },
  resultsTitle: {
    fontSize: rfs(16),
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: hp(1),
  },
  resultsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  resultItem: {
    width: '48%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: hp(0.5),
  },
  resultRound: {
    fontSize: rfs(12),
    color: Colors.light.tabIconDefault,
  },
  resultTime: {
    fontSize: rfs(12),
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  celebrationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  celebrationAnimation: {
    width: wp(80),
    height: hp(40),
  },
  celebrationText: {
    fontSize: rfs(28),
    fontWeight: 'bold',
    color: 'white',
    marginTop: hp(2),
  },
  celebrationScore: {
    fontSize: rfs(20),
    color: '#FFD700',
    marginTop: hp(1),
  },
});