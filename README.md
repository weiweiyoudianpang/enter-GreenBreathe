# 青植呼吸 GreenBreathe 🌿

> 基于MBTI性格的极简主义Chrome浏览器健康关怀插件

用温柔的方式，提醒你关爱自己。

![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ 特色功能

### 🎭 MBTI个性化关怀
- 支持16种MBTI性格类型
- 260+条定制化鼓励语
- 每条提醒都用最适合你的方式表达

**示例：**
- **INTJ（战略家）**："系统检测到逻辑引擎冷却液不足，建议补充200ml"
- **INFP（调停者）**："你滋润了那么多心灵，也记得滋润自己呀"
- **ESTJ（总经理）**："执行补水任务：200ml，5秒完成"
- **ENFP（竞选者）**："喝杯水，让灵感继续冒泡吧"

### 🎨 水墨美学设计
- 东方极简风格
- 毛玻璃质感弹窗（260×180px）
- 水墨晕染动画（0.8秒渐显）
- 四角定位，不干扰操作

### 🔬 科学依据支撑
每条健康指令都基于真实医学文献：
- **喝水**：轻度脱水致注意力下降17% (Nutrients, 2019)
- **眼保健操**：20-20-20法则减少眼疲劳52% (Optometry, 2018)
- **微运动**：久坐增加心血管疾病风险34% (Circulation, 2020)

### 🧠 智能避让系统
- 全屏状态自动延迟
- 视频播放时暂缓提醒
- 输入框聚焦时延后弹出
- 检测快速滚动/鼠标移动

### 🔒 隐私优先
- 所有数据本地存储
- 零云端同步
- 无需注册登录
- Chrome Storage Local API

## 🚀 快速开始

### 用户安装（推荐）

1. **下载扩展包**
   ```bash
   git clone https://github.com/your-repo/greenbreathe.git
   cd greenbreathe
   pnpm install
   pnpm build:extension
   ```

2. **加载到Chrome**
   - 打开 `chrome://extensions/`
   - 开启"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择 `dist` 文件夹

3. **首次配置**
   - 点击浏览器工具栏🌿图标
   - 打开设置页面
   - 输入昵称和MBTI类型
   - 保存设置

详细说明请查看 [构建指南](./BUILD_INSTRUCTIONS.md)

### 开发者开发

```bash
# 克隆仓库
git clone https://github.com/your-repo/greenbreathe.git
cd greenbreathe

# 安装依赖
pnpm install

# 开发模式（用于Options/Popup页面开发）
pnpm dev

# 构建扩展
pnpm build:extension

# 运行代码检查
pnpm lint
```

## 📸 界面预览

### 弹窗提醒
<img src="https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100003000/ink_wash_green_a3581157.png" width="300" alt="水墨风弹窗" crossorigin="anonymous">

*水墨青绿风格，温柔提醒*

### 设置页面
- 昵称个性化
- MBTI类型选择
- 提醒间隔调整（30-120分钟）
- 弹窗位置设置
- 极简模式开关

### 统计面板
- 今日/本周/累计完成数
- 植物成长系统（每10次升级）
- 快速访问设置

## 🎯 使用场景

| 用户群体 | 使用场景 | 核心价值 |
|---------|---------|---------|
| 办公室职员 | 长时间面对电脑 | 定时喝水、护眼、活动 |
| 自由职业者/开发者 | 深度工作易入迷 | 外部提醒，打破沉浸 |
| 学生群体 | 网课/自习 | 作息规律，保护视力 |
| 创意工作者 | 灵感迸发时 | 温柔提醒，不打断思路 |

## 🛠️ 技术架构

### 核心技术
- **框架**: React 19 + TypeScript
- **构建**: Vite + Manifest V3
- **UI**: shadcn/ui + Tailwind CSS
- **API**: Chrome Storage Local + Chrome Alarms

### 项目结构
```
thread/
├── public/
│   ├── manifest.json          # 扩展清单
│   ├── icons/                 # 扩展图标
│   └── images/                # 资源图片
├── src/
│   ├── extension/
│   │   ├── background.ts      # 后台服务
│   │   └── content.ts         # 内容脚本
│   ├── pages/
│   │   ├── Options.tsx        # 设置页面
│   │   └── Popup.tsx          # 弹出窗口
│   ├── data/
│   │   ├── mbtiMessages.ts    # MBTI鼓励语库
│   │   └── scientificInstructions.ts  # 科学指令库
│   └── lib/
│       └── storage.ts         # Storage封装
└── dist/                      # 构建输出
```

详细结构请查看 [扩展README](./README_EXTENSION.md)

## 📊 功能清单

### MVP（v1.0.0）✅
- [x] 基础设置页面（昵称、MBTI、间隔）
- [x] 定时提醒引擎（Chrome Alarms）
- [x] 水墨风弹窗UI（Shadow DOM隔离）
- [x] MBTI鼓励语库（通用+5类型）
- [x] 科学指令库（含文献依据）
- [x] 智能避让系统
- [x] 植物成长游戏化
- [x] Popup统计面板

### 二期计划 ⏳
- [ ] 声音系统（16种MBTI提示音）
- [ ] 自定义背景图片上传
- [ ] 完整16型MBTI鼓励语（每型15条）
- [ ] 免打扰时段精细设置
- [ ] 数据导出/导入功能
- [ ] 多语言支持（英文）

## 🎨 设计规范

### 主题色
- **青植绿**: `#64b464` (HSL: 120, 40%, 55%)
- **清新绿**: `#8bc34a` (HSL: 88, 50%, 53%)

### 视觉效果
- **毛玻璃**: `backdrop-filter: blur(10px)`
- **水墨晕染**: 三层PNG叠加（10%/50%/100%透明度）
- **渐显动画**: 0.8s cubic-bezier(0.4, 0, 0.2, 1)

### 字体
- **标题**: 思源宋体 (Source Han Serif CN)
- **正文**: 思源黑体 (Source Han Sans CN)

## 📖 文档

- [构建指南](./BUILD_INSTRUCTIONS.md) - 如何构建和安装扩展
- [扩展详细说明](./README_EXTENSION.md) - 开发者文档
- [代码规范](./CodeGuideline.md) - 代码风格指南

## 🤝 贡献

欢迎贡献！请遵循以下步骤：

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### 贡献方向
- 添加更多MBTI鼓励语
- 改进水墨视觉效果
- 优化智能避让算法
- 补充医学文献依据
- 翻译多语言版本

## 📝 许可证

MIT License - 详见 [LICENSE](./LICENSE) 文件

## 🙏 致谢

- 感谢所有为健康关怀和MBTI理论做出贡献的研究者
- 感谢shadcn/ui提供的优秀UI组件
- 感谢所有测试用户的宝贵反馈

## 📞 联系方式

- **GitHub Issues**: [提交问题](https://github.com/your-repo/greenbreathe/issues)
- **Email**: support@greenbreathe.app
- **讨论**: [GitHub Discussions](https://github.com/your-repo/greenbreathe/discussions)

---

**用温柔的方式，提醒你关爱自己** 🌿

*Made with ❤️ by GreenBreathe Team*
