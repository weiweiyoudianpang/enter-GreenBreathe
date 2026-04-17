// Extension types
export type MBTIType = 
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

export type TaskType = 'hydration' | 'eyeCare' | 'movement';

export type NotificationPosition = 'top_right' | 'top_left' | 'bottom_right' | 'bottom_left';

export interface UserProfile {
  nickname: string;
  mbtiType: MBTIType;
  // 三个独立的提醒间隔（分钟，0表示不提醒）
  hydrationInterval: number;    // 喝水提醒间隔（默认45分钟）
  eyeCareInterval: number;       // 眼睛休息间隔（默认20分钟）
  movementInterval: number;      // 身体活动间隔（默认60分钟）
  quietHours: string[]; // ["22:00-06:00"]
  notificationPosition: NotificationPosition;
  minimalMode: boolean;
  // 可选扩展字段
  theme?: string;
  soundEnabled?: boolean;
  soundVolume?: number;
  customImage?: string | null;
}

export interface InteractionLog {
  timestamp: number;
  action: 'completed' | 'snoozed' | 'dismissed';
  taskType: TaskType;
}

export interface PlantGrowth {
  level: number;
  totalCompletions: number;
  unlockedForms: string[];
}

export interface EncouragementMessage {
  id: string;
  taskType: TaskType;
  message: string;
  maxLength: number;
}

export interface ScientificInstruction {
  id: string;
  taskType: TaskType;
  instruction: string;
  scienceBasis: string;
  source: string;
  duration: number; // seconds
  mbtiAdaptation: {
    T: string; // Thinking
    F: string; // Feeling
    S: string; // Sensing
    N: string; // Intuition
  };
}

export interface NotificationData {
  taskType: TaskType;
  encouragement: string;
  instruction: ScientificInstruction;
  timestamp: number;
}
