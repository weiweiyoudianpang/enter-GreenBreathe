# 青植呼吸 GreenBreathe

**用温柔的方式，提醒你关爱自己 -- 但永远不会打断你的工作流**

一款基于 MBTI 性格的极简主义浏览器健康关怀插件，通过水墨渐显动画与科学依据的温柔表达，提醒你定时喝水、护眼休息、起身微运动。

---

## 支持平台

**操作系统**: Windows 11 / 10 | macOS (Monterey+) | Linux (Ubuntu / Fedora / Debian / Arch)

**浏览器**: Chrome (88+) | Edge (88+) | Brave | Opera

---

## 快速开始

### Windows

```powershell
winget install OpenJS.NodeJS.LTS
npm install -g pnpm
cd C:\path\to\greenbreathe-export
pnpm install
pnpm build:extension
# 打开 chrome://extensions/ -> 启用开发者模式 -> 加载已解压的扩展程序 -> 选择 dist-extension 文件夹
```

### macOS

```bash
brew install node
npm install -g pnpm
cd ~/Downloads/greenbreathe-export
pnpm install
pnpm build:extension
# 打开 chrome://extensions/ -> 启用开发者模式 -> 加载 dist-extension 文件夹
```

### Linux

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install -g pnpm
cd ~/Downloads/greenbreathe-export
pnpm install
pnpm build:extension
# 打开 chrome://extensions/ -> 启用开发者模式 -> 加载 dist-extension 文件夹
```

---

## 核心特性

### 1. 日间 / 夜间 / 自动主题

三套完整的视觉主题，覆盖所有页面（设置页、弹出面板、通知卡片、演示页）。

| 模式 | 配色 | 适用时段 |
|------|------|---------|
| 日间模式 | 清新绿白色调，翡翠绿强调色，白色毛玻璃卡片 | 手动选择 |
| 夜间模式 | 深海蓝底色，薄荷绿强调色，暗色半透明卡片 | 手动选择 |
| 自动模式 | 根据系统时间自动切换（6:00-18:00 为日间） | 默认 |

每套主题配有独立的背景图库（日间 3 张 / 夜间 3 张），支持自定义上传（单张上限 10MB）。

---

### 2. Canvas 水墨渐显动画

通知卡片的背景图以有机水墨扩散的方式逐步显现，每次动画图案随机生成，绝不重复。

**技术实现**:
- 4-6 个主墨滴从随机位置开始扩散
- 64 段多正弦噪声函数生成有机边缘
- 卫星子墨滴模拟水墨触须效果
- 双层绘制 + 0.12 透明度实现柔和羽化边缘
- 支持两种渲染模式：erase（独立窗口）与 paint（透明覆盖层）

**可配置项**:
- 水墨晕开时长：0 - 10 秒（0 = 跳过动画）
- 卡片存留时长：10 - 60 秒

---

### 3. 透明网页覆盖层通知

通知卡片直接注入当前浏览页面，未晕开区域完全透明（`mix-blend-mode: multiply`），不遮挡网页内容。

**三步可靠注入机制**:
1. 尝试向已加载的内容脚本发消息
2. 若失败，通过 `chrome.scripting.executeScript` 程序化注入
3. 仅在受限页面（chrome:// 等）回退到独立弹窗

**6 重智能避让系统**:
- 全屏模式检测
- 视频播放检测
- 输入框激活检测
- 鼠标活跃度监测
- 快速滚动检测
- 受限页面自动回退

**穿透点击**：通知容器设为 `pointer-events: none`，仅按钮区域可交互，完全不阻碍正常浏览操作。

---

### 4. 呼吸灯引导

Popup 弹窗内置深呼吸引导动画，采用 4-4-6-2 节奏（吸气 4s - 屏息 4s - 呼气 6s - 放松 2s），配合主题色脉冲光圈和相位文字提示，帮助用户在提醒间隙快速放松。

---

### 5. MBTI 性格驱动

**16 种性格全覆盖**，每种性格拥有独特标签与专属鼓励语风格：

| 类型 | 标签 | 喝水风格示例 |
|------|------|------------|
| INTJ | 策略家 | "系统检测到逻辑引擎冷却液不足，建议补充200ml" |
| INFP | 调停者 | "你滋润了那么多心灵，也记得滋润自己呀~" |
| ESTP | 企业家 | "补水就像抓住商机，错过这杯就是损失" |
| ENFJ | 主人公 | "照顾好自己才能更好地照顾别人，先喝杯水吧" |

**鼓励语库规模**:
- 通用消息：每种任务类型 20 条
- 16 种 MBTI：每种任务类型 15 条
- 合计 780+ 条（3 类任务 x (20 通用 + 16 x 15 专属)）
- 70% 性格专属 + 30% 通用混合机制，保持新鲜感

---

### 6. 高度自定义设置

| 设置项 | 范围 | 说明 |
|--------|------|------|
| MBTI 性格类型 | 16 种 | 影响鼓励语风格和科学指令表达 |
| 喝水提醒间隔 | 0 - 120 分钟 | 0 = 关闭该类提醒 |
| 护眼提醒间隔 | 0 - 120 分钟 | 基于 20-20-20 法则 |
| 运动提醒间隔 | 0 - 120 分钟 | 久坐微运动提醒 |
| 主题模式 | 日间 / 夜间 / 自动 | 全局主题切换 |
| 通知位置 | 右上 / 左上 / 右下 / 左下 / 居中 | 5 个预设位置 |
| 卡片大小 | 小 / 中 / 大 | 3 种尺寸 |
| 水墨晕开时长 | 0 - 10 秒 | 控制动画速度 |
| 卡片存留时长 | 10 - 60 秒 | 通知自动消失时间 |
| 日间背景图 | 自定义上传 | 单张上限 10MB |
| 夜间背景图 | 自定义上传 | 单张上限 10MB |

---

### 7. 植物成长系统

- 每次完成提醒任务，植物成长值 +1
- 10 级成长路径，可视化进度
- 通过正向反馈激励用户坚持健康习惯

---

### 8. 科学依据

21 条科学健康指令，涵盖喝水（7 条）、护眼（7 条）、运动（7 条），每条包含：
- 具体操作步骤
- 真实医学文献引用
- MBTI 维度适配表达（T 思维型 / N 直觉型 / F 情感型）

---

## 技术架构

```
src/
  pages/
    Index.tsx          # 演示页面（主题响应式）
    Options.tsx        # 设置页面
    Popup.tsx          # 弹出面板 + 呼吸灯
    Notification.tsx   # 独立通知窗口（回退方案）
  extension/
    background.ts      # Service Worker（闹钟、消息分发）
    content.ts         # 内容脚本（透明覆盖层 + Canvas 水墨引擎）
  components/
    InkWashCanvas.tsx   # React 水墨动画组件（erase / paint 模式）
  lib/
    theme.ts           # 主题系统（dayTheme / nightTheme / resolveTheme）
    storage.ts         # Chrome Storage 抽象层
  data/
    mbtiMessages.ts    # 780+ 条 MBTI 鼓励语库
    scientificInstructions.ts  # 21 条科学健康指令
  types/
    extension.ts       # TypeScript 类型定义
```

**技术栈**:
- React 18 + TypeScript
- Vite 7 + Rollup（多入口构建）
- Tailwind CSS + CSS Variables
- Chrome Extension Manifest V3
- Chrome Storage Local API
- Canvas 2D（水墨扩散模拟）

---

## 隐私保护

- 所有数据本地存储（Chrome Storage Local）
- 零云端同步
- 无网络请求
- 无用户追踪
- 完全离线可用

---

## 使用场景

| 用户群体 | 使用场景 | 核心痛点 |
|---------|---------|---------|
| 办公室职员 | 长时间面对电脑 | 久坐、视疲劳、忘记喝水 |
| 开发者 | 深度编码工作 | 时间感知弱，缺乏外部提醒 |
| 学生群体 | 网课 / 自习 | 用眼过度，作息不规律 |
| 创意工作者 | 灵感迸发时 | 沉浸状态不愿被打断 |

---

## 许可证

MIT License

---

> **温柔提醒，从不打扰**
> **青植呼吸 -- 用水墨的方式，提醒你关爱自己**

版本：3.0 - Ink Wash Theme
更新：2026-04-20
支持：Windows 11 / macOS / Linux
