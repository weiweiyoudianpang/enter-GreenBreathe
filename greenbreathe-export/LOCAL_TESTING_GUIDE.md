# 🧪 青植呼吸 - 本地测试完整指南

## 📥 第一步：下载项目

### 从Enter.pro下载

1. **导出项目**
   - 在Enter.pro界面，点击右上角菜单
   - 选择"Export" 或 "Download Project"
   - 下载ZIP文件到本地

2. **解压文件**
   ```bash
   unzip greenbreathe.zip
   cd greenbreathe
   ```

### 或从Git仓库克隆

```bash
git clone <你的仓库地址>
cd greenbreathe
```

## 🔧 第二步：安装依赖

### 检查环境

```bash
# 检查Node.js版本（需要 v18+）
node --version

# 检查pnpm（如果没有，先安装）
pnpm --version

# 如果没有pnpm，安装它
npm install -g pnpm
```

### 安装项目依赖

```bash
# 进入项目目录
cd greenbreathe

# 安装所有依赖（约需1-2分钟）
pnpm install
```

看到这样的输出表示成功：
```
Packages: +XXX
Progress: resolved XXX, reused XXX
Done in Xs
```

## 🏗️ 第三步：构建扩展

```bash
# 构建Chrome扩展
pnpm build:extension
```

成功后会看到：
```
✓ built in 3.08s
✓ Copied manifest.json
✓ Copied icons
✓ Copied images

✅ Extension build complete!
📦 Load the extension from: /your/path/dist
```

此时会生成 `dist` 文件夹，这就是可以加载到Chrome的扩展包。

## 🌐 第四步：加载到Chrome

### 详细步骤（带截图说明）

**1. 打开Chrome扩展管理页面**

方法A：地址栏输入
```
chrome://extensions/
```

方法B：通过菜单
- 点击Chrome右上角 ⋮ (三个点)
- 更多工具 → 扩展程序

**2. 启用开发者模式**

- 找到页面右上角的"开发者模式"开关
- 点击开启（应该变成蓝色/绿色）

**3. 加载扩展**

- 点击左上角的"加载已解压的扩展程序"按钮
- 在弹出的文件选择器中，导航到你的项目目录
- 选择 `dist` 文件夹
- 点击"选择文件夹"或"打开"

**4. 确认安装成功**

你应该看到：
- 扩展列表中出现"青植呼吸 GreenBreathe"卡片
- 卡片显示版本号 1.0.0
- 卡片显示扩展图标 🌿
- 浏览器工具栏出现绿色植物图标

## ⚙️ 第五步：初次设置

### 打开设置页面

**方法A：通过Popup**
1. 点击浏览器工具栏的🌿图标
2. 在弹出窗口中点击"打开设置"

**方法B：通过右键菜单**
1. 右键点击工具栏的🌿图标
2. 选择"选项"

### 配置个人信息

在设置页面填写：

1. **昵称**
   - 输入你喜欢的称呼（如"小明"、"飘飘"）
   - 这个昵称会出现在鼓励语中

2. **MBTI类型**
   - 从下拉菜单选择你的性格类型
   - 推荐的5个类型：INTJ、INFP、ESTJ、ENFP、ISTP
   - 不确定？访问 https://www.16personalities.com/ 测试

3. **提醒间隔**
   - 拖动滑块选择（30-120分钟）
   - 建议：60分钟（初次使用）

4. **弹窗位置**
   - 选择：右上角（推荐）、左上角、右下角、左下角

5. **保存设置**
   - 点击"保存设置"按钮
   - 看到"✓ 已保存"提示

## 🧪 第六步：测试扩展

### 测试1：立即触发提醒

1. **在设置页面或Popup中**
   - 点击"测试提醒"按钮

2. **切换到任意标签页**
   - 打开新标签页，访问任意网站（如google.com）
   - 或切换到已有的网页标签

3. **等待3-5秒**
   - 你应该在页面右上角（或你设置的位置）看到：
     - 水墨风格的白色半透明卡片
     - 个性化鼓励语
     - 健康指令和科学依据
     - 三个操作按钮

4. **交互测试**
   - 点击"已完成 ✓"：弹窗消失，统计+1
   - 点击"了解啦~"：弹窗消失
   - 点击"稍后"：弹窗消失，稍后重试
   - 或等待8秒：弹窗自动消失

### 测试2：查看统计

1. **点击工具栏🌿图标**
2. **在Popup中查看**
   - 今日完成：应该显示刚才完成的次数
   - 植物成长进度条
   - 累计统计

### 测试3：智能避让

1. **全屏视频测试**
   - 打开YouTube或任意视频网站
   - 进入全屏播放
   - 触发测试提醒
   - ✓ 弹窗应该延迟，不在全屏时显示

2. **输入框测试**
   - 打开Google搜索或任意输入框
   - 点击输入框开始输入
   - 触发测试提醒
   - ✓ 弹窗应该延迟，直到你完成输入

### 测试4：等待自动提醒

1. **正常浏览网页**
   - 打开几个标签页随便浏览

2. **等待设定的时间**
   - 如果设置60分钟，等待60分钟
   - 可以改成30分钟快速测试

3. **自动弹出提醒**
   - 到时间后应该自动显示弹窗
   - 内容随机（喝水/眼保健操/运动）

## 🔍 第七步：检查开发者日志（可选）

### 查看后台日志

1. **打开扩展管理页面**
   ```
   chrome://extensions/
   ```

2. **找到青植呼吸扩展**

3. **点击"service worker"链接**
   - 会打开开发者工具
   - 在Console中查看后台日志

4. **应该看到的日志**
   ```
   GreenBreathe Extension Installed
   Alarm set for every 60 minutes
   ```

### 查看页面日志

1. **在任意网页按F12**
   - 打开Chrome开发者工具

2. **切换到Console标签**

3. **查找相关日志**
   - 输入 `GreenBreathe` 过滤
   - 应该看到：`GreenBreathe Content Script Loaded`

## 🐛 常见问题排查

### Q1: 构建失败

**错误**：`pnpm: command not found`
```bash
# 解决：安装pnpm
npm install -g pnpm
```

**错误**：`Node version too old`
```bash
# 解决：升级Node.js到v18+
# 访问 https://nodejs.org/ 下载最新LTS版本
```

**错误**：`Failed to load manifest`
```bash
# 解决：确保构建完成
pnpm build:extension

# 确认dist目录存在
ls -la dist/
```

### Q2: 扩展加载失败

**错误**：`Manifest version 2 is deprecated`
- ✓ 本扩展已使用Manifest V3，无此问题

**错误**：`Could not load manifest`
```bash
# 解决：重新构建
rm -rf dist
pnpm build:extension
```

**错误**：`Invalid icon path`
```bash
# 解决：确认图标存在
ls dist/icons/
# 应该看到：icon-16.png, icon-48.png, icon-128.png
```

### Q3: 弹窗不显示

**检查1：是否开启极简模式**
- 打开设置页面
- 确认"极简模式"开关是关闭的

**检查2：是否在免打扰时间**
- 当前时间是否在 22:00-06:00
- 可在设置中修改

**检查3：查看后台日志**
- chrome://extensions/ → service worker
- 查看是否有错误信息

**检查4：刷新扩展**
- chrome://extensions/
- 找到青植呼吸
- 点击刷新图标 ⟳

### Q4: MBTI鼓励语不变

**原因**：缓存或随机性
- 鼓励语是随机选择的
- 可能连续几次出现相同内容

**解决**：
```bash
# 重新构建扩展
pnpm build:extension

# 刷新扩展
# 在chrome://extensions/点击刷新
```

### Q5: 样式显示异常

**检查**：是否有冲突的浏览器扩展
- 暂时禁用其他扩展测试

**解决**：清除缓存重新加载
```bash
# 重新构建
pnpm build:extension

# 硬刷新：chrome://extensions/ → 刷新
```

## 📊 验证清单

测试完成后，确认以下功能正常：

- [ ] 扩展成功加载到Chrome
- [ ] 工具栏显示🌿图标
- [ ] 点击图标打开Popup统计面板
- [ ] 设置页面可以正常打开和保存
- [ ] 测试提醒可以触发弹窗
- [ ] 弹窗显示正常（水墨风格、毛玻璃效果）
- [ ] 鼓励语符合选择的MBTI类型
- [ ] 科学指令显示正确
- [ ] 点击"已完成"后统计增加
- [ ] 植物成长进度条显示
- [ ] 自动提醒在设定时间触发
- [ ] 全屏时智能避让生效
- [ ] 输入时智能避让生效

## 🎯 下一步

### 日常使用

1. **正常浏览**
   - 扩展会在后台自动运行
   - 到时间会温柔提醒

2. **查看统计**
   - 随时点击🌿图标查看进度

3. **调整设置**
   - 根据使用体验调整间隔
   - 尝试不同的MBTI鼓励语

### 二期开发（可选）

如果你想继续开发：

1. **开发模式**
   ```bash
   # 启动热重载开发服务器（用于Options/Popup页面）
   pnpm dev
   # 访问 http://localhost:8080
   ```

2. **修改代码**
   - 编辑 `src/data/mbtiMessages.ts` 添加鼓励语
   - 编辑 `src/data/scientificInstructions.ts` 添加指令
   - 编辑 `src/index.css` 调整样式

3. **重新构建**
   ```bash
   pnpm build:extension
   ```

4. **刷新扩展**
   - chrome://extensions/ → 点击刷新图标

### 分享反馈

使用过程中遇到问题或有建议：
- 记录下使用体验
- 考虑添加新的MBTI鼓励语
- 建议改进点

## 📞 需要帮助？

如果测试过程中遇到问题：

1. **查看文档**
   - `README.md` - 项目概览
   - `BUILD_INSTRUCTIONS.md` - 构建详细说明
   - `QUICKSTART.md` - 快速上手

2. **检查日志**
   - 后台日志：chrome://extensions/ → service worker
   - 页面日志：F12 → Console

3. **重新构建**
   ```bash
   rm -rf dist node_modules
   pnpm install
   pnpm build:extension
   ```

---

**祝测试顺利！🌿**

记得在使用过程中照顾好自己的身体健康！
