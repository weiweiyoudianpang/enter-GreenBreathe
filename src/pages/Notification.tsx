import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
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

  const handleClose = async () => {
    setShow(false);
    if (notificationData) {
      const logs = await chrome.storage.local.get('interactionLog');
      const interactionLog = logs.interactionLog || [];
      interactionLog.push({
        timestamp: Date.now(),
        action: 'completed',
        taskType: notificationData.taskType,
      });
      await chrome.storage.local.set({ interactionLog: interactionLog.slice(-100) });
    }
    setTimeout(() => window.close(), 500);
  };

  if (!notificationData || !profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-background/95 backdrop-blur-md">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  const effectiveTheme = resolveTheme(profile.themeMode);
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

  const actionTexts = ['了解啦', '谢谢关心', 'OK', '收到', '这就去'];
  const randomAction = actionTexts[Math.floor(Math.random() * actionTexts.length)];

  // Background image: pick from the correct theme folder
  let bgImage: string;
  const customBgs = effectiveTheme === 'day'
    ? (profile.customBackgroundsDay || profile.customBackgrounds || [])
    : (profile.customBackgroundsNight || []);

  if (customBgs.length > 0) {
    bgImage = customBgs[Math.floor(Math.random() * customBgs.length)];
  } else {
    const defaults = defaultBackgrounds[effectiveTheme];
    const file = defaults[Math.floor(Math.random() * defaults.length)];
    bgImage = chrome.runtime.getURL(`images/${effectiveTheme}/${file}`);
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <style>{`
        @keyframes inkWashSpread {
          0% { opacity:0; filter:blur(30px) contrast(1.2) brightness(1.2); transform:scale(1.05); }
          40% { opacity:0.6; filter:blur(15px) contrast(1.1) brightness(1.1); }
          100% { opacity:1; filter:blur(0) contrast(1) brightness(1); transform:scale(1); }
        }
        @keyframes inkWashText {
          0% { opacity:0; filter:blur(8px); }
          60% { opacity:0; }
          100% { opacity:1; filter:blur(0); }
        }
        .notification-card {
          width:${width}px; height:${height}px;
          background-image:url('${bgImage}'); background-size:cover; background-position:center;
          border-radius:24px; position:relative; overflow:hidden;
          box-shadow:${t.notifShadow};
          animation:inkWashSpread 2s cubic-bezier(0.22,1,0.36,1) forwards;
          font-family:'Microsoft YaHei','PingFang SC',sans-serif;
        }
        .content-box {
          position:absolute; bottom:0; left:0; right:0; height:30%;
          background:${t.notifContentBg};
          backdrop-filter:blur(28px) saturate(150%);
          -webkit-backdrop-filter:blur(28px) saturate(150%);
          padding:40px 60px; display:flex; flex-direction:column; justify-content:center;
          animation:inkWashText 2.5s cubic-bezier(0.22,1,0.36,1) forwards;
          border-top:${t.notifContentBorder};
        }
        .encouragement { font-size:32px; line-height:1.5; margin-bottom:16px; color:${t.notifTitle}; font-weight:600; }
        .instruction { font-size:20px; color:${t.notifSubtitle}; margin-bottom:24px; line-height:1.6; font-weight:500; }
        .actions { display:flex; gap:12px; justify-content:flex-end; }
        .action-btn {
          padding:12px 32px; border-radius:12px; font-size:18px; font-weight:600; cursor:pointer;
          transition:all 0.3s ease; border:none;
          font-family:'Microsoft YaHei','PingFang SC',sans-serif;
          background:${t.notifBtnBg}; color:${t.notifBtnColor};
          box-shadow:0 4px 12px ${t.accentGlow};
        }
        .action-btn:hover { background:${t.accentHover}; transform:translateY(-2px); box-shadow:0 8px 20px ${t.accentGlow}; }
        .action-btn:active { transform:translateY(0); }
      `}</style>
      <div className={`notification-card ${show ? 'show' : ''}`}>
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
