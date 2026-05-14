/**
 * Weekly Report 数据聚合
 *
 * 周界定义：ISO 周（周一 00:00 到 周日 23:59:59）
 * 数据源：chrome.storage.local.interactionLog（保留 1000 条）
 *
 * 完成判定遵循「方案 3 三态诚实统计」：
 *   completed: 用户主动点击「我已完成」
 *   snoozed:   用户点击「稍后再说」
 *   ignored:   被动信号（快速关闭/超时/失焦）
 */
import { InteractionLog, TaskType, NotificationStyleKey } from '@/types/extension';

export interface WeekRange {
  start: number;        // ms timestamp
  end: number;          // ms timestamp (exclusive)
  label: string;        // e.g. "2025/05/12 - 2025/05/18"
  weekNumber: number;   // ISO week number
  year: number;
}

/** 取「本周」（周一开始）的范围 */
export function getCurrentWeekRange(now: Date = new Date()): WeekRange {
  return getWeekRangeFor(now);
}

/** 取「上一周」 */
export function getLastWeekRange(now: Date = new Date()): WeekRange {
  const lastWeek = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
  return getWeekRangeFor(lastWeek);
}

function getWeekRangeFor(d: Date): WeekRange {
  // Find Monday 00:00 of this week
  const day = d.getDay(); // 0=Sun, 1=Mon ... 6=Sat
  const daysFromMonday = (day === 0 ? 6 : day - 1);
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate() - daysFromMonday, 0, 0, 0, 0);
  const sunday = new Date(monday.getTime() + 7 * 24 * 3600 * 1000);
  return {
    start: monday.getTime(),
    end: sunday.getTime(),
    label: `${formatDate(monday)} - ${formatDate(new Date(sunday.getTime() - 1))}`,
    weekNumber: getISOWeekNumber(monday),
    year: monday.getFullYear(),
  };
}

function formatDate(d: Date): string {
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
}

function getISOWeekNumber(d: Date): number {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

/* ───────────────────────────────────────────────────────────── */

export interface DailyStat {
  /** 0=Mon ... 6=Sun */
  weekday: number;
  date: string;          // "2025/05/12"
  completed: number;
  snoozed: number;
  ignored: number;
  total: number;
}

export interface TaskStat {
  taskType: TaskType;
  completed: number;
  snoozed: number;
  ignored: number;
  total: number;
  /** completion / total */
  completionRate: number;
}

export interface HourStat {
  /** 0..23 */
  hour: number;
  total: number;
  completed: number;
}

export interface WeeklyReport {
  range: WeekRange;
  totals: {
    triggered: number;     // total notifications shown
    completed: number;
    snoozed: number;
    ignored: number;
  };
  /** completed / triggered */
  completionRate: number;
  /** active days (>=1 trigger) */
  activeDays: number;
  /** 连续完成天数（含本周内最长连击） */
  longestStreak: number;
  /** 与上周对比的完成数变化（正=增长） */
  weekOverWeekDelta: number | null;
  daily: DailyStat[];        // length = 7
  byTask: TaskStat[];        // 3 entries
  hourly: HourStat[];        // sparse: only hours with data
  bestHour: number | null;   // 最高完成时段
  /** 风格统计 */
  byStyle: Array<{ style: NotificationStyleKey; count: number; completionRate: number }>;
  /** 一句话寄语 */
  message: string;
}

/* ───────────────────────────────────────────────────────────── */

export function aggregateWeekly(logs: InteractionLog[], range: WeekRange, prevRange?: WeekRange): WeeklyReport {
  const inRange = logs.filter(l => l.timestamp >= range.start && l.timestamp < range.end);

  const totals = { triggered: inRange.length, completed: 0, snoozed: 0, ignored: 0 };
  for (const l of inRange) {
    if (l.action === 'completed') totals.completed++;
    else if (l.action === 'snoozed') totals.snoozed++;
    else totals.ignored++;
  }
  const completionRate = totals.triggered > 0 ? totals.completed / totals.triggered : 0;

  // Daily breakdown
  const daily: DailyStat[] = [];
  for (let i = 0; i < 7; i++) {
    const dayStart = range.start + i * 86400000;
    const dayEnd = dayStart + 86400000;
    const dayLogs = inRange.filter(l => l.timestamp >= dayStart && l.timestamp < dayEnd);
    const c = dayLogs.filter(l => l.action === 'completed').length;
    const s = dayLogs.filter(l => l.action === 'snoozed').length;
    const ig = dayLogs.filter(l => l.action === 'ignored').length;
    const dt = new Date(dayStart);
    daily.push({
      weekday: i,
      date: formatDate(dt),
      completed: c,
      snoozed: s,
      ignored: ig,
      total: dayLogs.length,
    });
  }

  const activeDays = daily.filter(d => d.total > 0).length;

  // Longest streak: consecutive days with completed > 0
  let longest = 0, cur = 0;
  for (const d of daily) {
    if (d.completed > 0) { cur++; longest = Math.max(longest, cur); }
    else cur = 0;
  }

  // Task breakdown
  const tasks: TaskType[] = ['hydration', 'eyeCare', 'movement'];
  const byTask: TaskStat[] = tasks.map(taskType => {
    const tLogs = inRange.filter(l => l.taskType === taskType);
    const c = tLogs.filter(l => l.action === 'completed').length;
    const s = tLogs.filter(l => l.action === 'snoozed').length;
    const ig = tLogs.filter(l => l.action === 'ignored').length;
    return {
      taskType,
      completed: c,
      snoozed: s,
      ignored: ig,
      total: tLogs.length,
      completionRate: tLogs.length > 0 ? c / tLogs.length : 0,
    };
  });

  // Hourly distribution
  const hourBuckets: Record<number, { total: number; completed: number }> = {};
  for (const l of inRange) {
    const h = new Date(l.timestamp).getHours();
    if (!hourBuckets[h]) hourBuckets[h] = { total: 0, completed: 0 };
    hourBuckets[h].total++;
    if (l.action === 'completed') hourBuckets[h].completed++;
  }
  const hourly: HourStat[] = Object.keys(hourBuckets)
    .map(h => ({ hour: Number(h), total: hourBuckets[Number(h)].total, completed: hourBuckets[Number(h)].completed }))
    .sort((a, b) => a.hour - b.hour);

  let bestHour: number | null = null;
  let bestCount = 0;
  for (const h of hourly) {
    if (h.completed > bestCount) { bestCount = h.completed; bestHour = h.hour; }
  }

  // Style breakdown
  const styleBuckets: Record<string, { count: number; completed: number }> = {};
  for (const l of inRange) {
    const k = l.style || 'inkWash';
    if (!styleBuckets[k]) styleBuckets[k] = { count: 0, completed: 0 };
    styleBuckets[k].count++;
    if (l.action === 'completed') styleBuckets[k].completed++;
  }
  const byStyle = Object.keys(styleBuckets).map(k => ({
    style: k as NotificationStyleKey,
    count: styleBuckets[k].count,
    completionRate: styleBuckets[k].count > 0 ? styleBuckets[k].completed / styleBuckets[k].count : 0,
  })).sort((a, b) => b.count - a.count);

  // Week-over-week
  let weekOverWeekDelta: number | null = null;
  if (prevRange) {
    const prevLogs = logs.filter(l => l.timestamp >= prevRange.start && l.timestamp < prevRange.end);
    const prevCompleted = prevLogs.filter(l => l.action === 'completed').length;
    weekOverWeekDelta = totals.completed - prevCompleted;
  }

  return {
    range,
    totals,
    completionRate,
    activeDays,
    longestStreak: longest,
    weekOverWeekDelta,
    daily,
    byTask,
    hourly,
    bestHour,
    byStyle,
    message: pickMessage(totals.completed, completionRate, longest, activeDays),
  };
}

function pickMessage(completed: number, rate: number, streak: number, activeDays: number): string {
  if (completed === 0) {
    return '本周没有完成记录，没关系，新的一周我们慢慢来。';
  }
  if (rate >= 0.7 && streak >= 5) {
    return `连续 ${streak} 天完成提醒，这种节奏值得为你鼓掌。`;
  }
  if (rate >= 0.5) {
    return `本周完成 ${completed} 次，节奏稳定，继续保持。`;
  }
  if (activeDays >= 5) {
    return `本周保持了 ${activeDays} 天的活跃，习惯正在生根。`;
  }
  return `本周完成 ${completed} 次，已经迈出了第一步。`;
}

/* ───────────────────────────────────────────────────────────── */

export const TASK_LABELS: Record<TaskType, string> = {
  hydration: '喝水',
  eyeCare: '眼睛',
  movement: '活动',
};

export const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];
