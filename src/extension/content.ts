// Content Script - Injects transparent ink-wash notification into web pages
import { NotificationData, NotificationStyleKey } from '@/types/extension';
import { pickRandomStyle } from '@/lib/notificationStyles';

// Guard against duplicate injection
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if ((window as any).__greenBreatheContentLoaded) {
  console.log('[GreenBreathe Content] Already loaded, skipping duplicate');
} else {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).__greenBreatheContentLoaded = true;

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

// ─── Resolve theme/bg from storage ─────────────────────────────────────────

async function resolveBgImages(): Promise<{ isDay: boolean; bgImages: string[] }> {
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
  return { isDay, bgImages };
}

// ─── Position resolution（含 random 4 角） ────────────────────────────────

const CORNER_POSITIONS = ['top_right', 'top_left', 'bottom_right', 'bottom_left'] as const;
type CornerPosition = typeof CORNER_POSITIONS[number];

function resolvePosition(saved: string | undefined): CornerPosition {
  if (saved === 'random') {
    return CORNER_POSITIONS[Math.floor(Math.random() * CORNER_POSITIONS.length)];
  }
  if (saved && (CORNER_POSITIONS as readonly string[]).includes(saved)) {
    return saved as CornerPosition;
  }
  return 'top_right';
}

// ─── Show notification ──────────────────────────────────────────────────────

interface ActiveNotification {
  wrapper: HTMLElement;
  taskType: string;
  style: NotificationStyleKey;
  shownAt: number;
  resolved: boolean;
  blurListener: () => void;
  autoTimerId: number;
}

let activeNotif: ActiveNotification | null = null;

/** 3 秒阈值：低于此值的关闭都视为「未真正阅读」 */
const READ_THRESHOLD_MS = 3000;
/** 失焦容忍：弹窗显示后 5 秒内切走视为放弃 */
const BLUR_GRACE_MS = 5000;

async function showNotification(data: NotificationData, retryCount = 0, inkDuration = 3, cardDisplayDuration = 20) {
  if (shouldDelayNotification() && retryCount < 3) {
    setTimeout(() => showNotification(data, retryCount + 1, inkDuration, cardDisplayDuration), 30000);
    return;
  }
  if (isUserActivelyInteracting() && retryCount === 0) {
    setTimeout(() => showNotification(data, retryCount, inkDuration, cardDisplayDuration), 10000);
    return;
  }

  const profileResult = await chrome.storage.local.get('userProfile');
  const profile = profileResult.userProfile || {};
  const position = resolvePosition(profile.notificationPosition);
  const cardSize = profile.cardSize || 'medium';
  const mbtiType = profile.mbtiType || 'INFP';
  const { isDay, bgImages } = await resolveBgImages();
  const style = pickRandomStyle(isDay);

  const sizeMap: Record<string, { width: number; height: number }> = {
    small: { width: 960, height: 570 },
    medium: { width: 1280, height: 760 },
    large: { width: 1600, height: 950 },
  };
  const { width, height } = sizeMap[cardSize] || sizeMap.medium;

  const isThinker = mbtiType.includes('T');
  const isIntuitive = mbtiType.includes('N');
  let scienceText = '';
  if (isThinker) scienceText = data.instruction.mbtiAdaptation.T;
  else if (isIntuitive) scienceText = data.instruction.mbtiAdaptation.N;
  else scienceText = data.instruction.mbtiAdaptation.F;

  const bgImage = bgImages[Math.floor(Math.random() * bgImages.length)];

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
    border-radius: ${style.borderRadius}px; pointer-events: none;
    font-family: ${style.fontFamily};
    mix-blend-mode: multiply;
    ${style.pixelArt ? 'image-rendering: pixelated;' : ''}
  `;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = `position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;border-radius:${style.borderRadius}px;${style.pixelArt ? 'image-rendering: pixelated;' : ''}`;
  container.appendChild(canvas);

  const contentBox = document.createElement('div');
  contentBox.style.cssText = `
    position: absolute; bottom: 0; left: 0; right: 0; height: 32%;
    background: ${style.contentBg};
    backdrop-filter: blur(28px) saturate(150%); -webkit-backdrop-filter: blur(28px) saturate(150%);
    border-top: ${style.contentBorder};
    padding: 32px 56px;
    display: flex; flex-direction: column; justify-content: center;
    z-index: 2; pointer-events: auto;
    opacity: 0; transform: translateY(20px); filter: blur(8px);
    transition: all 0.8s cubic-bezier(0.22,1,0.36,1);
    border-radius: 0 0 ${style.borderRadius}px ${style.borderRadius}px;
  `;

  const titleSize = style.pixelArt ? 22 : 30;
  const subSize = style.pixelArt ? 14 : 19;
  const btnSize = style.pixelArt ? 13 : 17;

  contentBox.innerHTML = `
    <div style="font-size:${titleSize}px;line-height:1.5;margin-bottom:14px;color:${style.textPrimary};font-weight:600;letter-spacing:${style.pixelArt ? 0 : 1}px">${escapeHtml(data.encouragement)}</div>
    <div style="font-size:${subSize}px;color:${style.textSecondary};margin-bottom:22px;line-height:1.6;font-weight:500">${escapeHtml(data.instruction.instruction)} · ${escapeHtml(scienceText)}</div>
    <div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap">
      <button class="gb-ghost gb-snooze" style="
        padding:10px 22px;border-radius:${Math.max(8, style.borderRadius - 8)}px;font-size:${btnSize}px;font-weight:600;cursor:pointer;
        font-family:${style.fontFamily};
        background:${style.ghostButtonBg};color:${style.ghostButtonColor};border:${style.ghostButtonBorder};
        transition:all 0.3s ease;pointer-events:auto;
      ">稍后再说</button>
      <button class="gb-ghost gb-ignore" style="
        padding:10px 22px;border-radius:${Math.max(8, style.borderRadius - 8)}px;font-size:${btnSize}px;font-weight:600;cursor:pointer;
        font-family:${style.fontFamily};
        background:${style.ghostButtonBg};color:${style.ghostButtonColor};border:${style.ghostButtonBorder};
        transition:all 0.3s ease;pointer-events:auto;
      ">先不了</button>
      <button class="gb-primary gb-complete" style="
        padding:10px 28px;border-radius:${Math.max(8, style.borderRadius - 8)}px;font-size:${btnSize}px;font-weight:600;cursor:pointer;border:${style.pixelArt ? '2px solid ' + style.buttonHover : 'none'};
        font-family:${style.fontFamily};
        background:${style.buttonBg};color:${style.buttonColor};
        box-shadow:0 4px 12px rgba(0,0,0,0.15);transition:all 0.3s ease;pointer-events:auto;
      ">我已完成</button>
    </div>
  `;
  container.appendChild(contentBox);
  shadow.appendChild(container);
  root.appendChild(wrapper);

  // ─── Track active notification for passive judgement ───
  const shownAt = Date.now();
  // Auto-dismiss timer
  const autoTimerId = window.setTimeout(() => {
    finalize('timeout');
  }, cardDisplayDuration * 1000);

  // Window blur within grace window → ignored
  const blurListener = () => {
    if (!activeNotif || activeNotif.resolved) return;
    if (Date.now() - activeNotif.shownAt < BLUR_GRACE_MS) {
      finalize('window_blur');
    }
  };
  window.addEventListener('blur', blurListener, { once: false });

  activeNotif = {
    wrapper, taskType: data.taskType, style: style.key,
    shownAt, resolved: false, blurListener, autoTimerId,
  };

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

    const effectiveSpeed = inkDuration > 0 ? 4.0 / inkDuration : 999;
    const maxAnimTime = inkDuration > 0 ? inkDuration * 1000 : 0;

    if (inkDuration <= 0) {
      ctx!.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
      contentBox.style.opacity = '1';
      contentBox.style.transform = 'translateY(0)';
      contentBox.style.filter = 'blur(0)';
    } else {
      const drops = createDrops(width, height, effectiveSpeed);
      const t0 = performance.now();
      let done = false;

      function frame(now: number) {
        if (done) return;
        const elapsed = now - t0;
        const allDone = stepDrops(drops, elapsed, width, height);

        ctx!.clearRect(0, 0, width, height);

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

        if (allDone || elapsed > maxAnimTime) {
          done = true;
          ctx!.clearRect(0, 0, width, height);
          ctx!.drawImage(img, sx, sy, sw, sh, 0, 0, width, height);
          contentBox.style.opacity = '1';
          contentBox.style.transform = 'translateY(0)';
          contentBox.style.filter = 'blur(0)';
          return;
        }
        requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
  };
  img.onerror = () => {
    contentBox.style.opacity = '1';
    contentBox.style.transform = 'translateY(0)';
    contentBox.style.filter = 'blur(0)';
  };
  img.src = bgImage;

  // ─── Button handlers ───
  const completeBtn = shadow.querySelector('.gb-complete') as HTMLButtonElement;
  const snoozeBtn = shadow.querySelector('.gb-snooze') as HTMLButtonElement;
  const ignoreBtn = shadow.querySelector('.gb-ignore') as HTMLButtonElement;

  completeBtn?.addEventListener('click', () => {
    const elapsed = Date.now() - shownAt;
    if (elapsed < READ_THRESHOLD_MS) {
      // 防误点：< 3 秒按 fast_dismiss 处理
      finalize('fast_dismiss');
    } else {
      finalize('user_completed');
    }
  });
  snoozeBtn?.addEventListener('click', () => finalize('user_snoozed'));
  ignoreBtn?.addEventListener('click', () => {
    const elapsed = Date.now() - shownAt;
    finalize(elapsed < READ_THRESHOLD_MS ? 'fast_dismiss' : 'timeout');
  });

  function finalize(reason: 'user_completed' | 'user_snoozed' | 'fast_dismiss' | 'timeout' | 'window_blur') {
    if (!activeNotif || activeNotif.resolved) return;
    activeNotif.resolved = true;
    clearTimeout(activeNotif.autoTimerId);
    window.removeEventListener('blur', activeNotif.blurListener);

    const elapsed = Date.now() - activeNotif.shownAt;
    let action: 'completed' | 'snoozed' | 'ignored';
    if (reason === 'user_completed') action = 'completed';
    else if (reason === 'user_snoozed') action = 'snoozed';
    else action = 'ignored';

    logInteraction(action, activeNotif.taskType, elapsed, reason, activeNotif.style);

    container.style.transition = 'all 1.0s cubic-bezier(0.22,1,0.36,1)';
    container.style.opacity = '0';
    container.style.filter = 'blur(10px)';
    container.style.transform = 'scale(0.96)';
    setTimeout(() => wrapper.remove(), 1100);
    activeNotif = null;
  }
}

function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));
}

// ─── Weekly Report inline overview card ─────────────────────────────────────

async function showWeeklyReportCard(cardDisplayDuration = 20) {
  const profileResult = await chrome.storage.local.get('userProfile');
  const profile = profileResult.userProfile || {};
  const position = resolvePosition(profile.notificationPosition);
  const { isDay } = await resolveBgImages();

  // Aggregate quick stats
  const logsResult = await chrome.storage.local.get('interactionLog');
  const logs = (logsResult.interactionLog || []) as Array<{ timestamp: number; action: string }>;
  const now = new Date();
  const day = now.getDay();
  const daysFromMonday = (day === 0 ? 6 : day - 1);
  const lastMon = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysFromMonday - 7, 0, 0, 0, 0);
  const lastSun = new Date(lastMon.getTime() + 7 * 24 * 3600 * 1000);
  const weekLogs = logs.filter(l => l.timestamp >= lastMon.getTime() && l.timestamp < lastSun.getTime());
  const completed = weekLogs.filter(l => l.action === 'completed').length;
  const total = weekLogs.length;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

  const bgGradient = isDay
    ? 'linear-gradient(135deg, rgba(220,252,231,0.95), rgba(167,243,208,0.92))'
    : 'linear-gradient(135deg, rgba(15,40,55,0.95), rgba(10,30,46,0.92))';
  const textPrimary = isDay ? '#064e3b' : '#e8f4f0';
  const textSecondary = isDay ? '#065f46' : '#a0c4b8';
  const accent = isDay ? '#059669' : '#38c9a3';
  const accentText = isDay ? '#ffffff' : '#0a1e2e';
  const ghostBorder = isDay ? 'rgba(16,185,129,0.35)' : 'rgba(56,201,163,0.35)';

  const width = 460, height = 280;

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

  const container = document.createElement('div');
  container.style.cssText = `
    width:${width}px;height:${height}px;border-radius:20px;
    background:${bgGradient};
    backdrop-filter:blur(24px) saturate(150%);-webkit-backdrop-filter:blur(24px) saturate(150%);
    box-shadow:0 12px 40px rgba(0,0,0,0.18);
    padding:24px 28px;box-sizing:border-box;pointer-events:auto;
    font-family:'Microsoft YaHei','PingFang SC',sans-serif;
    display:flex;flex-direction:column;
    opacity:0;transform:translateY(20px);transition:all 0.6s cubic-bezier(0.22,1,0.36,1);
  `;

  container.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
      <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${accent};box-shadow:0 0 8px ${accent}80"></span>
      <span style="font-size:13px;color:${textSecondary};letter-spacing:1px;">本周回顾 · 周报</span>
    </div>
    <div style="font-size:22px;font-weight:700;color:${textPrimary};margin-bottom:18px;line-height:1.4;">
      ${completed > 0 ? `本周你完成了 ${completed} 次提醒` : '本周还没有完成记录'}
    </div>
    <div style="display:flex;gap:14px;margin-bottom:20px;">
      <div style="flex:1;padding:12px 14px;border-radius:12px;background:${isDay ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.06)'};">
        <div style="font-size:11px;color:${textSecondary};letter-spacing:1px;">完成率</div>
        <div style="font-size:24px;font-weight:700;color:${accent};margin-top:2px;">${rate}%</div>
      </div>
      <div style="flex:1;padding:12px 14px;border-radius:12px;background:${isDay ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.06)'};">
        <div style="font-size:11px;color:${textSecondary};letter-spacing:1px;">收到提醒</div>
        <div style="font-size:24px;font-weight:700;color:${textPrimary};margin-top:2px;">${total}</div>
      </div>
    </div>
    <div style="margin-top:auto;display:flex;gap:10px;justify-content:flex-end;">
      <button class="gb-wr-close" style="
        padding:10px 18px;border-radius:10px;font-size:14px;cursor:pointer;
        background:transparent;color:${textSecondary};border:1px solid ${ghostBorder};
        font-family:'Microsoft YaHei','PingFang SC',sans-serif;font-weight:500;
      ">稍后再看</button>
      <button class="gb-wr-open" style="
        padding:10px 22px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;
        background:${accent};color:${accentText};border:none;
        font-family:'Microsoft YaHei','PingFang SC',sans-serif;
        box-shadow:0 4px 12px ${accent}40;
      ">查看完整周报</button>
    </div>
  `;
  shadow.appendChild(container);
  root.appendChild(wrapper);

  requestAnimationFrame(() => {
    container.style.opacity = '1';
    container.style.transform = 'translateY(0)';
  });

  const close = () => {
    container.style.opacity = '0';
    container.style.transform = 'translateY(20px)';
    setTimeout(() => wrapper.remove(), 700);
  };
  shadow.querySelector('.gb-wr-close')?.addEventListener('click', close);
  shadow.querySelector('.gb-wr-open')?.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'OPEN_WEEKLY_REPORT' });
    close();
  });
  setTimeout(() => { if (wrapper.parentElement) close(); }, cardDisplayDuration * 1000);
}

// ─── Interaction logging ────────────────────────────────────────────────────

async function logInteraction(
  action: 'completed' | 'snoozed' | 'ignored',
  taskType: string,
  shownDurationMs: number,
  reason: 'user_completed' | 'user_snoozed' | 'fast_dismiss' | 'timeout' | 'window_blur',
  style: NotificationStyleKey,
) {
  try {
    const result = await chrome.storage.local.get('interactionLog');
    const logs = result.interactionLog || [];
    logs.push({ timestamp: Date.now(), action, taskType, shownDurationMs, reason, style });
    if (logs.length > 1000) logs.splice(0, logs.length - 1000);
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
    showNotification(message.data, 0, message.inkDuration, message.cardDisplayDuration)
      .then(() => sendResponse({ success: true }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true;
  }
  if (message.type === 'SHOW_WEEKLY_REPORT_CARD') {
    showWeeklyReportCard(message.cardDisplayDuration)
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

} // end duplicate guard
