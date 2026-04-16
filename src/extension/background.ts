// Background Service Worker for Chrome Extension
import { storage } from '@/lib/storage';
import { NotificationData, TaskType } from '@/types/extension';
import { getEncouragementMessage } from '@/data/mbtiMessages';
import { getRandomInstruction } from '@/data/scientificInstructions';

const ALARM_NAME = 'greenBreatheReminder';

// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
  console.log('GreenBreathe Extension Installed');
  
  // Set default user profile if not exists
  const profile = await storage.getUserProfile();
  await storage.setUserProfile(profile);
  
  // Create initial alarm
  await setupAlarm();
});

// Setup alarm based on user settings
async function setupAlarm() {
  const profile = await storage.getUserProfile();
  
  // Clear existing alarm
  await chrome.alarms.clear(ALARM_NAME);
  
  if (!profile.minimalMode) {
    // Create periodic alarm
    chrome.alarms.create(ALARM_NAME, {
      delayInMinutes: profile.customInterval,
      periodInMinutes: profile.customInterval,
    });
    console.log(`Alarm set for every ${profile.customInterval} minutes`);
  }
}

// Listen for alarm
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === ALARM_NAME) {
    await triggerNotification();
  }
});

// Trigger notification
async function triggerNotification() {
  const profile = await storage.getUserProfile();
  
  // Check quiet hours
  if (isQuietHours(profile.quietHours)) {
    console.log('Quiet hours - skipping notification');
    return;
  }
  
  // Random task type
  const taskTypes: TaskType[] = ['hydration', 'eyeCare', 'movement'];
  const taskType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
  
  // Get messages
  const encouragement = getEncouragementMessage(profile.mbtiType, taskType);
  const instruction = getRandomInstruction(taskType);
  
  const notificationData: NotificationData = {
    taskType,
    encouragement,
    instruction,
    timestamp: Date.now(),
  };
  
  // Send message to content script
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tabs[0]?.id) {
    try {
      await chrome.tabs.sendMessage(tabs[0].id, {
        type: 'SHOW_NOTIFICATION',
        data: notificationData,
      });
    } catch (error) {
      console.error('Error sending message to content script:', error);
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
  if (message.type === 'UPDATE_ALARM') {
    setupAlarm().then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (message.type === 'TRIGGER_TEST_NOTIFICATION') {
    triggerNotification().then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
});
