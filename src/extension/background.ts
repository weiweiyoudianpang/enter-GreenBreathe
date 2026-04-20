// Background Service Worker for Chrome Extension
import { storage } from '@/lib/storage';
import { NotificationData, TaskType } from '@/types/extension';
import { getEncouragementMessage } from '@/data/mbtiMessages';
import { getRandomInstruction } from '@/data/scientificInstructions';

const ALARM_NAMES = {
  HYDRATION: 'greenBreathe_hydration',
  EYE_CARE: 'greenBreathe_eyeCare',
  MOVEMENT: 'greenBreathe_movement',
} as const;

// ─── Initialize ─────────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(async () => {
  console.log('[GreenBreathe] Extension installed');
  const profile = await storage.getUserProfile();
  await storage.setUserProfile(profile);
  await setupAlarms();
});

// ─── Alarms ─────────────────────────────────────────────────────────────────

async function setupAlarms() {
  const profile = await storage.getUserProfile();
  await chrome.alarms.clearAll();

  if (profile.minimalMode) {
    console.log('[GreenBreathe] Minimal mode - no alarms');
    return;
  }

  if (profile.hydrationInterval > 0) {
    chrome.alarms.create(ALARM_NAMES.HYDRATION, {
      delayInMinutes: profile.hydrationInterval,
      periodInMinutes: profile.hydrationInterval,
    });
  }
  if (profile.eyeCareInterval > 0) {
    chrome.alarms.create(ALARM_NAMES.EYE_CARE, {
      delayInMinutes: profile.eyeCareInterval,
      periodInMinutes: profile.eyeCareInterval,
    });
  }
  if (profile.movementInterval > 0) {
    chrome.alarms.create(ALARM_NAMES.MOVEMENT, {
      delayInMinutes: profile.movementInterval,
      periodInMinutes: profile.movementInterval,
    });
  }
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  let taskType: TaskType | null = null;
  switch (alarm.name) {
    case ALARM_NAMES.HYDRATION: taskType = 'hydration'; break;
    case ALARM_NAMES.EYE_CARE: taskType = 'eyeCare'; break;
    case ALARM_NAMES.MOVEMENT: taskType = 'movement'; break;
    default: return;
  }
  if (taskType) await triggerNotification(taskType);
});

// ─── Notification Trigger ───────────────────────────────────────────────────

async function triggerNotification(taskType: TaskType) {
  const profile = await storage.getUserProfile();

  if (isQuietHours(profile.quietHours)) {
    console.log('[GreenBreathe] Quiet hours - skipping');
    return;
  }

  const encouragement = getEncouragementMessage(profile.mbtiType, taskType);
  const instruction = getRandomInstruction(taskType);

  const notificationData: NotificationData = {
    taskType, encouragement, instruction, timestamp: Date.now(),
  };

  // Primary: send to content script in active tab (transparent overlay)
  const sent = await sendToContentScript(notificationData);

  // Fallback: standalone window (chrome:// pages, etc.)
  if (!sent) {
    await showNotificationWindow(notificationData, profile);
  }
}

/**
 * Try to send notification to content script in the active tab.
 * Returns true if successfully sent.
 */
async function sendToContentScript(data: NotificationData): Promise<boolean> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return false;

    // Skip chrome:// and other restricted pages
    const url = tab.url || '';
    if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') ||
        url.startsWith('about:') || url.startsWith('edge://')) {
      return false;
    }

    const response = await chrome.tabs.sendMessage(tab.id, {
      type: 'SHOW_NOTIFICATION',
      data,
    });
    return response?.success === true;
  } catch {
    console.log('[GreenBreathe] Content script not available, using window fallback');
    return false;
  }
}

/**
 * Fallback: open a standalone notification window.
 */
async function showNotificationWindow(data: NotificationData, profile: Awaited<ReturnType<typeof storage.getUserProfile>>) {
  await chrome.storage.local.set({
    pendingNotification: data,
    userProfile: profile,
  });

  await new Promise(resolve => setTimeout(resolve, 100));

  const cardSize = profile.cardSize || 'medium';
  const sizeMap: Record<string, { width: number; height: number }> = {
    small: { width: 960, height: 570 },
    medium: { width: 1280, height: 760 },
    large: { width: 1600, height: 950 },
  };
  const { width, height } = sizeMap[cardSize] || sizeMap.medium;

  let left = 200, top = 100;
  try {
    const displays = await chrome.system.display.getInfo();
    if (displays?.[0]) {
      const d = displays[0].workArea;
      left = Math.round((d.width - width) / 2);
      top = Math.round((d.height - height) / 2);
    }
  } catch { /* use defaults */ }

  try {
    const win = await chrome.windows.create({
      url: chrome.runtime.getURL('notification.html'),
      type: 'popup',
      width: width + 20,
      height: height + 40,
      left, top, focused: true,
    });

    // Auto-close after 30s
    setTimeout(async () => {
      try { if (win.id) await chrome.windows.remove(win.id); } catch { /* already closed */ }
    }, 30000);
  } catch (error) {
    console.error('[GreenBreathe] Error creating notification window:', error);
  }
}

// ─── Quiet hours check ──────────────────────────────────────────────────────

function isQuietHours(quietHours: string[]): boolean {
  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  for (const range of quietHours) {
    const [start, end] = range.split('-');
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    if (startTime > endTime) {
      if (currentTime >= startTime || currentTime <= endTime) return true;
    } else {
      if (currentTime >= startTime && currentTime <= endTime) return true;
    }
  }
  return false;
}

// ─── Message listener ───────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'UPDATE_ALARM') {
    setupAlarms().then(() => sendResponse({ success: true }));
    return true;
  }

  if (message.type === 'TRIGGER_TEST_NOTIFICATION') {
    const taskTypes: TaskType[] = ['hydration', 'eyeCare', 'movement'];
    const randomTask = taskTypes[Math.floor(Math.random() * taskTypes.length)];
    triggerNotification(randomTask)
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
});
