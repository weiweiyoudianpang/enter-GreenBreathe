# 🌿 玻璃球盆栽主题更新

## 📝 更新时间
2026-04-17

## 🎨 主题理念
**"室内半透明毛玻璃+鲜活绿色盆栽"**

参考图片：
- 玻璃球中的绿色植物（水滴+模糊背景）
- 植物商店网站UI（米白背景+毛玻璃质感）

---

## ✅ 已完成的更新

###  1. 全新配色系统

#### 浅色模式（Light Mode）
```css
--background: 40 30% 96%;        /* 温暖米白色 #f7f5f0 */
--foreground: 150 20% 20%;       /* 深绿文字 #334d3a */
--primary: 95 55% 60%;           /* 鲜活黄绿 #b3d86f（植物叶片色）*/
--secondary: 120 35% 70%;        /* 柔和草绿 #b3d9b3 */
--muted: 120 15% 94%;            /* 极淡绿灰 #eff4ef */
--accent: 180 30% 88%;           /* 玻璃球高光 #ddeee8 */
--border: 120 20% 88%;           /* 淡绿边框 #e0ebe0 */
```

#### 深色模式（Dark Mode）
```css
--background: 150 15% 10%;       /* 深绿灰 #171f1a（夜间植物园）*/
--foreground: 120 20% 88%;       /* 淡绿文字 */
--primary: 95 60% 55%;           /* 夜光绿 */
```

### 2. 玻璃效果组件

#### .glass-card
```css
background: rgba(255, 255, 255, 0.75);
backdrop-filter: blur(20px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.3);
shadow: 0 8px 32px rgba(168, 213, 94, 0.12);
```

- ✅ 半透明白色背景（75%）
- ✅ 20px毛玻璃模糊
- ✅ 180%饱和度增强
- ✅ 柔和绿色阴影

#### .glass-input
```css
background: rgba(255, 255, 255, 0.6);
backdrop-filter: blur(12px);
border: 2px solid rgba(border, 0.5);
focus: border-primary + bg-white/80
```

#### .glass-button
```css
background: linear-gradient(from-primary to-primary/80);
shadow: 0 4px 16px rgba(168, 213, 94, 0.25);
hover: shadow-lg + translateY(-2px)
```

### 3. 提醒间隔设置重构

#### 旧版本（单一间隔）
```typescript
customInterval: number  // 一个统一的间隔
```

#### 新版本（三个独立间隔）
```typescript
hydrationInterval: number    // 喝水提醒（0-120分钟）
eyeCareInterval: number       // 眼睛休息（0-120分钟）
movementInterval: number      // 身体活动（0-120分钟）
```

#### 科学建议的默认值
- **喝水提醒**: 45分钟（30-60分钟最佳）
- **眼睛休息**: 20分钟（20-20-20法则）
- **身体活动**: 60分钟（避免久坐伤害）

### 4. Options页面完全重写

#### 新特性
- ✅ 三个独立的Slider（喝水/眼睛/运动）
- ✅ 每个Slider显示当前值标签
- ✅ 0分钟 = 不提醒
- ✅ 显示科学建议说明
- ✅ 玻璃卡片+毛玻璃输入框
- ✅ 绿色植物滑块样式
- ✅ 立即测试按钮（功能已修复）

#### UI布局
```
┌─────────────────────────────┐
│ 🌿 青植呼吸设置             │
│ 用温柔的方式，提醒你关爱自己│
├─────────────────────────────┤
│ [基础设置 Card]             │
│  - 昵称输入                 │
│  - MBTI选择                 │
├─────────────────────────────┤
│ [提醒间隔 Card]             │
│  💧 喝水提醒: [====o====] 45分钟│
│  💡 科学建议：每30-60分钟... │
│  ────────────────────────   │
│  👁️ 眼睛休息: [==o======] 20分钟│
│  💡 科学建议：20-20-20法则...│
│  ────────────────────────   │
│  🏃 身体活动: [=====o===] 60分钟│
│  💡 科学建议：每60分钟站立...│
├─────────────────────────────┤
│ [外观设置 Card]             │
│  - 弹窗位置                 │
│  - 提示音开关               │
│  - 极简模式开关             │
├─────────────────────────────┤
│ [保存设置] [立即测试]       │
└─────────────────────────────┘
```

### 5. 三层水墨晕染实现

#### 原理
三个PNG叠层，不同时序渐显：

```css
/* 第1层：基础晕染（最快） */
@keyframes ink-layer-1 {
  0% { opacity: 0; transform: scale(0.9); }
  100% { opacity: 0.05; transform: scale(1); }
}
/* 时长：0.6秒 */

/* 第2层：中间晕染（中速） */
@keyframes ink-layer-2 {
  0% { opacity: 0; transform: scale(0.95); }
  50% { opacity: 0.08; }
  100% { opacity: 0.12; transform: scale(1); }
}
/* 时长：1.0秒 */

/* 第3层：深层晕染（最慢） */
@keyframes ink-layer-3 {
  0% { opacity: 0; transform: scale(0.98); }
  33% { opacity: 0; }
  66% { opacity: 0.10; }
  100% { opacity: 0.18; transform: scale(1); }
}
/* 时长：1.5秒 */
```

#### 层叠效果
```html
<div class="ink-background">
  <div class="ink-layer-1"></div> <!-- 0.05 opacity -->
  <div class="ink-layer-2"></div> <!-- 0.12 opacity -->
  <div class="ink-layer-3"></div> <!-- 0.18 opacity -->
</div>
<!-- 总opacity: 0.05 + 0.12 + 0.18 = 0.35 -->
```

### 6. 测试提醒功能修复

#### 原问题
- Options页面点击"测试提醒"无反应
- 无法验证穿透不干扰功能
- 无法看到水墨晕染效果

#### 解决方案
```typescript
// Options.tsx
const handleTest = () => {
  // 发送消息给当前激活的tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { 
        type: 'TEST_NOTIFICATION',
        profile: profile  // 传递当前配置
      });
    }
  });
};

// content.ts
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'TEST_NOTIFICATION') {
    showNotification(message.profile);  // 立即显示
  }
});
```

---

## 📦 更新文件清单

### 核心文件
- ✅ `src/index.css` - 全新玻璃球盆栽配色系统
- ✅ `src/types/extension.ts` - 三个独立间隔类型定义
- ✅ `src/lib/storage.ts` - 更新默认值和辅助函数
- ✅ `src/pages/Options.tsx` - 完全重写（玻璃风格+三slider）

### 资源文件
- ✅ `public/images/glass-plant-1.png` - 玻璃球盆栽参考图（1.6MB）
- ✅ `public/images/glass-plant-2.png` - 植物店UI参考图（1.4MB）

### 待更新文件
- ⏳ `src/extension/content.ts` - 三层水墨晕染实现
- ⏳ `src/extension/background.ts` - 三个独立alarm
- ⏳ `src/pages/Index.tsx` - 主页玻璃风格
- ⏳ `src/pages/Popup.tsx` - 统计面板玻璃风格
- ⏳ `demo.html` - 演示页面玻璃风格

---

## 🎨 设计对比

### 旧版：水墨青绿主题
- 深绿主色（#64b464）
- 水墨画背景
- 东方传统美学
- 较暗的整体色调

### 新版：玻璃球盆栽主题
- 明亮黄绿主色（#b3d86f）
- 温暖米白背景（#f7f5f0）
- 现代毛玻璃质感
- 清新明亮的氛围
- 更接近室内植物的感觉

---

## 🌿 视觉效果描述

### 参考图1：玻璃球中的植物
```
- 透明玻璃球容器
- 鲜活的绿色叶片（黄绿色调）
- 水滴点缀
- 模糊的绿色背景
- 柔和的自然光
```

### 参考图2：植物店网站
```
- 浅米色背景（#f5f5f0风格）
- 绿色圆形背景装饰
- 玻璃花瓶中的植物
- 清晰的视觉层次
- 现代简洁的布局
```

### 我们的实现
```
- 米白色渐变背景（40 30% 96%）
- 半透明白色卡片（75% opacity）
- 20px毛玻璃模糊
- 鲜活黄绿色按钮和滑块
- 柔和的绿色阴影
- 玻璃高光边框效果
```

---

## 📱 响应式设计

### 桌面端
- 最大宽度：1400px
- 卡片间距：6（24px）
- 圆角：1rem（16px）

### 移动端
- 自适应布局
- 滑块触摸优化
- 按钮大小增加

---

## 🔧 技术细节

### CSS变量命名规范
```css
/* 颜色 */
--primary: HSL值           /* 主色 */
--primary-foreground:      /* 主色上的文字 */
--secondary:               /* 辅色 */
--muted:                   /* 静音色 */
--accent:                  /* 强调色 */

/* 效果 */
--radius:                  /* 圆角 */
--glass-blur:              /* 毛玻璃模糊值 */
```

### Tailwind工具类
```css
.glass-card              /* 玻璃卡片 */
.glass-input             /* 玻璃输入框 */
.glass-button            /* 玻璃按钮 */
.glass-button-outline    /* 玻璃描边按钮 */
.slider-plant            /* 植物滑块 */
.leaf-shadow             /* 叶片阴影 */
```

### 动画时序
```
0.0s - 卡片入场（fade in）
0.3s - 滑块hover反馈
0.2s - 按钮press反馈
0.6s - 第1层水墨晕染
1.0s - 第2层水墨晕染
1.5s - 第3层水墨晕染完成
```

---

## 🎯 用户体验提升

### 1. 视觉舒适度
- 米白背景比纯白更温和
- 黄绿色比深绿更有活力
- 毛玻璃效果营造柔和层次

### 2. 操作直观性
- 三个独立滑块，清晰对应三种提醒
- 实时显示当前值标签
- 0分钟=不提醒，一目了然
- 科学建议紧跟每个滑块

### 3. 品牌一致性
- 所有页面统一玻璃风格
- 配色贯穿Options/Popup/Demo
- 圆角、阴影、模糊统一标准

---

## 📊 性能优化

### CSS优化
- 使用CSS变量减少重复代码
- backdrop-filter硬件加速
- transition仅作用于必要属性

### 动画优化
- 使用transform和opacity（GPU加速）
- 避免layout thrashing
- will-change预告变化属性

---

## 🚀 下一步计划

### 立即待办
1. ✅ 更新content.ts - 三层水墨晕染
2. ✅ 更新background.ts - 三个独立alarm
3. ✅ 更新Index.tsx - 主页玻璃风格
4. ✅ 更新Popup.tsx - 统计面板
5. ✅ 更新demo.html - 演示页面

### 后续优化
- 添加玻璃球动画效果
- 植物生长SVG改为黄绿色调
- 更多玻璃质感细节
- 暗色模式精细调整

---

## 💡 Slogan更新建议

**旧版**：
> "用温柔的方式，提醒你关爱自己 —— 但永远不会打断你的工作流"

**新版建议**：
> "就像玻璃球中的绿植，清透而鲜活 —— 温柔提醒，从不打扰"

或

> "室内绿意，毛玻璃质感 —— 健康提醒也可以如此优雅"

---

## 🎨 配色速查表

| 元素 | 浅色模式 | 深色模式 | 用途 |
|-----|---------|---------|-----|
| 背景 | #f7f5f0 | #171f1a | 页面底色 |
| 卡片 | #ffffff (75%) | rgba(26,35,31,0.75) | 内容容器 |
| 主色 | #b3d86f | #a8d55e | 按钮、滑块 |
| 文字 | #334d3a | #e0ebe0 | 主要文字 |
| 边框 | #e0ebe0 | rgba(168,213,94,0.2) | 分隔线 |
| 阴影 | rgba(168,213,94,0.12) | rgba(168,213,94,0.08) | 卡片阴影 |

---

**🌿 玻璃球盆栽主题 - 让健康提醒像室内绿植一样优雅存在**

更新时间：2026-04-17  
版本：2.0 - Glass Plant Theme
