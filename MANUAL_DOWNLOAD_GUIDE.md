# 📦 青植呼吸 - 手动下载完整指南

本指南提供三种方法来手动获取项目文件。

---

## 方法一：使用导出脚本（推荐）⭐

### 步骤1：运行导出脚本

在Enter.pro界面的终端中运行：

```bash
node scripts/export-project.js
```

### 步骤2：等待完成

你会看到类似的输出：
```
🌿 青植呼吸 - 开始导出项目...
📁 创建导出目录
📄 复制配置文件...
  ✓ package.json
  ✓ vite.config.ts
  ...
✅ 导出完成！
📦 导出位置: /workspace/thread/greenbreathe-export
```

### 步骤3：下载导出文件夹

导出完成后，`greenbreathe-export` 文件夹包含了所有需要的文件。

**下载方法：**
- 如果Enter.pro提供文件浏览器，直接下载 `greenbreathe-export` 文件夹
- 或者将该文件夹打包成zip后下载

---

## 方法二：逐个复制关键文件

如果无法使用脚本，可以手动创建以下文件结构：

### 📁 项目结构

```
greenbreathe/
├── package.json
├── pnpm-lock.yaml
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── eslint.config.js
├── postcss.config.js
├── components.json
├── .gitignore
├── index.html
├── options.html
├── popup.html
├── README.md
├── LOCAL_TESTING_GUIDE.md
├── LICENSE
├── .env.example
│
├── public/
│   ├── manifest.json
│   ├── icons/
│   │   ├── icon-16.png
│   │   ├── icon-48.png
│   │   └── icon-128.png
│   └── images/
│       └── ink-wash.png
│
├── scripts/
│   └── post-build.js
│
└── src/
    ├── main.tsx
    ├── App.tsx
    ├── App.css
    ├── index.css
    ├── router.tsx
    ├── env.d.ts
    │
    ├── types/
    │   └── extension.ts
    │
    ├── lib/
    │   ├── utils.ts
    │   └── storage.ts
    │
    ├── hooks/
    │   ├── use-mobile.tsx
    │   └── use-toast.ts
    │
    ├── data/
    │   ├── mbtiMessages.ts
    │   └── scientificInstructions.ts
    │
    ├── extension/
    │   ├── background.ts
    │   ├── content.ts
    │   └── content-styles.css
    │
    ├── pages/
    │   ├── Index.tsx
    │   ├── NotFound.tsx
    │   ├── Options.tsx
    │   └── Popup.tsx
    │
    └── components/
        └── ui/
            ├── button.tsx
            ├── input.tsx
            ├── label.tsx
            ├── select.tsx
            ├── slider.tsx
            ├── switch.tsx
            ├── card.tsx
            ├── badge.tsx
            ├── progress.tsx
            ├── tabs.tsx
            └── ... (所有其他shadcn组件)
```

### 核心文件清单（必需）

#### 1. 配置文件（根目录）

<details>
<summary>点击展开完整文件列表</summary>

- `package.json` - 依赖配置
- `pnpm-lock.yaml` - 锁定依赖版本
- `vite.config.ts` - Vite构建配置
- `tailwind.config.ts` - Tailwind CSS配置
- `tsconfig.json` - TypeScript配置
- `tsconfig.app.json` - 应用TS配置
- `tsconfig.node.json` - Node TS配置
- `eslint.config.js` - ESLint配置
- `postcss.config.js` - PostCSS配置
- `components.json` - shadcn/ui配置
- `.gitignore` - Git忽略文件

</details>

#### 2. HTML入口文件（根目录）

- `index.html` - 主应用入口
- `options.html` - 扩展设置页面入口
- `popup.html` - 扩展弹出页面入口

#### 3. 文档文件（根目录）

- `README.md` - 项目说明
- `LOCAL_TESTING_GUIDE.md` - 测试指南（重要！）
- `BUILD_INSTRUCTIONS.md` - 构建说明
- `QUICKSTART.md` - 快速开始
- `LICENSE` - 许可证

#### 4. Public资源

- `public/manifest.json` - Chrome扩展配置文件（必需）
- `public/icons/icon-*.png` - 扩展图标（3个文件）
- `public/images/ink-wash.png` - 水墨背景图

#### 5. 构建脚本

- `scripts/post-build.js` - 构建后处理脚本

#### 6. 源代码 - 扩展核心（最重要）

```
src/extension/
├── background.ts          # 后台服务Worker
├── content.ts             # 内容脚本（弹窗注入）
└── content-styles.css     # 弹窗样式
```

#### 7. 源代码 - 数据库

```
src/data/
├── mbtiMessages.ts              # 180条MBTI鼓励语
└── scientificInstructions.ts    # 科学健康指令
```

#### 8. 源代码 - 页面

```
src/pages/
├── Options.tsx     # 设置页面
├── Popup.tsx       # 统计面板
├── Index.tsx       # 主页
└── NotFound.tsx    # 404页面
```

#### 9. 源代码 - 工具库

```
src/lib/
├── storage.ts      # Chrome Storage封装
└── utils.ts        # 通用工具函数
```

#### 10. 源代码 - 类型定义

```
src/types/
└── extension.ts    # TypeScript类型定义
```

#### 11. 源代码 - UI组件

```
src/components/ui/
├── button.tsx
├── input.tsx
├── label.tsx
├── select.tsx
├── slider.tsx
├── switch.tsx
├── card.tsx
├── badge.tsx
├── progress.tsx
├── tabs.tsx
└── ... (约60个shadcn组件)
```

---

## 方法三：使用压缩包命令

如果可以在Enter.pro中执行命令，运行：

```bash
# 创建压缩包
cd /workspace/thread
tar -czf greenbreathe.tar.gz \
  --exclude='node_modules' \
  --exclude='dist' \
  --exclude='.git' \
  .

# 或使用zip
zip -r greenbreathe.zip . \
  -x "node_modules/*" "dist/*" ".git/*"
```

然后下载生成的 `greenbreathe.tar.gz` 或 `greenbreathe.zip` 文件。

---

## 📋 文件重要性级别

### 🔴 关键文件（必须有）

这些文件缺一不可，否则无法运行：

```
✅ package.json                    # 依赖配置
✅ vite.config.ts                  # 构建配置
✅ public/manifest.json            # 扩展配置
✅ src/extension/background.ts     # 后台服务
✅ src/extension/content.ts        # 内容注入
✅ src/data/mbtiMessages.ts        # 鼓励语库
✅ src/data/scientificInstructions.ts  # 指令库
✅ src/lib/storage.ts              # 存储封装
✅ src/pages/Options.tsx           # 设置页面
✅ src/pages/Popup.tsx             # 统计面板
✅ scripts/post-build.js           # 构建脚本
```

### 🟡 重要文件（强烈推荐）

这些文件影响功能完整性：

```
⭐ tailwind.config.ts              # 样式配置
⭐ src/index.css                   # 全局样式
⭐ src/types/extension.ts          # 类型定义
⭐ public/icons/*                  # 扩展图标
⭐ public/images/ink-wash.png      # 水墨背景
⭐ options.html / popup.html       # HTML入口
⭐ src/components/ui/*             # UI组件库
```

### 🟢 辅助文件（建议包含）

这些文件提供文档和配置：

```
📖 README.md
📖 LOCAL_TESTING_GUIDE.md
📖 BUILD_INSTRUCTIONS.md
📖 LICENSE
⚙️ tsconfig.*.json
⚙️ eslint.config.js
⚙️ postcss.config.js
```

---

## 🎯 最小可运行文件集

如果空间或时间有限，以下是最小文件集（约50个文件）：

### 根目录（9个文件）
```
package.json
vite.config.ts
tailwind.config.ts
tsconfig.json
options.html
popup.html
index.html
README.md
LOCAL_TESTING_GUIDE.md
```

### public/（5个文件）
```
public/manifest.json
public/icons/icon-128.png
public/icons/icon-48.png
public/icons/icon-16.png
public/images/ink-wash.png
```

### scripts/（1个文件）
```
scripts/post-build.js
```

### src/extension/（3个文件）
```
src/extension/background.ts
src/extension/content.ts
src/extension/content-styles.css
```

### src/data/（2个文件）
```
src/data/mbtiMessages.ts
src/data/scientificInstructions.ts
```

### src/pages/（3个文件）
```
src/pages/Options.tsx
src/pages/Popup.tsx
src/pages/Index.tsx
```

### src/lib/（2个文件）
```
src/lib/storage.ts
src/lib/utils.ts
```

### src/types/（1个文件）
```
src/types/extension.ts
```

### src/（4个文件）
```
src/main.tsx
src/App.tsx
src/router.tsx
src/index.css
```

### src/components/ui/（必需的10个组件）
```
src/components/ui/button.tsx
src/components/ui/input.tsx
src/components/ui/label.tsx
src/components/ui/select.tsx
src/components/ui/slider.tsx
src/components/ui/switch.tsx
src/components/ui/card.tsx
src/components/ui/badge.tsx
src/components/ui/progress.tsx
src/components/ui/tabs.tsx
```

**总计：约40个核心文件**

---

## 🔧 下载后的安装步骤

无论使用哪种方法，下载完成后：

### 1. 解压/放置文件

```bash
# 如果是压缩包
unzip greenbreathe.zip
cd greenbreathe

# 或直接使用导出的文件夹
cd greenbreathe-export
```

### 2. 安装依赖

```bash
# 确保已安装pnpm
npm install -g pnpm

# 安装项目依赖
pnpm install
```

### 3. 构建扩展

```bash
pnpm build:extension
```

### 4. 加载到Chrome

1. 打开 `chrome://extensions/`
2. 启用"开发者模式"
3. 点击"加载已解压的扩展程序"
4. 选择 `dist` 文件夹

### 5. 开始使用

详细步骤请查看 `LOCAL_TESTING_GUIDE.md`

---

## ❓ 常见问题

### Q: pnpm-lock.yaml文件很大，必须要吗？

A: **不是必需的**。删除后首次运行 `pnpm install` 会自动生成新的。但保留它可以确保依赖版本完全一致。

### Q: 可以只下载src文件夹吗？

A: **不行**。还需要配置文件（package.json、vite.config.ts等）和public资源。建议至少下载"最小可运行文件集"。

### Q: node_modules文件夹需要复制吗？

A: **不需要**。这个文件夹非常大（几百MB），且可以通过 `pnpm install` 重新生成。

### Q: dist文件夹需要复制吗？

A: **不需要**。这是构建产物，通过 `pnpm build:extension` 生成。

### Q: 如何验证文件完整性？

A: 运行以下命令检查：

```bash
# 检查关键文件
ls package.json vite.config.ts public/manifest.json

# 检查src目录
ls src/extension/background.ts src/extension/content.ts

# 检查数据文件
ls src/data/mbtiMessages.ts src/data/scientificInstructions.ts

# 如果这些文件都存在，基本就完整了
```

---

## 📞 需要帮助？

如果下载过程中遇到问题：

1. **检查文件清单**：对照上面的"核心文件清单"
2. **查看错误信息**：构建失败时查看具体缺少哪个文件
3. **使用最小文件集**：先用最小文件集测试，再补充完整

---

## 🎯 下一步

文件下载完成后，继续阅读：

- 📖 **LOCAL_TESTING_GUIDE.md** - 完整的本地测试流程
- 📖 **BUILD_INSTRUCTIONS.md** - 详细的构建说明
- 📖 **QUICKSTART.md** - 5分钟快速上手

---

**祝你下载顺利！🌿**
