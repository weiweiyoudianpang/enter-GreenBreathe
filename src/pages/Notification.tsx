import { createRoot } from 'react-dom/client';
import { useEffect, useState, useMemo, useCallback } from 'react';
import '@/index.css';
import { NotificationData, UserProfile } from '@/types/extension';
import { getTheme, resolveTheme, defaultBackgrounds } from '@/lib/theme';
import InkWashCanvas from '@/components/InkWashCanvas';

function NotificationWindow() {
  const [notificationData, setNotificationData] = useState<NotificationData | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [inkDone, setInkDone] = useState(false);

  useEffect(() => {
    const fetchData = () => {
      chrome.storage.local.get(['pendingNotification', 'userProfile'], (result) => {
        if (result.pendingNotification) {
          setNotificationData(result.pendingNotification);
          setProfile(result.userProfile);
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

  const randomAction = useMemo(() => {
    const actionTexts = ['了解啦', '谢谢关心', 'OK', '收到', '这就去'];
    return actionTexts[Math.floor(Math.random() * actionTexts.length)];
  }, []);

  const handleInkComplete = useCallback(() => {
    setInkDone(true);
  }, []);

  const handleClose = async () => {
    if (notificationData) {
      const logs = await chrome.storage.local.get('interactionLog');
      const interactionLog = logs.interactionLog || [];
      interactionLog.push({
        timestamp: Date.now(),
        action: 'completed',
        taskType: notificationData.taskType,
      });
      await chrome.storage.local.set({ interactionLog: interactionLog.slice(-100) });

      const plantResult = await chrome.storage.local.get('plantGrowth');
      const plantGrowth = plantResult.plantGrowth || { level: 1, totalCompletions: 0, unlockedForms: ['bamboo_sprout'] };
      plantGrowth.totalCompletions += 1;
      if (plantGrowth.totalCompletions % 10 === 0) {
        plantGrowth.level += 1;
      }
      await chrome.storage.local.set({ plantGrowth });
    }
    window.close();
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
        @keyframes contentSlideUp {
          0%   { opacity: 0; transform: translateY(20px); filter: blur(8px); }
          100% { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        @keyframes cardScale {
          0%   { transform: scale(0.96); }
          100% { transform: scale(1); }
        }
      `}</style>

      <div style={{
        width, height, borderRadius: 24, position: 'relative', overflow: 'hidden',
        boxShadow: t.notifShadow,
        fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
        animation: 'cardScale 0.8s cubic-bezier(0.22,1,0.36,1) forwards',
      }}>
        {/* Layer 1: Base solid color (visible before ink reveals) */}
        <div style={{ position: 'absolute', inset: 0, background: inkBgColor }} />

        {/* Layer 2: Background image (always present, covered by canvas mask) */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url('${bgImage}')`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          zIndex: 1,
        }} />

        {/* Layer 3: Canvas ink wash mask (covers image, gradually dissolves) */}
        <InkWashCanvas
          bgColor={inkBgColor}
          duration={profile.inkDuration ?? 3}
          onComplete={handleInkComplete}
          style={{ zIndex: 2 }}
        />

        {/* Layer 4: Content overlay */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%',
          background: t.notifContentBg,
          backdropFilter: 'blur(28px) saturate(150%)',
          WebkitBackdropFilter: 'blur(28px) saturate(150%)',
          padding: '40px 60px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          borderTop: t.notifContentBorder,
          zIndex: 3,
          opacity: inkDone ? 1 : 0,
          transform: inkDone ? 'translateY(0)' : 'translateY(20px)',
          filter: inkDone ? 'blur(0)' : 'blur(8px)',
          transition: 'all 0.8s cubic-bezier(0.22,1,0.36,1)',
        }}>
          <div style={{ fontSize: 32, lineHeight: 1.5, marginBottom: 16, color: t.notifTitle, fontWeight: 600 }}>
            {notificationData.encouragement}
          </div>
          <div style={{ fontSize: 20, color: t.notifSubtitle, marginBottom: 24, lineHeight: 1.6, fontWeight: 500 }}>
            {notificationData.instruction.instruction} · {scienceText}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              onClick={handleClose}
              style={{
                padding: '12px 32px', borderRadius: 12, fontSize: 18, fontWeight: 600,
                cursor: 'pointer', border: 'none',
                fontFamily: "'Microsoft YaHei', 'PingFang SC', sans-serif",
                background: t.notifBtnBg, color: t.notifBtnColor,
                boxShadow: `0 4px 12px ${t.accentGlow}`,
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = t.accentHover;
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = t.notifBtnBg;
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {randomAction}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const container = document.getElementById('notification-root');
if (container) {
  const root = createRoot(container);
  root.render(<NotificationWindow />);
}
