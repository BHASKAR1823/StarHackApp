import {
    BingoRow,
    ChatMessage,
    CommunityChallenge,
    DailyTask,
    HealthMetrics,
    InsuranceChallenge,
    InsurancePolicy,
    KPIMetrics,
    Mission,
    OnboardingStep,
    RewardItem,
    SurpriseEvent,
    User,
    YogaPose
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
  {
    id: '4',
    name: 'Golden Theme Pack',
    description: 'Unlock premium app themes and customizations',
    cost: 300,
    category: 'customization',
    icon: '🎨',
    isPurchased: false,
  },
  {
    id: '5',
    name: 'Nutrition Masterclass',
    description: 'Complete meal planning and nutrition course',
    cost: 800,
    category: 'premium_content',
    icon: '🥗',
    isPurchased: false,
  },
  {
    id: '6',
    name: 'AR Meditation Garden',
    description: 'Virtual meditation environments in AR',
    cost: 600,
    category: 'ar_poses',
    icon: '🌸',
    isPurchased: false,
  },
  {
    id: '7',
    name: 'Premium Policy Review',
    description: 'Expert analysis of your insurance coverage',
    cost: 1200,
    category: 'insurance_perks',
    icon: '📋',
    isPurchased: false,
  },
  {
    id: '8',
    name: 'Exclusive Avatar Pack',
    description: 'Unique profile avatars and badges',
    cost: 250,
    category: 'customization',
    icon: '👤',
    isPurchased: true,
  },
  {
    id: '9',
    name: 'Sleep Stories Collection',
    description: 'Premium bedtime stories for better sleep',
    cost: 450,
    category: 'premium_content',
    icon: '🌙',
    isPurchased: false,
  },
  {
    id: '10',
    name: 'Family Plan Discount',
    description: '25% off family insurance plans',
    cost: 2000,
    category: 'insurance_perks',
    icon: '👨‍👩‍👧‍👦',
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

// Dummy Wellness Bingo Data
export const dummyWellnessBingo: BingoRow[] = [
  {
    id: 'row1',
    name: 'Morning Energizer',
    bonusReward: 200,
    isCompleted: false,
    tasks: [
      { id: 'b1', title: '8 Glasses Water', description: 'Stay hydrated all day', icon: '💧', isCompleted: true, coinReward: 20, category: 'nutrition' },
      { id: 'b2', title: '5-Min Meditation', description: 'Start your day mindfully', icon: '🧘‍♀️', isCompleted: true, coinReward: 30, category: 'mental' },
      { id: 'b3', title: '10k Steps', description: 'Keep moving throughout the day', icon: '👟', isCompleted: false, coinReward: 40, category: 'physical' },
      { id: 'b4', title: 'Healthy Breakfast', description: 'Fuel your body right', icon: '🥗', isCompleted: true, coinReward: 25, category: 'nutrition' },
      { id: 'b5', title: 'Stretch Break', description: '5 minutes of stretching', icon: '🤸‍♀️', isCompleted: false, coinReward: 20, category: 'physical' }
    ]
  },
  {
    id: 'row2',
    name: 'Mindful Day',
    bonusReward: 250,
    isCompleted: false,
    tasks: [
      { id: 'b6', title: 'Gratitude Journal', description: 'Write 3 things you\'re grateful for', icon: '📝', isCompleted: false, coinReward: 35, category: 'mental' },
      { id: 'b7', title: 'Deep Breathing', description: '10 deep breaths during stress', icon: '🌬️', isCompleted: false, coinReward: 25, category: 'mental' },
      { id: 'b8', title: 'Nature Walk', description: '20 minutes outdoors', icon: '🌳', isCompleted: false, coinReward: 45, category: 'physical' },
      { id: 'b9', title: 'Digital Detox', description: '1 hour phone-free time', icon: '📱', isCompleted: false, coinReward: 50, category: 'mental' },
      { id: 'b10', title: 'Call a Friend', description: 'Connect with someone you care about', icon: '☎️', isCompleted: false, coinReward: 30, category: 'social' }
    ]
  },
  {
    id: 'row3',
    name: 'Evening Wind-Down',
    bonusReward: 300,
    isCompleted: false,
    tasks: [
      { id: 'b11', title: 'Yoga Session', description: '15 minutes of yoga', icon: '🧘‍♂️', isCompleted: false, coinReward: 40, category: 'physical' },
      { id: 'b12', title: 'Healthy Dinner', description: 'Nutritious evening meal', icon: '🍽️', isCompleted: false, coinReward: 30, category: 'nutrition' },
      { id: 'b13', title: 'Read 10 Pages', description: 'Learn something new', icon: '📚', isCompleted: false, coinReward: 25, category: 'mental' },
      { id: 'b14', title: 'Early Bedtime', description: 'Sleep by 10 PM', icon: '🛏️', isCompleted: false, coinReward: 35, category: 'physical' },
      { id: 'b15', title: 'Skincare Routine', description: 'Take care of your skin', icon: '🧴', isCompleted: false, coinReward: 20, category: 'physical' }
    ]
  }
];

// Dummy Surprise Events
export const dummySurpriseEvents: SurpriseEvent[] = [
  {
    id: '1',
    title: '🚶‍♂️ Step-a-thon Day',
    description: 'Double coins for every 1000 steps! Get moving for extra rewards.',
    type: 'step_challenge',
    icon: '👟',
    duration: 24,
    startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // Started 2 hours ago
    endTime: new Date(Date.now() + 22 * 60 * 60 * 1000), // Ends in 22 hours
    isActive: true,
    bonusMultiplier: 2,
    requirements: {
      steps: 1000
    }
  },
  {
    id: '2',
    title: '🎁 Mystery Box Hour',
    description: 'Complete any task this hour for a mystery reward!',
    type: 'mystery_box',
    icon: '📦',
    duration: 1,
    startTime: new Date(Date.now() + 3 * 60 * 60 * 1000), // Starts in 3 hours
    endTime: new Date(Date.now() + 4 * 60 * 60 * 1000), // Ends in 4 hours
    isActive: false,
    specialReward: 500,
    requirements: {
      tasks: 1
    }
  },
  {
    id: '3',
    title: '⚡ Flash Bonus',
    description: 'Triple coins for the next 30 minutes! Act fast!',
    type: 'flash_reward',
    icon: '⚡',
    duration: 0.5,
    startTime: new Date(Date.now() + 6 * 60 * 60 * 1000), // Starts in 6 hours
    endTime: new Date(Date.now() + 6.5 * 60 * 60 * 1000), // Ends in 6.5 hours
    isActive: false,
    bonusMultiplier: 3
  },
  {
    id: '4',
    title: '🔥 Streak Master',
    description: 'Maintain a 7-day streak to unlock exclusive rewards!',
    type: 'streak_bonus',
    icon: '🏆',
    duration: 168, // 7 days
    startTime: new Date(Date.now() - 24 * 60 * 60 * 1000), // Started yesterday
    endTime: new Date(Date.now() + 144 * 60 * 60 * 1000), // Ends in 6 days
    isActive: true,
    specialReward: 1000,
    requirements: {
      streak: 7
    }
  }
];