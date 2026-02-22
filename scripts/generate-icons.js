import sharp from 'sharp';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const sourcePath = resolve(root, 'public/icons/icon-original.png.png');
const iconsDir = resolve(root, 'public/icons');

const sizes = [
  { name: 'icon-180.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 }
];

async function generate() {
  for (const { name, size } of sizes) {
    const outPath = resolve(iconsDir, name);
    await sharp(sourcePath)
      .resize(size, size)
      .png()
      .toFile(outPath);
    console.log(`Generated ${name} (${size}x${size})`);
  }
}

generate().catch(err => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});
