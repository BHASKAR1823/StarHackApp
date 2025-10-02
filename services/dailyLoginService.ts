import AsyncStorage from '@react-native-async-storage/async-storage';
import { gamificationService } from './gamificationService';

export interface DailyLoginData {
  currentStreak: number;
  lastLoginDate: string;
  totalLogins: number;
  consecutiveDays: number;
  streakStartDate: string;
  highestStreak: number;
  todaysCoinsAwarded: boolean;
  nextMilestone: number;
  milestoneRewards: number[];
}

export interface LoginReward {
  coins: number;
  bonusCoins?: number;
  milestone?: boolean;
  streakDay: number;
  message: string;
  badge?: {
    id: string;
    name: string;
    description: string;
    icon: string;
  };
}

class DailyLoginService {
  private readonly STORAGE_KEY = 'daily_login_data';
  private readonly MILESTONES = [5, 10, 15, 20, 30, 50, 75, 100];
  
  // Initialize with 3-day streak as requested
  private readonly DEFAULT_DATA: DailyLoginData = {
    currentStreak: 3,
    lastLoginDate: this.getDateString(new Date(Date.now() - 24 * 60 * 60 * 1000)), // Yesterday
    totalLogins: 3,
    consecutiveDays: 3,
    streakStartDate: this.getDateString(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)),
    highestStreak: 3,
    todaysCoinsAwarded: false,
    nextMilestone: 5,
    milestoneRewards: []
  };

  private getDateString(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private getRandomCoins(streakDay: number): number {
    // Base coins increase with streak length
    const baseCoins = Math.min(20 + (streakDay * 2), 50);
    // Add random bonus (10-30% of base)
    const bonus = Math.floor(baseCoins * (0.1 + Math.random() * 0.2));
    return baseCoins + bonus;
  }

  private getMilestoneReward(milestone: number): { coins: number; badge?: any } {
    const baseMilestoneCoins = milestone * 20; // 5 days = 100 coins, 10 days = 200 coins, etc.
    const bonusCoins = Math.floor(baseMilestoneCoins * (0.5 + Math.random() * 0.5)); // 50-100% bonus
    
    const badges: { [key: number]: any } = {
      5: {
        id: 'streak_5',
        name: 'Consistent Starter',
        description: 'Logged in for 5 consecutive days',
        icon: '🔥'
      },
      10: {
        id: 'streak_10',
        name: 'Habit Builder',
        description: 'Maintained a 10-day login streak',
        icon: '⚡'
      },
      15: {
        id: 'streak_15',
        name: 'Dedication Master',
        description: 'Incredible 15-day commitment',
        icon: '🌟'
      },
      30: {
        id: 'streak_30',
        name: 'Monthly Champion',
        description: 'A full month of daily engagement',
        icon: '👑'
      }
    };

    return {
      coins: baseMilestoneCoins + bonusCoins,
      badge: badges[milestone]
    };
  }

  async getDailyLoginData(): Promise<DailyLoginData> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      // Return default data showing 3-day streak
      await this.saveDailyLoginData(this.DEFAULT_DATA);
      return this.DEFAULT_DATA;
    } catch (error) {
      console.error('Error getting daily login data:', error);
      return this.DEFAULT_DATA;
    }
  }

  private async saveDailyLoginData(data: DailyLoginData): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving daily login data:', error);
    }
  }

  async checkDailyLogin(): Promise<LoginReward | null> {
    const today = this.getDateString(new Date());
    const data = await this.getDailyLoginData();
    
    // If already logged in today and coins awarded, return null
    if (data.lastLoginDate === today && data.todaysCoinsAwarded) {
      return null;
    }

    const yesterday = this.getDateString(new Date(Date.now() - 24 * 60 * 60 * 1000));
    let newStreak = data.currentStreak;
    let streakBroken = false;

    // Check if streak should continue or reset
    if (data.lastLoginDate === yesterday) {
      // Continuing streak
      newStreak = data.currentStreak + 1;
    } else if (data.lastLoginDate === today) {
      // Same day login, keep current streak
      newStreak = data.currentStreak;
    } else {
      // Streak broken, reset to 1
      newStreak = 1;
      streakBroken = true;
    }

    // Generate rewards
    const coins = this.getRandomCoins(newStreak);
    const isMilestone = this.MILESTONES.includes(newStreak);
    let milestoneReward = null;
    let totalCoins = coins;

    if (isMilestone) {
      milestoneReward = this.getMilestoneReward(newStreak);
      totalCoins += milestoneReward.coins;
    }

    // Update data
    const updatedData: DailyLoginData = {
      ...data,
      currentStreak: newStreak,
      lastLoginDate: today,
      totalLogins: data.totalLogins + 1,
      consecutiveDays: newStreak,
      streakStartDate: streakBroken ? today : data.streakStartDate,
      highestStreak: Math.max(data.highestStreak, newStreak),
      todaysCoinsAwarded: true,
      nextMilestone: this.MILESTONES.find(m => m > newStreak) || 200,
      milestoneRewards: isMilestone ? [...data.milestoneRewards, newStreak] : data.milestoneRewards
    };

    await this.saveDailyLoginData(updatedData);

    // Award coins through gamification service
    await gamificationService.awardCoins(totalCoins, `Daily Login - Day ${newStreak}`);

    // Award milestone badge if applicable
    if (isMilestone && milestoneReward?.badge) {
      await gamificationService.awardBadge(
        milestoneReward.badge.id,
        milestoneReward.badge.name,
        milestoneReward.badge.description,
        milestoneReward.badge.icon,
        'milestone'
      );
    }

    // Create reward object
    const reward: LoginReward = {
      coins,
      bonusCoins: milestoneReward?.coins,
      milestone: isMilestone,
      streakDay: newStreak,
      message: this.getRewardMessage(newStreak, isMilestone, streakBroken),
      badge: milestoneReward?.badge
    };

    return reward;
  }

  private getRewardMessage(streakDay: number, isMilestone: boolean, streakBroken: boolean): string {
    if (streakBroken && streakDay === 1) {
      return "Welcome back! Your streak restarted, but every journey begins with a single step! 🌱";
    }
    
    if (isMilestone) {
      switch (streakDay) {
        case 5:
          return "🔥 Amazing! 5 days in a row! You're building a powerful habit!";
        case 10:
          return "⚡ Incredible! 10 consecutive days! You're unstoppable!";
        case 15:
          return "🌟 Outstanding! 15 days of dedication! You're a wellness champion!";
        case 30:
          return "👑 LEGENDARY! A full month of commitment! You're truly amazing!";
        default:
          return `🎉 Milestone achieved! ${streakDay} consecutive days of excellence!`;
      }
    }

    const messages = [
      "Great job coming back today! 🌟",
      "Your consistency is paying off! 💪",
      "Another day, another step forward! 🚀",
      "You're building amazing habits! ✨",
      "Keep the momentum going! 🔥",
      "Your dedication is inspiring! 🌱",
      "Every day counts! 💎",
      "You're on fire! 🔥"
    ];

    return messages[Math.floor(Math.random() * messages.length)];
  }

  async getStreakProgress(): Promise<{
    currentStreak: number;
    nextMilestone: number;
    progressPercentage: number;
    daysUntilMilestone: number;
    canClaimToday: boolean;
  }> {
    const data = await this.getDailyLoginData();
    const today = this.getDateString(new Date());
    const canClaimToday = data.lastLoginDate !== today || !data.todaysCoinsAwarded;
    const daysUntilMilestone = data.nextMilestone - data.currentStreak;
    const progressPercentage = (data.currentStreak / data.nextMilestone) * 100;

    return {
      currentStreak: data.currentStreak,
      nextMilestone: data.nextMilestone,
      progressPercentage,
      daysUntilMilestone,
      canClaimToday
    };
  }

  async resetStreak(): Promise<void> {
    const data = await this.getDailyLoginData();
    const resetData: DailyLoginData = {
      ...data,
      currentStreak: 0,
      consecutiveDays: 0,
      streakStartDate: this.getDateString(new Date()),
      todaysCoinsAwarded: false
    };
    await this.saveDailyLoginData(resetData);
  }

  // Simulate login for specific day (for testing)
  async simulateLogin(daysAgo: number = 0): Promise<void> {
    const targetDate = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000));
    const data = await this.getDailyLoginData();
    const updatedData: DailyLoginData = {
      ...data,
      lastLoginDate: this.getDateString(targetDate),
      todaysCoinsAwarded: daysAgo > 0 // Only today's login should be claimable
    };
    await this.saveDailyLoginData(updatedData);
  }
}

export const dailyLoginService = new DailyLoginService();