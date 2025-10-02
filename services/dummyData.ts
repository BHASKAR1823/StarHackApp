import { 
  User, 
  Badge, 
  DailyTask, 
  Mission, 
  YogaPose, 
  WorkoutSession, 
  HealthMetrics, 
  InsurancePolicy, 
  InsuranceChallenge, 
  ChatMessage, 
  ChatSession, 
  KPIMetrics, 
  RewardItem, 
  OnboardingStep, 
  CommunityChallenge 
} from '../types/app';

// Dummy User Data
export const dummyUser: User = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  level: 5,
  coins: 1250,
  streaks: {
    daily: 7,
    weekly: 3,
    monthly: 1,
  },
  badges: [
    {
      id: '1',
      name: 'Early Bird',
      description: 'Completed morning yoga 7 days in a row',
      icon: '🌅',
      earnedDate: new Date('2024-09-25'),
      category: 'health',
    },
    {
      id: '2',
      name: 'Insurance Explorer',
      description: 'Explored all insurance benefits',
      icon: '🛡️',
      earnedDate: new Date('2024-09-20'),
      category: 'insurance',
    },
    {
      id: '3',
      name: 'Meditation Master',
      description: 'Meditated for 30 days straight',
      icon: '🧘',
      earnedDate: new Date('2024-09-15'),
      category: 'health',
    },
  ],
  joinDate: new Date('2024-08-01'),
  avatar: '👤',
};

// Dummy Daily Tasks
export const dummyDailyTasks: DailyTask[] = [
  {
    id: '1',
    title: 'Walk 2,000 Steps',
    description: 'Take a healthy walk to reach your daily step goal',
    category: 'health',
    coinReward: 50,
    isCompleted: true,
    completedDate: new Date(),
    icon: '🚶',
  },
  {
    id: '2',
    title: 'Drink 8 Glasses of Water',
    description: 'Stay hydrated throughout the day',
    category: 'health',
    coinReward: 30,
    isCompleted: false,
    icon: '💧',
  },
  {
    id: '3',
    title: 'Check Insurance Premium',
    description: 'Review your current insurance premium details',
    category: 'insurance',
    coinReward: 25,
    isCompleted: false,
    icon: '📋',
  },
  {
    id: '4',
    title: '5-Minute Meditation',
    description: 'Practice mindfulness with a short meditation session',
    category: 'health',
    coinReward: 40,
    isCompleted: true,
    completedDate: new Date(),
    icon: '🧘',
  },
];

// Dummy Missions
export const dummyMissions: Mission[] = [
  {
    id: '1',
    title: 'Weekly Yoga Champion',
    description: 'Complete 5 yoga sessions this week',
    type: 'weekly',
    progress: 3,
    target: 5,
    coinReward: 200,
    isCompleted: false,
    expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    category: 'health',
  },
  {
    id: '2',
    title: 'Insurance Literacy Quest',
    description: 'Complete 3 insurance quizzes to improve your knowledge',
    type: 'monthly',
    progress: 1,
    target: 3,
    coinReward: 500,
    isCompleted: false,
    expiryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    category: 'insurance',
  },
  {
    id: '3',
    title: 'Mindfulness Master',
    description: 'Meditate for 10 consecutive days',
    type: 'daily',
    progress: 7,
    target: 10,
    coinReward: 300,
    isCompleted: false,
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    category: 'health',
  },
];

// Dummy Yoga Poses
export const dummyYogaPoses: YogaPose[] = [
  {
    id: '1',
    name: 'Mountain Pose',
    description: 'A foundational standing pose that improves posture and balance',
    difficulty: 'beginner',
    duration: 30,
    instructions: [
      'Stand tall with feet hip-width apart',
      'Ground down through your feet',
      'Lengthen your spine and reach the crown of your head toward the ceiling',
      'Relax your shoulders away from your ears',
      'Breathe deeply and hold the pose',
    ],
    benefits: ['Improves posture', 'Increases body awareness', 'Strengthens legs and core'],
  },
  {
    id: '2',
    name: 'Warrior II',
    description: 'A powerful standing pose that builds strength and stamina',
    difficulty: 'intermediate',
    duration: 45,
    instructions: [
      'From Mountain Pose, step your left foot back 3-4 feet',
      'Turn your left foot out 90 degrees',
      'Bend your right knee over your ankle',
      'Extend your arms parallel to the floor',
      'Gaze over your right fingertips',
    ],
    benefits: ['Strengthens legs and arms', 'Improves focus', 'Opens hips and chest'],
  },
];

// Dummy Health Metrics
export const dummyHealthMetrics: HealthMetrics[] = [
  {
    steps: 8500,
    sleepHours: 7.5,
    waterIntake: 6,
    meditationMinutes: 15,
    workoutSessions: 2,
    date: new Date(),
  },
  {
    steps: 9200,
    sleepHours: 8,
    waterIntake: 8,
    meditationMinutes: 20,
    workoutSessions: 1,
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
];

// Dummy Insurance Policies
export const dummyInsurancePolicies: InsurancePolicy[] = [
  {
    id: '1',
    type: 'health',
    provider: 'HealthGuard Insurance',
    premium: 2500,
    coverage: 500000,
    renewalDate: new Date('2025-03-15'),
    status: 'active',
  },
  {
    id: '2',
    type: 'life',
    provider: 'LifeSecure Co.',
    premium: 1800,
    coverage: 1000000,
    renewalDate: new Date('2025-06-20'),
    status: 'active',
  },
];

// Dummy Insurance Challenges
export const dummyInsuranceChallenges: InsuranceChallenge[] = [
  {
    id: '1',
    title: 'Premium Reduction Challenge',
    description: 'Walk 50,000 steps this month to unlock a 5% premium discount',
    type: 'premium_reduction',
    progress: 32000,
    target: 50000,
    reward: 5, // 5% discount
    isCompleted: false,
    expiryDate: new Date('2024-10-31'),
  },
  {
    id: '2',
    title: 'Policy Explorer',
    description: 'Explore all sections of your insurance policy',
    type: 'policy_exploration',
    progress: 3,
    target: 5,
    reward: 100, // 100 coins
    isCompleted: false,
    expiryDate: new Date('2024-10-15'),
  },
];

// Dummy Chat Messages
export const dummyChatMessages: ChatMessage[] = [
  {
    id: '1',
    text: 'Hello! I\'m your AI wellness assistant. How can I help you today?',
    isUser: false,
    timestamp: new Date(Date.now() - 60000),
    category: 'wellness',
  },
  {
    id: '2',
    text: 'I\'m feeling stressed and need some quick relaxation techniques.',
    isUser: true,
    timestamp: new Date(Date.now() - 30000),
    category: 'wellness',
  },
  {
    id: '3',
    text: 'I understand you\'re feeling stressed. Here are three quick techniques you can try:\n\n1. **Deep Breathing**: Take 4 deep breaths - inhale for 4 counts, hold for 4, exhale for 6.\n\n2. **Progressive Muscle Relaxation**: Tense and release each muscle group for 5 seconds.\n\n3. **Mindful Moment**: Focus on 5 things you can see, 4 you can hear, 3 you can touch, 2 you can smell, and 1 you can taste.\n\nWould you like me to guide you through any of these?',
    isUser: false,
    timestamp: new Date(),
    category: 'wellness',
  },
];

// Dummy KPI Metrics
export const dummyKPIMetrics: KPIMetrics[] = [
  {
    dau: 1250,
    mau: 8500,
    averageStreak: 4.2,
    featureAdoption: {
      yoga: 65,
      meditation: 72,
      insurance: 45,
      chat: 58,
    },
    policyEngagement: 38,
    retentionRate: 85,
    date: new Date(),
  },
  {
    dau: 1180,
    mau: 8200,
    averageStreak: 3.8,
    featureAdoption: {
      yoga: 62,
      meditation: 68,
      insurance: 42,
      chat: 55,
    },
    policyEngagement: 35,
    retentionRate: 82,
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
];

// Dummy Reward Items
export const dummyRewardItems: RewardItem[] = [
  {
    id: '1',
    name: 'Premium Meditation Pack',
    description: 'Access to 50+ guided meditations',
    cost: 500,
    category: 'premium_content',
    icon: '🧘‍♀️',
    isPurchased: false,
  },
  {
    id: '2',
    name: 'Advanced Yoga Poses',
    description: 'Unlock 20 advanced AR yoga poses',
    cost: 750,
    category: 'ar_poses',
    icon: '🤸‍♀️',
    isPurchased: true,
  },
  {
    id: '3',
    name: 'Insurance Consultation',
    description: 'Free 30-minute consultation with insurance expert',
    cost: 1000,
    category: 'insurance_perks',
    icon: '👨‍💼',
    isPurchased: false,
  },
];

// Dummy Onboarding Steps
export const dummyOnboardingSteps: OnboardingStep[] = [
  {
    id: '1',
    title: 'Welcome to YouMatter!',
    description: 'Learn about the main features of the app',
    screen: 'welcome',
    isCompleted: true,
    coinReward: 50,
  },
  {
    id: '2',
    title: 'Set Up Your Profile',
    description: 'Personalize your wellness journey',
    screen: 'profile',
    isCompleted: true,
    coinReward: 100,
  },
  {
    id: '3',
    title: 'Try Your First Yoga Pose',
    description: 'Experience our AR yoga feature',
    screen: 'yoga',
    isCompleted: false,
    coinReward: 150,
  },
  {
    id: '4',
    title: 'Chat with AI Assistant',
    description: 'Get personalized wellness advice',
    screen: 'chat',
    isCompleted: false,
    coinReward: 100,
  },
  {
    id: '5',
    title: 'Explore Insurance Benefits',
    description: 'Discover how wellness affects your premiums',
    screen: 'insurance',
    isCompleted: false,
    coinReward: 200,
  },
];

// Dummy Community Challenges
export const dummyCommunityChallenge: CommunityChallenge = {
  id: '1',
  title: 'Global Step Challenge',
  description: 'Join thousands of users in walking 1 million steps together!',
  participants: 5847,
  startDate: new Date('2024-10-01'),
  endDate: new Date('2024-10-31'),
  isParticipating: true,
  progress: 650000,
  target: 1000000,
  rewards: 500,
};