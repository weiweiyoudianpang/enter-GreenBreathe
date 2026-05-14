# GreenBreathe v4.0 — 真实数据 + 周报告 + 抗免疫升级

## Context（为什么做这次改动）

用户使用两周后反馈了两个核心问题：

1. **开机即弹**：新一天打开浏览器后，旧的 alarm 立即触发，体验突兀。
2. **使用免疫**：固定的视觉/位置/文案让大脑建立"忽略模式"，无法形成习惯，反而产生厌烦。

同时发现现有完成度判定虚高（无意识点掉就算"完成"），导致任何统计都不可信。

本次升级目标：
- 修掉"开机即弹"——跨日重置
- 让数据真实——三态被动判定
- 让体验有变化——随机位置 + 视觉风格轮换
- 让习惯有反馈——每周仪式感周报，可分享朋友圈

明确不做：虚拟植物养成、好友/排行榜、强制行为确认（避免流氓化）。

---

## 一、跨日重置（修开机即弹）

**修改文件**：`src/extension/background.ts` 中 `resetAlarms()`（第 49-87 行）。

**逻辑**：在 `createSmartAlarm` 中新增"跨日判定"——
- 若 `lastFired === 0` 或 `elapsed >= intervalMs`：原逻辑（下一个完整间隔后触发）
- 若 `lastFired` 与 `now` **不在同一自然日** 且 `elapsed >= 4 * 60 * 60 * 1000`（≥4 小时）：视为"新一天"，重置为 `now + intervalMs`，同时清空该任务的 `lastTrigger` 时间
- 其它情况：维持原逻辑

**额外**：在 `chrome.runtime.onStartup` 触发时，加 5 分钟的"启动宽限期"——若该任务下次预定触发时间在 `now + 5min` 之内，强制延后到 `now + 5min`。

---

## 二、随机显示位置选项（4 角随机）

**类型层** `src/types/extension.ts` 第 10 行：
```ts
export type NotificationPosition = 'top_right' | 'top_left' | 'bottom_right' | 'bottom_left' | 'random';
```

**Options 设置页** `src/pages/Options.tsx` 第 27 行：在 `<select>` 选项中加入 `{ value: 'random', label: '4 角随机' }`。

**Content Script** `src/extension/content.ts` 第 206 行：
```ts
let position = profile.notificationPosition || 'top_right';
if (position === 'random') {
  const corners = ['top_right', 'top_left', 'bottom_right', 'bottom_left'];
  position = corners[Math.floor(Math.random() * corners.length)];
}
```

CSS 第 444-447 行已定义 4 个角的样式，无需新增。

---

## 三、视觉风格轮换（4 种风格）

**新建文件** `src/lib/notificationStyles.ts`：导出 4 种风格的色板与样式 token：
- `inkWash`（水墨风，沿用现有）
- `gongbi`（国风工笔，金色描线 + 朱砂红印章感）
- `pixel`（像素风，8-bit 字体 + 像素描边 + 噪点纹理）
- `paper`（纸艺风，米色质感 + 折纸阴影 + 牛皮纸边）

每种风格定义：
```ts
{ key, name, contentBg, contentBorder, textPrimary, textSecondary,
  buttonBg, buttonHover, fontFamily, extraDecorations? }
```

**Content Script** `src/extension/content.ts`：
- 第 226-227 行下方新增：从 4 种风格中随机选 1 种（每次提醒都换）
- 替换原 `theme.contentBg` / `theme.contentBorder` 等硬编码为当前风格 token
- Canvas 水墨动画在非 `inkWash` 风格时使用对应的简化效果（工笔→金线扫描，像素→像素马赛克渐显，纸艺→纸张展开）—— 复用 `InkWashCanvas` 接口，新增 `mode` prop

**注**：动画 mode 切换可作为 V1 简化（动画统一保留水墨晕开，仅卡片视觉换风格），下版本再做动画差异化。最终方案：**V1 仅卡片视觉差异化（背景、字体、按钮、边框），动画统一**，既能让用户感知新鲜，又不增加过多工作量。

---

## 四、完成判定方案 3（被动信号识别）

### 数据模型扩展
**修改文件** `src/types/extension.ts`：

```ts
// 新增三态
export type InteractionAction = 'completed' | 'snoozed' | 'ignored';

export interface InteractionLog {
  timestamp: number;          // 触发时间
  action: InteractionAction;
  taskType: TaskType;
  shownDurationMs?: number;   // 卡片实际展示时长（用于审计）
  reason?: 'user_completed' | 'user_snoozed' | 'fast_dismiss' | 'timeout' | 'window_blur';
}
```

### 判定逻辑
**修改文件** `src/extension/content.ts`（第 270-410 行区域）：

| 判定 | 触发条件 | reason |
|------|---------|--------|
| `completed` | 卡片 ≥ 3 秒后点"我已完成" | `user_completed` |
| `snoozed` | 主动点"稍后再说" | `user_snoozed` |
| `ignored` | 卡片 < 3 秒被点掉 | `fast_dismiss` |
| `ignored` | 展示满 `cardDisplayDuration` 仍无交互 | `timeout` |
| `ignored` | 卡片显示 5 秒内 `window.blur` | `window_blur` |

**按钮调整**：原 `randomAction` 单按钮 → 三按钮并排：
- "稍后再说"（中性灰）
- "忽略"（淡灰，可选省略，因 timeout 即可代替）
- "我已完成"（高亮主色，<3 秒置灰禁用，倒计时显示 `(2s)`）

实现要点：
- 在 `showNotification` 内记录 `shownAt = Date.now()`
- 注册 `window.addEventListener('blur', ...)` 5 秒内触发 → 计入 `ignored / window_blur`
- 倒计时启用按钮通过 `setTimeout(() => btn.disabled = false, 3000)`

### 日志写入
**修改文件** `src/extension/content.ts` 中 `logInteraction()`（第 402 行）：
- 接收新参数 `action: InteractionAction`、`reason`、`shownDurationMs`
- 同步 `Notification.tsx`（第 51-71 行）的窗口模式逻辑保持一致

### 历史日志保留量
`src/lib/storage.ts` 第 49 行：`logs.slice(-100)` → `logs.slice(-1000)`（周报需要 4 周数据，按平均每天 30 条计 4 周约 840 条）。

---

## 五、周报告（D 方案：嵌入卡片 + 全屏新标签页）

### 数据聚合
**新建文件** `src/lib/weeklyReport.ts`：

```ts
export interface WeeklyReport {
  weekStart: number;              // 本周一 00:00 timestamp（ISO 周）
  weekEnd: number;
  totalReminders: number;
  completed: number;
  snoozed: number;
  ignored: number;
  completionRate: number;         // completed / totalReminders
  prevCompletionRate?: number;    // 上周完成率
  byTaskType: Record<TaskType, { total, completed, ignored, snoozed }>;
  hourlyHeatmap: number[24];      // 每小时忽略率
  worstHourRange: string;         // "下午 3-5 点"
  bestTaskType: TaskType;
  worstTaskType: TaskType;
  trendCompletionRates: number[]; // 最近 4 周
  suggestion: { text, action?: { type: 'adjust_interval', taskType, newInterval } };
}

export async function generateWeeklyReport(): Promise<WeeklyReport>;
export function getWeekStart(date = new Date()): Date;  // 周一 00:00
```

**周界定**：周一 00:00 ~ 周日 23:59:59（按用户选择 Q3 = A）。

### 触发机制（D 方案）

**Background** `src/extension/background.ts`：
- 在 `chrome.runtime.onStartup` 与 `chrome.alarms.onAlarm` 中加入 `checkAndShowWeeklyReport()`
- 逻辑：
  1. 读 `lastWeeklyReportShownWeekStart`
  2. 若当前周一 00:00 timestamp > 上次 → 标记本周报告 pending
  3. 当本周第一次普通提醒触发时，**替换为周报告卡片**（在 content script 端），而不是新增打扰
  4. 显示后写入 `lastWeeklyReportShownWeekStart = currentWeekStart`
- 新增 message type `SHOW_WEEKLY_REPORT_CARD`，content script 处理并显示概览卡片，含"查看详细报告"按钮 → `chrome.runtime.sendMessage({ type: 'OPEN_WEEKLY_REPORT' })` → background 调 `chrome.tabs.create({ url: chrome.runtime.getURL('report.html') })`

### 概览卡片（嵌入式，水墨风）

在 `content.ts` 中新增 `showWeeklyReportCard(report)` 函数，结构：
```
┌─────────────────────────────────┐
│   水墨晕开背景                  │
│   你的本周青植呼吸报告           │
│   ━━━━━━━━━━                    │
│      47        18               │
│    总提醒   已完成               │
│   完成率 38%  ↑ 比上周 +6%      │
│   "最容易忽略：下午 3-5 点"     │
│   [ 查看详细报告 → ]            │
└─────────────────────────────────┘
```

### 详细报告页（全屏新标签页，5 分页）

**新建入口** `report.html`（root: `#report-root`，复用 `index.css`）。

**新建页面** `src/pages/Report.tsx` + 子组件：
- `src/pages/Report.tsx`：主容器，加载 `WeeklyReport` 数据，5 页向下滚动（`scroll-snap-type: y mandatory`），每页 `100vh`
- `src/components/report/PageOverview.tsx`：大数字 + 圆环图（用 SVG 自绘，避免引入 chart 库）
- `src/components/report/PageHourly.tsx`：24 小时热力图（SVG 网格）
- `src/components/report/PageByTask.tsx`：3 类任务对比柱状图
- `src/components/report/PageTrend.tsx`：4 周折线图
- `src/components/report/PageSuggestion.tsx`：1-2 条建议 + "一键应用"按钮 + "生成分享图片"按钮

每页底部有"↓ 继续"提示，最后一页有"返回顶部"。

**新建** `src/main-report.tsx`：`createRoot(...).render(<Report />)`

### 分享图片生成（B 方案：Spotify Wrapped 风格 9:16 海报）

**新建组件** `src/components/report/ShareablePoster.tsx`：
- 9:16 比例（720 × 1280px）固定尺寸
- 全屏视觉：水墨背景 + 大字数据 + Logo + 用户昵称 + 一句话洞察 + 二维码（GitHub 项目地址）
- 用 `html-to-image` 库生成 PNG，用户可下载或一键分享

**依赖**：需要 `html-to-image`（轻量、零依赖、纯前端）。

实现位置：`PageSuggestion.tsx` 中"生成分享图片"按钮触发 → 渲染隐藏 `ShareablePoster` → `htmlToImage.toPng(node)` → 触发下载 `greenbreathe-week-2026W17.png`。

### Vite 多入口
**修改文件** `vite.config.ts`（第 30-37 行）：在 `rollupOptions.input` 中加入：
```ts
report: path.resolve(__dirname, 'report.html'),
```

**修改文件** `public/manifest.json` 第 46 行：`web_accessible_resources.resources` 加入 `"report.html"`。

### Popup 入口
**修改文件** `src/pages/Popup.tsx`（约第 200-220 行附近的"今日完成"区域）：
- 新增"本周报告 →"卡片入口（每周一刷新可见徽章），点击 `chrome.tabs.create({ url: chrome.runtime.getURL('report.html') })`

---

## 六、文件清单（汇总）

### 新建
- `src/lib/notificationStyles.ts` — 4 种风格 tokens
- `src/lib/weeklyReport.ts` — 周报数据聚合
- `src/pages/Report.tsx` — 周报详细页
- `src/main-report.tsx` — Report 入口
- `src/components/report/PageOverview.tsx`
- `src/components/report/PageHourly.tsx`
- `src/components/report/PageByTask.tsx`
- `src/components/report/PageTrend.tsx`
- `src/components/report/PageSuggestion.tsx`
- `src/components/report/ShareablePoster.tsx`
- `report.html` — 报告页 HTML 入口

### 修改
- `src/types/extension.ts` — `NotificationPosition` + `random`，`InteractionAction`，`InteractionLog` 字段扩展
- `src/lib/storage.ts` — 日志保留量 100 → 1000
- `src/extension/background.ts` — 跨日重置、启动宽限期、周报触发、`OPEN_WEEKLY_REPORT` 处理
- `src/extension/content.ts` — 随机位置、风格轮换、三按钮 + 三态判定、blur 监听、周报概览卡片
- `src/pages/Notification.tsx` — 同步三态判定逻辑（窗口模式 fallback）
- `src/pages/Options.tsx` — `notificationPosition` 选项加 random
- `src/pages/Popup.tsx` — 周报入口卡片
- `vite.config.ts` — 加入 `report` 入口
- `public/manifest.json` — `web_accessible_resources` 加入 `report.html`

### 依赖新增
- `html-to-image`（用于生成可分享 PNG）

---

## 七、Verification（怎么验收）

### 自动校验
1. `pnpm run lint`：0 errors。
2. `npx vite build --mode extension && node scripts/post-build.js`：`dist-extension/` 包含 `report.html`、`assets/main-report-*.js`。

### 手动测试清单

**A. 跨日重置**
1. 设置 `lastTrigger` = 昨天 18:00（mock），间隔 60 分钟。
2. 重启浏览器，应延后到 `now + 60min`，而不是立即触发。
3. `console` 应输出 `[GreenBreathe] cross-day reset for hydration`。

**B. 启动宽限期**
1. 浏览器启动时，若某任务下次触发时间在 5 分钟内 → 应延后到 5 分钟后。

**C. 随机位置**
1. Options 页选 "4 角随机"，触发 5 次测试通知，应分别落在 4 个角且分布合理。

**D. 视觉风格轮换**
1. 触发 4 次测试通知，应能看到 4 种不同的卡片视觉风格（背景/字体/按钮）。

**E. 三态判定**
1. 卡片显示 < 3 秒就关掉 → 日志 `ignored / fast_dismiss`。
2. 卡片显示 ≥ 3 秒后点"我已完成" → `completed / user_completed`。
3. 卡片显示 ≥ 3 秒后点"稍后" → `snoozed / user_snoozed`。
4. 卡片显示后切走窗口（5 秒内）→ `ignored / window_blur`。
5. 不动鼠标，等到 `cardDisplayDuration` 自动消失 → `ignored / timeout`。
6. "我已完成"按钮在卡片显示 < 3 秒时为禁用（带倒计时文案）。

**F. 周报告**
1. mock 一周（7 天）日志数据。
2. 周一第一次提醒应替换为"本周报告"概览卡片。
3. 点"查看详细报告"打开新标签页，可滚动 5 页。
4. Popup 顶部应显示"本周报告 →"入口。
5. "生成分享图片"按钮应下载 720×1280 PNG。

**G. 数据真实性**
1. 卡片自动消失（timeout）不应再被记为 completed（验证 Notification.tsx 修复）。
2. 周报"忽略次数"应反映真实未交互次数。

---

## 八、范围之外（明确不做）

- 虚拟植物养成系统
- 好友 / 排行榜 / 打卡群组
- 后端账号系统
- 强制行为确认（如长按、咕咚、倒计时）
- AI 智能分析（基于规则即可）
- 节气 / 天气感知文案
- 不同视觉风格对应不同动画（仅卡片视觉差异，动画统一保留水墨）
