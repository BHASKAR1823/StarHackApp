import { Badge, Mission, User } from '../types/app';
import { dummyUser } from './dummyData';

class GamificationService {
  private user: User = dummyUser;

  // Level system
  calculateLevel(coins: number): number {
    return Math.floor(coins / 200) + 1;
  }

  getCoinsForNextLevel(currentCoins: number): number {
    const currentLevel = this.calculateLevel(currentCoins);
    return (currentLevel * 200) - currentCoins;
  }

  getLevelProgress(coins: number): number {
    const currentLevel = this.calculateLevel(coins);
    const coinsForCurrentLevel = (currentLevel - 1) * 200;
    const coinsInCurrentLevel = coins - coinsForCurrentLevel;
    return (coinsInCurrentLevel / 200) * 100;
  }

  // Reward system
  async awardCoins(amount: number, reason: string): Promise<{ success: boolean; newTotal: number; levelUp: boolean }> {
    const oldLevel = this.calculateLevel(this.user.coins);
    this.user.coins += amount;
    const newLevel = this.calculateLevel(this.user.coins);
    const levelUp = newLevel > oldLevel;

    // Simulate saving to storage
    await this.saveUser();

    return {
      success: true,
      newTotal: this.user.coins,
      levelUp
    };
  }

  async completeTask(taskId: string): Promise<{ success: boolean; coinsAwarded: number; levelUp: boolean }> {
    // In a real app, this would update the task in the database
    const coinReward = 50; // Default coin reward
    const result = await this.awardCoins(coinReward, `Completed task ${taskId}`);
    
    return {
      success: result.success,
      coinsAwarded: coinReward,
      levelUp: result.levelUp
    };
  }

  // Streak system
  updateStreak(type: 'daily' | 'weekly' | 'monthly'): number {
    this.user.streaks[type] += 1;
    this.saveUser();
    return this.user.streaks[type];
  }

  resetStreak(type: 'daily' | 'weekly' | 'monthly'): void {
    this.user.streaks[type] = 0;
    this.saveUser();
  }

  getStreakMultiplier(streakCount: number): number {
    if (streakCount >= 30) return 2.0;
    if (streakCount >= 14) return 1.5;
    if (streakCount >= 7) return 1.2;
    return 1.0;
  }

  // Badge system
  async awardBadge(badgeId: string, name: string, description: string, icon: string, category: Badge['category']): Promise<boolean> {
    const existingBadge = this.user.badges.find(b => b.id === badgeId);
    if (existingBadge) return false;

    const newBadge: Badge = {
      id: badgeId,
      name,
      description,
      icon,
      category,
      earnedDate: new Date()
    };

    this.user.badges.push(newBadge);
    await this.saveUser();
    return true;
  }

  checkAndAwardBadges(): Promise<Badge[]> {
    const newBadges: Badge[] = [];
    
    // Check for streak badges
    if (this.user.streaks.daily >= 7 && !this.user.badges.find(b => b.id === 'weekly_streak')) {
      newBadges.push({
        id: 'weekly_streak',
        name: 'Week Warrior',
        description: 'Maintained a 7-day streak',
        icon: '🔥',
        category: 'milestone',
        earnedDate: new Date()
      });
    }

    if (this.user.streaks.daily >= 30 && !this.user.badges.find(b => b.id === 'monthly_streak')) {
      newBadges.push({
        id: 'monthly_streak',
        name: 'Monthly Master',
        description: 'Maintained a 30-day streak',
        icon: '👑',
        category: 'milestone',
        earnedDate: new Date()
      });
    }

    // Check for coin badges
    if (this.user.coins >= 1000 && !this.user.badges.find(b => b.id === 'coin_collector')) {
      newBadges.push({
        id: 'coin_collector',
        name: 'Coin Collector',
        description: 'Earned 1000 coins',
        icon: '💰',
        category: 'milestone',
        earnedDate: new Date()
      });
    }

    // Award new badges
    newBadges.forEach(badge => {
      this.user.badges.push(badge);
    });

    if (newBadges.length > 0) {
      this.saveUser();
    }

    return Promise.resolve(newBadges);
  }

  // User management
  getUser(): User {
    return this.user;
  }

  async saveUser(): Promise<void> {
    // In a real app, this would save to AsyncStorage or a database
    // For now, we'll just simulate the async operation
    return new Promise(resolve => setTimeout(resolve, 100));
  }

  // Progress tracking
  calculateMissionProgress(mission: Mission, userActivity: any): number {
    // This would calculate progress based on user activity
    // For demo purposes, we'll return the current progress
    return mission.progress;
  }

  // Variable reward system (neuroscience-based)
  calculateVariableReward(baseReward: number, context: {
    streakCount?: number;
    difficulty?: 'easy' | 'medium' | 'hard';
    timeOfDay?: 'morning' | 'afternoon' | 'evening';
    userEngagement?: 'low' | 'medium' | 'high';
  }): number {
    let reward = baseReward;
    
    // Streak multiplier
    if (context.streakCount) {
      const streakMultiplier = this.getStreakMultiplier(context.streakCount);
      reward *= streakMultiplier;
    }
    
    // Difficulty bonus
    if (context.difficulty) {
      switch (context.difficulty) {
        case 'easy': reward *= 0.8; break;
        case 'medium': reward *= 1.0; break;
        case 'hard': reward *= 1.5; break;
      }
    }
    
    // Time-based multiplier (morning activities get bonus)
    if (context.timeOfDay === 'morning') {
      reward *= 1.2;
    }
    
    // Variable reward randomization (15-25% variance)
    const variance = 0.15 + Math.random() * 0.1;
    const multiplier = 1 + (Math.random() > 0.5 ? variance : -variance);
    reward *= multiplier;
    
    // Occasional gold chest (rare big reward)
    if (Math.random() < 0.05) { // 5% chance
      reward *= 3;
    }
    
    return Math.round(reward);
  }

  // Tiered progression system
  getTierInfo(coins: number): {
    currentTier: string;
    nextTier: string;
    progress: number;
    coinsToNext: number;
    benefits: string[];
  } {
    const tiers = [
      { name: 'Bronze', threshold: 0, benefits: ['Basic rewards', 'Daily tasks'] },
      { name: 'Silver', threshold: 500, benefits: ['1.2x coin multiplier', 'Weekly challenges'] },
      { name: 'Gold', threshold: 1500, benefits: ['1.5x coin multiplier', 'Premium content'] },
      { name: 'Platinum', threshold: 3000, benefits: ['2x coin multiplier', 'Exclusive AR poses'] },
      { name: 'Diamond', threshold: 6000, benefits: ['3x coin multiplier', 'VIP support'] },
      { name: 'Master', threshold: 12000, benefits: ['5x coin multiplier', 'All features unlocked'] }
    ];

    let currentTier = tiers[0];
    let nextTier = tiers[1];

    for (let i = 0; i < tiers.length; i++) {
      if (coins >= tiers[i].threshold) {
        currentTier = tiers[i];
        nextTier = tiers[i + 1] || tiers[i];
      } else {
        break;
      }
    }

    const progress = nextTier !== currentTier 
      ? ((coins - currentTier.threshold) / (nextTier.threshold - currentTier.threshold)) * 100
      : 100;

    return {
      currentTier: currentTier.name,
      nextTier: nextTier.name,
      progress,
      coinsToNext: nextTier.threshold - coins,
      benefits: currentTier.benefits
    };
  }

  // Mystery box rewards
  openMysteryBox(): {
    type: 'coins' | 'multiplier' | 'badge' | 'premium_content';
    value: number | string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  } {
    const rand = Math.random();
    
    if (rand < 0.5) { // 50% - Coins
      const coinAmount = rand < 0.3 ? 50 : rand < 0.15 ? 150 : 500;
      return {
        type: 'coins',
        value: coinAmount,
        rarity: coinAmount <= 50 ? 'common' : coinAmount <= 150 ? 'rare' : 'epic'
      };
    } else if (rand < 0.8) { // 30% - Multiplier
      const multiplier = rand < 0.65 ? 1.5 : rand < 0.05 ? 3.0 : 2.0;
      return {
        type: 'multiplier',
        value: multiplier,
        rarity: multiplier <= 1.5 ? 'common' : multiplier <= 2.0 ? 'rare' : 'legendary'
      };
    } else if (rand < 0.95) { // 15% - Badge
      return {
        type: 'badge',
        value: 'Mystery Master',
        rarity: 'rare'
      };
    } else { // 5% - Premium content
      return {
        type: 'premium_content',
        value: 'Advanced Meditation Pack',
        rarity: 'legendary'
      };
    }
  }

  // Dopamine-optimized feedback timing
  getOptimalFeedbackDelay(rewardSize: 'small' | 'medium' | 'large'): number {
    switch (rewardSize) {
      case 'small': return 200; // Immediate for small rewards
      case 'medium': return 500; // Slight delay builds anticipation
      case 'large': return 1000; // Longer delay for major rewards
      default: return 200;
    }
  }

  // Social comparison (friendly competition)
  getFriendComparison(): {
    yourPosition: number;
    friendsAhead: number;
    friendsBehind: number;
    encouragementMessage: string;
  } {
    const position = Math.floor(Math.random() * 10) + 1;
    const messages = [
      "You're catching up! Keep going! 🚀",
      "Amazing progress this week! 💪",
      "Your friends are cheering you on! 👏",
      "You're inspiring others to stay active! ⭐",
      "One step closer to the top! 🏆"
    ];

    return {
      yourPosition: position,
      friendsAhead: Math.max(0, position - 1),
      friendsBehind: Math.max(0, 10 - position),
      encouragementMessage: messages[Math.floor(Math.random() * messages.length)]
    };
  }

  // Surprise events
  generateSurpriseEvent(): { type: string; title: string; description: string; multiplier: number } | null {
    const events = [
      {
        type: 'step_bonus',
        title: 'Step-a-thon Day!',
        description: 'Double coins for walking today!',
        multiplier: 2.0
      },
      {
        type: 'meditation_bonus',
        title: 'Mindfulness Monday',
        description: '1.5x coins for meditation!',
        multiplier: 1.5
      },
      {
        type: 'yoga_bonus',
        title: 'Yoga Power Hour',
        description: '3x coins for yoga poses!',
        multiplier: 3.0
      }
    ];

    // 20% chance of a surprise event
    if (Math.random() < 0.2) {
      return events[Math.floor(Math.random() * events.length)];
    }
    
    return null;
  }

  // Leaderboard functionality
  getLeaderboardPosition(): Promise<{ position: number; totalUsers: number }> {
    // Simulate leaderboard position
    return Promise.resolve({
      position: Math.floor(Math.random() * 100) + 1,
      totalUsers: 5847
    });
  }
}

export const gamificationService = new GamificationService();