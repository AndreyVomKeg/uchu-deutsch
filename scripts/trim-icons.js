import sharp from 'sharp';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { unlinkSync, copyFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const iconsDir = resolve(root, 'public/icons');

// Blue background color matching the icon design
const BG = { r: 106, g: 155, b: 204 };

const sizes = [
  { name: 'icon-180.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 }
];

async function main() {
  const src = resolve(iconsDir, 'icon-512.png');
  const meta = await sharp(src).metadata();
  console.log(`Source: ${meta.width}x${meta.height}, ${meta.channels} ch`);

  // Flatten the image onto blue background
  // This replaces all transparent/semi-transparent areas with the blue BG
  const tmpPath = resolve(iconsDir, 'icon-processed.png');
  await sharp(src)
    .flatten({ background: BG })
    .png()
    .toFile(tmpPath);

  console.log('Flattened onto blue background');

  // Generate all sizes
  for (const { name, size } of sizes) {
    const outPath = resolve(iconsDir, name);
    await sharp(tmpPath)
      .resize(size, size, { fit: 'fill' })
      .png()
      .toFile(outPath + '.tmp');
    unlinkSync(outPath);
    copyFileSync(outPath + '.tmp', outPath);
    unlinkSync(outPath + '.tmp');
    console.log(`Processed ${name} (${size}x${size})`);
  }

  unlinkSync(tmpPath);
  console.log('Done!');
}

main().catch(console.error);
