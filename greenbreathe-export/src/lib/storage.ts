// Chrome Storage API wrapper
import { UserProfile, InteractionLog, PlantGrowth } from '@/types/extension';

const DEFAULT_PROFILE: UserProfile = {
  nickname: '朋友',
  mbtiType: 'INFP',
  customInterval: 60,
  quietHours: ['22:00-06:00'],
  notificationPosition: 'top_right',
  minimalMode: false,
};

export const storage = {
  // Get user profile
  async getUserProfile(): Promise<UserProfile> {
    try {
      const result = await chrome.storage.local.get('userProfile');
      return result.userProfile || DEFAULT_PROFILE;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return DEFAULT_PROFILE;
    }
  },

  // Set user profile
  async setUserProfile(profile: Partial<UserProfile>): Promise<void> {
    try {
      const current = await this.getUserProfile();
      await chrome.storage.local.set({
        userProfile: { ...current, ...profile },
      });
    } catch (error) {
      console.error('Error setting user profile:', error);
    }
  },

  // Add interaction log
  async addInteractionLog(log: InteractionLog): Promise<void> {
    try {
      const result = await chrome.storage.local.get('interactionLog');
      const logs: InteractionLog[] = result.interactionLog || [];
      logs.push(log);
      
      // Keep only last 100 logs
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      await chrome.storage.local.set({ interactionLog: logs });
    } catch (error) {
      console.error('Error adding interaction log:', error);
    }
  },

  // Get interaction logs
  async getInteractionLogs(): Promise<InteractionLog[]> {
    try {
      const result = await chrome.storage.local.get('interactionLog');
      return result.interactionLog || [];
    } catch (error) {
      console.error('Error getting interaction logs:', error);
      return [];
    }
  },

  // Get plant growth
  async getPlantGrowth(): Promise<PlantGrowth> {
    try {
      const result = await chrome.storage.local.get('plantGrowth');
      return result.plantGrowth || {
        level: 0,
        totalCompletions: 0,
        unlockedForms: [],
      };
    } catch (error) {
      console.error('Error getting plant growth:', error);
      return { level: 0, totalCompletions: 0, unlockedForms: [] };
    }
  },

  // Update plant growth
  async updatePlantGrowth(completions: number): Promise<void> {
    try {
      const growth = await this.getPlantGrowth();
      growth.totalCompletions += completions;
      growth.level = Math.floor(growth.totalCompletions / 10);
      
      await chrome.storage.local.set({ plantGrowth: growth });
    } catch (error) {
      console.error('Error updating plant growth:', error);
    }
  },
};
