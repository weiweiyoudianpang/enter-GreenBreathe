# 🌿 青植呼吸 - 跨平台安装指南

适用于 **Windows 11** | **macOS** | **Linux**

---

## 📋 目录

1. [环境准备](#环境准备)
2. [下载项目](#下载项目)
3. [安装依赖](#安装依赖)
4. [构建扩展](#构建扩展)
5. [加载到浏览器](#加载到浏览器)
6. [常见问题](#常见问题)

---

## 🔧 环境准备

### 1. 安装 Node.js (v18+)

#### Windows 11
```powershell
# 方法1: 官网下载安装包（推荐）
# 访问：https://nodejs.org/
# 下载 LTS 版本（例如 v20.x.x）
# 双击安装包，按提示完成安装

# 方法2: 使用 winget
winget install OpenJS.NodeJS.LTS

# 验证安装
node --version
npm --version
```

#### macOS
```bash
# 方法1: 官网下载安装包
# 访问：https://nodejs.org/
# 下载 macOS Installer (.pkg)

# 方法2: 使用 Homebrew（推荐）
brew install node

# 验证安装
node --version
npm --version
```

#### Linux (Ubuntu/Debian)
```bash
# 使用官方 NodeSource 仓库
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证安装
node --version
npm --version
```

#### Linux (Fedora/RHEL)
```bash
# 使用 dnf
sudo dnf install nodejs

# 验证安装
node --version
npm --version
```

### 2. 安装 pnpm

#### 所有平台通用
```bash
# 使用 npm 全局安装
npm install -g pnpm

# 验证安装
pnpm --version
```

#### Windows 11 特别说明
如果遇到权限问题，以管理员身份运行 PowerShell：
```powershell
# 右键点击 PowerShell → "以管理员身份运行"
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
npm install -g pnpm
```

---

## 📥 下载项目

### 方法1: 下载压缩包（推荐新手）

#### Windows 11
1. 下载 `greenbreathe-project.zip` (6.2MB)
2. 右键 → "全部解压缩"
3. 解压到你的工作目录，例如：`C:\Users\你的用户名\greenbreathe`

#### macOS
1. 下载 `greenbreathe-project.tar.gz` (6.1MB)
2. 双击自动解压，或在终端运行：
```bash
tar -xzf greenbreathe-project.tar.gz
cd greenbreathe-export
```

#### Linux
```bash
# 解压 tar.gz
tar -xzf greenbreathe-project.tar.gz
cd greenbreathe-export

# 或解压 zip
unzip greenbreathe-project.zip
cd greenbreathe-export
```

### 方法2: Git 克隆（推荐开发者）

#### 所有平台通用
```bash
# 如果有 Git 仓库
git clone https://your-repo-url.git greenbreathe
cd greenbreathe

# 如果没有 Git，请先安装：
# Windows: winget install Git.Git
# macOS: brew install git
# Linux: sudo apt install git
```

---

## 📦 安装依赖

### 打开终端/命令提示符

#### Windows 11
```powershell
# 方法1: 在项目文件夹中
# 按住 Shift + 右键 → "在此处打开 PowerShell 窗口"

# 方法2: 使用 Windows Terminal（推荐）
# Win + R → 输入 wt → 回车
cd C:\Users\你的用户名\greenbreathe-export
```

#### macOS
```bash
# 方法1: 使用 Finder
# 进入项目文件夹 → 右键 → "在终端中打开"

# 方法2: 手动导航
# Cmd + Space → 输入 Terminal → 回车
cd ~/Downloads/greenbreathe-export
```

#### Linux
```bash
# 在文件管理器中右键 → "在此处打开终端"
# 或手动导航
cd ~/Downloads/greenbreathe-export
```

### 安装项目依赖

#### 所有平台通用
```bash
# 安装依赖（首次运行，需要3-5分钟）
pnpm install

# 等待完成，应该看到类似输出：
# ✓ Packages: +XXX
# ✓ Done in X.XXs
```

**可能的问题**：

| 平台 | 问题 | 解决方案 |
|------|------|---------|
| Windows | `pnpm: 无法加载文件` | 以管理员运行 PowerShell，执行 `Set-ExecutionPolicy RemoteSigned` |
| macOS | `permission denied` | 使用 `sudo pnpm install` 或修复权限 |
| Linux | `EACCES` 错误 | 使用 `sudo pnpm install` 或修复 npm 权限 |

---

## 🔨 构建扩展

### 所有平台通用命令

```bash
# 构建 Chrome 扩展
pnpm build:extension

# 等待完成，应该看到：
# ✓ built in X.XXs
# ✅ Extension build complete!
# 📦 Load the extension from: /your/path/dist
```

### 验证构建结果

#### Windows 11
```powershell
# 检查 dist 文件夹
dir dist

# 应该看到：
# background.js
# content.js
# manifest.json
# options.html
# popup.html
# icons/
# images/
```

#### macOS / Linux
```bash
# 检查 dist 文件夹
ls -la dist/

# 应该看到相同的文件列表
```

---

## 🌐 加载到浏览器

### 支持的浏览器

- ✅ **Google Chrome** (88+)
- ✅ **Microsoft Edge** (88+)
- ✅ **Brave Browser**
- ✅ **Opera**
- ⚠️ **Firefox** (需要轻微调整)

### Chrome / Edge 加载步骤

#### 1. 打开扩展管理页面

| 平台 | 快捷键 | 或手动输入 |
|------|--------|-----------|
| Windows | `Ctrl + Shift + Delete` 然后点击"扩展程序" | `chrome://extensions/` |
| macOS | `Cmd + Shift + Delete` 然后点击"扩展程序" | `chrome://extensions/` |
| Linux | `Ctrl + Shift + Delete` 然后点击"扩展程序" | `chrome://extensions/` |

#### 2. 启用开发者模式

在页面右上角找到并**开启**"开发者模式"开关

#### 3. 加载扩展

点击左上角的"**加载已解压的扩展程序**"按钮

#### 4. 选择 dist 文件夹

**Windows 11**:
```
C:\Users\你的用户名\greenbreathe-export\dist
```

**macOS**:
```
/Users/你的用户名/greenbreathe-export/dist
```

**Linux**:
```
/home/你的用户名/greenbreathe-export/dist
```

#### 5. 完成！

你应该看到：
- 🌿 青植呼吸扩展卡片
- 浏览器工具栏出现绿色图标
- 扩展状态显示为"已启用"

---

## ⚙️ 配置和测试

### 1. 打开设置页面

#### 方法1: 点击图标
点击浏览器工具栏的 🌿 图标 → **"打开设置"**

#### 方法2: 右键菜单
右键点击 🌿 图标 → **"选项"**

### 2. 基础配置

```
1. 昵称：输入你的名字
2. MBTI：选择你的性格类型
3. 提醒间隔：
   💧 喝水：45分钟（推荐）
   👁️ 眼睛：20分钟（推荐）
   🏃 运动：60分钟（推荐）
4. 弹窗位置：右上角（默认）
```

### 3. 测试提醒

点击"**立即测试**"按钮，应该在当前网页看到通知弹出

### 4. 验证功能

- ✅ 弹窗显示在正确位置
- ✅ 可以点击弹窗下方的网页内容（穿透不干扰）
- ✅ 水墨晕染动画流畅
- ✅ 植物生长动画显示

---

## 🐛 常见问题

### Windows 11 特定问题

#### Q1: PowerShell 无法运行 pnpm
```powershell
# 错误：无法加载文件 pnpm.ps1
# 解决：以管理员身份运行 PowerShell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# 然后重新尝试
pnpm --version
```

#### Q2: 找不到 dist 文件夹
```powershell
# 检查当前目录
pwd

# 应该显示类似：
# Path: C:\Users\你的用户名\greenbreathe-export

# 如果不对，重新导航
cd C:\Users\你的用户名\greenbreathe-export
```

#### Q3: 扩展图标不显示
```
1. 检查 dist/icons/ 文件夹是否存在
2. 重新构建：pnpm build:extension
3. 在 chrome://extensions/ 点击扩展的刷新按钮
```

### macOS 特定问题

#### Q1: 权限被拒绝
```bash
# 如果遇到 EACCES 错误
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# 或使用 sudo 安装
sudo pnpm install
```

#### Q2: Homebrew 未安装
```bash
# 安装 Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 然后安装 Node.js
brew install node
```

#### Q3: 找不到 greenbreathe-export 文件夹
```bash
# 检查下载文件夹
ls ~/Downloads/

# 或使用 Spotlight 搜索
# Cmd + Space → 输入 greenbreathe
```

### Linux 特定问题

#### Q1: npm 权限错误
```bash
# 方法1: 修复 npm 权限（推荐）
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# 方法2: 使用 sudo（不推荐）
sudo pnpm install
```

#### Q2: Node.js 版本太旧
```bash
# 卸载旧版本
sudo apt remove nodejs npm

# 安装最新 LTS 版本
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 验证
node --version  # 应该显示 v20.x.x
```

#### Q3: 缺少构建工具
```bash
# Ubuntu/Debian
sudo apt-get install build-essential

# Fedora
sudo dnf groupinstall "Development Tools"

# 然后重新安装依赖
pnpm install
```

### 通用问题

#### Q1: 构建失败
```bash
# 清理并重新安装
rm -rf node_modules dist
pnpm install
pnpm build:extension
```

#### Q2: 扩展无法加载
```
1. 检查 dist/manifest.json 是否存在
2. 确保选择的是 dist 文件夹，不是项目根目录
3. 查看 Chrome 扩展页面的错误信息
4. 尝试重新构建
```

#### Q3: 测试提醒无反应
```
1. 确保在一个普通网页上（不是 chrome:// 页面）
2. 检查扩展权限是否授予
3. 打开 Chrome DevTools → Console 查看错误
4. 重新加载扩展
```

---

## 📁 项目结构说明

```
greenbreathe-export/
├── dist/                    # 构建输出（加载这个文件夹）
│   ├── manifest.json       # 扩展配置
│   ├── background.js       # 后台服务
│   ├── content.js          # 内容脚本
│   ├── options.html        # 设置页面
│   ├── popup.html          # 弹出面板
│   ├── icons/              # 扩展图标
│   └── images/             # 背景图片
├── src/                    # 源代码
├── public/                 # 静态资源
├── package.json            # 项目配置
├── pnpm-lock.yaml         # 依赖锁定
└── README.md              # 项目说明
```

---

## 🎯 下一步

### 完成安装后

1. ✅ **阅读 README.md** - 了解产品理念
2. ✅ **阅读 FEATURES.md** - 深入了解四大卖点
3. ✅ **打开设置页面** - 配置个性化参数
4. ✅ **测试提醒功能** - 验证穿透不干扰
5. ✅ **正常使用** - 开始关爱自己的健康！

### 获取帮助

- 📖 **完整文档**: `LOCAL_TESTING_GUIDE.md`
- 🛠️ **构建指南**: `BUILD_INSTRUCTIONS.md`
- 🚀 **快速开始**: `QUICKSTART.md`
- 🐛 **问题排查**: `LOCAL_TESTING_GUIDE.md` → "常见问题"

---

## 💡 命令速查表

### 开发命令

| 命令 | 说明 | 适用平台 |
|------|------|---------|
| `pnpm install` | 安装依赖 | 全平台 |
| `pnpm build:extension` | 构建扩展 | 全平台 |
| `pnpm dev` | 开发模式 | 全平台 |
| `pnpm lint` | 代码检查 | 全平台 |

### 目录导航

| Windows | macOS / Linux | 说明 |
|---------|---------------|------|
| `cd C:\path\to\project` | `cd /path/to/project` | 进入目录 |
| `dir` | `ls` | 列出文件 |
| `dir /s` | `ls -la` | 详细列表 |
| `pwd` | `pwd` | 当前路径 |
| `cls` | `clear` | 清屏 |

### 文件操作

| Windows | macOS / Linux | 说明 |
|---------|---------------|------|
| `del file.txt` | `rm file.txt` | 删除文件 |
| `rmdir /s dist` | `rm -rf dist` | 删除文件夹 |
| `copy file1 file2` | `cp file1 file2` | 复制文件 |
| `move file1 file2` | `mv file1 file2` | 移动文件 |

---

## 🌍 浏览器快捷键

### Chrome 扩展管理

| 功能 | Windows | macOS | Linux |
|------|---------|-------|-------|
| 打开扩展页面 | `Ctrl + Shift + Delete` → 扩展程序 | `Cmd + Shift + Delete` → 扩展程序 | `Ctrl + Shift + Delete` → 扩展程序 |
| 或直接输入 | `chrome://extensions/` | `chrome://extensions/` | `chrome://extensions/` |
| 开发者工具 | `F12` 或 `Ctrl + Shift + I` | `Cmd + Option + I` | `F12` 或 `Ctrl + Shift + I` |
| 刷新页面 | `Ctrl + R` | `Cmd + R` | `Ctrl + R` |

---

## ✅ 安装检查清单

使用这个清单确保每一步都正确完成：

- [ ] Node.js 已安装（v18+）
- [ ] pnpm 已全局安装
- [ ] 项目已下载并解压
- [ ] 进入项目目录
- [ ] 依赖已安装（pnpm install）
- [ ] 扩展已构建（pnpm build:extension）
- [ ] dist 文件夹存在且包含所有文件
- [ ] Chrome 扩展页面已打开
- [ ] 开发者模式已启用
- [ ] dist 文件夹已加载
- [ ] 扩展图标出现在工具栏
- [ ] 设置页面可以打开
- [ ] 测试提醒功能正常
- [ ] 穿透不干扰验证通过

---

## 🎉 成功！

如果上述所有步骤都完成了，恭喜你已经成功安装了 **青植呼吸 (GreenBreathe)**！

现在你可以：
- 🌿 享受温柔的健康提醒
- 🎯 体验真正不干扰的通知
- 🎨 欣赏水墨晕染的优雅
- 🌱 观察植物一天天成长
- 💬 收到符合你性格的鼓励语

**用温柔的方式，提醒你关爱自己 —— 但永远不会打断你的工作流**

---

**需要帮助？** 查看项目中的其他文档或提交 Issue。

**祝使用愉快！** 🌿✨
