import { createRoot } from 'react-dom/client';
import { useEffect, useState, useMemo } from 'react';
import '@/index.css';
import { NotificationData, UserProfile } from '@/types/extension';
import { getTheme, resolveTheme, defaultBackgrounds } from '@/lib/theme';

function NotificationWindow() {
  const [notificationData, setNotificationData] = useState<NotificationData | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const fetchData = () => {
      chrome.storage.local.get(['pendingNotification', 'userProfile'], (result) => {
        if (result.pendingNotification) {
          setNotificationData(result.pendingNotification);
          setProfile(result.userProfile);
          chrome.storage.local.remove('pendingNotification');
          setTimeout(() => setShow(true), 100);
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

  // Generate random ink drop positions once
  const inkDrops = useMemo(() => {
    const drops = [];
    // 7 ink drops at pseudo-random positions for organic spread
    const positions = [
      [35, 25], [65, 40], [20, 60], [80, 30], [50, 70], [15, 35], [75, 65],
    ];
    for (let i = 0; i < positions.length; i++) {
      drops.push({ x: positions[i][0], y: positions[i][1], delay: i * 0.18, size: 70 + (i % 3) * 15 });
    }
    return drops;
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

  // Build the mask keyframes for ink drop reveal
  // Each drop expands from 0% to its full size with staggered delays
  const inkMaskKeyframes = inkDrops.map((drop, i) => `
    @keyframes inkDrop${i} {
      0% { --r${i}: 0%; }
      100% { --r${i}: ${drop.size}%; }
    }
  `).join('');

  // Build the mask-image as multiple radial gradients
  // During animation, each gradient circle grows from 0 to full size
  // We use the CSS animation approach: animate the mask-size of each layer
  const maskLayers = inkDrops.map((drop) =>
    `radial-gradient(circle at ${drop.x}% ${drop.y}%, black 0%, black 100%, transparent 100%)`
  ).join(', ');

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <style>{`
        /* ── Ink wash progressive reveal ── */
        @keyframes inkRevealMask {
          0%   { mask-size: 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%; -webkit-mask-size: 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%; }
          10%  { mask-size: 45% 45%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%; -webkit-mask-size: 45% 45%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%; }
          20%  { mask-size: 70% 70%, 35% 35%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%; -webkit-mask-size: 70% 70%, 35% 35%, 0% 0%, 0% 0%, 0% 0%, 0% 0%, 0% 0%; }
          30%  { mask-size: 90% 90%, 65% 65%, 40% 40%, 0% 0%, 0% 0%, 0% 0%, 0% 0%; -webkit-mask-size: 90% 90%, 65% 65%, 40% 40%, 0% 0%, 0% 0%, 0% 0%, 0% 0%; }
          40%  { mask-size: 110% 110%, 85% 85%, 70% 70%, 45% 45%, 0% 0%, 0% 0%, 0% 0%; -webkit-mask-size: 110% 110%, 85% 85%, 70% 70%, 45% 45%, 0% 0%, 0% 0%, 0% 0%; }
          55%  { mask-size: 140% 140%, 110% 110%, 95% 95%, 80% 80%, 55% 55%, 35% 35%, 0% 0%; -webkit-mask-size: 140% 140%, 110% 110%, 95% 95%, 80% 80%, 55% 55%, 35% 35%, 0% 0%; }
          70%  { mask-size: 170% 170%, 140% 140%, 120% 120%, 110% 110%, 90% 90%, 70% 70%, 50% 50%; -webkit-mask-size: 170% 170%, 140% 140%, 120% 120%, 110% 110%, 90% 90%, 70% 70%, 50% 50%; }
          85%  { mask-size: 200% 200%, 180% 180%, 160% 160%, 150% 150%, 130% 130%, 110% 110%, 90% 90%; -webkit-mask-size: 200% 200%, 180% 180%, 160% 160%, 150% 150%, 130% 130%, 110% 110%, 90% 90%; }
          100% { mask-size: 250% 250%, 220% 220%, 200% 200%, 200% 200%, 180% 180%, 160% 160%, 150% 150%; -webkit-mask-size: 250% 250%, 220% 220%, 200% 200%, 200% 200%, 180% 180%, 160% 160%, 150% 150%; }
        }

        @keyframes cardEnter {
          0% { transform: scale(0.97); filter: brightness(0.7); }
          100% { transform: scale(1); filter: brightness(1); }
        }

        @keyframes contentFadeIn {
          0% { opacity: 0; filter: blur(10px); transform: translateY(12px); }
          60% { opacity: 0; filter: blur(10px); transform: translateY(12px); }
          100% { opacity: 1; filter: blur(0); transform: translateY(0); }
        }

        ${inkMaskKeyframes}

        .notification-card {
          width: ${width}px;
          height: ${height}px;
          border-radius: 24px;
          position: relative;
          overflow: hidden;
          box-shadow: ${t.notifShadow};
          font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
          animation: cardEnter 2.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .card-bg-layer {
          position: absolute;
          inset: 0;
          background-image: url('${bgImage}');
          background-size: cover;
          background-position: center;
          /* Ink wash mask: multiple radial gradients that expand progressively */
          mask-image: ${maskLayers};
          -webkit-mask-image: ${maskLayers};
          mask-position: ${inkDrops.map(d => `${d.x}% ${d.y}%`).join(', ')};
          -webkit-mask-position: ${inkDrops.map(d => `${d.x}% ${d.y}%`).join(', ')};
          mask-repeat: no-repeat;
          -webkit-mask-repeat: no-repeat;
          mask-composite: add;
          -webkit-mask-composite: source-over;
          animation: inkRevealMask 3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .card-bg-base {
          position: absolute;
          inset: 0;
          background: ${resolveTheme(profile.themeMode) === 'day' ? '#e8f0e4' : '#0a1a28'};
        }

        .content-box {
          position: absolute;
          bottom: 0; left: 0; right: 0; height: 30%;
          background: ${t.notifContentBg};
          backdrop-filter: blur(28px) saturate(150%);
          -webkit-backdrop-filter: blur(28px) saturate(150%);
          padding: 40px 60px;
          display: flex; flex-direction: column; justify-content: center;
          animation: contentFadeIn 3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          border-top: ${t.notifContentBorder};
        }

        .encouragement { font-size: 32px; line-height: 1.5; margin-bottom: 16px; color: ${t.notifTitle}; font-weight: 600; }
        .instruction { font-size: 20px; color: ${t.notifSubtitle}; margin-bottom: 24px; line-height: 1.6; font-weight: 500; }
        .actions { display: flex; gap: 12px; justify-content: flex-end; }
        .action-btn {
          padding: 12px 32px; border-radius: 12px; font-size: 18px; font-weight: 600; cursor: pointer;
          transition: all 0.3s ease; border: none;
          font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
          background: ${t.notifBtnBg}; color: ${t.notifBtnColor};
          box-shadow: 0 4px 12px ${t.accentGlow};
        }
        .action-btn:hover { background: ${t.accentHover}; transform: translateY(-2px); box-shadow: 0 8px 20px ${t.accentGlow}; }
        .action-btn:active { transform: translateY(0); }
      `}</style>
      <div className={`notification-card ${show ? 'show' : ''}`}>
        {/* Base color layer (visible before ink reveals the image) */}
        <div className="card-bg-base" />
        {/* Image layer with ink wash mask reveal */}
        <div className="card-bg-layer" />
        {/* Content overlay */}
        <div className="content-box">
          <div className="encouragement">{notificationData.encouragement}</div>
          <div className="instruction">{notificationData.instruction.instruction} · {scienceText}</div>
          <div className="actions">
            <button className="action-btn" onClick={handleClose}>{randomAction}</button>
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
