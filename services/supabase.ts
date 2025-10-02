import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found. Please check your .env file.');
}

// Create a simple storage fallback for SSR
const createStorage = () => {
  if (typeof window === 'undefined') {
    // Server-side fallback
    return {
      getItem: async (key: string) => null,
      setItem: async (key: string, value: string) => {},
      removeItem: async (key: string) => {},
    };
  }
  return AsyncStorage;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: createStorage(),
    autoRefreshToken: typeof window !== 'undefined',
    persistSession: typeof window !== 'undefined',
    detectSessionInUrl: false,
  },
});

// Database types
export interface UserProfile {
  id: string;
  email: string | null;
  name: string | null;
  age: number | null;
  gender: string | null;
  height: number | null;
  weight: number | null;
  coins: number;
  level: number;
  daily_streak: number;
  weekly_streak: number;
  monthly_streak: number;
  created_at: string;
  updated_at: string;
}

export interface CoinTransaction {
  id: string;
  user_id: string;
  amount: number;
  reason: string;
  transaction_type: 'earn' | 'spend';
  created_at: string;
}

export interface TaskCompletion {
  id: string;
  user_id: string;
  task_id: string;
  coins_earned: number;
  completed_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  badge_name: string;
  badge_icon: string | null;
  earned_at: string;
}

