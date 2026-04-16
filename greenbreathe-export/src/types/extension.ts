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
  customInterval: number; // minutes
  quietHours: string[]; // ["22:00-06:00"]
  notificationPosition: NotificationPosition;
  minimalMode: boolean;
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
