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
  await resetAlarms();
});

// Reset alarms on browser startup to prevent stale overdue alarms from firing immediately
chrome.runtime.onStartup.addListener(async () => {
  console.log('[GreenBreathe] Browser started, resetting alarms');
  await resetAlarms();
});

// ─── Alarms ─────────────────────────────────────────────────────────────────

// Track the last trigger time per task to prevent premature re-fires
const LAST_TRIGGER_KEY = 'greenBreathe_lastTrigger';

async function getLastTriggerTimes(): Promise<Record<string, number>> {
  const result = await chrome.storage.local.get(LAST_TRIGGER_KEY);
  return result[LAST_TRIGGER_KEY] || {};
}

async function setLastTriggerTime(taskType: TaskType) {
  const times = await getLastTriggerTimes();
  times[taskType] = Date.now();
  await chrome.storage.local.set({ [LAST_TRIGGER_KEY]: times });
}

/**
 * Reset all alarms using absolute `when` timestamps.
 * Uses the last trigger time to calculate the correct next fire time,
 * preventing early triggers after browser restart.
 */
async function resetAlarms() {
  const profile = await storage.getUserProfile();
  await chrome.alarms.clearAll();

  if (profile.minimalMode) {
    console.log('[GreenBreathe] Minimal mode - no alarms');
    return;
  }

  const lastTriggers = await getLastTriggerTimes();
  const now = Date.now();

  const createSmartAlarm = (name: string, intervalMin: number, taskKey: string) => {
    if (intervalMin <= 0) return;
    const intervalMs = intervalMin * 60 * 1000;
    const lastFired = lastTriggers[taskKey] || 0;
    const elapsed = now - lastFired;

    // Calculate when the alarm should next fire
    let nextFireMs: number;
    if (lastFired === 0 || elapsed >= intervalMs) {
      // Never fired or already overdue: fire after full interval from now
      nextFireMs = now + intervalMs;
    } else {
      // Not yet due: fire at the remaining time
      nextFireMs = lastFired + intervalMs;
    }

    chrome.alarms.create(name, {
      when: nextFireMs,
      periodInMinutes: intervalMin,
    });
    console.log(`[GreenBreathe] Alarm ${name}: next in ${Math.round((nextFireMs - now) / 60000)}min`);
  };

  createSmartAlarm(ALARM_NAMES.HYDRATION, profile.hydrationInterval, 'hydration');
  createSmartAlarm(ALARM_NAMES.EYE_CARE, profile.eyeCareInterval, 'eyeCare');
  createSmartAlarm(ALARM_NAMES.MOVEMENT, profile.movementInterval, 'movement');
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  let taskType: TaskType | null = null;
  switch (alarm.name) {
    case ALARM_NAMES.HYDRATION: taskType = 'hydration'; break;
    case ALARM_NAMES.EYE_CARE: taskType = 'eyeCare'; break;
    case ALARM_NAMES.MOVEMENT: taskType = 'movement'; break;
    default: return;
  }
  if (!taskType) return;

  // Guard: skip if fired too early (less than 80% of interval elapsed)
  const profile = await storage.getUserProfile();
  const intervalMin = taskType === 'hydration' ? profile.hydrationInterval
    : taskType === 'eyeCare' ? profile.eyeCareInterval
    : profile.movementInterval;
  const lastTriggers = await getLastTriggerTimes();
  const lastFired = lastTriggers[taskType] || 0;
  const minGapMs = intervalMin * 60 * 1000 * 0.8; // 80% of interval as minimum gap

  if (lastFired > 0 && (Date.now() - lastFired) < minGapMs) {
    console.log(`[GreenBreathe] Skipping ${taskType}: only ${Math.round((Date.now() - lastFired) / 60000)}min since last, need ${intervalMin}min`);
    return;
  }

  await setLastTriggerTime(taskType);
  await triggerNotification(taskType);
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
  const sent = await sendToContentScript(notificationData, profile);

  // Fallback: standalone window (chrome:// pages, etc.)
  if (!sent) {
    await showNotificationWindow(notificationData, profile);
  }
}

/**
 * Try to send notification to content script in the active tab.
 * Uses a 3-step approach for maximum reliability:
 * 1. Try messaging the existing content script
 * 2. If that fails, programmatically inject the content script
 * 3. Try messaging again after injection
 */
async function sendToContentScript(data: NotificationData, profile: Awaited<ReturnType<typeof storage.getUserProfile>>): Promise<boolean> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return false;

    // Skip chrome:// and other restricted pages
    const url = tab.url || '';
    if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') ||
        url.startsWith('about:') || url.startsWith('edge://') ||
        url.startsWith('devtools://') || url.startsWith('view-source:')) {
      return false;
    }

    const msg = {
      type: 'SHOW_NOTIFICATION',
      data,
      inkDuration: profile.inkDuration ?? 3,
      cardDisplayDuration: profile.cardDisplayDuration ?? 20,
    };

    // Step 1: Try sending to existing content script
    try {
      const response = await chrome.tabs.sendMessage(tab.id, msg);
      if (response?.success === true) return true;
    } catch {
      console.log('[GreenBreathe] Content script not loaded, injecting...');
    }

    // Step 2: Programmatically inject content script
    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js'],
      });
    } catch (injectError) {
      console.log('[GreenBreathe] Cannot inject content script:', injectError);
      return false;
    }

    // Step 3: Wait for script to initialize, then retry message
    await new Promise(resolve => setTimeout(resolve, 300));
    try {
      const response = await chrome.tabs.sendMessage(tab.id, msg);
      return response?.success === true;
    } catch {
      console.log('[GreenBreathe] Content script injected but message failed');
      return false;
    }
  } catch {
    console.log('[GreenBreathe] sendToContentScript error, using window fallback');
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

    // Auto-close after configured duration
    const displayDuration = (profile.cardDisplayDuration ?? 20) * 1000;
    setTimeout(async () => {
      try { if (win.id) await chrome.windows.remove(win.id); } catch { /* already closed */ }
    }, displayDuration);
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
    resetAlarms().then(() => sendResponse({ success: true }));
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
