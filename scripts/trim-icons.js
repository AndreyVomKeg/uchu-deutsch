import sharp from 'sharp';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const iconsDir = resolve(root, 'public/icons');

const sizes = [
  { name: 'icon-180.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 }
];

async function trimIcons() {
  // Use icon-512 as source (largest)
  const sourcePath = resolve(iconsDir, 'icon-512.png');
  
  for (const { name, size } of sizes) {
    const outPath = resolve(iconsDir, name);
    await sharp(sourcePath)
      .trim()  // Remove white/light border
      .resize(size, size, { fit: 'contain', background: { r: 106, g: 155, b: 204, alpha: 1 } })
      .png()
      .toFile(outPath + '.tmp');
    
    // Replace original with trimmed version
    const { copyFileSync, unlinkSync } = await import('fs');
    unlinkSync(outPath);
    copyFileSync(outPath + '.tmp', outPath);
    unlinkSync(outPath + '.tmp');
    
    console.log(`Trimmed ${name} (${size}x${size})`);
  }
}

trimIcons().catch(err => {
  console.error('Icon trimming failed:', err);
  process.exit(1);
});
