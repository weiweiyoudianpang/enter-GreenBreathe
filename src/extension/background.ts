// Background Service Worker for Chrome Extension
import { storage } from '@/lib/storage';
import { NotificationData, TaskType } from '@/types/extension';
import { getEncouragementMessage } from '@/data/mbtiMessages';
import { getRandomInstruction } from '@/data/scientificInstructions';

const ALARM_NAMES = {
  HYDRATION: 'greenBreathe_hydration',
  EYE_CARE: 'greenBreathe_eyeCare',
  MOVEMENT: 'greenBreathe_movement',
  WEEKLY_REPORT: 'greenBreathe_weeklyReport',
} as const;

/** 浏览器启动后的「宽限期」（毫秒）——避免一打开浏览器就立刻弹窗 */
const STARTUP_GRACE_MS = 5 * 60 * 1000;
/** 跨日检测：距上次触发≥4小时，且日期不同时，按「新一天」对待 */
const CROSS_DAY_MIN_GAP_MS = 4 * 3600 * 1000;

// ─── Initialize ─────────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(async () => {
  console.log('[GreenBreathe] Extension installed');
  const profile = await storage.getUserProfile();
  await storage.setUserProfile(profile);
  await resetAlarms({ startupGrace: false });
  await scheduleWeeklyReport();
});

// Reset alarms on browser startup with grace period
chrome.runtime.onStartup.addListener(async () => {
  console.log('[GreenBreathe] Browser started, resetting alarms with grace period');
  await resetAlarms({ startupGrace: true });
  await scheduleWeeklyReport();
});

// ─── Alarms ─────────────────────────────────────────────────────────────────

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

function isSameLocalDay(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear()
    && da.getMonth() === db.getMonth()
    && da.getDate() === db.getDate();
}

/**
 * Reset all alarms using absolute `when` timestamps.
 *
 * - startupGrace: 浏览器启动时调用，本次任何触发时间均不早于 now + STARTUP_GRACE_MS
 * - 跨日重置：若上次触发不是「今天」且距今≥4小时，按完整间隔重新计时（不携带昨日 overdue）
 */
async function resetAlarms(opts: { startupGrace: boolean }) {
  const profile = await storage.getUserProfile();
  await chrome.alarms.clearAll();

  if (profile.minimalMode) {
    console.log('[GreenBreathe] Minimal mode - no alarms');
    return;
  }

  const lastTriggers = await getLastTriggerTimes();
  const now = Date.now();
  const earliestAllowed = opts.startupGrace ? now + STARTUP_GRACE_MS : now;

  const createSmartAlarm = (name: string, intervalMin: number, taskKey: TaskType) => {
    if (intervalMin <= 0) return;
    const intervalMs = intervalMin * 60 * 1000;
    const lastFired = lastTriggers[taskKey] || 0;
    const elapsed = now - lastFired;
    const crossedDay = lastFired > 0 && !isSameLocalDay(lastFired, now) && elapsed >= CROSS_DAY_MIN_GAP_MS;

    let nextFireMs: number;
    if (lastFired === 0 || crossedDay || elapsed >= intervalMs) {
      // 从未触发 / 跨天 / 已过期：按完整间隔重新计时
      nextFireMs = now + intervalMs;
    } else {
      // 还在间隔内：按剩余时间触发
      nextFireMs = lastFired + intervalMs;
    }

    // 应用启动宽限期
    if (nextFireMs < earliestAllowed) {
      nextFireMs = earliestAllowed;
    }

    chrome.alarms.create(name, {
      when: nextFireMs,
      periodInMinutes: intervalMin,
    });
    console.log(`[GreenBreathe] Alarm ${name}: next in ${Math.round((nextFireMs - now) / 60000)}min${crossedDay ? ' (cross-day reset)' : ''}${opts.startupGrace ? ' (startup grace)' : ''}`);
  };

  createSmartAlarm(ALARM_NAMES.HYDRATION, profile.hydrationInterval, 'hydration');
  createSmartAlarm(ALARM_NAMES.EYE_CARE, profile.eyeCareInterval, 'eyeCare');
  createSmartAlarm(ALARM_NAMES.MOVEMENT, profile.movementInterval, 'movement');
}

/**
 * 每周一 09:00 触发周报（用上一周的数据）
 */
async function scheduleWeeklyReport() {
  const now = new Date();
  const next = new Date(now);
  // 找到下一个周一 09:00
  const day = next.getDay(); // 0..6, 0=Sun
  let daysUntilMon = (8 - day) % 7; // 0=Sun→1, 1=Mon→0, 2=Tue→6...
  if (daysUntilMon === 0) {
    // 今天就是周一：若已过 09:00，安排到下周一
    if (now.getHours() >= 9) daysUntilMon = 7;
  }
  next.setDate(next.getDate() + daysUntilMon);
  next.setHours(9, 0, 0, 0);
  await chrome.alarms.create(ALARM_NAMES.WEEKLY_REPORT, {
    when: next.getTime(),
    periodInMinutes: 7 * 24 * 60,
  });
  console.log(`[GreenBreathe] Weekly report scheduled at ${next.toLocaleString()}`);
}

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAMES.WEEKLY_REPORT) {
    // 设置周报「待展示」标记，下次触发提醒时优先展示周报
    await chrome.storage.local.set({ pendingWeeklyReport: { generatedAt: Date.now() } });
    console.log('[GreenBreathe] Weekly report flag set');
    return;
  }

  let taskType: TaskType | null = null;
  switch (alarm.name) {
    case ALARM_NAMES.HYDRATION: taskType = 'hydration'; break;
    case ALARM_NAMES.EYE_CARE: taskType = 'eyeCare'; break;
    case ALARM_NAMES.MOVEMENT: taskType = 'movement'; break;
    default: return;
  }
  if (!taskType) return;

  const profile = await storage.getUserProfile();
  const intervalMin = taskType === 'hydration' ? profile.hydrationInterval
    : taskType === 'eyeCare' ? profile.eyeCareInterval
    : profile.movementInterval;
  const lastTriggers = await getLastTriggerTimes();
  const lastFired = lastTriggers[taskType] || 0;
  const minGapMs = intervalMin * 60 * 1000 * 0.8;

  if (lastFired > 0 && (Date.now() - lastFired) < minGapMs) {
    console.log(`[GreenBreathe] Skipping ${taskType}: only ${Math.round((Date.now() - lastFired) / 60000)}min since last, need ${intervalMin}min`);
    return;
  }

  await setLastTriggerTime(taskType);

  // 是否有待展示的周报？若有，优先发送周报卡片（替换本次提醒）
  const pendingFlag = await chrome.storage.local.get('pendingWeeklyReport');
  if (pendingFlag.pendingWeeklyReport) {
    await chrome.storage.local.remove('pendingWeeklyReport');
    const sentReport = await sendWeeklyReportCard(profile);
    if (sentReport) {
      // 周报卡片发送成功，本次跳过普通提醒
      return;
    }
    // 周报失败则降级为普通提醒
  }

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

  const sent = await sendToContentScript(notificationData, profile);

  if (!sent) {
    await showNotificationWindow(notificationData, profile);
  }
}

async function sendToContentScript(data: NotificationData, profile: Awaited<ReturnType<typeof storage.getUserProfile>>): Promise<boolean> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) return false;

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

    try {
      const response = await chrome.tabs.sendMessage(tab.id, msg);
      if (response?.success === true) return true;
    } catch {
      console.log('[GreenBreathe] Content script not loaded, injecting...');
    }

    try {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content.js'],
      });
    } catch (injectError) {
      console.log('[GreenBreathe] Cannot inject content script:', injectError);
      return false;
    }

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
 * 在活动 tab 内嵌入「周报概览卡片」，点击可跳转完整周报页
 */
async function sendWeeklyReportCard(profile: Awaited<ReturnType<typeof storage.getUserProfile>>): Promise<boolean> {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id) {
      // 无活动 tab，直接打开周报新标签页
      await chrome.tabs.create({ url: chrome.runtime.getURL('report.html') });
      return true;
    }
    const url = tab.url || '';
    if (url.startsWith('chrome://') || url.startsWith('chrome-extension://') ||
        url.startsWith('about:') || url.startsWith('edge://') ||
        url.startsWith('devtools://') || url.startsWith('view-source:')) {
      await chrome.tabs.create({ url: chrome.runtime.getURL('report.html') });
      return true;
    }

    const msg = {
      type: 'SHOW_WEEKLY_REPORT_CARD',
      cardDisplayDuration: profile.cardDisplayDuration ?? 20,
    };
    try {
      const response = await chrome.tabs.sendMessage(tab.id, msg);
      if (response?.success === true) return true;
    } catch {
      console.log('[GreenBreathe] Content script not loaded for weekly report, injecting...');
    }

    try {
      await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
    } catch {
      // 注入失败：fallback 直接打开周报页
      await chrome.tabs.create({ url: chrome.runtime.getURL('report.html') });
      return true;
    }
    await new Promise(r => setTimeout(r, 300));
    try {
      const response = await chrome.tabs.sendMessage(tab.id, msg);
      if (response?.success === true) return true;
    } catch { /* swallow */ }

    // 最终 fallback
    await chrome.tabs.create({ url: chrome.runtime.getURL('report.html') });
    return true;
  } catch (e) {
    console.error('[GreenBreathe] sendWeeklyReportCard error:', e);
    return false;
  }
}

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
    resetAlarms({ startupGrace: false }).then(() => sendResponse({ success: true }));
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

  if (message.type === 'OPEN_WEEKLY_REPORT') {
    chrome.tabs.create({ url: chrome.runtime.getURL('report.html') })
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }

  if (message.type === 'TRIGGER_TEST_WEEKLY_REPORT') {
    storage.getUserProfile().then(p => sendWeeklyReportCard(p))
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
});
