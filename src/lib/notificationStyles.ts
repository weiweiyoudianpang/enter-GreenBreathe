/**
 * Notification Visual Style Tokens
 *
 * V1：4 种卡片视觉风格随机轮换（仅切换卡片配色 + 字体 + 边框，
 * 水墨晕开动画统一保留，避免破坏现有 InkWashCanvas 的视觉一致性）。
 *
 * 每次提醒触发时随机选择一种风格。
 */
import { NotificationStyleKey } from '@/types/extension';

export interface NotificationStyleTokens {
  key: NotificationStyleKey;
  label: string;
  /** 内容遮罩层背景 */
  contentBg: string;
  /** 内容遮罩顶部分割线 */
  contentBorder: string;
  /** 主标题颜色 */
  textPrimary: string;
  /** 副文案颜色 */
  textSecondary: string;
  /** 主按钮背景 */
  buttonBg: string;
  /** 主按钮 hover */
  buttonHover: string;
  /** 主按钮文字 */
  buttonColor: string;
  /** 次按钮背景（透明系） */
  ghostButtonBg: string;
  /** 次按钮文字 */
  ghostButtonColor: string;
  /** 次按钮边框 */
  ghostButtonBorder: string;
  /** 字体族 */
  fontFamily: string;
  /** 卡片圆角 */
  borderRadius: number;
  /** 像素风专用：是否启用像素化字体阴影 */
  pixelArt?: boolean;
}

const FONT_DEFAULT = "'Microsoft YaHei','PingFang SC',sans-serif";
const FONT_GONGBI = "'STKaiti','KaiTi','楷体',serif";
const FONT_PIXEL = "'Press Start 2P','Courier New',monospace";
const FONT_PAPER = "'Songti SC','SimSun','宋体',serif";

/* 同一种风格在白天/夜间下的两套配色 */
function buildStyles(isDay: boolean): Record<NotificationStyleKey, NotificationStyleTokens> {
  if (isDay) {
    return {
      inkWash: {
        key: 'inkWash',
        label: '水墨',
        contentBg: 'rgba(255,255,255,0.65)',
        contentBorder: '1px solid rgba(16,185,129,0.2)',
        textPrimary: '#064e3b',
        textSecondary: '#065f46',
        buttonBg: '#059669',
        buttonHover: '#047857',
        buttonColor: '#ffffff',
        ghostButtonBg: 'rgba(255,255,255,0.45)',
        ghostButtonColor: '#065f46',
        ghostButtonBorder: '1px solid rgba(16,185,129,0.35)',
        fontFamily: FONT_DEFAULT,
        borderRadius: 24,
      },
      gongbi: {
        key: 'gongbi',
        label: '工笔',
        contentBg: 'rgba(253,247,235,0.78)',
        contentBorder: '1px solid rgba(180,130,80,0.35)',
        textPrimary: '#5a3a1a',
        textSecondary: '#8a5a2a',
        buttonBg: '#b8860b',
        buttonHover: '#9a6f08',
        buttonColor: '#fff7e0',
        ghostButtonBg: 'rgba(253,247,235,0.55)',
        ghostButtonColor: '#7a4a1a',
        ghostButtonBorder: '1px solid rgba(180,130,80,0.5)',
        fontFamily: FONT_GONGBI,
        borderRadius: 18,
      },
      pixel: {
        key: 'pixel',
        label: '像素',
        contentBg: 'rgba(35,55,75,0.82)',
        contentBorder: '2px solid #38c9a3',
        textPrimary: '#a8ffe6',
        textSecondary: '#80d8c0',
        buttonBg: '#38c9a3',
        buttonHover: '#2db892',
        buttonColor: '#0a1e2e',
        ghostButtonBg: 'transparent',
        ghostButtonColor: '#a8ffe6',
        ghostButtonBorder: '2px solid #38c9a3',
        fontFamily: FONT_PIXEL,
        borderRadius: 4,
        pixelArt: true,
      },
      paper: {
        key: 'paper',
        label: '纸张',
        contentBg: 'rgba(248,243,232,0.82)',
        contentBorder: '1px dashed rgba(120,100,80,0.4)',
        textPrimary: '#3a2f20',
        textSecondary: '#5a4a35',
        buttonBg: '#5a4a35',
        buttonHover: '#3a2f20',
        buttonColor: '#f8f3e8',
        ghostButtonBg: 'rgba(248,243,232,0.6)',
        ghostButtonColor: '#5a4a35',
        ghostButtonBorder: '1px solid rgba(120,100,80,0.5)',
        fontFamily: FONT_PAPER,
        borderRadius: 12,
      },
    };
  }
  // night
  return {
    inkWash: {
      key: 'inkWash',
      label: '水墨',
      contentBg: 'rgba(10,30,46,0.55)',
      contentBorder: '1px solid rgba(56,201,163,0.15)',
      textPrimary: '#e8f4f0',
      textSecondary: '#a0c4b8',
      buttonBg: '#38c9a3',
      buttonHover: '#2db892',
      buttonColor: '#0a1e2e',
      ghostButtonBg: 'rgba(255,255,255,0.05)',
      ghostButtonColor: '#a0c4b8',
      ghostButtonBorder: '1px solid rgba(56,201,163,0.25)',
      fontFamily: FONT_DEFAULT,
      borderRadius: 24,
    },
    gongbi: {
      key: 'gongbi',
      label: '工笔',
      contentBg: 'rgba(40,28,18,0.7)',
      contentBorder: '1px solid rgba(212,160,84,0.3)',
      textPrimary: '#f3e3c8',
      textSecondary: '#d4b890',
      buttonBg: '#d4a054',
      buttonHover: '#b88840',
      buttonColor: '#1a0f05',
      ghostButtonBg: 'rgba(40,28,18,0.5)',
      ghostButtonColor: '#f3e3c8',
      ghostButtonBorder: '1px solid rgba(212,160,84,0.4)',
      fontFamily: FONT_GONGBI,
      borderRadius: 18,
    },
    pixel: {
      key: 'pixel',
      label: '像素',
      contentBg: 'rgba(8,20,30,0.88)',
      contentBorder: '2px solid #38c9a3',
      textPrimary: '#80ffd0',
      textSecondary: '#5fbfa0',
      buttonBg: '#38c9a3',
      buttonHover: '#2db892',
      buttonColor: '#08141e',
      ghostButtonBg: 'transparent',
      ghostButtonColor: '#80ffd0',
      ghostButtonBorder: '2px solid #38c9a3',
      fontFamily: FONT_PIXEL,
      borderRadius: 4,
      pixelArt: true,
    },
    paper: {
      key: 'paper',
      label: '纸张',
      contentBg: 'rgba(28,24,18,0.78)',
      contentBorder: '1px dashed rgba(180,160,130,0.35)',
      textPrimary: '#e8dec5',
      textSecondary: '#b8a98c',
      buttonBg: '#b8a98c',
      buttonHover: '#9a8b6e',
      buttonColor: '#1c1812',
      ghostButtonBg: 'rgba(28,24,18,0.55)',
      ghostButtonColor: '#e8dec5',
      ghostButtonBorder: '1px solid rgba(180,160,130,0.45)',
      fontFamily: FONT_PAPER,
      borderRadius: 12,
    },
  };
}

const ALL_KEYS: NotificationStyleKey[] = ['inkWash', 'gongbi', 'pixel', 'paper'];

/** 在白天/夜间环境下随机选一种风格 */
export function pickRandomStyle(isDay: boolean): NotificationStyleTokens {
  const key = ALL_KEYS[Math.floor(Math.random() * ALL_KEYS.length)];
  return buildStyles(isDay)[key];
}

/** 按 key 获取风格（周报展示用） */
export function getStyleByKey(key: NotificationStyleKey, isDay: boolean): NotificationStyleTokens {
  return buildStyles(isDay)[key];
}

export const NOTIFICATION_STYLE_LABELS: Record<NotificationStyleKey, string> = {
  inkWash: '水墨',
  gongbi: '工笔',
  pixel: '像素',
  paper: '纸张',
};
