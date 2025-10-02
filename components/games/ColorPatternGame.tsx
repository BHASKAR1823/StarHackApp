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

interface ColorPattern {
  id: string;
  color: string;
  name: string;
}

const COLORS: ColorPattern[] = [
  { id: '1', color: '#FF6B6B', name: 'Red' },
  { id: '2', color: '#4ECDC4', name: 'Teal' },
  { id: '3', color: '#45B7D1', name: 'Blue' },
  { id: '4', color: '#96CEB4', name: 'Green' },
  { id: '5', color: '#FFEAA7', name: 'Yellow' },
  { id: '6', color: '#DDA0DD', name: 'Purple' },
];

interface ColorPatternGameProps {
  onGameComplete: (score: number) => void;
  onBack: () => void;
}

type GameState = 'ready' | 'showing' | 'input' | 'result' | 'completed';

export default function ColorPatternGame({ onGameComplete, onBack }: ColorPatternGameProps) {
  const [gameState, setGameState] = useState<GameState>('ready');
  const [currentLevel, setCurrentLevel] = useState(1);
  const [pattern, setPattern] = useState<ColorPattern[]>([]);
  const [userInput, setUserInput] = useState<ColorPattern[]>([]);
  const [showingIndex, setShowingIndex] = useState(-1);
  const [score, setScore] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [lives, setLives] = useState(3);

  const flashAnim = useRef(new Animated.Value(0)).current;
  const buttonAnims = useRef(COLORS.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    if (gameState === 'showing' && showingIndex >= 0) {
      flashColor(showingIndex);
    }
  }, [gameState, showingIndex]);

  const startGame = () => {
    generatePattern(currentLevel);
    setGameState('showing');
    setShowingIndex(0);
    setUserInput([]);
  };

  const generatePattern = (length: number) => {
    const newPattern: ColorPattern[] = [];
    for (let i = 0; i < length + 2; i++) { // Increase difficulty each level
      const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      newPattern.push(randomColor);
    }
    setPattern(newPattern);
  };

  const flashColor = (index: number) => {
    if (index >= pattern.length) {
      // Pattern showing complete, start input phase
      setGameState('input');
      setShowingIndex(-1);
      return;
    }

    const colorIndex = COLORS.findIndex(c => c.id === pattern[index].id);
    if (colorIndex !== -1) {
      Vibration.vibrate(100);
      
      // Flash animation
      Animated.sequence([
        Animated.timing(buttonAnims[colorIndex], {
          toValue: 1.2,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(buttonAnims[colorIndex], {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Move to next color after delay
      setTimeout(() => {
        setShowingIndex(index + 1);
      }, 600);
    }
  };

  const handleColorPress = (color: ColorPattern) => {
    if (gameState !== 'input') return;

    const newUserInput = [...userInput, color];
    setUserInput(newUserInput);

    const currentIndex = newUserInput.length - 1;
    const isCorrect = pattern[currentIndex]?.id === color.id;

    if (isCorrect) {
      // Correct color
      if (newUserInput.length === pattern.length) {
        // Level complete!
        setScore(prev => prev + currentLevel * 100);
        setGameState('result');
        
        if (currentLevel >= 5) {
          // Game complete
          setTimeout(() => completeGame(), 2000);
        } else {
          setTimeout(() => {
            setCurrentLevel(prev => prev + 1);
            setGameState('ready');
          }, 2000);
        }
      }
    } else {
      // Wrong color
      setLives(prev => {
        const newLives = prev - 1;
        if (newLives <= 0) {
          setTimeout(() => completeGame(), 1500);
        } else {
          setTimeout(() => {
            setGameState('ready');
            setUserInput([]);
          }, 1500);
        }
        return newLives;
      });
      setGameState('result');
      
      // Shake animation for wrong answer
      Animated.sequence([
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(flashAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(flashAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const completeGame = () => {
    setGameState('completed');
    setShowCelebration(true);

    const finalScore = score + (lives * 50); // Bonus for remaining lives

    setTimeout(() => {
      onGameComplete(finalScore);
    }, 3000);
  };

  const resetGame = () => {
    setGameState('ready');
    setCurrentLevel(1);
    setScore(0);
    setLives(3);
    setPattern([]);
    setUserInput([]);
    setShowingIndex(-1);
    setShowCelebration(false);
  };

  const getGameStateText = () => {
    switch (gameState) {
      case 'ready':
        return currentLevel === 1 ? 'Tap Start to Begin' : `Level ${currentLevel}\nTap Start`;
      case 'showing':
        return 'Watch the Pattern...';
      case 'input':
        return `Repeat the Pattern\n${userInput.length}/${pattern.length}`;
      case 'result':
        const isCorrect = userInput.length > 0 && 
          pattern[userInput.length - 1]?.id === userInput[userInput.length - 1]?.id;
        return isCorrect ? 'Correct! 🎉' : 'Wrong! 😔';
      case 'completed':
        return `Game Over!\nFinal Score: ${score + (lives * 50)}`;
      default:
        return '';
    }
  };

  const shakeStyle = {
    transform: [
      {
        translateX: flashAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 10],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={wp(6)} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Color Pattern</Text>
        <TouchableOpacity onPress={resetGame} style={styles.resetButton}>
          <Ionicons name="refresh" size={wp(5)} color={Colors.light.tint} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Level</Text>
          <Text style={styles.statValue}>{currentLevel}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Score</Text>
          <Text style={styles.statValue}>{score}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Lives</Text>
          <View style={styles.livesContainer}>
            {[...Array(3)].map((_, index) => (
              <Ionicons
                key={index}
                name="heart"
                size={wp(4)}
                color={index < lives ? '#FF6B6B' : '#E0E0E0'}
                style={styles.heartIcon}
              />
            ))}
          </View>
        </View>
      </View>

      {/* Game Status */}
      <Animated.View style={[styles.statusContainer, shakeStyle]}>
        <Text style={styles.statusText}>{getGameStateText()}</Text>
        {(gameState === 'ready' || gameState === 'result') && currentLevel <= 5 && lives > 0 && (
          <TouchableOpacity onPress={startGame} style={styles.startButton}>
            <Text style={styles.startButtonText}>
              {gameState === 'ready' ? 'Start' : 'Continue'}
            </Text>
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Color Grid */}
      <View style={styles.colorGrid}>
        {COLORS.map((color, index) => (
          <Animated.View
            key={color.id}
            style={[
              styles.colorButtonContainer,
              { transform: [{ scale: buttonAnims[index] }] },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.colorButton,
                { backgroundColor: color.color },
                gameState === 'showing' && showingIndex === pattern.findIndex(p => p.id === color.id)
                  ? styles.activeColor : {},
                gameState !== 'input' ? styles.disabledColor : {},
              ]}
              onPress={() => handleColorPress(color)}
              disabled={gameState !== 'input'}
            >
              <Text style={styles.colorName}>{color.name}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      {/* Pattern Display */}
      {pattern.length > 0 && gameState === 'input' && (
        <View style={styles.patternContainer}>
          <Text style={styles.patternTitle}>Pattern to Match:</Text>
          <View style={styles.patternDisplay}>
            {pattern.map((color, index) => (
              <View
                key={index}
                style={[
                  styles.patternDot,
                  { backgroundColor: color.color },
                  index < userInput.length ? styles.completedDot : {},
                ]}
              />
            ))}
          </View>
        </View>
      )}

      {/* Celebration Animation */}
      {showCelebration && (
        <View style={styles.celebrationOverlay}>
          <LottieView
            source={require('@/assets/lottie/success-confetti.json')}
            autoPlay
            loop={false}
            style={styles.celebrationAnimation}
          />
          <Text style={styles.celebrationText}>Pattern Master!</Text>
          <Text style={styles.celebrationScore}>
            Final Score: {score + (lives * 50)}
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
  livesContainer: {
    flexDirection: 'row',
  },
  heartIcon: {
    marginHorizontal: wp(0.5),
  },
  statusContainer: {
    backgroundColor: 'white',
    borderRadius: wp(4),
    padding: wp(4),
    alignItems: 'center',
    marginBottom: hp(2),
  },
  statusText: {
    fontSize: rfs(18),
    fontWeight: 'bold',
    color: Colors.light.text,
    textAlign: 'center',
    lineHeight: rfs(24),
    marginBottom: hp(2),
  },
  startButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: wp(8),
    paddingVertical: hp(1.5),
    borderRadius: wp(6),
  },
  startButtonText: {
    fontSize: rfs(16),
    fontWeight: 'bold',
    color: 'white',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: hp(2),
  },
  colorButtonContainer: {
    width: '48%',
    marginBottom: hp(2),
  },
  colorButton: {
    height: hp(10),
    borderRadius: wp(4),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  activeColor: {
    elevation: 8,
    shadowOpacity: 0.4,
  },
  disabledColor: {
    opacity: 0.6,
  },
  colorName: {
    fontSize: rfs(16),
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  patternContainer: {
    backgroundColor: 'white',
    borderRadius: wp(4),
    padding: wp(4),
    alignItems: 'center',
  },
  patternTitle: {
    fontSize: rfs(14),
    color: Colors.light.tabIconDefault,
    marginBottom: hp(1),
  },
  patternDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  patternDot: {
    width: wp(6),
    height: wp(6),
    borderRadius: wp(3),
    margin: wp(1),
    opacity: 0.7,
  },
  completedDot: {
    opacity: 1,
    borderWidth: 2,
    borderColor: '#4ECDC4',
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