import { Colors } from '@/constants/theme';
import { hp, rfs, wp } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { useEffect, useState } from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';

interface Card {
  id: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const CARD_ICONS: (keyof typeof Ionicons.glyphMap)[] = [
  'heart', 'star', 'leaf', 'flash', 'diamond', 'flower',
  'snow', 'sunny', 'moon', 'flame', 'water', 'musical-note'
];

const CARD_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
];

interface MemoryMatchGameProps {
  onGameComplete: (score: number) => void;
  onBack: () => void;
}

export default function MemoryMatchGame({ onGameComplete, onBack }: MemoryMatchGameProps) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [gameTime, setGameTime] = useState(0);

  const celebrationScale = useSharedValue(0);

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (gameStarted) {
      const timer = setInterval(() => {
        setGameTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameStarted]);

  const initializeGame = () => {
    const gameIcons = CARD_ICONS.slice(0, 6); // Use 6 pairs (12 cards)
    const cardPairs = gameIcons.flatMap((icon, index) => [
      {
        id: index * 2,
        icon,
        color: CARD_COLORS[index % CARD_COLORS.length],
        isFlipped: false,
        isMatched: false,
      },
      {
        id: index * 2 + 1,
        icon,
        color: CARD_COLORS[index % CARD_COLORS.length],
        isFlipped: false,
        isMatched: false,
      }
    ]);

    // Shuffle cards
    const shuffledCards = cardPairs.sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
    setGameStarted(true);
  };

  const flipCard = (cardId: number) => {
    if (flippedCards.length >= 2) return;
    if (flippedCards.includes(cardId)) return;
    if (cards.find(card => card.id === cardId)?.isMatched) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Update card state
    setCards(prev => prev.map(card => 
      card.id === cardId ? { ...card, isFlipped: true } : card
    ));

    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);
      checkForMatch(newFlippedCards);
    }
  };

  const checkForMatch = (flippedCardIds: number[]) => {
    const [firstId, secondId] = flippedCardIds;
    const firstCard = cards.find(card => card.id === firstId);
    const secondCard = cards.find(card => card.id === secondId);

    setTimeout(() => {
      if (firstCard?.icon === secondCard?.icon) {
        // Match found
        setCards(prev => prev.map(card => 
          flippedCardIds.includes(card.id) 
            ? { ...card, isMatched: true }
            : card
        ));
        setMatches(prev => {
          const newMatches = prev + 1;
          if (newMatches === 6) { // All pairs matched
            completeGame();
          }
          return newMatches;
        });
      } else {
        // No match, flip back
        setCards(prev => prev.map(card => 
          flippedCardIds.includes(card.id) 
            ? { ...card, isFlipped: false }
            : card
        ));
      }
      setFlippedCards([]);
    }, 1000);
  };

  const completeGame = () => {
    setShowCelebration(true);
    celebrationScale.value = withSpring(1);

    // Calculate score based on moves and time
    const baseScore = 1000;
    const movesPenalty = moves * 10;
    const timePenalty = gameTime * 2;
    const finalScore = Math.max(100, baseScore - movesPenalty - timePenalty);

    setTimeout(() => {
      onGameComplete(finalScore);
    }, 3000);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const celebrationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: celebrationScale.value }],
    opacity: celebrationScale.value,
  }));

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={wp(6)} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Memory Match</Text>
        <View style={styles.stats}>
          <Text style={styles.statText}>Moves: {moves}</Text>
          <Text style={styles.statText}>Time: {formatTime(gameTime)}</Text>
        </View>
      </View>

      {/* Game Board */}
      <View style={styles.gameBoard}>
        {cards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={[
              styles.card,
              card.isFlipped || card.isMatched ? { backgroundColor: card.color } : {},
            ]}
            onPress={() => flipCard(card.id)}
            disabled={card.isFlipped || card.isMatched}
          >
            {(card.isFlipped || card.isMatched) && (
              <Ionicons 
                name={card.icon} 
                size={wp(8)} 
                color="white" 
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Pairs Found: {matches}/6
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(matches / 6) * 100}%` }
            ]} 
          />
        </View>
      </View>

      {/* Celebration Animation */}
      {showCelebration && (
        <Animated.View style={[styles.celebrationOverlay, celebrationStyle]}>
          <LottieView
            source={require('@/assets/lottie/success-confetti.json')}
            autoPlay
            loop={false}
            style={styles.celebrationAnimation}
          />
          <Text style={styles.celebrationText}>Excellent Memory!</Text>
          <Text style={styles.celebrationScore}>
            Score: {Math.max(100, 1000 - moves * 10 - gameTime * 2)}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const { width } = Dimensions.get('window');
const cardSize = (width - wp(16)) / 4 - wp(2);

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
  stats: {
    alignItems: 'flex-end',
  },
  statText: {
    fontSize: rfs(14),
    color: Colors.light.tabIconDefault,
    marginBottom: hp(0.5),
  },
  gameBoard: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingVertical: hp(4),
  },
  card: {
    width: cardSize,
    height: cardSize,
    backgroundColor: '#E0E0E0',
    borderRadius: wp(2),
    marginBottom: wp(2),
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  progressContainer: {
    paddingVertical: hp(2),
  },
  progressText: {
    fontSize: rfs(16),
    color: Colors.light.text,
    marginBottom: hp(1),
    textAlign: 'center',
  },
  progressBar: {
    height: hp(1),
    backgroundColor: '#E0E0E0',
    borderRadius: hp(0.5),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.tint,
    borderRadius: hp(0.5),
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