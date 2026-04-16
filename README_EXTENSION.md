# 青植呼吸 GreenBreathe

> 基于MBTI性格的极简主义浏览器健康关怀插件

## 📖 简介

青植呼吸是一款Chrome浏览器扩展，通过水墨风弹窗与科学依据的温柔表达，提醒用户定时喝水、眼保健操、微运动。每条提醒都根据你的MBTI性格类型，用最适合你的方式表达关怀。

### 核心特点

- **🎭 MBTI个性化**：16种性格类型，260+条定制鼓励语
- **🎨 水墨美学**：东方极简设计，毛玻璃质感，不干扰工作
- **🔬 科学依据**：每条健康指令基于真实医学文献
- **🔒 隐私优先**：所有数据本地存储，零云端同步
- **🧠 智能避让**：全屏/视频/输入时自动延迟提醒

## 🚀 快速开始

### 开发模式

```bash
# 安装依赖
pnpm install

# 启动开发服务器（用于Options/Popup页面开发）
pnpm dev

# 构建扩展
pnpm build:extension
```

### 加载到Chrome

1. 运行 `pnpm build:extension`
2. 打开 Chrome，访问 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择项目的 `dist` 文件夹

## 📦 项目结构

```
thread/
├── public/
│   ├── manifest.json          # 扩展清单
│   ├── icons/                 # 扩展图标
│   └── images/                # 资源图片（水墨PNG等）
├── src/
│   ├── extension/
│   │   ├── background.ts      # 后台服务工作进程
│   │   └── content.ts         # 内容脚本（注入弹窗）
│   ├── pages/
│   │   ├── Options.tsx        # 设置页面
│   │   └── Popup.tsx          # 弹出窗口
│   ├── data/
│   │   ├── mbtiMessages.ts    # MBTI鼓励语库
│   │   └── scientificInstructions.ts  # 科学指令库
│   ├── types/
│   │   └── extension.ts       # TypeScript类型定义
│   └── lib/
│       └── storage.ts         # Chrome Storage封装
├── options.html               # Options页面入口
├── popup.html                 # Popup页面入口
└── vite.config.ts             # Vite多入口配置
```

## ⚙️ 功能说明

### 用户设置（Options页面）
- 昵称输入
- MBTI类型选择（16型）
- 提醒间隔调整（30-120分钟）
- 弹窗位置设置
- 极简模式开关

### 定时提醒引擎
- 基于 `chrome.alarms` API
- 智能避让算法（检测全屏、视频、输入框）
- 水墨渐显动画（0.8秒入场）
- 自动消失（8秒后）

### 弹窗交互
- Shadow DOM隔离样式
- 260×180px水墨风卡片
- MBTI个性化鼓励语
- 科学指令 + 文献来源
- 三个操作按钮：了解/完成/稍后

### 统计（Popup页面）
- 今日/本周/累计完成数
- 植物成长系统（每10次升级）
- 快速访问设置

## 🎭 MBTI鼓励语示例

### INTJ（战略家）
> "系统检测到逻辑引擎冷却液不足，建议补充200ml"

### INFP（调停者）
> "你滋润了那么多心灵，也记得滋润自己呀"

### ESTJ（总经理）
> "执行补水任务：200ml，5秒完成"

### ENFP（竞选者）
> "喝杯水，让灵感继续冒泡吧"

### ISTP（鉴赏家）
> "工具需要保养，身体也是"

## 🔬 科学依据样例

所有健康指令均基于真实医学文献：

- **喝水**：轻度脱水致注意力下降17% (Nutrients, 2019)
- **眼保健操**：20-20-20法则减少眼疲劳52% (Optometry, 2018)
- **微运动**：久坐增加心血管疾病风险34% (Circulation, 2020)

## 🎨 设计系统

### 主题色
- 青植绿：`#64b464` (HSL: 120, 40%, 55%)
- 清新绿：`#8bc34a` (HSL: 88, 50%, 53%)

### 效果
- 毛玻璃：`backdrop-filter: blur(10px)`
- 水墨晕染：三层PNG叠加（透明度10%/50%/100%）
- 渐显动画：0.8秒 cubic-bezier(0.4, 0, 0.2, 1)

### 字体
- 标题：思源宋体 (Source Han Serif CN)
- 正文：思源黑体 (Source Han Sans CN)

## 📝 开发计划

### MVP（当前版本 v1.0.0）
- ✅ 基础设置页面
- ✅ 定时提醒引擎
- ✅ 水墨风弹窗
- ✅ MBTI鼓励语库（通用+5类型）
- ✅ 科学指令库
- ✅ 植物成长系统
- ✅ Popup统计页面

### 二期计划
- ⏳ 声音系统（16种MBTI提示音）
- ⏳ 自定义背景图片上传
- ⏳ 完整16型MBTI鼓励语
- ⏳ 免打扰时段设置
- ⏳ 数据导出/导入

## 🛠️ 技术栈

- **框架**：React 19 + TypeScript
- **构建**：Vite + Manifest V3
- **UI库**：shadcn/ui + Tailwind CSS
- **存储**：Chrome Storage Local API
- **定时**：Chrome Alarms API

## 📄 许可证

MIT License

## 🙏 致谢

感谢所有为健康关怀和MBTI理论做出贡献的研究者们。

---

**用温柔的方式，提醒你关爱自己** 🌿
