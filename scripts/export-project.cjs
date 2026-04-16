#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../greenbreathe-export');

const FILES_TO_COPY = [
  'package.json', 'pnpm-lock.yaml', 'vite.config.ts', 'tailwind.config.ts',
  'tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json', 
  'eslint.config.js', 'postcss.config.js', 'components.json', '.gitignore',
  'index.html', 'options.html', 'popup.html',
  'README.md', 'README_EXTENSION.md', 'BUILD_INSTRUCTIONS.md',
  'QUICKSTART.md', 'LOCAL_TESTING_GUIDE.md', 'PROJECT_SUMMARY.md',
  'CHECKLIST.md', 'LICENSE', '.env.example',
];

const DIRS_TO_COPY = ['src', 'public', 'scripts'];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  ensureDir(destDir);
  fs.copyFileSync(src, dest);
}

function copyDir(src, dest) {
  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', '.git'].includes(entry.name)) continue;
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  }
}

function countFiles(dir) {
  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      count += countFiles(path.join(dir, entry.name));
    } else {
      count++;
    }
  }
  return count;
}

function getDirSize(dir) {
  let size = 0;
  if (!fs.existsSync(dir)) return 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      size += getDirSize(fullPath);
    } else {
      size += fs.statSync(fullPath).size;
    }
  }
  return size;
}

function main() {
  console.log('🌿 青植呼吸 - 开始导出项目...\n');
  const rootDir = path.join(__dirname, '..');
  
  if (fs.existsSync(OUTPUT_DIR)) {
    console.log('🗑️  清理旧的导出目录...');
    fs.rmSync(OUTPUT_DIR, { recursive: true, force: true });
  }
  
  ensureDir(OUTPUT_DIR);
  console.log(`📁 创建导出目录: ${OUTPUT_DIR}\n`);
  
  console.log('📄 复制配置文件...');
  let copiedFiles = 0;
  for (const file of FILES_TO_COPY) {
    const src = path.join(rootDir, file);
    const dest = path.join(OUTPUT_DIR, file);
    if (fs.existsSync(src)) {
      copyFile(src, dest);
      console.log(`  ✓ ${file}`);
      copiedFiles++;
    }
  }
  
  console.log('\n📁 复制项目目录...');
  let copiedDirs = 0;
  for (const dir of DIRS_TO_COPY) {
    const src = path.join(rootDir, dir);
    const dest = path.join(OUTPUT_DIR, dir);
    if (fs.existsSync(src)) {
      copyDir(src, dest);
      const fileCount = countFiles(dest);
      console.log(`  ✓ ${dir}/ (${fileCount} 个文件)`);
      copiedDirs++;
    }
  }
  
  const startHere = `🌿 青植呼吸 (GreenBreathe) - Chrome扩展

感谢使用！这是一个导出的项目文件包。

📖 快速开始：
1. 安装依赖：pnpm install
2. 构建扩展：pnpm build:extension
3. 加载到Chrome
   - 打开 chrome://extensions/
   - 启用"开发者模式"
   - 点击"加载已解压的扩展程序"
   - 选择 dist 文件夹

📚 详细文档：
- LOCAL_TESTING_GUIDE.md - 完整测试指南
- QUICKSTART.md - 快速上手教程
- BUILD_INSTRUCTIONS.md - 构建说明

🎯 祝你使用愉快！`;
  
  fs.writeFileSync(path.join(OUTPUT_DIR, 'START_HERE.txt'), startHere);
  
  const totalSize = getDirSize(OUTPUT_DIR);
  const sizeInMB = (totalSize / 1024 / 1024).toFixed(2);
  
  console.log('\n✅ 导出完成！');
  console.log(`\n📊 统计：`);
  console.log(`  - 文件: ${copiedFiles}`);
  console.log(`  - 目录: ${copiedDirs}`);
  console.log(`  - 大小: ${sizeInMB} MB`);
  console.log(`\n📦 导出位置: ${OUTPUT_DIR}`);
  console.log('\n💡 下一步：');
  console.log('  1. 复制 greenbreathe-export 文件夹到你的电脑');
  console.log('  2. 进入文件夹，运行: pnpm install');
  console.log('  3. 构建: pnpm build:extension');
  console.log('  4. 查看 LOCAL_TESTING_GUIDE.md\n');
}

main();
