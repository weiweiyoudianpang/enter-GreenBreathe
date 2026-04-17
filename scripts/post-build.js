// Post-build script to copy manifest and assets to dist
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');
const distDir = path.join(rootDir, 'dist-extension');

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

if (fs.existsSync(iconsSrc)) {
  if (!fs.existsSync(iconsDest)) {
    fs.mkdirSync(iconsDest, { recursive: true });
  }
  
  const files = fs.readdirSync(iconsSrc);
  files.forEach(file => {
    fs.copyFileSync(
      path.join(iconsSrc, file),
      path.join(iconsDest, file)
    );
  });
  console.log('✓ Copied icons');
}

// Copy images directory
const imagesSrc = path.join(publicDir, 'images');
const imagesDest = path.join(distDir, 'images');

if (fs.existsSync(imagesSrc)) {
  if (!fs.existsSync(imagesDest)) {
    fs.mkdirSync(imagesDest, { recursive: true });
  }
  
  const files = fs.readdirSync(imagesSrc);
  files.forEach(file => {
    fs.copyFileSync(
      path.join(imagesSrc, file),
      path.join(imagesDest, file)
    );
  });
  console.log('✓ Copied images');
}

console.log('\n✅ Extension build complete!');
console.log('📦 Load the extension from:', distDir);
