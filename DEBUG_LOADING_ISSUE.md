# 🐛 插件加载问题排查和修复

## 问题描述

**症状**：Chrome 扩展一直卡在"加载中"状态，无法正常启动

**原因**：dist 文件夹中缺少 `background.js` 和 `content.js` 文件

---

## 🔍 问题排查过程

### 1. 检查 dist 文件夹

```bash
cd /workspace/thread
ls -la dist/
```

**发现**：
- ✅ manifest.json 存在
- ❌ background.js 不存在
- ❌ content.js 不存在
- ✅ options.html 存在
- ✅ popup.html 存在

### 2. 检查构建配置

查看 `vite.config.ts`：
```typescript
build: {
  rollupOptions: {
    input: {
      background: path.resolve(__dirname, 'src/extension/background.ts'),
      content: path.resolve(__dirname, 'src/extension/content.ts'),
    }
  }
}
```

配置正确，但文件没有生成。

### 3. 根本原因

**上一次构建使用了错误的命令**：
```bash
# 错误：构建了 web 应用而不是扩展
pnpm build

# 正确：构建扩展
BUILD_TARGET=extension pnpm build
或
pnpm build:extension
```

---

## ✅ 解决方案

### 方法1：使用正确的构建命令（推荐）

```bash
# 清理旧文件
rm -rf dist

# 构建扩展
pnpm build:extension
```

### 方法2：手动设置环境变量

**Windows PowerShell**：
```powershell
Remove-Item -Recurse -Force dist
$env:BUILD_TARGET="extension"
pnpm build
```

**Windows CMD**：
```cmd
rmdir /s /q dist
set BUILD_TARGET=extension
pnpm build
```

**macOS / Linux**：
```bash
rm -rf dist
BUILD_TARGET=extension pnpm build
```

---

## 🔧 完整修复步骤

### 步骤1：清理旧文件

```bash
cd greenbreathe-export
rm -rf dist node_modules/.vite
```

### 步骤2：重新构建

```bash
pnpm build:extension
```

### 步骤3：验证文件

```bash
ls dist/

# 应该看到：
# background.js ✓
# content.js ✓
# manifest.json ✓
# options.html ✓
# popup.html ✓
# icons/ ✓
# images/ ✓
# assets/ ✓
```

### 步骤4：重新加载扩展

1. 打开 `chrome://extensions/`
2. 找到"青植呼吸"扩展
3. 点击"刷新"按钮（🔄）
4. 或者先移除，再重新加载 dist 文件夹

### 步骤5：验证加载成功

**成功标志**：
- ✅ 扩展状态显示"已启用"（不是"加载中"）
- ✅ 工具栏出现绿色🌿图标
- ✅ 点击图标可以打开 popup
- ✅ 右键图标 → "选项"可以打开设置页面

---

## 🐛 常见加载错误

### 错误1：Service worker registration failed

**原因**：background.js 不存在或有语法错误

**解决**：
```bash
# 检查 background.js 是否存在
ls dist/background.js

# 重新构建
pnpm build:extension
```

### 错误2：Content script failed to load

**原因**：content.js 不存在或有语法错误

**解决**：
```bash
# 检查 content.js 是否存在
ls dist/content.js

# 重新构建
pnpm build:extension
```

### 错误3：Manifest file is missing or unreadable

**原因**：manifest.json 格式错误或不存在

**解决**：
```bash
# 检查 manifest.json
cat dist/manifest.json

# 重新运行 post-build 脚本
node scripts/post-build.js
```

### 错误4：Icons not found

**原因**：icons 文件夹没有复制到 dist

**解决**：
```bash
# 运行 post-build 脚本
node scripts/post-build.js

# 验证
ls dist/icons/
```

---

## 📋 构建检查清单

在重新加载扩展前，确保以下文件都存在：

- [ ] `dist/manifest.json`
- [ ] `dist/background.js` (重要！)
- [ ] `dist/content.js` (重要！)
- [ ] `dist/options.html`
- [ ] `dist/popup.html`
- [ ] `dist/icons/icon-16.png`
- [ ] `dist/icons/icon-48.png`
- [ ] `dist/icons/icon-128.png`
- [ ] `dist/images/ink-wash-mountain.png`
- [ ] `dist/assets/` (包含 CSS 和 JS chunks)

---

## 🎯 如何避免此问题

### 1. 始终使用正确的构建命令

**推荐**：
```bash
pnpm build:extension
```

**不推荐**：
```bash
pnpm build  # 这会构建 web 应用，不是扩展！
```

### 2. 添加构建前检查

在 `package.json` 中添加：
```json
{
  "scripts": {
    "build:extension": "BUILD_TARGET=extension vite build && node scripts/post-build.js",
    "prebuild:extension": "echo '🔨 Building Chrome Extension...'",
    "postbuild:extension": "echo '✅ Build complete! Load dist folder in Chrome.'"
  }
}
```

### 3. 验证构建结果

```bash
# 构建后立即验证
pnpm build:extension && ls -lh dist/background.js dist/content.js
```

---

## 🔍 调试技巧

### 查看 Chrome 扩展错误

1. 打开 `chrome://extensions/`
2. 找到"青植呼吸"扩展
3. 点击"错误"按钮（如果有）
4. 查看 service worker 日志：
   - 点击"service worker"链接
   - 查看 Console 中的错误信息

### 查看构建日志

```bash
# 详细构建日志
pnpm build:extension 2>&1 | tee build.log

# 检查是否有错误
grep -i error build.log
```

### 手动测试 background.js

```bash
# 检查语法
node -c dist/background.js

# 或使用 Chrome DevTools
# 在 service worker 页面打开 Console
```

---

## 📚 相关文档

- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [Service Workers](https://developer.chrome.com/docs/extensions/mv3/service_workers/)
- [Content Scripts](https://developer.chrome.com/docs/extensions/mv3/content_scripts/)
- [Vite Build Configuration](https://vitejs.dev/config/build-options.html)

---

## ✅ 问题已解决！

如果按照上述步骤操作，扩展应该能够正常加载了。

**验证成功的标志**：
1. ✅ 扩展状态从"加载中"变为"已启用"
2. ✅ 🌿 图标出现在工具栏
3. ✅ 点击图标可以打开 popup
4. ✅ 点击"打开设置"可以进入 Options 页面
5. ✅ 点击"立即测试"会在当前网页显示提醒

---

**最后更新**：2026-04-17  
**问题状态**：✅ 已修复
