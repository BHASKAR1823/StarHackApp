import { supabase, UserProfile, CoinTransaction, TaskCompletion, UserBadge } from './supabase';

class SupabaseUserService {
  /**
   * Get user profile from database
   */
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Get profile error:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Get profile exception:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', userId);

      if (error) {
        console.error('Update profile error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Update profile exception:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Award coins to user
   */
  async awardCoins(userId: string, amount: number, reason: string): Promise<{ success: boolean; newTotal?: number; error?: string }> {
    try {
      // Get current profile
      const profile = await this.getProfile(userId);
      if (!profile) {
        return { success: false, error: 'Profile not found' };
      }

      const newTotal = profile.coins + amount;

      // Update coins in profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ coins: newTotal })
        .eq('id', userId);

      if (updateError) {
        console.error('Update coins error:', updateError);
        return { success: false, error: updateError.message };
      }

      // Record transaction
      const { error: transactionError } = await supabase
        .from('coin_transactions')
        .insert({
          user_id: userId,
          amount: amount,
          reason: reason,
          transaction_type: 'earn',
        });

      if (transactionError) {
        console.error('Transaction error:', transactionError);
        // Don't fail the whole operation if transaction logging fails
      }

      return { success: true, newTotal };
    } catch (error: any) {
      console.error('Award coins exception:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Spend coins
   */
  async spendCoins(userId: string, amount: number, reason: string): Promise<{ success: boolean; newTotal?: number; error?: string }> {
    try {
      // Get current profile
      const profile = await this.getProfile(userId);
      if (!profile) {
        return { success: false, error: 'Profile not found' };
      }

      if (profile.coins < amount) {
        return { success: false, error: 'Insufficient coins' };
      }

      const newTotal = profile.coins - amount;

      // Update coins in profile
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ coins: newTotal })
        .eq('id', userId);

      if (updateError) {
        console.error('Update coins error:', updateError);
        return { success: false, error: updateError.message };
      }

      // Record transaction
      const { error: transactionError } = await supabase
        .from('coin_transactions')
        .insert({
          user_id: userId,
          amount: amount,
          reason: reason,
          transaction_type: 'spend',
        });

      if (transactionError) {
        console.error('Transaction error:', transactionError);
      }

      return { success: true, newTotal };
    } catch (error: any) {
      console.error('Spend coins exception:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Complete a task
   */
  async completeTask(userId: string, taskId: string, coinsEarned: number): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if task was already completed today
      const today = new Date().toISOString().split('T')[0];
      const { data: existing } = await supabase
        .from('task_completions')
        .select('*')
        .eq('user_id', userId)
        .eq('task_id', taskId)
        .gte('completed_at', `${today}T00:00:00`)
        .lte('completed_at', `${today}T23:59:59`)
        .single();

      if (existing) {
        return { success: false, error: 'Task already completed today' };
      }

      // Record completion
      const { error: completionError } = await supabase
        .from('task_completions')
        .insert({
          user_id: userId,
          task_id: taskId,
          coins_earned: coinsEarned,
        });

      if (completionError) {
        console.error('Task completion error:', completionError);
        return { success: false, error: completionError.message };
      }

      // Award coins
      await this.awardCoins(userId, coinsEarned, `Completed task: ${taskId}`);

      return { success: true };
    } catch (error: any) {
      console.error('Complete task exception:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Award a badge
   */
  async awardBadge(userId: string, badgeId: string, badgeName: string, badgeIcon?: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if badge already earned
      const { data: existing } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId)
        .eq('badge_id', badgeId)
        .single();

      if (existing) {
        return { success: false, error: 'Badge already earned' };
      }

      const { error } = await supabase
        .from('user_badges')
        .insert({
          user_id: userId,
          badge_id: badgeId,
          badge_name: badgeName,
          badge_icon: badgeIcon,
        });

      if (error) {
        console.error('Award badge error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Award badge exception:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user badges
   */
  async getBadges(userId: string): Promise<UserBadge[]> {
    try {
      const { data, error } = await supabase
        .from('user_badges')
        .select('*')
        .eq('user_id', userId)
        .order('earned_at', { ascending: false });

      if (error) {
        console.error('Get badges error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get badges exception:', error);
      return [];
    }
  }

  /**
   * Get coin transaction history
   */
  async getCoinHistory(userId: string, limit: number = 50): Promise<CoinTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('coin_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Get coin history error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get coin history exception:', error);
      return [];
    }
  }

  /**
   * Update streak
   */
  async updateStreak(userId: string, streakType: 'daily' | 'weekly' | 'monthly', value: number): Promise<{ success: boolean; error?: string }> {
    try {
      const updateField = `${streakType}_streak`;
      
      const { error } = await supabase
        .from('user_profiles')
        .update({ [updateField]: value })
        .eq('id', userId);

      if (error) {
        console.error('Update streak error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      console.error('Update streak exception:', error);
      return { success: false, error: error.message };
    }
  }
}

export const supabaseUserService = new SupabaseUserService();

