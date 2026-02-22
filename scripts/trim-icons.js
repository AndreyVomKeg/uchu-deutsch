import sharp from 'sharp';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { unlinkSync, copyFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const iconsDir = resolve(root, 'public/icons');

const sizes = [
  { name: 'icon-180.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 }
];

async function main() {
  const src = resolve(iconsDir, 'icon-512.png');
  const meta = await sharp(src).metadata();
  console.log(`Source: ${meta.width}x${meta.height}, ${meta.channels} ch`);

  // Step 1: Flatten FIRST onto detected BG, then blur heavily.
  // This creates a smooth background plate where edge colors extend naturally.
  // Flatten first ensures blur doesn't mix with transparent black.
  const bgPlate = await sharp(src)
    .flatten({ background: { r: 108, g: 145, b: 186 } })
    .blur(100)
    .toBuffer();

  // Step 2: Composite original (with alpha) over the blurred opaque plate.
  // The original's opaque pixels dominate; semi-transparent edges blend
  // with the matching blurred colors underneath.
  const tmpPath = resolve(iconsDir, 'icon-processed.png');
  await sharp(bgPlate)
    .composite([{ input: src, blend: 'over' }])
    .png()
    .toFile(tmpPath);

  console.log('Composited over flattened+blurred background');

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
