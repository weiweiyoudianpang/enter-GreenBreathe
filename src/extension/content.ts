// Content Script - Injects transparent ink-wash notification into web pages
import { NotificationData } from '@/types/extension';

console.log('[GreenBreathe Content] Script loaded on:', window.location.href);

// ─── Ink Wash Canvas Engine (pure JS, no React) ─────────────────────────────

interface Drop {
  x: number; y: number; r: number; maxR: number;
  speed: number; phase: number; wobble: number; delay: number;
  subs: SubDrop[]; lastSubR: number;
}
interface SubDrop {
  x: number; y: number; r: number; maxR: number;
  speed: number; phase: number; wobble: number;
}

function noise(a: number, p: number, t: number): number {
  return (
    Math.sin(a * 2.0 + p) * 0.22 +
    Math.sin(a * 3.7 + p * 1.3 + t * 0.0008) * 0.14 +
    Math.sin(a * 7.1 + p * 2.1) * 0.09 +
    Math.sin(a * 11.3 + p * 0.7) * 0.05
  );
}

function traceBlobPath(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, r: number,
  phase: number, wobble: number, t: number,
) {
  if (r <= 1) return;
  const N = 64;
  for (let i = 0; i <= N; i++) {
    const a = (i / N) * Math.PI * 2;
    const n = noise(a, phase, t) * wobble;
    const rr = r * (1 + n);
    const px = x + Math.cos(a) * rr;
    const py = y + Math.sin(a) * rr;
    if (i === 0) { ctx.moveTo(px, py); } else { ctx.lineTo(px, py); }
  }
  ctx.closePath();
}

function spawnTendril(drop: Drop, w: number, h: number) {
  const angle = Math.random() * Math.PI * 2;
  const dist = drop.r * (0.75 + Math.random() * 0.35);
  const tx = drop.x + Math.cos(angle) * dist;
  const ty = drop.y + Math.sin(angle) * dist;
  if (tx > -20 && tx < w + 20 && ty > -20 && ty < h + 20) {
    drop.subs.push({
      x: tx, y: ty, r: 0,
      maxR: 12 + Math.random() * 28,
      speed: 0.4 + Math.random() * 0.8,
      phase: Math.random() * 100,
      wobble: 0.3 + Math.random() * 0.35,
    });
  }
}

function createDrops(w: number, h: number, speed: number): Drop[] {
  const diag = Math.sqrt(w * w + h * h);
  const count = 4 + Math.floor(Math.random() * 3);
  const drops: Drop[] = [];
  for (let i = 0; i < count; i++) {
    drops.push({
      x: w * (0.12 + Math.random() * 0.76),
      y: h * (0.12 + Math.random() * 0.76),
      r: 0, maxR: diag * (0.45 + Math.random() * 0.4),
      speed: (1.0 + Math.random() * 1.8) * speed,
      phase: Math.random() * 200,
      wobble: 0.2 + Math.random() * 0.25,
      delay: i * 160 + Math.random() * 220,
      subs: [], lastSubR: 0,
    });
  }
  return drops;
}

function stepDrops(drops: Drop[], elapsed: number, w: number, h: number): boolean {
  let allDone = true;
  for (const d of drops) {
    if (elapsed < d.delay) { allDone = false; continue; }
    if (d.r < d.maxR) {
      const ease = 1 + (1 - d.r / d.maxR) * 0.6;
      d.r = Math.min(d.r + d.speed * ease, d.maxR);
      allDone = false;
    }
    if (d.r - d.lastSubR > 25 + Math.random() * 15) {
      d.lastSubR = d.r;
      spawnTendril(d, w, h);
      if (Math.random() > 0.6) spawnTendril(d, w, h);
    }
    for (const s of d.subs) {
      if (s.r < s.maxR) {
        s.r = Math.min(s.r + s.speed, s.maxR);
        allDone = false;
      }
    }
  }
  return allDone;
}

// ─── Smart avoidance system ─────────────────────────────────────────────────

function shouldDelayNotification(): boolean {
  if (document.fullscreenElement) return true;
  const ae = document.activeElement;
  if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.getAttribute('contenteditable') === 'true')) return true;
  const videos = document.querySelectorAll('video');
  for (const v of videos) {
    const r = v.getBoundingClientRect();
    if (!v.paused && v.currentTime > 0 && r.width > 200 && r.height > 150) return true;
  }
  return false;
}

let lastMouseMove = 0;
let lastScroll = 0;
document.addEventListener('mousemove', () => { lastMouseMove = Date.now(); }, { passive: true });
document.addEventListener('scroll', () => { lastScroll = Date.now(); }, { passive: true });

function isUserActivelyInteracting(): boolean {
  const now = Date.now();
  return now - lastMouseMove < 5000 || now - lastScroll < 5000;
}

// ─── Resolve theme from storage ─────────────────────────────────────────────

interface ThemeResult {
  isDay: boolean;
  bgImages: string[];
  accent: string;
  accentHover: string;
  textPrimary: string;
  textSecondary: string;
  contentBg: string;
  contentBorder: string;
  btnBg: string;
  btnColor: string;
}

async function resolveNotificationTheme(): Promise<ThemeResult> {
  const result = await chrome.storage.local.get('userProfile');
  const profile = result.userProfile || {};
  const themeMode = profile.themeMode || 'auto';
  const hour = new Date().getHours();
  const isDay = themeMode === 'day' || (themeMode === 'auto' && hour >= 6 && hour < 18);

  const dayBgs = ['copper-grass-goldfish.png', 'mint-photography.png', 'office-zen-green-cat.png'];
  const nightBgs = ['neon-leaf.png', 'moonlight-forest.png', 'shattered-moon.jpg'];

  const customDay = profile.customBackgroundsDay || profile.customBackgrounds || [];
  const customNight = profile.customBackgroundsNight || [];

  let bgImages: string[];
  if (isDay) {
    bgImages = customDay.length > 0 ? customDay : dayBgs.map(f => chrome.runtime.getURL(`images/day/${f}`));
  } else {
    bgImages = customNight.length > 0 ? customNight : nightBgs.map(f => chrome.runtime.getURL(`images/night/${f}`));
  }

  if (isDay) {
    return {
      isDay: true, bgImages,
      accent: '#059669', accentHover: '#047857',
      textPrimary: '#064e3b', textSecondary: '#065f46',
      contentBg: 'rgba(255,255,255,0.65)',
      contentBorder: '1px solid rgba(16,185,129,0.2)',
      btnBg: '#059669', btnColor: '#ffffff',
    };
  } else {
    return {
      isDay: false, bgImages,
      accent: '#38c9a3', accentHover: '#2db892',
      textPrimary: '#e8f4f0', textSecondary: '#a0c4b8',
      contentBg: 'rgba(10,30,46,0.55)',
      contentBorder: '1px solid rgba(56,201,163,0.15)',
      btnBg: '#38c9a3', btnColor: '#0a1e2e',
    };
  }
}

// ─── Show notification ──────────────────────────────────────────────────────

async function showNotification(data: NotificationData, retryCount = 0) {
  if (shouldDelayNotification() && retryCount < 3) {
    setTimeout(() => showNotification(data, retryCount + 1), 30000);
    return;
  }
  if (isUserActivelyInteracting() && retryCount === 0) {
    setTimeout(() => showNotification(data, retryCount), 10000);
    return;
  }

  const profileResult = await chrome.storage.local.get('userProfile');
  const profile = profileResult.userProfile || {};
  const position = profile.notificationPosition || 'top_right';
  const cardSize = profile.cardSize || 'medium';
  const mbtiType = profile.mbtiType || 'INFP';
  const theme = await resolveNotificationTheme();

  const sizeMap: Record<string, { width: number; height: number }> = {
    small: { width: 960, height: 570 },
    medium: { width: 1280, height: 760 },
    large: { width: 1600, height: 950 },
  };
  const { width, height } = sizeMap[cardSize] || sizeMap.medium;

  // MBTI-adapted text
  const isThinker = mbtiType.includes('T');
  const isIntuitive = mbtiType.includes('N');
  let scienceText = '';
  if (isThinker) scienceText = data.instruction.mbtiAdaptation.T;
  else if (isIntuitive) scienceText = data.instruction.mbtiAdaptation.N;
  else scienceText = data.instruction.mbtiAdaptation.F;

  const actionTexts = ['了解啦', '谢谢关心', 'OK', '收到', '这就去'];
  const randomAction = actionTexts[Math.floor(Math.random() * actionTexts.length)];
  const bgImage = theme.bgImages[Math.floor(Math.random() * theme.bgImages.length)];

  // ─── Create overlay container ───
  let root = document.getElementById('green-breathe-notification-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'green-breathe-notification-root';
    document.body.appendChild(root);
  }
  root.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = `green-breathe-notification ${position}`;
  const shadow = wrapper.attachShadow({ mode: 'open' });

  // ─── Build Shadow DOM ───
  const container = document.createElement('div');
  container.style.cssText = `
    width: ${width}px; height: ${height}px; position: relative; overflow: hidden;
    border-radius: 24px; pointer-events: none;
    font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
    mix-blend-mode: multiply;
  `;

  // Canvas for ink-wash paint
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;border-radius:24px;';
  container.appendChild(canvas);

  // Content box (initially hidden)
  const contentBox = document.createElement('div');
  contentBox.style.cssText = `
    position: absolute; bottom: 0; left: 0; right: 0; height: 30%;
    background: ${theme.contentBg};
    backdrop-filter: blur(28px) saturate(150%); -webkit-backdrop-filter: blur(28px) saturate(150%);
    border-top: ${theme.contentBorder};
    padding: 40px 60px;
    display: flex; flex-direction: column; justify-content: center;
    z-index: 2; pointer-events: auto;
    opacity: 0; transform: translateY(20px); filter: blur(8px);
    transition: all 0.8s cubic-bezier(0.22,1,0.36,1);
    border-radius: 0 0 24px 24px;
  `;
  contentBox.innerHTML = `
    <div style="font-size:32px;line-height:1.5;margin-bottom:16px;color:${theme.textPrimary};font-weight:600;letter-spacing:1px">${data.encouragement}</div>
    <div style="font-size:20px;color:${theme.textSecondary};margin-bottom:24px;line-height:1.6;font-weight:500">${data.instruction.instruction} · ${scienceText}</div>
    <div style="display:flex;gap:12px;justify-content:flex-end">
      <button class="gb-dismiss" style="
        padding:12px 32px;border-radius:12px;font-size:18px;font-weight:600;cursor:pointer;border:none;
        font-family:'Microsoft YaHei','PingFang SC',sans-serif;
        background:${theme.btnBg};color:${theme.btnColor};
        box-shadow:0 4px 12px rgba(0,0,0,0.15);transition:all 0.3s ease;pointer-events:auto;
      ">${randomAction}</button>
    </div>
  `;
  container.appendChild(contentBox);
  shadow.appendChild(container);
  root.appendChild(wrapper);

  // ─── Load image & run ink wash paint animation ───
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Compute cover crop
    const imgRatio = img.width / img.height;
    const canvasRatio = width / height;
    let sx = 0, sy = 0, sw = img.width, sh = img.height;
    if (imgRatio > canvasRatio) {
      sw = img.height * canvasRatio;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / canvasRatio;
      sy = (img.height - sh) / 2;
    }

    const drops = createDrops(width, height, 1);
    const t0 = performance.now();
    let done = false;

    function frame(now: number) {
      if (done) return;
      const elapsed = now - t0;
      const allDone = stepDrops(drops, elapsed, width, height);

      ctx!.clearRect(0, 0, width, height);

      // Draw image through blob clip paths
      ctx!.save();
      ctx!.beginPath();
      for (const d of drops) {
        if (d.r > 1) traceBlobPath(ctx!, d.x, d.y, d.r, d.phase, d.wobble, elapsed);
        for (const s of d.subs) {
          if (s.r > 1) traceBlobPath(ctx!, s.x, s.y, s.r, s.phase, s.wobble, elapsed);
        }
      }
      ctx!.clip();
      ctx!.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
      ctx!.restore();

      // Soft feathered edge
      ctx!.globalAlpha = 0.12;
      ctx!.save();
      ctx!.beginPath();
      for (const d of drops) {
        if (d.r > 1) traceBlobPath(ctx!, d.x, d.y, d.r * 1.12, d.phase, d.wobble, elapsed);
        for (const s of d.subs) {
          if (s.r > 1) traceBlobPath(ctx!, s.x, s.y, s.r * 1.15, s.phase, s.wobble, elapsed);
        }
      }
      ctx!.clip();
      ctx!.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
      ctx!.restore();
      ctx!.globalAlpha = 1;

      if (allDone || elapsed > 4000) {
        done = true;
        ctx!.clearRect(0, 0, width, height);
        ctx!.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
        // Show content
        contentBox.style.opacity = '1';
        contentBox.style.transform = 'translateY(0)';
        contentBox.style.filter = 'blur(0)';
        return;
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  };
  img.onerror = () => {
    contentBox.style.opacity = '1';
    contentBox.style.transform = 'translateY(0)';
    contentBox.style.filter = 'blur(0)';
  };
  img.src = bgImage;

  // ─── Dismiss handler ───
  const dismissBtn = shadow.querySelector('.gb-dismiss') as HTMLButtonElement;
  const dismiss = () => {
    logInteraction('completed', data.taskType);
    container.style.transition = 'all 1.2s cubic-bezier(0.22,1,0.36,1)';
    container.style.opacity = '0';
    container.style.filter = 'blur(10px)';
    container.style.transform = 'scale(0.95)';
    setTimeout(() => wrapper.remove(), 1500);
  };
  dismissBtn?.addEventListener('click', dismiss);

  // Auto-dismiss after 12 seconds
  setTimeout(() => {
    if (wrapper.parentElement) dismiss();
  }, 12000);
}

// ─── Interaction logging ────────────────────────────────────────────────────

async function logInteraction(action: 'completed' | 'dismissed', taskType: string) {
  try {
    const result = await chrome.storage.local.get('interactionLog');
    const logs = result.interactionLog || [];
    logs.push({ timestamp: Date.now(), action, taskType });
    if (logs.length > 100) logs.splice(0, logs.length - 100);
    await chrome.storage.local.set({ interactionLog: logs });

    if (action === 'completed') {
      const gr = await chrome.storage.local.get('plantGrowth');
      const growth = gr.plantGrowth || { level: 0, totalCompletions: 0, unlockedForms: [] };
      growth.totalCompletions += 1;
      growth.level = Math.floor(growth.totalCompletions / 10);
      await chrome.storage.local.set({ plantGrowth: growth });
    }
  } catch (e) {
    console.error('[GreenBreathe] Error logging interaction:', e);
  }
}

// ─── Listen for messages from background ────────────────────────────────────

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SHOW_NOTIFICATION') {
    showNotification(message.data)
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
});

// ─── Inject positioning styles ──────────────────────────────────────────────

const style = document.createElement('style');
style.textContent = `
  #green-breathe-notification-root {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    z-index: 2147483647; pointer-events: none;
  }
  #green-breathe-notification-root .green-breathe-notification {
    position: absolute; pointer-events: none;
  }
  #green-breathe-notification-root .top_right { top: 32px; right: 32px; }
  #green-breathe-notification-root .top_left { top: 32px; left: 32px; }
  #green-breathe-notification-root .bottom_right { bottom: 32px; right: 32px; }
  #green-breathe-notification-root .bottom_left { bottom: 32px; left: 32px; }
  #green-breathe-notification-root .center {
    top: 50%; left: 50%; transform: translate(-50%, -50%);
  }
`;
document.head.appendChild(style);

console.log('[GreenBreathe Content] Script ready');
