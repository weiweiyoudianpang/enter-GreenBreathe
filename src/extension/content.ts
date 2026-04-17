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
  wrapper.className = `green-breathe-notification ${position}`;
  
  // Create Shadow DOM for style isolation
  const shadowRoot = wrapper.attachShadow({ mode: 'open' });
  
  // Get user profile
  const result = await chrome.storage.local.get('userProfile');
  const nickname = result.userProfile?.nickname || '朋友';
  const mbtiType = result.userProfile?.mbtiType || 'INFP';
  
  // Generate adapted instruction text
  const adaptedText = getAdaptedText(data, mbtiType);
  
  // Random action button text
  const actionTexts = ['了解啦~', '知道啦', '谢谢提醒', 'OK'];
  const randomAction = actionTexts[Math.floor(Math.random() * actionTexts.length)];
  
  // Get task icon
  const taskIcon = getTaskIcon(data.taskType);
  
  // Current time
  const currentTime = new Date().toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
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
        width: 260px;
        background: rgba(255, 255, 255, 0.92);
        backdrop-filter: blur(12px) saturate(180%);
        -webkit-backdrop-filter: blur(12px) saturate(180%);
        border-radius: 16px;
        padding: 18px;
        box-shadow: 
          0 8px 32px rgba(100, 180, 100, 0.12),
          0 2px 8px rgba(100, 180, 100, 0.08);
        border: 1px solid rgba(100, 180, 100, 0.2);
        font-family: 'Source Han Serif CN', 'Noto Serif SC', Georgia, serif;
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
        transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        position: relative;
        overflow: hidden;
        /* 🎯 核心：仅卡片本体可交互，不阻挡页面 */
        pointer-events: auto;
      }
      
      .notification-card.show {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      
      /* 🎨 水墨晕染背景 - 三层叠加 */
      .ink-wash-bg {
        position: absolute;
        top: -30px;
        left: -30px;
        right: -30px;
        bottom: -30px;
        background-image: url('${chrome.runtime.getURL('images/ink-wash.png')}');
        background-size: 120%;
        background-position: center;
        opacity: 0;
        pointer-events: none;
        z-index: 0;
        animation: inkSpread 0.8s ease-out forwards;
      }
      
      @keyframes inkSpread {
        0% {
          opacity: 0;
          transform: scale(0.8);
        }
        50% {
          opacity: 0.06;
        }
        100% {
          opacity: 0.12;
          transform: scale(1);
        }
      }
      
      /* 🌱 植物成长动画容器 */
      .plant-growth {
        position: absolute;
        bottom: 16px;
        right: 16px;
        width: 32px;
        height: 32px;
        opacity: 0.6;
        pointer-events: none;
        z-index: 2;
      }
      
      .plant-svg {
        width: 100%;
        height: 100%;
      }
      
      .plant-path {
        stroke: #64b464;
        stroke-width: 2;
        fill: none;
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-dasharray: 100;
        stroke-dashoffset: 100;
        animation: plantGrow 2s ease-out forwards;
      }
      
      @keyframes plantGrow {
        to {
          stroke-dashoffset: 0;
        }
      }
      
      .content {
        position: relative;
        z-index: 1;
      }
      
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        color: #64b464;
        font-size: 12px;
      }
      
      .title {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      
      .plant-icon {
        font-size: 16px;
      }
      
      .time {
        opacity: 0.6;
      }
      
      .encouragement {
        color: #2d5a2d;
        font-size: 14px;
        line-height: 1.6;
        margin-bottom: 12px;
        font-weight: 500;
      }
      
      .instruction-box {
        background: rgba(100, 180, 100, 0.08);
        border-left: 3px solid #64b464;
        padding: 10px;
        margin-bottom: 12px;
        border-radius: 4px;
      }
      
      .instruction {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #2d5a2d;
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 6px;
      }
      
      .task-icon {
        font-size: 16px;
      }
      
      .science {
        font-size: 11px;
        color: #5a7a5a;
        line-height: 1.4;
        font-family: 'Source Han Sans CN', 'Noto Sans SC', sans-serif;
      }
      
      .source {
        font-size: 10px;
        color: #8a9a8a;
        margin-top: 2px;
      }
      
      .actions {
        display: flex;
        gap: 8px;
        pointer-events: auto;
      }
      
      button {
        flex: 1;
        padding: 8px 12px;
        border: none;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
        font-family: 'Source Han Sans CN', 'Noto Sans SC', sans-serif;
      }
      
      .btn-primary {
        background: rgba(100, 180, 100, 0.15);
        color: #2d5a2d;
        border: 1px solid rgba(100, 180, 100, 0.3);
      }
      
      .btn-primary:hover {
        background: rgba(100, 180, 100, 0.25);
        transform: translateY(-1px);
      }
      
      .btn-secondary {
        background: rgba(100, 180, 100, 0.8);
        color: white;
        font-weight: 500;
      }
      
      .btn-secondary:hover {
        background: rgba(100, 180, 100, 1);
        transform: translateY(-1px);
      }
      
      .btn-tertiary {
        background: transparent;
        color: #5a7a5a;
        border: 1px solid rgba(100, 180, 100, 0.2);
      }
      
      .btn-tertiary:hover {
        background: rgba(100, 180, 100, 0.1);
      }
    </style>
    
    <div class="notification-card">
      <div class="ink-wash-bg"></div>
      <div class="content">
        <div class="header">
          <div class="title">
            <span class="plant-icon">🌿</span>
            <span>青植关怀 · ${mbtiType}</span>
          </div>
          <div class="time">${currentTime}</div>
        </div>
        
        <div class="encouragement">${data.encouragement}</div>
        
        <div class="instruction-box">
          <div class="instruction">
            <span class="task-icon">${taskIcon}</span>
            <span>${data.instruction.instruction}</span>
          </div>
          <div class="science">
            ${adaptedText}
          </div>
          <div class="source">(${data.instruction.source})</div>
        </div>
        
        <div class="actions">
          <button class="btn-primary action-dismiss">${randomAction}</button>
          <button class="btn-secondary action-complete">已完成 ✓</button>
          <button class="btn-tertiary action-snooze">稍后</button>
        </div>
      </div>
    </div>
  `;
  
  // Add event listeners
  const card = shadowRoot.querySelector('.notification-card') as HTMLElement;
  const dismissBtn = shadowRoot.querySelector('.action-dismiss') as HTMLButtonElement;
  const completeBtn = shadowRoot.querySelector('.action-complete') as HTMLButtonElement;
  const snoozeBtn = shadowRoot.querySelector('.action-snooze') as HTMLButtonElement;
  
  dismissBtn?.addEventListener('click', () => {
    logInteraction('dismissed', data.taskType);
    dismissNotification(wrapper);
  });
  
  completeBtn?.addEventListener('click', () => {
    logInteraction('completed', data.taskType);
    dismissNotification(wrapper);
  });
  
  snoozeBtn?.addEventListener('click', () => {
    logInteraction('snoozed', data.taskType);
    dismissNotification(wrapper);
  });
  
  return wrapper;
}

// Get task icon
function getTaskIcon(taskType: string): string {
  switch (taskType) {
    case 'hydration': return '💧';
    case 'eyeCare': return '👁️';
    case 'movement': return '🏃';
    default: return '🌿';
  }
}

// Get MBTI adapted text
function getAdaptedText(data: NotificationData, mbtiType: string): string {
  const isThinker = mbtiType.includes('T');
  const isIntuitive = mbtiType.includes('N');
  
  let text = '';
  if (isThinker) {
    text = data.instruction.mbtiAdaptation.T;
  } else if (isIntuitive) {
    text = data.instruction.mbtiAdaptation.N;
  } else {
    text = data.instruction.mbtiAdaptation.F;
  }
  
  return `${text} <br/><small>↑ ${data.instruction.scienceBasis}</small>`;
}

// Dismiss notification with animation
function dismissNotification(element: HTMLElement) {
  const shadowRoot = element.shadowRoot;
  const card = shadowRoot?.querySelector('.notification-card') as HTMLElement;
  
  if (card) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(-20px)';
  }
  
  setTimeout(() => {
    element.remove();
  }, 800);
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
  }
  
  #green-breathe-notification-root .green-breathe-notification {
    position: absolute;
    pointer-events: auto;
  }
  
  #green-breathe-notification-root .top_right {
    top: 20px;
    right: 20px;
  }
  
  #green-breathe-notification-root .top_left {
    top: 20px;
    left: 20px;
  }
  
  #green-breathe-notification-root .bottom_right {
    bottom: 20px;
    right: 20px;
  }
  
  #green-breathe-notification-root .bottom_left {
    bottom: 20px;
    left: 20px;
  }
`;
document.head.appendChild(style);

console.log('GreenBreathe Content Script Loaded');
