# 青植呼吸 GreenBreathe - Electron 桌面应用 PRD

## 📋 文档信息
- **项目名称**：青植呼吸 GreenBreathe
- **版本**：2.0（Electron 桌面版）
- **日期**：2026-04-17
- **状态**：需求确认中

---

## 1. 项目背景

### 1.1 为什么要从 Chrome 扩展迁移到 Electron？

**Chrome 扩展的致命限制：**
1. ❌ 通知依赖单一标签页，切换标签后无法显示
2. ❌ 无法实现"始终置顶"功能（浏览器安全限制）
3. ❌ 需要打开F12控制台才能正常加载
4. ❌ Content Script 加载不稳定，用户体验差

**Electron 的核心优势：**
1. ✅ 真正的"始终置顶"窗口（`alwaysOnTop: true`）
2. ✅ 独立于浏览器运行，不受标签页影响
3. ✅ 稳定可靠的定时提醒机制
4. ✅ 完全自定义的 UI/UX
5. ✅ 跨平台支持（Windows、macOS、Linux）

### 1.2 产品定位

**一款基于 MBTI 性格理论的智能健康提醒桌面应用**

- 🎯 **核心价值**：通过个性化、艺术化的提醒方式，帮助长时间使用电脑的用户养成健康习惯
- 🌿 **设计理念**：将健康提醒变成一种"呼吸"般自然、舒适的体验
- 🎨 **视觉风格**：水墨艺术 + 毛玻璃质感 + 自然植物意象

---

## 2. 用户画像

### 2.1 目标用户

**主要用户群体：**
- 👨‍💻 程序员、设计师、文字工作者（长时间电脑工作者）
- 🎓 学生（在线学习、写论文、查资料）
- 💼 办公室白领（文档编辑、数据处理、邮件沟通）

**用户特征：**
- 年龄：20-45 岁
- 工作时长：每天使用电脑 6-12 小时
- 健康意识：中高（知道需要休息，但经常忘记）
- 科技接受度：高（愿意尝试新工具）
- 审美要求：中高（不喜欢简陋的系统提醒）

### 2.2 用户痛点

1. **容易忘记喝水**：沉浸工作时忘记补充水分，导致脱水、头痛
2. **眼睛疲劳**：长时间盯屏幕，眼睛干涩、视力下降
3. **久坐危害**：腰酸背痛、颈椎问题、血液循环不良
4. **提醒工具体验差**：
   - 系统提醒太生硬，像"命令"一样
   - 通用提醒文案无法产生共鸣
   - UI 丑陋，打断工作流

### 2.3 用户期望

- 🎯 **提醒要有效**：在需要时精准出现，不能太频繁也不能太少
- 🌸 **提醒要温柔**：像朋友关心，而非机械命令
- 🎨 **界面要美**：赏心悦目，不反感被打断
- 🧠 **懂我**：根据我的性格特点，用我喜欢的方式说话
- ⚙️ **可控**：我能自定义间隔、背景、位置等

---

## 3. 核心功能需求

### 3.1 功能清单（MVP）

#### 功能 1：三种健康提醒
**需求描述：**
- **喝水提醒**：定时提醒用户补充水分（默认 45 分钟）
- **护眼提醒**：提醒用户眼睛休息（默认 20 分钟，20-20-20 法则）
- **运动提醒**：提醒用户站起来活动（默认 60 分钟）

**技术要求：**
- 使用 Electron 的 `setInterval` 或系统级定时器
- 每种提醒独立计时，互不干扰
- 支持用户自定义间隔（5-180 分钟）
- 支持"免打扰时段"（如 22:00-06:00）

#### 功能 2：MBTI 个性化文案
**需求描述：**
- 支持 16 种 MBTI 性格类型
- 每种性格 × 3 种提醒类型 × 10 条随机文案（共 480 条）
- 根据用户选择的 MBTI 类型，匹配对应的鼓励语风格

**文案风格示例：**
- **INTJ（战略家）**："系统检测到逻辑引擎冷却液不足，建议补充200ml"
- **INFP（调停者）**："你滋润了那么多心灵，也记得滋润自己呀"
- **ESTJ（总经理）**："执行补水任务：200ml，5秒完成"
- **ENFP（竞选者）**："喝杯水，让灵感继续冒泡吧"

**技术要求：**
- 文案存储在 JSON 文件中
- 启动时根据 MBTI 类型加载对应文案库
- 每次提醒随机选择一条文案

#### 功能 3：始终置顶通知窗口
**需求描述：**
- 提醒以独立小窗口形式出现
- 窗口始终置顶（`alwaysOnTop: true`）
- 切换应用、标签页时仍然可见
- 支持 4 种显示位置：左上、右上、左下、右下

**窗口规格：**
- 默认尺寸：1280×760（可在设置中选择小/中/大）
- 无边框窗口（frameless）
- 圆角、阴影、毛玻璃效果
- 未互动情况下显示 **30 秒**后自动关闭

**交互行为：**
- 鼠标移入：暂停自动关闭计时器
- 鼠标移出：恢复倒计时
- 点击"了解啦"按钮：立即关闭并记录完成
- 点击窗口外：暂不支持（窗口内点击才有效）

#### 功能 4：精美 UI 设计
**需求描述：**
- **水墨晕开动画**：窗口出现时，从模糊到清晰的 2 秒渐显效果
- **毛玻璃文本框**：底部 30% 区域为白色半透明毛玻璃，文字清晰可读
- **背景图片**：上方 70% 区域显示清晰的植物/自然风景图
- **字体**：微软雅黑，鼓励语 32px，指令 20px

**内置背景图（3张）：**
1. 铜钱草金鱼（水彩风格）
2. 薄荷摄影（实拍绿植）
3. 办公室禅意绿猫（现代禅意）

**自定义背景：**
- 用户可在设置中上传自己的图片（最多 6 张）
- 支持格式：PNG、JPG、JPEG
- 建议尺寸：2K（2560×1440）或 4K
- 图片存储在本地数据库（sqlite）

#### 功能 5：设置中心
**需求描述：**
一个独立的设置窗口，用户可以配置所有参数。

**设置项：**
1. **个人资料**
   - 昵称（可选）
   - MBTI 类型（必选，16 选 1）

2. **提醒设置**
   - 喝水间隔（5-180 分钟，滑动条）
   - 护眼间隔（5-180 分钟）
   - 运动间隔（5-180 分钟）
   - 每种提醒可单独开关（间隔设为 0 即关闭）

3. **外观设置**
   - 通知位置（左上/右上/左下/右下）
   - 卡片尺寸（小 960×570 / 中 1280×760 / 大 1600×950）
   - 背景图片管理（上传、删除、预览）

4. **高级设置**
   - 免打扰时段（如 22:00-06:00）
   - 开机自启动（默认关闭）
   - 声音提示（可选，默认关闭）

5. **测试功能**
   - "立即测试"按钮：立即触发一次随机提醒，方便用户预览效果

#### 功能 6：系统托盘图标
**需求描述：**
- 应用最小化到系统托盘（不占用任务栏）
- 托盘图标：绿色叶子 🌿
- 右键菜单：
  - 「打开设置」
  - 「立即测试提醒」
  - 「暂停提醒（1小时）」
  - 「退出应用」

### 3.2 功能清单（未来迭代）
以下功能暂不实现，留待后续版本：
- ❌ 植物养成系统（用户每完成一次提醒，虚拟植物成长）
- ❌ 数据统计（完成率、健康得分）
- ❌ 云同步（多设备同步设置）
- ❌ 社交功能（邀请好友、排行榜）

---

## 4. 技术架构

### 4.1 技术栈选型

**桌面框架：**
- **Electron** v28+（最新稳定版）
- 原因：成熟稳定、生态丰富、跨平台支持好

**前端框架：**
- **React 19** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui**（复用现有代码）
- **Framer Motion**（水墨动画）

**数据存储：**
- **electron-store**（本地配置存储，替代 chrome.storage）
- **SQLite**（存储自定义背景图片的 base64 数据）

**打包工具：**
- **electron-builder**（生成 Windows .exe、macOS .dmg、Linux .deb）

### 4.2 项目结构

```
greenbreathe-electron/
├── src/
│   ├── main/                 # 主进程代码
│   │   ├── index.ts          # 应用入口
│   │   ├── notification.ts   # 通知窗口管理
│   │   ├── scheduler.ts      # 定时任务调度
│   │   ├── tray.ts           # 系统托盘
│   │   └── storage.ts        # 数据存储封装
│   ├── renderer/             # 渲染进程代码
│   │   ├── settings/         # 设置窗口
│   │   ├── notification/     # 通知窗口
│   │   └── components/       # 共享组件
│   ├── shared/               # 共享代码
│   │   ├── types/            # TypeScript 类型定义
│   │   ├── data/             # MBTI 文案、科学指令
│   │   └── constants.ts      # 常量配置
│   └── assets/               # 静态资源
│       ├── images/           # 内置背景图
│       └── icons/            # 应用图标
├── electron.vite.config.ts   # Vite 配置
├── electron-builder.yml      # 打包配置
└── package.json
```

### 4.3 核心模块设计

#### 模块 1：定时任务调度器（Scheduler）
```typescript
class NotificationScheduler {
  private timers: Map<TaskType, NodeJS.Timeout> = new Map();
  
  start(userProfile: UserProfile): void {
    // 根据用户设置启动三个独立定时器
    if (userProfile.hydrationInterval > 0) {
      this.scheduleTask('hydration', userProfile.hydrationInterval);
    }
    // ...
  }
  
  private scheduleTask(type: TaskType, intervalMinutes: number): void {
    const intervalMs = intervalMinutes * 60 * 1000;
    const timer = setInterval(() => {
      if (!this.isQuietHours()) {
        this.triggerNotification(type);
      }
    }, intervalMs);
    this.timers.set(type, timer);
  }
  
  private isQuietHours(): boolean {
    // 检查是否在免打扰时段
  }
}
```

#### 模块 2：通知窗口管理器（NotificationWindow）
```typescript
class NotificationWindowManager {
  private window: BrowserWindow | null = null;
  
  show(data: NotificationData, position: NotificationPosition, size: CardSize): void {
    // 1. 计算窗口位置（根据 position 和屏幕尺寸）
    const bounds = this.calculateBounds(position, size);
    
    // 2. 创建无边框、置顶窗口
    this.window = new BrowserWindow({
      ...bounds,
      frame: false,
      alwaysOnTop: true,
      skipTaskbar: true,
      transparent: true,
      resizable: false,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      }
    });
    
    // 3. 加载通知页面，传递数据
    this.window.loadURL(`file://${__dirname}/notification.html`);
    this.window.webContents.send('notification-data', data);
    
    // 4. 30秒后自动关闭
    setTimeout(() => this.close(), 30000);
  }
  
  close(): void {
    if (this.window) {
      this.window.close();
      this.window = null;
    }
  }
}
```

#### 模块 3：数据存储（Storage）
```typescript
import Store from 'electron-store';
import Database from 'better-sqlite3';

class DataStorage {
  private store: Store<UserProfile>;
  private db: Database.Database;
  
  constructor() {
    // 用户配置存储
    this.store = new Store<UserProfile>({
      defaults: {
        nickname: '',
        mbtiType: 'INFP',
        hydrationInterval: 45,
        eyeCareInterval: 20,
        movementInterval: 60,
        notificationPosition: 'top_right',
        cardSize: 'medium',
        customBackgrounds: []
      }
    });
    
    // 自定义背景图片存储（SQLite）
    this.db = new Database('greenbreathe.db');
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS backgrounds (
        id INTEGER PRIMARY KEY,
        image_data TEXT NOT NULL,
        created_at INTEGER NOT NULL
      )
    `);
  }
  
  getUserProfile(): UserProfile {
    return this.store.store;
  }
  
  saveUserProfile(profile: UserProfile): void {
    this.store.set(profile);
  }
  
  addCustomBackground(base64: string): void {
    this.db.prepare('INSERT INTO backgrounds (image_data, created_at) VALUES (?, ?)').run(base64, Date.now());
  }
  
  getCustomBackgrounds(): string[] {
    const rows = this.db.prepare('SELECT image_data FROM backgrounds ORDER BY created_at DESC LIMIT 6').all();
    return rows.map(row => row.image_data);
  }
}
```

---

## 5. UI/UX 设计规范

### 5.1 通知窗口设计

**布局结构：**
```
┌────────────────────────────────────────┐
│                                        │ ← 上方 70%：清晰背景图
│        [背景图片 - 植物/自然]          │
│                                        │
├────────────────────────────────────────┤
│ ╔════════════════════════════════════╗ │ ← 下方 30%：毛玻璃文本框
│ ║ [鼓励语，32px，微软雅黑]          ║ │   (白色半透明 + backdrop-filter)
│ ║ [指令 · 科学依据，20px]           ║ │
│ ║              [了解啦 按钮]          ║ │
│ ╚════════════════════════════════════╝ │
└────────────────────────────────────────┘
```

**动画效果：**
1. **入场动画（2秒）**：
   - 0.0s：opacity: 0, blur(20px), scale(0.95)
   - 2.0s：opacity: 1, blur(0), scale(1)
   - 缓动函数：cubic-bezier(0.22, 1, 0.36, 1)

2. **关闭动画（0.5秒）**：
   - 淡出 + 缩小

**颜色规范：**
- 毛玻璃背景：`rgba(255, 255, 255, 0.75)` + `backdrop-filter: blur(16px)`
- 鼓励语颜色：`#1a1a1a`（深灰黑）
- 指令颜色：`#4a4a4a`（中灰）
- 按钮背景：`rgba(74, 222, 128, 0.1)`（浅绿）
- 按钮文字：`#16a34a`（绿色）
- 按钮 hover：`rgba(74, 222, 128, 0.2)`

### 5.2 设置窗口设计

**窗口规格：**
- 尺寸：1000×700
- 可调整大小：是
- 最小尺寸：800×600

**布局：**
- 左侧导航：固定宽度 200px
  - 个人资料
  - 提醒设置
  - 外观设置
  - 高级设置
- 右侧内容区：滚动视图

**设计风格：**
- 与通知窗口保持一致的视觉语言
- 使用 shadcn/ui 组件（复用现有代码）
- 卡片式布局，清晰分组

---

## 6. 数据流设计

### 6.1 应用启动流程
```
1. 主进程启动 (main/index.ts)
   ↓
2. 读取用户配置 (storage.ts)
   ↓
3. 初始化定时任务调度器 (scheduler.ts)
   ↓
4. 创建系统托盘图标 (tray.ts)
   ↓
5. 如果首次启动，显示设置窗口
   ↓
6. 应用进入后台运行状态
```

### 6.2 通知触发流程
```
1. 定时器触发 (scheduler.ts)
   ↓
2. 检查是否在免打扰时段
   ↓ (否)
3. 生成通知数据 (NotificationData)
   - 随机选择 MBTI 文案
   - 随机选择科学指令
   - 随机选择背景图片
   ↓
4. 创建通知窗口 (notification.ts)
   ↓
5. 渲染通知 UI (renderer/notification/)
   ↓
6. 等待用户交互或 30秒自动关闭
   ↓
7. 记录互动日志（可选）
```

### 6.3 设置修改流程
```
1. 用户在设置窗口修改配置
   ↓
2. 点击"保存"按钮
   ↓
3. 验证输入（如：间隔不能为负数）
   ↓
4. 保存到 electron-store
   ↓
5. 通知主进程更新定时器
   ↓
6. 重启调度器 (scheduler.restart())
```

---

## 7. 开发优先级

### Phase 1：基础框架搭建（核心功能）
**目标：**实现最基本的"定时提醒 + 置顶窗口"功能

**任务清单：**
1. ✅ 初始化 Electron 项目
2. ✅ 配置 Vite + React + TypeScript
3. ✅ 实现定时任务调度器（三种独立定时器）
4. ✅ 实现置顶通知窗口（无边框、可关闭）
5. ✅ 迁移现有 React 组件（通知卡片 UI）
6. ✅ 实现数据存储（electron-store）
7. ✅ 测试基本功能

**验收标准：**
- [ ] 应用启动后，按设定间隔弹出通知
- [ ] 通知窗口始终置顶，切换应用不影响
- [ ] 点击按钮可以关闭通知
- [ ] 30秒后自动关闭

### Phase 2：MBTI 个性化 + UI 美化
**目标：**完善 MBTI 文案系统和视觉设计

**任务清单：**
1. ✅ 迁移 480 条 MBTI 文案数据
2. ✅ 实现文案随机选择逻辑
3. ✅ 实现水墨晕开入场动画
4. ✅ 实现毛玻璃文本框样式
5. ✅ 集成 3 张内置背景图
6. ✅ 优化字体、颜色、布局

**验收标准：**
- [ ] 通知文案根据 MBTI 类型匹配
- [ ] 每次提醒文案不重复（至少连续 5 次）
- [ ] 入场动画流畅自然（2秒水墨晕开）
- [ ] 背景图清晰，文本框易读

### Phase 3：设置中心 + 自定义功能
**目标：**允许用户自定义所有参数

**任务清单：**
1. ✅ 创建设置窗口（独立窗口）
2. ✅ 实现个人资料设置（昵称、MBTI）
3. ✅ 实现提醒间隔设置（三个滑动条）
4. ✅ 实现外观设置（位置、尺寸）
5. ✅ 实现自定义背景图片上传
6. ✅ 实现"立即测试"功能
7. ✅ 配置持久化（保存/读取）

**验收标准：**
- [ ] 设置修改后立即生效
- [ ] 自定义背景图片成功显示
- [ ] "立即测试"按钮触发通知
- [ ] 应用重启后设置保留

### Phase 4：系统集成 + 打包发布
**目标：**完善系统级功能，打包为可分发应用

**任务清单：**
1. ✅ 实现系统托盘图标
2. ✅ 实现开机自启动（可选）
3. ✅ 实现免打扰时段
4. ✅ 配置 electron-builder
5. ✅ 打包 Windows .exe
6. ✅ 打包 macOS .dmg
7. ✅ 编写用户手册

**验收标准：**
- [ ] 应用可最小化到托盘
- [ ] 托盘右键菜单功能正常
- [ ] 免打扰时段不弹出通知
- [ ] 打包后的应用可独立运行
- [ ] 安装包大小 < 150MB

---

## 8. 非功能性需求

### 8.1 性能要求
- 应用启动时间：< 3 秒
- 通知弹出响应时间：< 500ms
- 内存占用：< 150MB（空闲状态）
- CPU 占用：< 1%（空闲状态）

### 8.2 兼容性要求
- **Windows**：Windows 10/11（64位）
- **macOS**：macOS 11.0+（支持 Intel 和 Apple Silicon）
- **Linux**：Ubuntu 20.04+、Debian 11+

### 8.3 安全性要求
- 所有数据存储在本地，不上传到任何服务器
- 不收集用户隐私信息
- 不联网（除非未来添加云同步功能）

---

## 9. 验收标准

### 9.1 功能验收
| 功能 | 验收标准 | 优先级 |
|------|----------|--------|
| 定时提醒 | 按设定间隔精准触发（误差 < 5秒） | P0 |
| 始终置顶 | 切换应用、标签页时通知窗口保持可见 | P0 |
| 30秒自动关闭 | 未互动情况下，30秒后窗口自动消失 | P0 |
| MBTI 文案 | 文案与用户选择的 MBTI 类型匹配 | P0 |
| 背景图片 | 支持 3 张内置图 + 最多 6 张自定义图 | P1 |
| 设置持久化 | 修改设置后重启应用，设置保留 | P0 |
| 系统托盘 | 应用可最小化到托盘，右键菜单可用 | P1 |

### 9.2 UI/UX 验收
- 通知窗口符合设计稿（水墨动画、毛玻璃效果）
- 设置窗口布局清晰，交互流畅
- 所有文字使用微软雅黑字体
- 颜色、间距符合设计规范

### 9.3 性能验收
- 应用启动时间 < 3 秒
- 通知弹出无卡顿
- 长时间运行（24小时）无内存泄漏

---

## 10. 风险与挑战

### 10.1 技术风险
| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Electron 打包体积过大 | 用户下载意愿降低 | 使用 asar 压缩、排除无用依赖 |
| 跨平台兼容性问题 | macOS/Linux 用户无法使用 | 在虚拟机中充分测试，提供降级方案 |
| 自定义背景图片过大 | 应用卡顿、占用空间 | 限制单张图片 < 2MB，压缩后存储 |

### 10.2 用户体验风险
| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 提醒频率过高 | 用户觉得烦扰 | 默认间隔设置合理（45/20/60分钟），允许用户调整 |
| 文案不符合预期 | 用户觉得"不懂我" | 充分测试 MBTI 文案，提供反馈渠道 |
| 通知被忽略 | 用户养成"无视"习惯 | 30秒强制显示 + 精美设计吸引注意 |

---

## 11. 未来规划

### 11.1 版本迭代路线
- **v2.0**（MVP）：基础定时提醒 + MBTI 文案 + 置顶窗口
- **v2.1**：植物养成系统（完成提醒 → 植物成长）
- **v2.2**：数据统计（完成率、健康得分、周报）
- **v2.3**：云同步（多设备设置同步）
- **v3.0**：AI 智能提醒（根据用户行为自适应调整）

### 11.2 商业化可能性
- 免费版：基础功能
- 专业版（$9.9/年）：
  - 解锁更多 MBTI 文案
  - 无限自定义背景图
  - 云同步
  - 高级数据统计

---

## 12. 附录

### 12.1 现有代码资产清单
可复用的代码（从 Chrome 扩展迁移）：
- ✅ `src/types/extension.ts` - TypeScript 类型定义
- ✅ `src/data/mbtiMessages.ts` - 480 条 MBTI 文案
- ✅ `src/data/scientificInstructions.ts` - 科学指令库
- ✅ `src/pages/Notification.tsx` - 通知卡片 UI 组件
- ✅ `src/pages/Options.tsx` - 设置页面组件（需调整）
- ✅ `src/components/ui/*` - shadcn/ui 组件库
- ✅ `src/lib/storage.ts` - 存储逻辑（需改为 electron-store）
- ✅ `public/images/*` - 3 张内置背景图

### 12.2 需要新增的代码
- 🆕 `src/main/index.ts` - Electron 主进程入口
- 🆕 `src/main/scheduler.ts` - 定时任务调度器
- 🆕 `src/main/notification.ts` - 通知窗口管理
- 🆕 `src/main/tray.ts` - 系统托盘
- 🆕 `electron.vite.config.ts` - Vite 配置
- 🆕 `electron-builder.yml` - 打包配置

### 12.3 关键文件路径
```
/workspace/thread/src/types/extension.ts         # 类型定义
/workspace/thread/src/data/mbtiMessages.ts       # MBTI 文案
/workspace/thread/src/data/scientificInstructions.ts  # 科学指令
/workspace/thread/src/pages/Notification.tsx     # 通知组件
/workspace/thread/src/pages/Options.tsx          # 设置组件
/workspace/thread/public/images/                 # 内置背景图
/workspace/thread/src/lib/storage.ts             # 存储逻辑
```

---

## 13. 总结

**青植呼吸 Electron 版的核心价值：**
1. 🎯 **真正的置顶提醒**：解决 Chrome 扩展的致命缺陷
2. 🧠 **懂你的个性化**：16 种 MBTI × 480 条文案
3. 🎨 **极致的美学体验**：水墨动画 + 毛玻璃 + 自然意象
4. ⚙️ **完全的可定制性**：间隔、背景、位置、尺寸
5. 🔒 **绝对的隐私保护**：所有数据本地存储，不联网

**成功的关键：**
- 将"提醒"变成一种"享受"，而非打扰
- 用艺术化、个性化的方式，让用户愿意被提醒
- 技术稳定可靠，不出现 bug 影响体验

---

**文档状态：** ✅ 待用户确认
