import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not found. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types
export interface UserProfile {
  id: string;
  phone_number: string;
  name: string | null;
  age: number | null;
  gender: string | null;
  email: string | null;
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

