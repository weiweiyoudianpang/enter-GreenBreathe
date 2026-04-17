// Background Service Worker for Chrome Extension
import { storage } from '@/lib/storage';
import { NotificationData, TaskType } from '@/types/extension';
import { getEncouragementMessage } from '@/data/mbtiMessages';
import { getRandomInstruction } from '@/data/scientificInstructions';

// 三个独立的 alarm 名称
const ALARM_NAMES = {
  HYDRATION: 'greenBreathe_hydration',
  EYE_CARE: 'greenBreathe_eyeCare',
  MOVEMENT: 'greenBreathe_movement',
} as const;

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
  console.log('GreenBreathe Extension Installed');
  
  // Set default user profile if not exists
  const profile = await storage.getUserProfile();
  await storage.setUserProfile(profile);
  
  // Create initial alarms
  await setupAlarms();
});

// Setup three independent alarms based on user settings
async function setupAlarms() {
  const profile = await storage.getUserProfile();
  
  // Clear all existing alarms
  await chrome.alarms.clearAll();
  
  if (profile.minimalMode) {
    console.log('Minimal mode enabled - no alarms created');
    return;
  }
  
  // 喝水提醒 alarm
  if (profile.hydrationInterval > 0) {
    chrome.alarms.create(ALARM_NAMES.HYDRATION, {
      delayInMinutes: profile.hydrationInterval,
      periodInMinutes: profile.hydrationInterval,
    });
    console.log(`💧 Hydration alarm set: every ${profile.hydrationInterval} minutes`);
  }
  
  // 眼睛休息 alarm
  if (profile.eyeCareInterval > 0) {
    chrome.alarms.create(ALARM_NAMES.EYE_CARE, {
      delayInMinutes: profile.eyeCareInterval,
      periodInMinutes: profile.eyeCareInterval,
    });
    console.log(`👁️ Eye care alarm set: every ${profile.eyeCareInterval} minutes`);
  }
  
  // 身体活动 alarm
  if (profile.movementInterval > 0) {
    chrome.alarms.create(ALARM_NAMES.MOVEMENT, {
      delayInMinutes: profile.movementInterval,
      periodInMinutes: profile.movementInterval,
    });
    console.log(`🏃 Movement alarm set: every ${profile.movementInterval} minutes`);
  }
}

// Listen for alarms
chrome.alarms.onAlarm.addListener(async (alarm) => {
  let taskType: TaskType | null = null;
  
  switch (alarm.name) {
    case ALARM_NAMES.HYDRATION:
      taskType = 'hydration';
      console.log('💧 Hydration alarm triggered');
      break;
    case ALARM_NAMES.EYE_CARE:
      taskType = 'eyeCare';
      console.log('👁️ Eye care alarm triggered');
      break;
    case ALARM_NAMES.MOVEMENT:
      taskType = 'movement';
      console.log('🏃 Movement alarm triggered');
      break;
    default:
      console.warn('Unknown alarm:', alarm.name);
      return;
  }
  
  if (taskType) {
    await triggerNotification(taskType);
  }
});

// Trigger notification for specific task type
async function triggerNotification(taskType: TaskType) {
  const profile = await storage.getUserProfile();
  
  // Check quiet hours
  if (isQuietHours(profile.quietHours)) {
    console.log('Quiet hours - skipping notification');
    return;
  }
  
  // Get messages
  const encouragement = getEncouragementMessage(profile.mbtiType, taskType);
  const instruction = getRandomInstruction(taskType);
  
  const notificationData: NotificationData = {
    taskType,
    encouragement,
    instruction,
    timestamp: Date.now(),
  };
  
  // ⚠️ 关键修复：当用户在 options 页面点击测试时，active tab 是 chrome-extension:// 页面
  // content.ts 不会注入到 extension 页面，需要找一个真正的 http/https tab
  const activeTabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeTab = activeTabs[0];
  
  let targetTabId: number | undefined;
  
  if (activeTab?.url?.startsWith('http')) {
    // Active tab 是普通网页，直接使用
    targetTabId = activeTab.id;
  } else {
    // Active tab 是 extension 页面（options/popup），找一个普通网页
    const allTabs = await chrome.tabs.query({ currentWindow: true });
    const httpTab = allTabs.find(tab => tab.url?.startsWith('http'));
    targetTabId = httpTab?.id;
    if (targetTabId) {
      console.log('[GreenBreathe] Active tab is extension page, using tab:', httpTab?.url);
    } else {
      console.warn('[GreenBreathe] No http/https tab found to show notification');
    }
  }

  if (targetTabId) {
    try {
      await chrome.tabs.sendMessage(targetTabId, {
        type: 'SHOW_NOTIFICATION',
        data: notificationData,
      });
      console.log('[GreenBreathe] Notification sent to tab', targetTabId);
    } catch (error) {
      console.error('[GreenBreathe] Error sending to content script:', error);
    }
  }
}

// Check if current time is in quiet hours
function isQuietHours(quietHours: string[]): boolean {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  
  for (const range of quietHours) {
    const [start, end] = range.split('-');
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;
    
    // Handle overnight range
    if (startTime > endTime) {
      if (currentTime >= startTime || currentTime <= endTime) {
        return true;
      }
    } else {
      if (currentTime >= startTime && currentTime <= endTime) {
        return true;
      }
    }
  }
  
  return false;
}

// Listen for messages from popup/options/content
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[GreenBreathe Background] Received message:', message.type);
  
  if (message.type === 'UPDATE_ALARM') {
    setupAlarms().then(() => {
      console.log('[GreenBreathe Background] Alarms updated');
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (message.type === 'TRIGGER_TEST_NOTIFICATION') {
    console.log('[GreenBreathe Background] Test notification triggered');
    // For test, randomly pick a task type
    const taskTypes: TaskType[] = ['hydration', 'eyeCare', 'movement'];
    const randomTask = taskTypes[Math.floor(Math.random() * taskTypes.length)];
    console.log('[GreenBreathe Background] Selected task type:', randomTask);
    triggerNotification(randomTask).then(() => {
      console.log('[GreenBreathe Background] Test notification sent');
      sendResponse({ success: true });
    }).catch((error) => {
      console.error('[GreenBreathe Background] Error sending test notification:', error);
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }
});
