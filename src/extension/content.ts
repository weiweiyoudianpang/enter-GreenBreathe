// Content Script - Injects notification into web pages
import { NotificationData } from '@/types/extension';

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
  
  // Create notification UI
  const notification = await createNotificationUI(data, position);
  
  // Inject into page
  let container = document.getElementById('green-breathe-notification-root');
  if (!container) {
    container = createNotificationContainer();
  }
  
  // Clear existing notifications
  container.innerHTML = '';
  
  // Append notification
  container.appendChild(notification);
  
  // Trigger entrance animation — 必须加在 shadowRoot 内的 .notification-card 上
  setTimeout(() => {
    const card = notification.shadowRoot?.querySelector('.notification-card') as HTMLElement;
    if (card) card.classList.add('show');
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
  wrapper.className = `green-breathe-notification center`;
  
  // Create Shadow DOM for style isolation
  const shadowRoot = wrapper.attachShadow({ mode: 'open' });
  
  // Get user profile
  const result = await chrome.storage.local.get('userProfile');
  const mbtiType = result.userProfile?.mbtiType || 'INFP';
  
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
  
  // Create HTML
  shadowRoot.innerHTML = `
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      /* 🎨 水墨审美：毛玻璃 + 晕染效果 */
      .notification-card {
        width: 800px;
        max-width: 90vw;
        min-height: 400px;
        background: rgba(255, 255, 255, 0.35);
        backdrop-filter: blur(30px) saturate(120%);
        -webkit-backdrop-filter: blur(30px) saturate(120%);
        border-radius: 24px;
        padding: 80px 60px;
        box-shadow: 
          0 20px 60px rgba(0, 0, 0, 0.05),
          inset 0 0 0 1px rgba(255, 255, 255, 0.4);
        font-family: 'STKaiti', 'KaiTi', '楷体', 'Source Han Serif CN', 'Noto Serif SC', serif;
        opacity: 0;
        filter: blur(20px);
        transform: scale(0.95);
        transition: all 2s cubic-bezier(0.22, 1, 0.36, 1);
        position: relative;
        overflow: hidden;
        /* 🎯 核心：仅卡片本体可交互，不阻挡页面 */
        pointer-events: none;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
      }
      
      .notification-card.show {
        opacity: 1;
        filter: blur(0);
        transform: scale(1);
      }
      
      /* 🎨 水墨风景画背景 */
      .ink-wash-bg {
        position: absolute;
        inset: 0;
        background-image: url('${chrome.runtime.getURL('images/ink-wash-mountain.png')}');
        background-size: cover;
        background-position: center;
        opacity: 0.15;
        mix-blend-mode: multiply;
        pointer-events: none;
        z-index: 0;
      }
      
      .content {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
      }
      
      .encouragement {
        color: #1a2f1a;
        font-size: 36px;
        line-height: 1.6;
        margin-bottom: 30px;
        font-weight: 600;
        letter-spacing: 3px;
        text-shadow: 0 2px 15px rgba(255,255,255,0.9);
      }
      
      .instruction {
        color: #3a5f3a;
        font-size: 22px;
        margin-bottom: 50px;
        opacity: 0.85;
        letter-spacing: 2px;
      }
      
      .actions {
        pointer-events: auto;
      }
      
      .action-btn {
        padding: 14px 48px;
        background: transparent;
        border: 1px solid rgba(26, 47, 26, 0.3);
        border-radius: 100px;
        color: #1a2f1a;
        font-size: 20px;
        font-family: inherit;
        cursor: pointer;
        transition: all 0.5s ease;
        letter-spacing: 2px;
      }
      
      .action-btn:hover {
        background: rgba(26, 47, 26, 0.08);
        border-color: rgba(26, 47, 26, 0.6);
        transform: translateY(-2px);
      }
    </style>
    
    <div class="notification-card">
      <div class="ink-wash-bg"></div>
      <div class="content">
        <div class="encouragement">${data.encouragement}</div>
        <div class="instruction">${data.instruction.instruction} · ${scienceText}</div>
        <div class="actions">
          <button class="action-btn action-dismiss">${randomAction}</button>
        </div>
      </div>
    </div>
  `;
  
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
    showNotification(message.data);
    sendResponse({ success: true });
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
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  #green-breathe-notification-root .green-breathe-notification {
    position: relative;
    pointer-events: none;
  }
`;
document.head.appendChild(style);

console.log('GreenBreathe Content Script Loaded');
