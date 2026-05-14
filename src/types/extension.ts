// Extension types
export type MBTIType = 
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

export type TaskType = 'hydration' | 'eyeCare' | 'movement';

export type NotificationPosition = 'top_right' | 'top_left' | 'bottom_right' | 'bottom_left' | 'random';

export type NotificationStyleKey = 'inkWash' | 'gongbi' | 'pixel' | 'paper';

export type ThemeMode = 'day' | 'night' | 'auto';

export type CardSize = 'small' | 'medium' | 'large';

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
  cardSize?: CardSize;           // 卡片尺寸（默认 medium）
  themeMode?: ThemeMode;         // 白天/夜间/自动模式
  // 可选扩展字段
  theme?: string;
  soundEnabled?: boolean;
  soundVolume?: number;
  customImage?: string | null;
  customBackgrounds?: string[];  // 兼容旧版
  customBackgroundsDay?: string[];   // 白天模式自定义背景
  customBackgroundsNight?: string[]; // 夜间模式自定义背景
  inkDuration?: number;              // 水墨晕开动画时长（秒, 0-10, 默认3）
  cardDisplayDuration?: number;      // 卡片存留时长（秒, 10-60, 默认20）
}

export interface InteractionLog {
  timestamp: number;
  /**
   * 用户对提醒卡片的真实反馈状态
   * - completed: 卡片显示≥3秒，且用户主动点击「我已完成」
   * - snoozed:   用户点击「稍后再说」
   * - ignored:   未交互（被动信号）：快速关闭/超时/失焦
   */
  action: 'completed' | 'snoozed' | 'ignored';
  taskType: TaskType;
  /** 卡片实际展示时长（毫秒） */
  shownDurationMs?: number;
  /** ignored / snoozed 的具体原因 */
  reason?: 'user_completed' | 'user_snoozed' | 'fast_dismiss' | 'timeout' | 'window_blur';
  /** 当次使用的视觉风格 */
  style?: NotificationStyleKey;
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
