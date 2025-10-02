// User and Gamification Types
export interface User {
  id: string;
  name: string;
  email: string;
  dateOfBirth: string;
  phone: string;
  gender: string;
  height: number; // in cm
  weight: number; // in kg
  level: number;
  coins: number;
  streaks: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  badges: Badge[];
  joinDate: Date;
  avatar?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedDate: Date;
  category: 'health' | 'finance' | 'insurance' | 'social' | 'milestone';
}

export interface DailyTask {
  id: string;
  title: string;
  description: string;
  category: 'health' | 'finance' | 'insurance' | 'social';
  coinReward: number;
  isCompleted: boolean;
  completedDate?: Date;
  icon: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly';
  progress: number;
  target: number;
  coinReward: number;
  isCompleted: boolean;
  expiryDate: Date;
  category: 'health' | 'finance' | 'insurance' | 'social';
}

// Health & Wellness Types
export interface YogaPose {
  id: string;
  name: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in seconds
  instructions: string[];
  benefits: string[];
  imageUrl?: string;
}

export interface WorkoutSession {
  id: string;
  type: 'yoga' | 'meditation' | 'fitness' | 'walk';
  duration: number;
  date: Date;
  coinsEarned: number;
  poses?: YogaPose[];
}

export interface HealthMetrics {
  steps: number;
  sleepHours: number;
  waterIntake: number; // in glasses
  meditationMinutes: number;
  workoutSessions: number;
  date: Date;
}

// Wellness Bingo Types
export interface BingoTask {
  id: string;
  title: string;
  description: string;
  icon: string;
  isCompleted: boolean;
  coinReward: number;
  category: 'physical' | 'mental' | 'nutrition' | 'social' | 'bonus';
}

export interface BingoRow {
  id: string;
  name: string;
  tasks: BingoTask[];
  isCompleted: boolean;
  bonusReward: number;
}

// Surprise Events Types
export interface SurpriseEvent {
  id: string;
  title: string;
  description: string;
  type: 'step_challenge' | 'double_coins' | 'mystery_box' | 'streak_bonus' | 'flash_reward';
  icon: string;
  duration: number; // in hours
  startTime: Date;
  endTime: Date;
  isActive: boolean;
  bonusMultiplier?: number;
  specialReward?: number;
  requirements?: {
    steps?: number;
    tasks?: number;
    streak?: number;
  };
}

// Insurance Types
export interface InsurancePolicy {
  id: string;
  type: 'health' | 'life' | 'auto' | 'home';
  provider: string;
  premium: number;
  coverage: number;
  renewalDate: Date;
  status: 'active' | 'expired' | 'pending';
}

export interface InsuranceChallenge {
  id: string;
  title: string;
  description: string;
  type: 'premium_reduction' | 'policy_exploration' | 'renewal_reward' | 'quiz';
  progress: number;
  target: number;
  reward: number; // in coins or discount percentage
  isCompleted: boolean;
  expiryDate: Date;
}

// Chat Types
export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  category?: 'wellness' | 'meditation' | 'insurance' | 'general';
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  startDate: Date;
  lastActiveDate: Date;
}

// Analytics Types
export interface KPIMetrics {
  dau: number; // Daily Active Users
  mau: number; // Monthly Active Users
  averageStreak: number;
  featureAdoption: {
    yoga: number;
    meditation: number;
    insurance: number;
    chat: number;
  };
  policyEngagement: number;
  retentionRate: number;
  date: Date;
}

// Rewards and Store Types
export interface RewardItem {
  id: string;
  name: string;
  description: string;
  cost: number; // in coins
  category: 'premium_content' | 'ar_poses' | 'insurance_perks' | 'customization';
  icon: string;
  isPurchased: boolean;
}

// Onboarding Types
export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  screen: string;
  isCompleted: boolean;
  coinReward: number;
}

// Community Types
export interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  participants: number;
  startDate: Date;
  endDate: Date;
  isParticipating: boolean;
  progress: number;
  target: number;
  rewards: number;
}