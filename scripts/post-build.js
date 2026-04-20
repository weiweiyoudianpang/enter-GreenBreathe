// Post-build script to copy manifest and assets to dist
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const distDir = path.join(rootDir, 'dist-extension');

// Recursive copy helper
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Copy manifest.json
const manifestSrc = path.join(publicDir, 'manifest.json');
const manifestDest = path.join(distDir, 'manifest.json');

if (fs.existsSync(manifestSrc)) {
  fs.copyFileSync(manifestSrc, manifestDest);
  console.log('✓ Copied manifest.json');
}

// Copy icons directory
const iconsSrc = path.join(publicDir, 'icons');
const iconsDest = path.join(distDir, 'icons');
copyDirRecursive(iconsSrc, iconsDest);
console.log('✓ Copied icons');

// Copy images directory (recursive, includes day/ and night/ subdirs)
const imagesSrc = path.join(publicDir, 'images');
const imagesDest = path.join(distDir, 'images');
copyDirRecursive(imagesSrc, imagesDest);
console.log('✓ Copied images (including day/night subdirectories)');

console.log('\n✅ Extension build complete!');
console.log('📦 Load the extension from:', distDir);
