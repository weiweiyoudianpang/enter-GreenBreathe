# 🌿 青植呼吸 GreenBreathe

**用温柔的方式，提醒你关爱自己 —— 但永远不会打断你的工作流**

一款基于MBTI性格的极简主义浏览器健康关怀插件，通过玻璃球盆栽美学与科学依据的温柔表达，提醒你定时喝水、眼保健操、微运动。

---

## 🌍 支持平台

✅ **Windows 11 / 10**  
✅ **macOS** (Monterey+)  
✅ **Linux** (Ubuntu / Fedora / Debian / Arch)

✅ **Chrome** (88+)  
✅ **Edge** (88+)  
✅ **Brave / Opera**

---

## ⚡ 快速开始

### Windows 11
```powershell
# 1. 安装 Node.js + pnpm
winget install OpenJS.NodeJS.LTS
npm install -g pnpm

# 2. 解压项目并进入
cd C:\path\to\greenbreathe-export

# 3. 安装并构建
pnpm install
pnpm build:extension

# 4. 加载到 Chrome
# 打开 chrome://extensions/ → 启用开发者模式 → 加载 dist 文件夹
```

### macOS
```bash
# 1. 安装 Node.js + pnpm
brew install node
npm install -g pnpm

# 2. 解压并进入
cd ~/Downloads/greenbreathe-export

# 3. 安装并构建
pnpm install
pnpm build:extension

# 4. 加载到 Chrome
# Cmd + Shift + Delete → 扩展程序 → 开发者模式 → 加载 dist 文件夹
```

### Linux
```bash
# 1. 安装 Node.js + pnpm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pnpm

# 2. 解压并进入
cd ~/Downloads/greenbreathe-export

# 3. 安装并构建
pnpm install
pnpm build:extension

# 4. 加载到 Chrome
# Ctrl + Shift + Delete → 扩展程序 → 开发者模式 → 加载 dist 文件夹
```

📖 **详细安装指南**: [INSTALL_GUIDE.md](./INSTALL_GUIDE.md)（完整跨平台说明）

---

## 🎯 四大核心卖点

### 1. 🎯 穿透不干扰（⭐⭐⭐⭐⭐）

**终极用户体验 - 解决"能不能用"**

传统通知的痛点：
- ❌ 遮挡操作区域，必须关闭才能继续
- ❌ 抢占焦点，打断思维流程
- ❌ 全屏/视频时强制弹出，体验极差

青植呼吸的解决方案：
- ✅ **6重智能避让系统**
  - 全屏模式检测
  - 视频播放检测
  - 音频通话检测
  - 输入框激活检测
  - 用户活跃度监测
  - 快速滚动/移动检测

- ✅ **穿透点击架构**
  ```css
  /* 通知容器完全穿透 */
  pointer-events: none;
  
  /* 仅按钮区域可交互 */
  .button { pointer-events: auto; }
  ```

- ✅ **实际场景验证**
  - 正在视频会议 → 延迟提醒
  - 正在输入文字 → 延迟提醒
  - 全屏观看视频 → 延迟提醒
  - 快速滚动页面 → 延迟提醒
  - 鼠标高速移动 → 延迟提醒

**对比传统通知**：

| 场景 | 传统通知 | 青植呼吸 |
|------|---------|---------|
| 全屏视频 | ❌ 强制弹出，遮挡画面 | ✅ 检测到全屏，自动延迟 |
| 输入文字 | ❌ 遮挡输入框，打断思路 | ✅ 检测到输入，等待完成 |
| 视频会议 | ❌ 突然出现，尴尬 | ✅ 检测到音频，智能避让 |
| 快速滚动 | ❌ 遮挡内容，影响浏览 | ✅ 监测活跃度，暂缓显示 |
| 点击通知下方 | ❌ 必须先关闭通知 | ✅ 直接穿透点击，无阻碍 |

---

### 2. 🎨 水墨审美（⭐⭐⭐⭐）

**视觉愉悦 - 解决"第一印象"**

**玻璃球盆栽主题**：
- 🌿 温暖米白背景（#f7f5f0）
- 🌿 鲜活黄绿主色（#b3d86f）
- 🌿 半透明毛玻璃质感（75% opacity + 20px blur）
- 🌿 柔和绿色阴影（rgba(168, 213, 94, 0.12)）
- 🌿 三层水墨晕染动画（0.6s / 1.0s / 1.5s）

**设计理念**：
> 就像室内的玻璃球盆栽 —— 清透、鲜活、优雅存在

**视觉元素**：
```
┌─────────────────────────────┐
│  [水墨晕染背景 - 三层叠加]  │
│                             │
│  🌿 青植关怀 · INFP 16:30  │ ← 玻璃质感顶栏
│  ─────────────────────────  │
│  "你滋润了那么多心灵，     │ ← MBTI鼓励语
│   也记得滋润自己呀~"       │   (≤30字)
│                             │
│  💧 喝200ml温水             │ ← 科学指令
│  ↑ 轻度脱水致注意力↓17%    │   + 文献依据
│  (Human Brain Mapping,2018) │
│                             │
│  [了解啦~] [已完成✓] [稍后] │ ← 交互按钮
│                             │
│  🌱 (植物成长中...)         │ ← 游戏化元素
└─────────────────────────────┘
```

---

### 3. 🌱 植物成长（⭐⭐⭐）

**正向激励 - 解决"会不会坚持"**

- ✅ **每次完成任务，植物长出一片新叶**
- ✅ **SVG描边动画（2.5秒舒展生长）**
- ✅ **10级成长路径，解锁不同形态**
- ✅ **4种植物：竹、兰、菊、梅**

**心理学原理**：
- 即时反馈：立即看到成长
- 可视化进度：清晰的成就感
- 收集欲望：解锁更多植物形态
- 损失厌恶：不想"断掉"成长

---

### 4. 💬 MBTI个性化（⭐⭐）

**情感共鸣 - 解决"会不会推荐"**

**180条鼓励语库**：
- 通用30条 + 5个主要类型各30条
- INTJ / INTP / INFP / ESTJ / ENFP

**风格差异**：

| 任务 | INTJ（理性） | INFP（情感） |
|------|------------|------------|
| 喝水 | "系统检测到逻辑引擎冷却液不足，建议补充200ml" | "你滋润了那么多心灵，也记得滋润自己呀~" |
| 眼睛 | "视觉传感器疲劳度达阈值，执行20-20-20协议" | "让目光穿越屏幕，去捕捉窗外的绿意吧" |
| 运动 | "战略休息：2分钟微运动，提升后续效率23%" | "身体想和你一起跳支小小的舞呢~" |

---

## 📋 功能特性

### 三个独立的提醒间隔

| 类型 | 默认值 | 范围 | 科学依据 |
|------|--------|------|---------|
| 💧 喝水提醒 | 45分钟 | 0-120分钟 | 每30-60分钟补充150-200ml，保持水分平衡 |
| 👁️ 眼睛休息 | 20分钟 | 0-120分钟 | 20-20-20法则：每20分钟看20英尺外20秒 |
| 🏃 身体活动 | 60分钟 | 0-120分钟 | 每60分钟站立活动2-5分钟，改善久坐 |

**0分钟 = 不提醒**（可单独关闭某类型提醒）

### 8条科学指令

每条指令包含：
- ✅ 具体操作步骤
- ✅ 真实医学文献依据
- ✅ MBTI个性化表达
- ✅ 预估完成时长

**文献来源**：
- Nutrients 2018
- Journal of Optometry 2015
- British Journal of Sports Medicine 2019
- Human Brain Mapping 2018
- Circulation 2017

---

## 🎨 玻璃球盆栽主题

**配色方案**：
```css
/* 浅色模式 */
--background: #f7f5f0;      /* 温暖米白 */
--primary: #b3d86f;         /* 鲜活黄绿 */
--secondary: #b3d9b3;       /* 柔和草绿 */
--text: #334d3a;            /* 深绿文字 */
--glass-bg: rgba(255, 255, 255, 0.75);
--glass-blur: 20px;
```

**玻璃效果组件**：
- `.glass-card` - 卡片容器
- `.glass-input` - 输入框
- `.glass-button` - 按钮
- `.slider-plant` - 植物滑块

---

## 📚 文档导航

### 快速开始
- 📖 **[INSTALL_GUIDE.md](./INSTALL_GUIDE.md)** - 跨平台安装指南（Win/Mac/Linux）
- 🚀 **[QUICKSTART.md](./QUICKSTART.md)** - 5分钟快速上手
- 🔧 **[BUILD_INSTRUCTIONS.md](./BUILD_INSTRUCTIONS.md)** - 详细构建说明

### 深入了解
- 🌟 **[FEATURES.md](./FEATURES.md)** - 四大卖点深度解析（12000字）
- 🎨 **[GLASS_PLANT_UPDATE.md](./GLASS_PLANT_UPDATE.md)** - 玻璃球盆栽主题说明
- 📊 **[PRIORITY_UPDATE.md](./PRIORITY_UPDATE.md)** - 卖点优先级调整说明

### 测试和演示
- 🧪 **[LOCAL_TESTING_GUIDE.md](./LOCAL_TESTING_GUIDE.md)** - 完整测试指南
- 🎬 **[DEMO_GUIDE.md](./DEMO_GUIDE.md)** - 演示页面使用说明
- 📝 **[demo.html](./demo.html)** - 交互式效果演示

### 其他
- 📄 **[README_EXTENSION.md](./README_EXTENSION.md)** - 扩展技术细节
- ✅ **[CHECKLIST.md](./CHECKLIST.md)** - 功能完成检查清单
- 📜 **[LICENSE](./LICENSE)** - MIT 开源许可证

---

## 💻 技术栈

- **框架**: React 18 + TypeScript
- **构建**: Vite 7 + Rollup
- **样式**: Tailwind CSS + CSS Variables
- **组件**: shadcn/ui (60+ 组件)
- **扩展**: Chrome Extension Manifest V3
- **存储**: Chrome Storage Local API
- **动画**: CSS Keyframes + SVG Animation

---

## 🔒 隐私保护

- ✅ **所有数据本地存储**（Chrome Storage Local）
- ✅ **零云端同步**
- ✅ **无网络请求**
- ✅ **无用户追踪**
- ✅ **完全离线可用**

---

## 📊 项目统计

```
源代码：     109 个文件
代码量：     ~4500 行
文档：       12 份完整文档
鼓励语库：   180 条（5种MBTI × 30条 + 通用30条）
科学指令：   8 条（含真实文献引用）
UI组件：     60+ shadcn/ui 组件
项目大小：   6.8 MB（含资源）
```

---

## 🎯 使用场景

| 用户群体 | 使用场景 | 核心痛点 |
|---------|---------|---------|
| 办公室职员 | 长时间面对电脑 | 久坐、视疲劳、忘记喝水 |
| 开发者 | 深度编码工作 | 时间感知弱，缺乏外部提醒 |
| 学生群体 | 网课/自习 | 用眼过度，作息不规律 |
| 创意工作者 | 灵感迸发时 | 沉浸状态不愿被打断 |

---

## 🚀 路线图

### ✅ MVP 已完成
- [x] 6重智能避让系统
- [x] 玻璃球盆栽主题
- [x] 三个独立提醒间隔
- [x] 180条MBTI鼓励语
- [x] 8条科学指令
- [x] 植物成长系统
- [x] 跨平台支持（Win/Mac/Linux）

### 🔄 二期计划
- [ ] 16种MBTI专属提示音
- [ ] 自定义背景图片上传
- [ ] 完整260条鼓励语（16型 × 15条 + 通用20条）
- [ ] 免打扰时段精细设置
- [ ] 数据导出/导入功能
- [ ] 多语言支持（英文版）

---

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

---

## 📜 许可证

MIT License - 详见 [LICENSE](./LICENSE)

---

## 🌟 Slogan

> **就像玻璃球中的绿植，清透而鲜活**  
> **温柔提醒，从不打扰**

---

## 📞 获取帮助

- 📖 阅读 [INSTALL_GUIDE.md](./INSTALL_GUIDE.md) 了解跨平台安装
- 🧪 查看 [LOCAL_TESTING_GUIDE.md](./LOCAL_TESTING_GUIDE.md) 进行问题排查
- 🎬 打开 [demo.html](./demo.html) 体验效果演示

---

**🌿 青植呼吸 - 用温柔的方式，提醒你关爱自己**

版本：2.0 - Glass Plant Theme  
更新：2026-04-17  
支持：Windows 11 / macOS / Linux
