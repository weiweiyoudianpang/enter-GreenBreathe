# 🌿 青植呼吸 GreenBreathe

**一款真正不干扰的浏览器健康关怀扩展**

> 用温柔的方式，提醒你关爱自己 —— 但永远不会打断你的工作流

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-brightgreen)](https://chrome.google.com/webstore)
[![Version](https://img.shields.io/badge/version-1.0.0-blue)](./package.json)

---

## 🎯 核心卖点

### 1. 穿透不干扰 - 终极用户体验 ⭐⭐⭐⭐⭐

**市面上99%的通知都会打断你的工作，但青植呼吸不会。**

```
传统通知：
❌ 霸占屏幕中心
❌ 阻挡网页交互
❌ 在视频会议中弹出
❌ 在打字时突然出现

青植呼吸：
✅ 角落温柔显示
✅ 完全穿透点击
✅ 智能避让专注状态
✅ 永不打断工作流
```

#### 🔬 技术实现

- **Pointer Events穿透架构**：容器 `pointer-events: none`，仅通知本体可交互
- **6重智能避让系统**：
  1. 全屏模式检测（演示、游戏）
  2. 输入框激活检测（正在打字）
  3. 视频播放检测（观看视频）
  4. 音频播放检测（听音乐）
  5. 视频通话检测（在线会议）
  6. 用户活跃度检测（快速操作时）
- **Shadow DOM隔离**：零污染网页样式
- **自适应延迟重试**：最多3次，间隔30秒

#### 💡 实际体验

```
场景1：你正在Zoom开会
→ 青植呼吸检测到摄像头激活，自动延迟提醒

场景2：你正在快速编辑文档
→ 检测到5秒内有频繁鼠标/滚动操作，延迟10秒

场景3：你在看YouTube视频
→ 检测到主视频正在播放，自动避让

场景4：你在刷推特
→ 通知显示在右上角，完全不影响点击推文
```

---

### 2. 水墨审美 - 视觉愉悦 🎨

**不是冷冰冰的系统弹窗，而是一幅流动的水墨画。**

- **毛玻璃质感**：`backdrop-filter: blur(12px)` + 92%透明度
- **三层水墨晕染**：0.8秒渐显动画，自然扩散效果
- **思源字体**：标题用思源宋体，正文用思源黑体
- **青绿色系**：主色 #64b464，辅色 #8bc34a，灵感来自中国传统水墨
- **优雅动画**：cubic-bezier(0.34, 1.56, 0.64, 1) 弹性曲线

#### 🎨 视觉层次

```css
/* 通知卡片 */
背景：毛玻璃 rgba(255,255,255,0.92)
边框：半透明青绿 rgba(100,180,100,0.2)
阴影：双层叠加 0-8px + 2-8px
字体：思源宋体（标题）+ 思源黑体（正文）

/* 水墨晕染层 */
位置：卡片后方 -30px 扩展
动画：0.8秒 scale(0.8→1) opacity(0→0.12)
效果：静态PNG叠层，渐显扩散

/* 植物成长动画 */
位置：右下角 32×32px
动画：2秒 stroke-dashoffset 描边生长
颜色：#64b464 青绿
```

---

### 3. 植物成长 - 正向激励 🌱

**每次完成健康指令，角落的小植物就会长出一片新叶。**

- **4种植物形态**：竹、兰、菊、梅（对应不同MBTI性格）
- **10级成长系统**：每完成10次任务升1级
- **SVG描边动画**：2秒舒展生长，stroke-dashoffset技术
- **成就解锁**：累计完成数解锁新植物

#### 🌿 成长机制

```
完成次数  →  植物状态
─────────────────────
0-9次      竹芽（1节）
10-19次    竹笋（2节 + 叶）
20-29次    小竹（3节 + 双叶）
30-49次    青竹（4节 + 繁叶）
50+次      翠竹（5节 + 茂盛）

解锁植物：
竹：INTJ/INTP（理性坚韧）
兰：INFP/INFJ（优雅内敛）
菊：ESTJ/ENTJ（坚毅独立）
梅：ENFP/ENTP（灵动乐观）
```

---

### 4. MBTI个性化 - 情感共鸣 💬

**同样是喝水提醒，INTJ收到的是"系统冷却液不足"，INFP收到的是"给自己一杯温柔的关怀"。**

- **180条个性化鼓励语**：通用30条 + 5种性格各30条
- **8条科学指令**：含真实医学文献依据
- **4维度适配表达**：
  - T（理性）→ 用数据、系统、效率语言
  - F（情感）→ 用共情、温柔、关怀语言
  - S（实感）→ 具体指令、当下感知
  - N（直觉）→ 意象引导、未来隐喻

#### 💬 表达差异示例

| 任务类型 | INTJ表达 | INFP表达 |
|---------|---------|---------|
| 喝水 | "系统检测到逻辑引擎冷却液不足，建议补充200ml" | "你滋润了那么多心灵，也记得滋润自己呀~" |
| 眼保健操 | "视觉传感器疲劳度达阈值，执行20-20-20协议" | "让目光穿越屏幕，去捕捉窗外的一片绿意" |
| 运动 | "战略休息：2分钟微运动，预计提升后续效率23%" | "身体想和你一起跳支小小的舞呢~" |

---

## 📖 快速开始

### 安装（3分钟）

```bash
# 1. 克隆项目
git clone <repository-url>
cd greenbreathe

# 2. 安装依赖
pnpm install

# 3. 构建扩展
pnpm build:extension

# 4. 加载到Chrome
# 打开 chrome://extensions/
# 启用"开发者模式"
# 点击"加载已解压的扩展程序"
# 选择 dist 文件夹
```

### 配置（1分钟）

1. 点击工具栏🌿图标 → "打开设置"
2. 填写昵称（如"小飘"）
3. 选择MBTI类型（推荐：INFP、INTJ、ENFP）
4. 提醒间隔：60分钟（默认）
5. 保存 → 点击"测试提醒"

---

## 🔥 技术架构

### Chrome Extension (Manifest V3)

```
架构设计：
├── Background Service Worker   # 定时触发器
├── Content Script             # 弹窗注入 + 智能避让
├── Options Page               # React设置界面
├── Popup Panel                # React统计面板
└── Storage Layer              # 本地数据持久化

核心技术：
✅ React 18 + TypeScript
✅ Vite 7 多入口构建
✅ Tailwind CSS + shadcn/ui
✅ Chrome Storage API
✅ Shadow DOM 样式隔离
✅ Pointer Events 穿透架构
```

### 智能避让系统

```typescript
// 6重检测机制
function shouldDelayNotification(): boolean {
  if (document.fullscreenElement) return true;        // 全屏
  if (activeInput()) return true;                     // 输入
  if (videoPlaying()) return true;                    // 视频
  if (audioPlaying()) return true;                    // 音频
  if (videoCalling()) return true;                    // 通话
  if (isUserActivelyInteracting()) return true;       // 活跃
  return false;
}

// 延迟重试策略
retryAfter = 30s × retryCount (max 3次)
```

### 水墨渲染引擎

```css
/* 三层合成 */
.notification-card {
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(12px) saturate(180%);
  box-shadow: 0 8px 32px rgba(100,180,100,0.12);
}

.ink-wash-bg {
  animation: inkSpread 0.8s ease-out;
  opacity: 0 → 0.12;
  scale: 0.8 → 1;
}

.plant-path {
  animation: plantGrow 2s ease-out;
  stroke-dashoffset: 100 → 0;
}
```

---

## 📊 项目统计

| 项目 | 数量 |
|-----|------|
| 源代码文件 | 103个 |
| 代码总量 | ~3500行 |
| MBTI鼓励语 | 180条 |
| 科学指令 | 8条（含8篇文献） |
| UI组件 | 60+个（shadcn/ui） |
| 支持MBTI类型 | 5种专属+通用 |
| 植物形态 | 4种（竹兰菊梅） |
| 扩展大小 | 2.4MB |

---

## 📚 文档导航

- 📖 [快速上手（5分钟）](./QUICKSTART.md)
- 🔧 [本地测试指南](./LOCAL_TESTING_GUIDE.md)
- 🏗️ [构建说明](./BUILD_INSTRUCTIONS.md)
- 💻 [技术文档](./README_EXTENSION.md)
- 📋 [完成清单](./CHECKLIST.md)
- 📦 [项目总结](./PROJECT_SUMMARY.md)
- 💾 [下载指南](./START_DOWNLOADING.md)

---

## 🎯 使用场景

### 办公室职员
- **痛点**：久坐、视疲劳、忘记喝水
- **方案**：60分钟提醒，全天候健康关怀
- **穿透优势**：写报表、做PPT时不被打断

### 开发者/设计师
- **痛点**：深度工作易入迷，时间感知弱
- **方案**：智能避让代码编辑，仅在合适时提醒
- **穿透优势**：调试代码、画UI时通知不挡视线

### 学生群体
- **痛点**：网课用眼过度，作息不规律
- **方案**：20-20-20护眼法则，定时休息提醒
- **穿透优势**：上网课、写作业时不影响屏幕操作

### 视频会议工作者
- **痛点**：长时间Zoom/Teams会议，无法离开
- **方案**：自动检测视频通话，会后再提醒
- **穿透优势**：会议期间完全不打扰

---

## 🌟 核心优势总结

| 维度 | 传统健康提醒 | 青植呼吸 |
|-----|------------|---------|
| **干扰度** | ⛔ 阻挡页面交互 | ✅ 完全穿透点击 |
| **智能度** | ❌ 固定时间弹出 | ✅ 6重智能避让 |
| **美感** | ❌ 系统样式丑陋 | ✅ 水墨审美愉悦 |
| **激励** | ❌ 单调重复提醒 | ✅ 植物成长反馈 |
| **共鸣** | ❌ 机械式通知 | ✅ MBTI个性化 |
| **隐私** | ⚠️ 可能上传数据 | ✅ 100%本地存储 |

---

## 🚀 二期计划

- 🔊 16种MBTI专属提示音
- 🖼️ 自定义水墨背景上传
- 📚 完整260条鼓励语（16型全覆盖）
- ⏰ 精细化免打扰时段
- 💾 数据导出/导入
- 🌍 英文版国际化
- 📊 健康数据统计图表
- 🏆 成就徽章系统

---

## 💬 反馈与贡献

欢迎提交Issue和Pull Request！

- **Bug反馈**：[GitHub Issues](https://github.com/...)
- **功能建议**：[Discussions](https://github.com/.../discussions)
- **贡献代码**：查看 [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## 📄 许可证

MIT License - 详见 [LICENSE](./LICENSE)

---

## 🙏 致谢

- **设计灵感**：中国传统水墨画艺术
- **字体**：思源宋体、思源黑体（Adobe & Google）
- **UI组件**：shadcn/ui
- **技术栈**：React、Vite、Tailwind CSS

---

**🌿 用温柔的方式，提醒你关爱自己 —— 但永远不会打断你的工作流**

---

## 📞 快速链接

- 🚀 [立即下载](./START_DOWNLOADING.md)
- 📖 [5分钟上手](./QUICKSTART.md)
- 🔧 [本地测试](./LOCAL_TESTING_GUIDE.md)
- 💻 [技术文档](./README_EXTENSION.md)

**记住：先穿透不干扰，再美如水墨画 🎯🎨**
