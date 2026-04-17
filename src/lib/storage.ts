import { UserProfile, InteractionLog, PlantGrowth } from '@/types/extension';

// Storage keys
const STORAGE_KEYS = {
  USER_PROFILE: 'userProfile',
  INTERACTION_LOG: 'interactionLog',
  PLANT_GROWTH: 'plantGrowth',
} as const;

// Default values
const DEFAULT_PROFILE: UserProfile = {
  nickname: '朋友',
  mbtiType: 'INFP',
  hydrationInterval: 45,    // 喝水：45分钟（科学建议）
  eyeCareInterval: 20,       // 眼睛：20分钟（20-20-20法则）
  movementInterval: 60,      // 运动：60分钟（久坐提醒）
  quietHours: [],
  notificationPosition: 'top_right',
  minimalMode: false,
};

// Storage API
export const storage = {
  async getUserProfile(): Promise<UserProfile> {
    const result = await chrome.storage.local.get(STORAGE_KEYS.USER_PROFILE);
    return result[STORAGE_KEYS.USER_PROFILE] || DEFAULT_PROFILE;
  },

  async setUserProfile(profile: UserProfile): Promise<void> {
    await chrome.storage.local.set({
      [STORAGE_KEYS.USER_PROFILE]: profile,
    });
  },

  async getInteractionLog(): Promise<InteractionLog[]> {
    const result = await chrome.storage.local.get(STORAGE_KEYS.INTERACTION_LOG);
    return result[STORAGE_KEYS.INTERACTION_LOG] || [];
  },

  async addInteractionLog(log: InteractionLog): Promise<void> {
    const logs = await this.getInteractionLog();
    logs.push(log);
    // Keep only last 100 logs
    const recentLogs = logs.slice(-100);
    await chrome.storage.local.set({
      [STORAGE_KEYS.INTERACTION_LOG]: recentLogs,
    });
  },

  async getPlantGrowth(): Promise<PlantGrowth> {
    const result = await chrome.storage.local.get(STORAGE_KEYS.PLANT_GROWTH);
    return result[STORAGE_KEYS.PLANT_GROWTH] || {
      level: 1,
      totalCompletions: 0,
      unlockedForms: ['bamboo_sprout'],
    };
  },

  async updatePlantGrowth(growth: Partial<PlantGrowth>): Promise<void> {
    const current = await this.getPlantGrowth();
    await chrome.storage.local.set({
      [STORAGE_KEYS.PLANT_GROWTH]: { ...current, ...growth },
    });
  },

  async clearAllData(): Promise<void> {
    await chrome.storage.local.clear();
  },
};

// Helper functions for compatibility
export async function loadUserProfile(): Promise<UserProfile> {
  return storage.getUserProfile();
}

export async function saveUserProfile(profile: UserProfile): Promise<void> {
  return storage.setUserProfile(profile);
}

export async function loadPlantGrowth(): Promise<PlantGrowth> {
  return storage.getPlantGrowth();
}

export async function savePlantGrowth(growth: PlantGrowth): Promise<void> {
  return storage.updatePlantGrowth(growth);
}
