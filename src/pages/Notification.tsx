import { createRoot } from 'react-dom/client';
import { useEffect, useState } from 'react';
import '@/index.css';
import { NotificationData, UserProfile } from '@/types/extension';

function NotificationWindow() {
  const [notificationData, setNotificationData] = useState<NotificationData | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    console.log('[GreenBreathe Notification] Component mounted, fetching data...');
    
    // Add a small delay to ensure storage is ready
    const fetchData = () => {
      chrome.storage.local.get(['pendingNotification', 'userProfile'], (result) => {
        console.log('[GreenBreathe Notification] Storage result:', result);
        
        if (chrome.runtime.lastError) {
          console.error('[GreenBreathe Notification] Storage error:', chrome.runtime.lastError);
          return;
        }
        
        if (result.pendingNotification) {
          console.log('[GreenBreathe Notification] Data loaded successfully');
          setNotificationData(result.pendingNotification);
          setProfile(result.userProfile);
          // Clear pending notification
          chrome.storage.local.remove('pendingNotification');
          // Trigger show animation
          setTimeout(() => setShow(true), 100);
        } else {
          console.warn('[GreenBreathe Notification] No pending notification found');
          // Retry after a short delay
          setTimeout(fetchData, 200);
        }
      });
    };
    
    // Start fetching with a small initial delay
    setTimeout(fetchData, 50);
  }, []);

  const handleClose = async () => {
    setShow(false);
    // Log interaction
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
    // Close window after animation
    setTimeout(() => window.close(), 500);
  };

  if (!notificationData || !profile) {
    return (
      <div className="flex items-center justify-center h-screen bg-background/95 backdrop-blur-md">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  const cardSize = profile.cardSize || 'medium';
  const sizeMap = {
    small: { width: 960, height: 570 },
    medium: { width: 1280, height: 760 },
    large: { width: 1600, height: 950 }
  };
  const { width, height } = sizeMap[cardSize];

  // Generate adapted instruction text
  const mbtiType = profile.mbtiType;
  const isThinker = mbtiType.includes('T');
  const isIntuitive = mbtiType.includes('N');
  let scienceText = '';
  if (isThinker) {
    scienceText = notificationData.instruction.mbtiAdaptation.T;
  } else if (isIntuitive) {
    scienceText = notificationData.instruction.mbtiAdaptation.N;
  } else {
    scienceText = notificationData.instruction.mbtiAdaptation.F;
  }

  // Random action button text
  const actionTexts = ['了解啦', '谢谢关心', 'OK', '收到', '这就去'];
  const randomAction = actionTexts[Math.floor(Math.random() * actionTexts.length)];

  // Background image selection
  let bgImage: string;
  const customBackgrounds = profile.customBackgrounds || [];
  if (customBackgrounds.length > 0) {
    bgImage = customBackgrounds[Math.floor(Math.random() * customBackgrounds.length)];
  } else {
    const bgImageFiles = [
      'copper-grass-goldfish.png',
      'mint-photography.png',
      'office-zen-green-cat.png'
    ];
    const randomImageFile = bgImageFiles[Math.floor(Math.random() * bgImageFiles.length)];
    bgImage = chrome.runtime.getURL(`images/${randomImageFile}`);
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <style>
        {`
          @keyframes inkWashSpread {
            0% {
              opacity: 0;
              filter: blur(30px) contrast(1.2) brightness(1.2);
              transform: scale(1.05);
            }
            40% {
              opacity: 0.6;
              filter: blur(15px) contrast(1.1) brightness(1.1);
            }
            100% {
              opacity: 1;
              filter: blur(0px) contrast(1) brightness(1);
              transform: scale(1);
            }
          }

          @keyframes inkWashText {
            0% {
              opacity: 0;
              filter: blur(8px);
            }
            60% {
              opacity: 0;
            }
            100% {
              opacity: 1;
              filter: blur(0px);
            }
          }

          .notification-card {
            width: ${width}px;
            height: ${height}px;
            background-image: url('${bgImage}');
            background-size: cover;
            background-position: center;
            border-radius: 24px;
            box-shadow: 0 20px 60px rgba(19, 78, 111, 0.3);
            position: relative;
            overflow: hidden;
            animation: inkWashSpread 2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
          }

          .content-box {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 30%;
            background: rgba(255, 255, 255, 0.35);
            backdrop-filter: blur(28px) saturate(150%);
            -webkit-backdrop-filter: blur(28px) saturate(150%);
            padding: 40px 60px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            animation: inkWashText 2.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
            border-top: 1px solid rgba(255, 255, 255, 0.5);
          }

          .encouragement {
            font-size: 32px;
            line-height: 1.5;
            margin-bottom: 16px;
            color: #134e6f;
            font-weight: 600;
          }

          .instruction {
            font-size: 20px;
            color: #38c9a3;
            margin-bottom: 24px;
            line-height: 1.6;
            font-weight: 500;
          }

          .actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
          }

          .action-btn {
            padding: 12px 32px;
            border-radius: 12px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            border: none;
            font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
          }

          .action-dismiss {
            background: #38c9a3;
            color: white;
            box-shadow: 0 4px 12px rgba(56, 201, 163, 0.3);
          }

          .action-dismiss:hover {
            background: #2eb391;
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(56, 201, 163, 0.4);
          }

          .action-dismiss:active {
            transform: translateY(0);
          }
        `}
      </style>

      <div className={`notification-card ${show ? 'show' : ''}`}>
        <div className="content-box">
          <div className="encouragement">{notificationData.encouragement}</div>
          <div className="instruction">{notificationData.instruction.instruction} · {scienceText}</div>
          <div className="actions">
            <button className="action-btn action-dismiss" onClick={handleClose}>
              {randomAction}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Mount React app
const container = document.getElementById('notification-root');
if (container) {
  const root = createRoot(container);
  root.render(<NotificationWindow />);
}
