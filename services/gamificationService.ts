import { User, Badge, DailyTask, Mission } from '../types/app';
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