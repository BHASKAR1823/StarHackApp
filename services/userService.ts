import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  name: string;
  age: string;
  gender: string;
  email: string;
  height: string;
  weight: string;
}

const PROFILE_STORAGE_KEY = 'youmatter.userProfile';

class UserService {
  private cachedProfile: UserProfile | null = null;

  async getProfile(): Promise<UserProfile | null> {
    // Return cached if available
    if (this.cachedProfile) {
      return this.cachedProfile;
    }

    try {
      const saved = await AsyncStorage.getItem(PROFILE_STORAGE_KEY);
      if (saved) {
        this.cachedProfile = JSON.parse(saved);
        return this.cachedProfile;
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
    return null;
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
      this.cachedProfile = profile;
    } catch (error) {
      console.error('Failed to save profile:', error);
      throw error;
    }
  }

  async clearProfile(): Promise<void> {
    try {
      await AsyncStorage.removeItem(PROFILE_STORAGE_KEY);
      this.cachedProfile = null;
    } catch (error) {
      console.error('Failed to clear profile:', error);
    }
  }

  // Get display name (first name only)
  getDisplayName(profile: UserProfile | null): string {
    if (!profile?.name) return 'Guest';
    return profile.name.split(' ')[0];
  }

  // Get full name or default
  getFullName(profile: UserProfile | null): string {
    return profile?.name || 'Guest User';
  }

  // Get email or default
  getEmail(profile: UserProfile | null): string {
    return profile?.email || 'guest@youmatter.app';
  }

  // Clear cache (useful when profile is updated)
  invalidateCache(): void {
    this.cachedProfile = null;
  }
}

export const userService = new UserService();

