# 🗄️ Supabase Integration Guide for YouMatter

This guide will help you integrate Supabase as the backend database for the YouMatter wellness app, replacing the current dummy data with real-time data persistence.

## 📋 Prerequisites

- YouMatter app running locally
- Supabase account (free tier available)
- Node.js and npm installed

## Step 1: Setup Supabase Project

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in project details:
   - **Name**: YouMatter
   - **Database Password**: Create a secure password
   - **Region**: Choose closest to your users
4. Wait for project setup (2-3 minutes)

### 1.2 Get Project Credentials
1. Go to **Settings** → **API**
2. Copy these values (you'll need them later):
   - **Project URL**
   - **Project API Key (anon public)**

## Step 2: Install Supabase Dependencies

```bash
cd YouMatter
npm install @supabase/supabase-js
npm install @supabase/auth-helpers-react-native
npm install react-native-url-polyfill
```

## Step 3: Configure Supabase Client

### 3.1 Create Supabase Configuration
Create `lib/supabase.ts`:

```typescript
import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL' // Replace with your project URL
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY' // Replace with your anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})
```

### 3.2 Environment Variables (Recommended)
Create `.env` file in root:

```bash
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Update `lib/supabase.ts`:

```typescript
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
```

## Step 4: Database Schema Setup

### 4.1 Create Tables
Go to Supabase Dashboard → **SQL Editor** and run these commands:

```sql
-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  level INTEGER DEFAULT 1,
  coins INTEGER DEFAULT 0,
  daily_streak INTEGER DEFAULT 0,
  weekly_streak INTEGER DEFAULT 0,
  monthly_streak INTEGER DEFAULT 0,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Badges table
CREATE TABLE badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('health', 'finance', 'insurance', 'social', 'milestone')),
  earned_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily tasks table
CREATE TABLE daily_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('health', 'finance', 'insurance', 'social')),
  coin_reward INTEGER NOT NULL,
  icon TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  completed_date TIMESTAMP WITH TIME ZONE,
  created_date DATE DEFAULT CURRENT_DATE
);

-- Missions table
CREATE TABLE missions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly')),
  progress INTEGER DEFAULT 0,
  target INTEGER NOT NULL,
  coin_reward INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('health', 'finance', 'insurance', 'social')),
  is_completed BOOLEAN DEFAULT FALSE,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Health metrics table
CREATE TABLE health_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  steps INTEGER DEFAULT 0,
  sleep_hours DECIMAL(3,1) DEFAULT 0,
  water_intake INTEGER DEFAULT 0,
  meditation_minutes INTEGER DEFAULT 0,
  workout_sessions INTEGER DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insurance policies table
CREATE TABLE insurance_policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('health', 'life', 'auto', 'home')),
  provider TEXT NOT NULL,
  premium DECIMAL(10,2) NOT NULL,
  coverage DECIMAL(12,2) NOT NULL,
  renewal_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'pending'))
);

-- Insurance challenges table
CREATE TABLE insurance_challenges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('premium_reduction', 'policy_exploration', 'renewal_reward', 'quiz')),
  progress INTEGER DEFAULT 0,
  target INTEGER NOT NULL,
  reward DECIMAL(10,2) NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_user BOOLEAN NOT NULL,
  category TEXT CHECK (category IN ('wellness', 'meditation', 'insurance', 'general')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout sessions table
CREATE TABLE workout_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('yoga', 'meditation', 'fitness', 'walk')),
  duration INTEGER NOT NULL,
  coins_earned INTEGER NOT NULL,
  poses TEXT[], -- Array of pose names for yoga sessions
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reward items table
CREATE TABLE reward_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  cost INTEGER NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('premium_content', 'ar_poses', 'insurance_perks', 'customization')),
  icon TEXT NOT NULL,
  is_available BOOLEAN DEFAULT TRUE
);

-- User purchased rewards table
CREATE TABLE user_rewards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reward_id UUID REFERENCES reward_items(id) ON DELETE CASCADE,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, reward_id)
);
```

### 4.2 Enable Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rewards ENABLE ROW LEVEL SECURITY;

-- Create policies (users can only access their own data)
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own badges" ON badges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own badges" ON badges FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own tasks" ON daily_tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own tasks" ON daily_tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own tasks" ON daily_tasks FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add similar policies for other tables...
```

## Step 5: Replace Dummy Data Services

### 5.1 Create Database Service
Create `services/databaseService.ts`:

```typescript
import { supabase } from '../lib/supabase'
import { User, Badge, DailyTask, Mission, HealthMetrics, InsurancePolicy } from '../types/app'

class DatabaseService {
  // User methods
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return data
  }

  async updateUser(updates: Partial<User>): Promise<User> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Daily tasks methods
  async getDailyTasks(): Promise<DailyTask[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const { data, error } = await supabase
      .from('daily_tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('created_date', new Date().toISOString().split('T')[0])

    if (error) throw error
    return data || []
  }

  async completeTask(taskId: string): Promise<void> {
    const { error } = await supabase
      .from('daily_tasks')
      .update({ 
        is_completed: true, 
        completed_date: new Date().toISOString() 
      })
      .eq('id', taskId)

    if (error) throw error
  }

  // Health metrics methods
  async getTodayHealthMetrics(): Promise<HealthMetrics | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const { data, error } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', new Date().toISOString().split('T')[0])
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async updateHealthMetrics(metrics: Partial<HealthMetrics>): Promise<HealthMetrics> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const { data, error } = await supabase
      .from('health_metrics')
      .upsert({
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        ...metrics
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Chat messages methods
  async getChatMessages(): Promise<any[]> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (error) throw error
    return data || []
  }

  async saveChatMessage(text: string, isUser: boolean, category?: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        text,
        is_user: isUser,
        category
      })

    if (error) throw error
  }

  // Gamification methods
  async awardCoins(amount: number, reason: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    // Get current coins
    const { data: currentUser } = await supabase
      .from('users')
      .select('coins')
      .eq('id', user.id)
      .single()

    if (!currentUser) throw new Error('User not found')

    // Update coins
    const { error } = await supabase
      .from('users')
      .update({ coins: currentUser.coins + amount })
      .eq('id', user.id)

    if (error) throw error
  }

  async awardBadge(badge: Omit<Badge, 'id' | 'user_id' | 'earned_date'>): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No authenticated user')

    const { error } = await supabase
      .from('badges')
      .insert({
        user_id: user.id,
        ...badge
      })

    if (error) throw error
  }
}

export const dbService = new DatabaseService()
```

### 5.2 Update Gamification Service
Update `services/gamificationService.ts`:

```typescript
import { User, Badge } from '../types/app'
import { dbService } from './databaseService'

class GamificationService {
  // Update existing methods to use database
  async awardCoins(amount: number, reason: string): Promise<{ success: boolean; newTotal: number; levelUp: boolean }> {
    try {
      const currentUser = await dbService.getCurrentUser()
      if (!currentUser) throw new Error('No user found')

      const oldLevel = this.calculateLevel(currentUser.coins)
      await dbService.awardCoins(amount, reason)
      
      const updatedUser = await dbService.getCurrentUser()
      if (!updatedUser) throw new Error('Failed to get updated user')

      const newLevel = this.calculateLevel(updatedUser.coins)
      const levelUp = newLevel > oldLevel

      if (levelUp) {
        await dbService.updateUser({ level: newLevel })
      }

      return {
        success: true,
        newTotal: updatedUser.coins,
        levelUp
      }
    } catch (error) {
      console.error('Error awarding coins:', error)
      return { success: false, newTotal: 0, levelUp: false }
    }
  }

  // Keep existing calculation methods
  calculateLevel(coins: number): number {
    return Math.floor(coins / 200) + 1
  }

  // ... other methods
}

export const gamificationService = new GamificationService()
```

## Step 6: Authentication Setup

### 6.1 Create Auth Service
Create `services/authService.ts`:

```typescript
import { supabase } from '../lib/supabase'
import { dbService } from './databaseService'

class AuthService {
  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error

    // Create user profile
    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        email,
        name,
        coins: 0,
        level: 1,
        daily_streak: 0,
        weekly_streak: 0,
        monthly_streak: 0
      })
    }

    return data
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  }

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  async getCurrentSession() {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  }
}

export const authService = new AuthService()
```

### 6.2 Create Authentication Context
Create `contexts/AuthContext.tsx`:

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react'
import { Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

type AuthContextType = {
  session: Session | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, loading }}>
      {children}
    </AuthContext.Provider>
  )
}
```

## Step 7: Update App Root

### 7.1 Update App Layout
Update `app/_layout.tsx`:

```typescript
import { AuthProvider } from '@/contexts/AuthContext'
import { Stack } from 'expo-router'

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="auth" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  )
}
```

### 7.2 Create Auth Screen
Create `app/auth.tsx`:

```typescript
import React, { useState } from 'react'
import { View, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { ThemedText } from '@/components/themed-text'
import { ThemedView } from '@/components/themed-view'
import { authService } from '@/services/authService'
import { router } from 'expo-router'

export default function AuthScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleAuth = async () => {
    if (!email || !password || (isSignUp && !name)) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    setLoading(true)
    try {
      if (isSignUp) {
        await authService.signUp(email, password, name)
        Alert.alert('Success', 'Account created! Please check your email to verify.')
      } else {
        await authService.signIn(email, password)
        router.replace('/(tabs)')
      }
    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Welcome to YouMatter</ThemedText>
      
      {isSignUp && (
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
        />
      )}
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={handleAuth}
        disabled={loading}
      >
        <ThemedText style={styles.buttonText}>
          {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
        </ThemedText>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
        <ThemedText style={styles.switchText}>
          {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
        </ThemedText>
      </TouchableOpacity>
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchText: {
    textAlign: 'center',
    color: '#007AFF',
  },
})
```

## Step 8: Update Components to Use Real Data

### 8.1 Update Home Screen
Replace dummy data imports in `app/(tabs)/index.tsx`:

```typescript
// Replace this:
import { dummyUser, dummyDailyTasks, dummyMissions } from '@/services/dummyData';

// With this:
import { dbService } from '@/services/databaseService';
import { useAuth } from '@/contexts/AuthContext';

// In component:
const { session } = useAuth();
const [user, setUser] = useState<User | null>(null);
const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([]);

useEffect(() => {
  if (session) {
    loadUserData();
  }
}, [session]);

const loadUserData = async () => {
  try {
    const userData = await dbService.getCurrentUser();
    const tasks = await dbService.getDailyTasks();
    setUser(userData);
    setDailyTasks(tasks);
  } catch (error) {
    console.error('Error loading user data:', error);
  }
};
```

## Step 9: Deploy and Test

### 9.1 Test Locally
1. Restart your Expo app: `npx expo start`
2. Test authentication flow
3. Verify data persistence
4. Test all CRUD operations

### 9.2 Deploy to Production
1. Build the app: `npx expo build`
2. Update Supabase project settings for production
3. Configure proper authentication redirects
4. Set up proper RLS policies

## 📊 Additional Features to Implement

### Real-time Updates
```typescript
// Subscribe to real-time changes
useEffect(() => {
  const subscription = supabase
    .channel('user_changes')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'users',
      filter: `id=eq.${session?.user?.id}`
    }, (payload) => {
      setUser(payload.new as User)
    })
    .subscribe()

  return () => subscription.unsubscribe()
}, [session])
```

### File Storage for Avatars
```typescript
// Upload avatar
const uploadAvatar = async (file: File) => {
  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(`${session?.user?.id}/avatar.jpg`, file)
  
  if (error) throw error
  return data
}
```

### Analytics Integration
```typescript
// Track user events
const trackEvent = async (event: string, properties: any) => {
  await supabase
    .from('analytics_events')
    .insert({
      user_id: session?.user?.id,
      event,
      properties,
      timestamp: new Date().toISOString()
    })
}
```

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit secrets to git
2. **RLS Policies**: Ensure users can only access their own data
3. **Input Validation**: Validate all user inputs
4. **Rate Limiting**: Implement rate limiting for API calls
5. **HTTPS Only**: Always use HTTPS in production

## 🚀 Performance Optimization

1. **Pagination**: Implement pagination for large datasets
2. **Caching**: Use React Query or SWR for data caching
3. **Lazy Loading**: Load data on demand
4. **Optimistic Updates**: Update UI before server response
5. **Connection Pooling**: Configure Supabase connection pooling

This integration will transform your YouMatter app from using dummy data to a fully functional, scalable backend with real-time capabilities, user authentication, and data persistence! 🎉