// Content Script - Injects notification into web pages
import { NotificationData } from '@/types/extension';

// 🔥 Content script initialized
console.log('[GreenBreathe Content] Script loaded on:', window.location.href);

// Create and inject notification container
function createNotificationContainer(): HTMLDivElement {
  const container = document.createElement('div');
  container.id = 'green-breathe-notification-root';
  document.body.appendChild(container);
  return container;
}

// 🎯 核心功能：智能避让系统 - 检测用户专注状态
// Smart Avoidance System - Never interrupt focused work
function shouldDelayNotification(): boolean {
  // 1. 全屏模式检测（演示、游戏、视频）
  if (document.fullscreenElement) {
    console.log('[GreenBreathe] Delayed: Fullscreen detected');
    return true;
  }
  
  // 2. 输入框激活检测（正在打字）
  const activeElement = document.activeElement;
  if (
    activeElement &&
    (activeElement.tagName === 'INPUT' ||
      activeElement.tagName === 'TEXTAREA' ||
      activeElement.getAttribute('contenteditable') === 'true')
  ) {
    console.log('[GreenBreathe] Delayed: User is typing');
    return true;
  }
  
  // 3. 视频播放检测（观看视频中）
  const videos = document.querySelectorAll('video');
  for (const video of videos) {
    const rect = video.getBoundingClientRect();
    const isVisible = rect.width > 200 && rect.height > 150; // 主视频判定
    if (!video.paused && video.currentTime > 0 && isVisible) {
      console.log('[GreenBreathe] Delayed: Video playing');
      return true;
    }
  }
  
  // 4. 音频播放检测（听音乐、播客）
  const audios = document.querySelectorAll('audio');
  for (const audio of audios) {
    if (!audio.paused && audio.currentTime > 0) {
      console.log('[GreenBreathe] Delayed: Audio playing');
      return true;
    }
  }
  
  // 5. 通话状态检测（视频会议）
  const mediaDevices = navigator.mediaDevices;
  if (mediaDevices) {
    // 检测是否有活跃的媒体流（摄像头/麦克风）
    const mediaStreamTrack = document.querySelector('video[autoplay]');
    if (mediaStreamTrack) {
      console.log('[GreenBreathe] Delayed: Video call detected');
      return true;
    }
  }
  
  // 6. 表单提交中检测
  const forms = document.querySelectorAll('form[data-submitting="true"]');
  if (forms.length > 0) {
    console.log('[GreenBreathe] Delayed: Form submitting');
    return true;
  }
  
  console.log('[GreenBreathe] ✓ Safe to show notification');
  return false;
}

// 🎯 增强功能：检测用户活跃度（避免在快速操作时打断）
// 初始化为 0，而不是 Date.now()，否则 content 加载后5秒内永远延迟
let lastMouseMove = 0;
let lastScroll = 0;

document.addEventListener('mousemove', () => {
  lastMouseMove = Date.now();
}, { passive: true });

document.addEventListener('scroll', () => {
  lastScroll = Date.now();
}, { passive: true });

function isUserActivelyInteracting(): boolean {
  const now = Date.now();
  // 如果5秒内有快速鼠标移动或滚动，认为用户正在活跃操作
  if (now - lastMouseMove < 5000 || now - lastScroll < 5000) {
    return true;
  }
  return false;
}

// 🎯 显示通知 with 智能延迟重试
async function showNotification(data: NotificationData, retryCount = 0) {
  console.log('[GreenBreathe Content] showNotification called, retryCount:', retryCount);
  
  // 智能避让：检测用户专注状态
  if (shouldDelayNotification() && retryCount < 3) {
    console.log(`[GreenBreathe] Retry attempt ${retryCount + 1}/3 after 30s`);
    setTimeout(() => showNotification(data, retryCount + 1), 30000);
    return;
  }
  
  // 活跃度检测：如果用户正在快速操作，延迟10秒
  if (isUserActivelyInteracting() && retryCount === 0) {
    console.log('[GreenBreathe] User actively interacting, delaying 10s');
    setTimeout(() => showNotification(data, retryCount), 10000);
    return;
  }
  
  // Get user profile for position
  const result = await chrome.storage.local.get('userProfile');
  const position = result.userProfile?.notificationPosition || 'top_right';
  
  console.log('[GreenBreathe Content] Creating notification UI...');
  
  // Create notification UI
  const notification = await createNotificationUI(data, position);
  
  console.log('[GreenBreathe Content] Notification UI created, injecting into page...');
  
  // Inject into page
  let container = document.getElementById('green-breathe-notification-root');
  if (!container) {
    container = createNotificationContainer();
  }
  
  // Clear existing notifications
  container.innerHTML = '';
  
  // Append notification
  container.appendChild(notification);
  
  console.log('[GreenBreathe Content] Notification injected, triggering animation...');
  
  // Trigger entrance animation — 必须加在 shadowRoot 内的 .notification-card 上
  setTimeout(() => {
    const card = notification.shadowRoot?.querySelector('.notification-card') as HTMLElement;
    if (card) {
      card.classList.add('show');
      console.log('[GreenBreathe Content] Animation triggered');
    } else {
      console.error('[GreenBreathe Content] Card element not found in shadow DOM');
    }
  }, 100);
  
  // Auto dismiss after 8 seconds
  setTimeout(() => {
    dismissNotification(notification);
  }, 8000);
}

// Create notification UI with Shadow DOM
async function createNotificationUI(
  data: NotificationData,
  position: string
): Promise<HTMLDivElement> {
  const wrapper = document.createElement('div');
  wrapper.className = `green-breathe-notification ${position}`;
  
  // Create Shadow DOM for style isolation
  const shadowRoot = wrapper.attachShadow({ mode: 'open' });
  
  // Get user profile
  const result = await chrome.storage.local.get('userProfile');
  const mbtiType = result.userProfile?.mbtiType || 'INFP';
  const cardSize = result.userProfile?.cardSize || 'medium';
  const customBackgrounds = result.userProfile?.customBackgrounds || [];
  
  console.log('[GreenBreathe Content] User has', customBackgrounds.length, 'custom backgrounds');
  
  // Card size dimensions
  const sizeMap = {
    small: { width: 960, height: 570 },
    medium: { width: 1280, height: 760 },
    large: { width: 1600, height: 950 }
  };
  const { width, height } = sizeMap[cardSize];
  
  // Generate adapted instruction text (without source)
  const isThinker = mbtiType.includes('T');
  const isIntuitive = mbtiType.includes('N');
  let scienceText = '';
  if (isThinker) {
    scienceText = data.instruction.mbtiAdaptation.T;
  } else if (isIntuitive) {
    scienceText = data.instruction.mbtiAdaptation.N;
  } else {
    scienceText = data.instruction.mbtiAdaptation.F;
  }
  
  // Random action button text
  const actionTexts = ['了解啦', '谢谢关心', 'OK', '收到', '这就去'];
  const randomAction = actionTexts[Math.floor(Math.random() * actionTexts.length)];
  
  // Background image selection: 优先使用用户自定义图片，否则使用内置图片
  let bgImage: string;
  if (customBackgrounds.length > 0) {
    // 从用户自定义图片中随机选择
    bgImage = customBackgrounds[Math.floor(Math.random() * customBackgrounds.length)];
    console.log('[GreenBreathe Content] Using custom background');
  } else {
    // 使用内置图片
    const bgImageFiles = [
      'copper-grass-goldfish.png',  // 铜钱草金鱼
      'mint-photography.png',        // 薄荷摄影
      'office-zen-green-cat.png'     // 办公室禅意绿猫
    ];
    const randomImageFile = bgImageFiles[Math.floor(Math.random() * bgImageFiles.length)];
    bgImage = chrome.runtime.getURL(`images/${randomImageFile}`);
    console.log('[GreenBreathe Content] Using built-in background:', randomImageFile);
  }
  
  // Create HTML
  shadowRoot.innerHTML = `
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
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
          filter: blur(12px);
          transform: translateY(10px);
        }
        40% {
          opacity: 0;
          filter: blur(12px);
          transform: translateY(10px);
        }
        100% {
          opacity: 1;
          filter: blur(0px);
          transform: translateY(0);
        }
      }
      
      /* 🎨 整体卡片：根据用户设置调整尺寸，背景图片覆盖整张卡片 */
      .notification-card {
        width: ${width}px;
        height: ${height}px;
        border-radius: 24px;
        box-shadow: 
          0 30px 60px rgba(0, 0, 0, 0.2),
          0 0 0 1px rgba(255, 255, 255, 0.15);
        font-family: 'Microsoft YaHei', 'PingFang SC', 'Helvetica Neue', sans-serif;
        opacity: 0;
        position: relative;
        overflow: hidden;
        /* 🎯 核心：仅卡片本体可交互，不阻挡页面 */
        pointer-events: none;
        display: flex;
        flex-direction: column;
        justify-content: flex-end; /* 内容靠下对齐 */
        
        /* 清晰的翠绿风景背景，覆盖整张卡片 */
        background-image: url('${bgImage}');
        background-size: cover;
        background-position: center;
      }
      
      .notification-card.show {
        animation: inkWashSpread 2.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }
      
      /* 🎨 文本框区域：毛玻璃质感，只占整个窗口的 30% */
      .content-box {
        position: relative;
        z-index: 1;
        width: 100%;
        height: 30%; /* 严格控制占比 30% */
        padding: 40px 60px;
        
        /* 毛玻璃效果：白色半透明底色，让文字清晰，同时透出背景 */
        background: rgba(255, 255, 255, 0.75);
        backdrop-filter: blur(20px) saturate(120%);
        -webkit-backdrop-filter: blur(20px) saturate(120%);
        border-top: 1px solid rgba(255, 255, 255, 0.4);
        
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      
      .notification-card.show .content-box {
        animation: inkWashText 2.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }
      
      .encouragement {
        font-size: 32px;
        line-height: 1.5;
        margin-bottom: 16px;
        font-weight: 600;
        letter-spacing: 1px;
        color: #1a331a; /* 深翠绿色文字 */
      }
      
      .instruction {
        color: #3a5a3a; /* 柔和的绿色 */
        font-size: 20px;
        margin-bottom: 24px;
        line-height: 1.5;
        font-weight: 400;
      }
      
      .actions {
        pointer-events: auto;
        align-self: flex-end;
        margin-top: auto;
      }
      
      .action-btn {
        padding: 12px 40px;
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid rgba(150, 200, 150, 0.4);
        border-radius: 100px;
        color: #2c4c2c;
        font-size: 18px;
        font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }
      
      .action-btn:hover {
        background: #ffffff;
        border-color: #8fbc8f;
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
      }
    </style>
    
    <div class="notification-card">
      <div class="content-box">
        <div class="encouragement">${data.encouragement}</div>
        <div class="instruction">${data.instruction.instruction} · ${scienceText}</div>
        <div class="actions">
          <button class="action-btn action-dismiss">${randomAction}</button>
        </div>
      </div>
    </div>
  `;
  
  // 🔥 关键修复：预加载背景图片，确保图片加载完成后再返回
  // 这样可以避免 "只在F12打开时才显示" 的竞态条件bug
  await new Promise<void>((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      console.log('[GreenBreathe Content] Background image loaded:', bgImage);
      resolve();
    };
    img.onerror = (error) => {
      console.error('[GreenBreathe Content] Background image failed to load:', bgImage, error);
      // 即使图片加载失败，也继续显示通知（降级处理）
      resolve();
    };
    // 设置超时，避免无限等待
    setTimeout(() => {
      console.warn('[GreenBreathe Content] Image load timeout, proceeding anyway');
      resolve();
    }, 3000);
    img.src = bgImage;
  });
  
  console.log('[GreenBreathe Content] Background image ready, setting up event listeners');
  
  // Add event listeners
  const dismissBtn = shadowRoot.querySelector('.action-dismiss') as HTMLButtonElement;
  
  dismissBtn?.addEventListener('click', () => {
    logInteraction('dismissed', data.taskType);
    dismissNotification(wrapper);
  });
  
  return wrapper;
}

// Dismiss notification with animation
function dismissNotification(element: HTMLElement) {
  const shadowRoot = element.shadowRoot;
  const card = shadowRoot?.querySelector('.notification-card') as HTMLElement;
  
  if (card) {
    card.style.animation = 'none'; // 移除入场动画，以便应用退场过渡
    card.style.transition = 'all 1.5s cubic-bezier(0.22, 1, 0.36, 1)';
    card.style.opacity = '0';
    card.style.filter = 'blur(10px)';
    card.style.transform = 'scale(0.95)';
  }
  
  setTimeout(() => {
    element.remove();
  }, 2000);
}

// Log interaction
async function logInteraction(action: 'completed' | 'snoozed' | 'dismissed', taskType: string) {
  try {
    const log = {
      timestamp: Date.now(),
      action,
      taskType: taskType as 'hydration' | 'eyeCare' | 'movement',
    };
    
    const result = await chrome.storage.local.get('interactionLog');
    const logs = result.interactionLog || [];
    logs.push(log);
    
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100);
    }
    
    await chrome.storage.local.set({ interactionLog: logs });
    
    // Update plant growth if completed
    if (action === 'completed') {
      const growthResult = await chrome.storage.local.get('plantGrowth');
      const growth = growthResult.plantGrowth || {
        level: 0,
        totalCompletions: 0,
        unlockedForms: [],
      };
      
      growth.totalCompletions += 1;
      growth.level = Math.floor(growth.totalCompletions / 10);
      
      await chrome.storage.local.set({ plantGrowth: growth });
    }
  } catch (error) {
    console.error('Error logging interaction:', error);
  }
}

// Listen for messages from background
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SHOW_NOTIFICATION') {
    console.log('[GreenBreathe Content] Received SHOW_NOTIFICATION message', message.data);
    showNotification(message.data)
      .then(() => {
        console.log('[GreenBreathe Content] Notification displayed successfully');
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error('[GreenBreathe Content] Error showing notification:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // 保持消息通道开放，用于异步 sendResponse
  }
});

// Inject styles for notification positioning
const style = document.createElement('style');
style.textContent = `
  #green-breathe-notification-root {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2147483647;
    pointer-events: none;
  }
  
  #green-breathe-notification-root .green-breathe-notification {
    position: absolute;
    pointer-events: none;
  }
  
  #green-breathe-notification-root .top_right {
    top: 32px;
    right: 32px;
  }
  
  #green-breathe-notification-root .top_left {
    top: 32px;
    left: 32px;
  }
  
  #green-breathe-notification-root .bottom_right {
    bottom: 32px;
    right: 32px;
  }
  
  #green-breathe-notification-root .bottom_left {
    bottom: 32px;
    left: 32px;
  }
`;
document.head.appendChild(style);

console.log('GreenBreathe Content Script Loaded');
