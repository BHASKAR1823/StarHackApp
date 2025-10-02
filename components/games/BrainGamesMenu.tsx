import { Colors } from '@/constants/theme';
import { hp, rfs, wp } from '@/utils/responsive';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import MemoryMatchGame from './MemoryMatchGame';
import ReactionTimeGame from './ReactionTimeGame';

interface BrainGamesMenuProps {
  onBack: () => void;
}

type GameType = 'menu' | 'memory' | 'reaction';

interface GameInfo {
  id: GameType;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  difficulty: string;
}

const GAMES: GameInfo[] = [
  {
    id: 'memory',
    title: 'Memory Match',
    description: 'Test your memory with card matching challenges',
    icon: 'grid',
    color: '#FF6B6B',
    difficulty: 'Easy to Hard',
  },
  {
    id: 'reaction',
    title: 'Reaction Time',
    description: 'Train your reflexes and response speed',
    icon: 'flash',
    color: '#4ECDC4',
    difficulty: 'Progressive',
  },
];

export default function BrainGamesMenu({ onBack }: BrainGamesMenuProps) {
  const [currentGame, setCurrentGame] = useState<GameType>('menu');
  const [playerStats, setPlayerStats] = useState({
    totalGamesPlayed: 0,
    totalScore: 0,
    bestMemoryScore: 0,
    bestReactionScore: 0,
  });

  const handleGameComplete = (gameType: GameType, score: number) => {
    setPlayerStats(prev => ({
      ...prev,
      totalGamesPlayed: prev.totalGamesPlayed + 1,
      totalScore: prev.totalScore + score,
      ...(gameType === 'memory' && score > prev.bestMemoryScore 
        ? { bestMemoryScore: score } 
        : {}),
      ...(gameType === 'reaction' && score > prev.bestReactionScore 
        ? { bestReactionScore: score } 
        : {}),
    }));
    setCurrentGame('menu');
  };

  if (currentGame === 'memory') {
    return (
      <MemoryMatchGame
        onGameComplete={(score) => handleGameComplete('memory', score)}
        onBack={() => setCurrentGame('menu')}
      />
    );
  }

  if (currentGame === 'reaction') {
    return (
      <ReactionTimeGame
        onGameComplete={(score) => handleGameComplete('reaction', score)}
        onBack={() => setCurrentGame('menu')}
      />
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={wp(6)} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Brain Training</Text>
        <View style={styles.brainIcon}>
          <Ionicons name="brain" size={wp(6)} color={Colors.light.tint} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={styles.statsHeader}>
            <Ionicons name="trophy" size={wp(5)} color="#FFD700" />
            <Text style={styles.statsTitle}>Your Progress</Text>
          </View>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{playerStats.totalGamesPlayed}</Text>
              <Text style={styles.statLabel}>Games Played</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{playerStats.totalScore}</Text>
              <Text style={styles.statLabel}>Total Score</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{playerStats.bestMemoryScore}</Text>
              <Text style={styles.statLabel}>Best Memory</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{playerStats.bestReactionScore}</Text>
              <Text style={styles.statLabel}>Best Reaction</Text>
            </View>
          </View>
        </View>

        {/* Games Grid */}
        <View style={styles.gamesContainer}>
          <Text style={styles.sectionTitle}>Choose Your Challenge</Text>
          {GAMES.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={[styles.gameCard, { borderLeftColor: game.color }]}
              onPress={() => setCurrentGame(game.id)}
            >
              <View style={styles.gameCardContent}>
                <View style={[styles.gameIcon, { backgroundColor: game.color }]}>
                  <Ionicons name={game.icon} size={wp(6)} color="white" />
                </View>
                <View style={styles.gameInfo}>
                  <Text style={styles.gameTitle}>{game.title}</Text>
                  <Text style={styles.gameDescription}>{game.description}</Text>
                  <View style={styles.gameMeta}>
                    <View style={styles.difficultyBadge}>
                      <Text style={styles.difficultyText}>{game.difficulty}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.playButton}>
                  <Ionicons name="play" size={wp(5)} color={Colors.light.tint} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsContainer}>
          <Text style={styles.sectionTitle}>Brain Training Benefits</Text>
          <View style={styles.benefitsList}>
            {[
              { icon: 'flash', title: 'Faster Processing', desc: 'Improve mental agility' },
              { icon: 'eye', title: 'Better Focus', desc: 'Enhanced concentration' },
              { icon: 'fitness', title: 'Memory Boost', desc: 'Strengthen recall ability' },
              { icon: 'trending-up', title: 'Cognitive Growth', desc: 'Expand mental capacity' },
            ].map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <View style={styles.benefitIcon}>
                  <Ionicons name={benefit.icon} size={wp(4)} color={Colors.light.tint} />
                </View>
                <View style={styles.benefitText}>
                  <Text style={styles.benefitTitle}>{benefit.title}</Text>
                  <Text style={styles.benefitDesc}>{benefit.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Motivational Message */}
        <View style={styles.motivationContainer}>
          <LottieView
            source={require('@/assets/lottie/confetti-transparent.json')}
            autoPlay={false}
            loop={false}
            style={styles.motivationAnimation}
          />
          <Text style={styles.motivationTitle}>Train Your Brain Daily!</Text>
          <Text style={styles.motivationText}>
            Just 5-10 minutes of brain training can improve cognitive function and mental sharpness.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

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
  },
  backButton: {
    padding: wp(2),
  },
  title: {
    fontSize: rfs(24),
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  brainIcon: {
    padding: wp(2),
  },
  content: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  statsContainer: {
    backgroundColor: 'white',
    borderRadius: wp(4),
    padding: wp(4),
    marginBottom: hp(3),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp(2),
  },
  statsTitle: {
    fontSize: rfs(18),
    fontWeight: 'bold',
    color: Colors.light.text,
    marginLeft: wp(2),
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: rfs(20),
    fontWeight: 'bold',
    color: Colors.light.tint,
  },
  statLabel: {
    fontSize: rfs(12),
    color: Colors.light.tabIconDefault,
    textAlign: 'center',
    marginTop: hp(0.5),
  },
  gamesContainer: {
    marginBottom: hp(3),
  },
  sectionTitle: {
    fontSize: rfs(20),
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: hp(2),
  },
  gameCard: {
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
  gameCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp(4),
  },
  gameIcon: {
    width: wp(12),
    height: wp(12),
    borderRadius: wp(6),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: wp(3),
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: rfs(16),
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: hp(0.5),
  },
  gameDescription: {
    fontSize: rfs(14),
    color: Colors.light.tabIconDefault,
    marginBottom: hp(1),
  },
  gameMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    backgroundColor: Colors.light.background,
    paddingHorizontal: wp(2),
    paddingVertical: hp(0.5),
    borderRadius: wp(3),
  },
  difficultyText: {
    fontSize: rfs(12),
    color: Colors.light.tabIconDefault,
  },
  playButton: {
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
    marginBottom: hp(3),
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
  motivationContainer: {
    backgroundColor: 'white',
    borderRadius: wp(4),
    padding: wp(4),
    alignItems: 'center',
    marginBottom: hp(4),
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  motivationAnimation: {
    width: wp(20),
    height: wp(20),
  },
  motivationTitle: {
    fontSize: rfs(18),
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: hp(1),
  },
  motivationText: {
    fontSize: rfs(14),
    color: Colors.light.tabIconDefault,
    textAlign: 'center',
    lineHeight: rfs(20),
  },
});