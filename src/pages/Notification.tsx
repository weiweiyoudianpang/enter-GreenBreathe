import { createRoot } from 'react-dom/client';
import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import '@/index.css';
import { NotificationData, UserProfile } from '@/types/extension';
import { getTheme, resolveTheme, defaultBackgrounds } from '@/lib/theme';
import InkWashCanvas from '@/components/InkWashCanvas';

const READ_THRESHOLD_MS = 3000;
const BLUR_GRACE_MS = 5000;

function NotificationWindow() {
  const [notificationData, setNotificationData] = useState<NotificationData | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [inkDone, setInkDone] = useState(false);
  const shownAtRef = useRef<number>(Date.now());
  const resolvedRef = useRef(false);

  useEffect(() => {
    const fetchData = () => {
      chrome.storage.local.get(['pendingNotification', 'userProfile'], (result) => {
        if (result.pendingNotification) {
          setNotificationData(result.pendingNotification);
          setProfile(result.userProfile);
          shownAtRef.current = Date.now();
          chrome.storage.local.remove('pendingNotification');
        } else {
          setTimeout(fetchData, 200);
        }
      });
    };
    setTimeout(fetchData, 50);
  }, []);

  const bgImage = useMemo(() => {
    if (!profile) return '';
    const effectiveTheme = resolveTheme(profile.themeMode);
    const customBgs = effectiveTheme === 'day'
      ? (profile.customBackgroundsDay || profile.customBackgrounds || [])
      : (profile.customBackgroundsNight || []);
    if (customBgs.length > 0) {
      return customBgs[Math.floor(Math.random() * customBgs.length)];
    }
    const defaults = defaultBackgrounds[effectiveTheme];
    const file = defaults[Math.floor(Math.random() * defaults.length)];
    return chrome.runtime.getURL(`images/${effectiveTheme}/${file}`);
  }, [profile]);

  const handleInkComplete = useCallback(() => {
    setInkDone(true);
  }, []);

  const finalize = useCallback(async (
    action: 'completed' | 'snoozed' | 'ignored',
    reason: 'user_completed' | 'user_snoozed' | 'fast_dismiss' | 'timeout' | 'window_blur',
  ) => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    if (notificationData) {
      const elapsed = Date.now() - shownAtRef.current;
      const logs = await chrome.storage.local.get('interactionLog');
      const interactionLog = logs.interactionLog || [];
      interactionLog.push({
        timestamp: Date.now(),
        action,
        taskType: notificationData.taskType,
        shownDurationMs: elapsed,
        reason,
      });
      await chrome.storage.local.set({ interactionLog: interactionLog.slice(-1000) });

      if (action === 'completed') {
        const plantResult = await chrome.storage.local.get('plantGrowth');
        const plantGrowth = plantResult.plantGrowth || { level: 1, totalCompletions: 0, unlockedForms: ['bamboo_sprout'] };
        plantGrowth.totalCompletions += 1;
        if (plantGrowth.totalCompletions % 10 === 0) plantGrowth.level += 1;
        await chrome.storage.local.set({ plantGrowth });
      }
    }
    window.close();
  }, [notificationData]);

  // Window blur within grace period → ignored
  useEffect(() => {
    if (!notificationData) return;
    const onBlur = () => {
      if (Date.now() - shownAtRef.current < BLUR_GRACE_MS) {
        finalize('ignored', 'window_blur');
      }
    };
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, [notificationData, finalize]);

  const handleComplete = () => {
    const elapsed = Date.now() - shownAtRef.current;
    if (elapsed < READ_THRESHOLD_MS) finalize('ignored', 'fast_dismiss');
    else finalize('completed', 'user_completed');
  };
  const handleSnooze = () => finalize('snoozed', 'user_snoozed');
  const handleIgnore = () => {
    const elapsed = Date.now() - shownAtRef.current;
    finalize('ignored', elapsed < READ_THRESHOLD_MS ? 'fast_dismiss' : 'timeout');
  };

  if (!notificationData || !profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-background/95 backdrop-blur-md">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  const t = getTheme(profile.themeMode);
  const effectiveTheme = resolveTheme(profile.themeMode);
  const isDay = effectiveTheme === 'day';
  const cardSize = profile.cardSize || 'medium';
  const sizeMap = {
    small: { width: 960, height: 570 },
    medium: { width: 1280, height: 760 },
    large: { width: 1600, height: 950 }
  };
  const { width, height } = sizeMap[cardSize];

  const mbtiType = profile.mbtiType;
  const isThinker = mbtiType.includes('T');
  const isIntuitive = mbtiType.includes('N');
  let scienceText = '';
  if (isThinker) scienceText = notificationData.instruction.mbtiAdaptation.T;
  else if (isIntuitive) scienceText = notificationData.instruction.mbtiAdaptation.N;
  else scienceText = notificationData.instruction.mbtiAdaptation.F;

  const inkBgColor = isDay ? '#e8f0e4' : '#0a1a28';

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.15)', backdropFilter: 'blur(6px)',
    }}>
      <style>{`
        @keyframes contentSlideUp { 0% { opacity: 0; transform: translateY(20px); filter: blur(8px); } 100% { opacity: 1; transform: translateY(0); filter: blur(0); } }
        @keyframes cardScale { 0% { transform: scale(0.96); } 100% { transform: scale(1); } }
      `}</style>

      <div style={{
        width, height, borderRadius: 24, position: 'relative', overflow: 'hidden',
        boxShadow: t.notifShadow,
        fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
        animation: 'cardScale 0.8s cubic-bezier(0.22,1,0.36,1) forwards',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: inkBgColor }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url('${bgImage}')`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          zIndex: 1,
        }} />
        <InkWashCanvas
          bgColor={inkBgColor}
          duration={profile.inkDuration ?? 3}
          onComplete={handleInkComplete}
          style={{ zIndex: 2 }}
        />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '32%',
          background: t.notifContentBg,
          backdropFilter: 'blur(28px) saturate(150%)',
          WebkitBackdropFilter: 'blur(28px) saturate(150%)',
          padding: '32px 56px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          borderTop: t.notifContentBorder,
          zIndex: 3,
          opacity: inkDone ? 1 : 0,
          transform: inkDone ? 'translateY(0)' : 'translateY(20px)',
          filter: inkDone ? 'blur(0)' : 'blur(8px)',
          transition: 'all 0.8s cubic-bezier(0.22,1,0.36,1)',
        }}>
          <div style={{ fontSize: 30, lineHeight: 1.5, marginBottom: 14, color: t.notifTitle, fontWeight: 600 }}>
            {notificationData.encouragement}
          </div>
          <div style={{ fontSize: 19, color: t.notifSubtitle, marginBottom: 22, lineHeight: 1.6, fontWeight: 500 }}>
            {notificationData.instruction.instruction} · {scienceText}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <button
              onClick={handleSnooze}
              style={ghostBtnStyle(t, isDay)}
              onMouseEnter={(e) => { e.currentTarget.style.background = isDay ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = isDay ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.05)'; }}
            >
              稍后再说
            </button>
            <button
              onClick={handleIgnore}
              style={ghostBtnStyle(t, isDay)}
              onMouseEnter={(e) => { e.currentTarget.style.background = isDay ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = isDay ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.05)'; }}
            >
              先不了
            </button>
            <button
              onClick={handleComplete}
              style={{
                padding: '10px 28px', borderRadius: 12, fontSize: 17, fontWeight: 600,
                cursor: 'pointer', border: 'none',
                fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
                background: t.notifBtnBg, color: t.notifBtnColor,
                boxShadow: `0 4px 12px ${t.accentGlow}`,
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = t.accentHover; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = t.notifBtnBg; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              我已完成
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ghostBtnStyle(t: ReturnType<typeof getTheme>, isDay: boolean) {
  return {
    padding: '10px 22px', borderRadius: 12, fontSize: 17, fontWeight: 600, cursor: 'pointer',
    fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
    background: isDay ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.05)',
    color: t.notifSubtitle,
    border: `1px solid ${isDay ? 'rgba(16,185,129,0.35)' : 'rgba(56,201,163,0.25)'}`,
    transition: 'all 0.3s ease',
  } as const;
}

const container = document.getElementById('notification-root');
if (container) {
  const root = createRoot(container);
  root.render(<NotificationWindow />);
}
