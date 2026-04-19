import { ThemeMode } from '@/types/extension';

export interface ThemeColors {
  // Backgrounds
  bg: string;
  bgGradient: string;
  bgSubtle: string;
  // Cards
  card: string;
  cardBorder: string;
  cardHover: string;
  // Text
  text: string;
  textSecondary: string;
  textMuted: string;
  textOnAccent: string;
  // Accent colors
  accent: string;
  accentHover: string;
  accentGlow: string;
  accentSoft: string;
  // Feature colors
  hydration: string;
  eyeCare: string;
  movement: string;
  // Misc
  border: string;
  overlay: string;
  inputBg: string;
  inputBorder: string;
  progressTrack: string;
  shadow: string;
  glowOrb1: string;
  glowOrb2: string;
  // Notification card
  notifContentBg: string;
  notifContentBorder: string;
  notifTitle: string;
  notifSubtitle: string;
  notifBtnBg: string;
  notifBtnColor: string;
  notifShadow: string;
}

export const dayTheme: ThemeColors = {
  bg: '#f0fdf4',
  bgGradient: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f5fef7 100%)',
  bgSubtle: '#ecfdf5',
  card: 'rgba(255,255,255,0.88)',
  cardBorder: 'rgba(16,185,129,0.18)',
  cardHover: 'rgba(255,255,255,0.95)',
  text: '#064e3b',
  textSecondary: '#047857',
  textMuted: '#6b7280',
  textOnAccent: '#ffffff',
  accent: '#10b981',
  accentHover: '#059669',
  accentGlow: 'rgba(16,185,129,0.25)',
  accentSoft: 'rgba(16,185,129,0.08)',
  hydration: '#0ea5e9',
  eyeCare: '#8b5cf6',
  movement: '#f59e0b',
  border: 'rgba(16,185,129,0.12)',
  overlay: 'rgba(240,253,244,0.6)',
  inputBg: 'rgba(255,255,255,0.8)',
  inputBorder: 'rgba(16,185,129,0.2)',
  progressTrack: 'rgba(16,185,129,0.12)',
  shadow: '0 8px 32px rgba(16,185,129,0.1)',
  glowOrb1: 'radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)',
  glowOrb2: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, transparent 70%)',
  notifContentBg: 'rgba(255,255,255,0.7)',
  notifContentBorder: '1px solid rgba(255,255,255,0.8)',
  notifTitle: '#064e3b',
  notifSubtitle: '#10b981',
  notifBtnBg: '#10b981',
  notifBtnColor: '#ffffff',
  notifShadow: '0 20px 60px rgba(16,185,129,0.2)',
};

export const nightTheme: ThemeColors = {
  bg: '#0a1e2e',
  bgGradient: 'linear-gradient(135deg, rgba(10,30,46,0.95) 0%, rgba(15,42,62,0.9) 50%, rgba(10,30,46,0.98) 100%)',
  bgSubtle: '#0d2a3d',
  card: 'rgba(255,255,255,0.04)',
  cardBorder: 'rgba(255,255,255,0.08)',
  cardHover: 'rgba(255,255,255,0.07)',
  text: '#e8f4f0',
  textSecondary: '#a3d5c9',
  textMuted: 'rgba(255,255,255,0.4)',
  textOnAccent: '#ffffff',
  accent: '#38c9a3',
  accentHover: '#2eb391',
  accentGlow: 'rgba(56,201,163,0.25)',
  accentSoft: 'rgba(56,201,163,0.08)',
  hydration: '#3b9ede',
  eyeCare: '#7c5cbf',
  movement: '#3aaa6e',
  border: 'rgba(255,255,255,0.06)',
  overlay: 'rgba(10,30,46,0.6)',
  inputBg: 'rgba(255,255,255,0.06)',
  inputBorder: 'rgba(255,255,255,0.1)',
  progressTrack: 'rgba(255,255,255,0.08)',
  shadow: '0 8px 32px rgba(0,0,0,0.3)',
  glowOrb1: 'radial-gradient(circle, rgba(56,201,163,0.12) 0%, transparent 70%)',
  glowOrb2: 'radial-gradient(circle, rgba(59,158,222,0.1) 0%, transparent 70%)',
  notifContentBg: 'rgba(10,30,46,0.65)',
  notifContentBorder: '1px solid rgba(255,255,255,0.12)',
  notifTitle: '#e8f4f0',
  notifSubtitle: '#38c9a3',
  notifBtnBg: '#38c9a3',
  notifBtnColor: '#ffffff',
  notifShadow: '0 20px 60px rgba(0,0,0,0.4)',
};

/**
 * Resolve the effective theme based on user preference.
 * 'auto' = day from 6:00–18:00, night otherwise.
 */
export function resolveTheme(mode?: ThemeMode): 'day' | 'night' {
  if (mode === 'day') return 'day';
  if (mode === 'night') return 'night';
  // auto: 6am-6pm = day
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? 'day' : 'night';
}

export function getTheme(mode?: ThemeMode): ThemeColors {
  return resolveTheme(mode) === 'day' ? dayTheme : nightTheme;
}

/** Default background images per theme */
export const defaultBackgrounds = {
  day: [
    'copper-grass-goldfish.png',
    'mint-photography.png',
    'office-zen-green-cat.png',
  ],
  night: [
    'neon-leaf.png',
    'moonlight-forest.png',
    'shattered-moon.jpg',
  ],
};
