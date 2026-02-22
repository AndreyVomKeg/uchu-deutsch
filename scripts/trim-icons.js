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
  const { width, height, channels } = meta;
  console.log(`Source: ${width}x${height}, ${channels} ch`);

  // Read raw pixels to find the actual blue BG color
  const raw = await sharp(src).raw().toBuffer();

  // Sample pixels from the blue area of the icon (inside rounded rect, not corners)
  // The blue BG is roughly at 20% from edges
  const samplePoints = [
    [Math.floor(width * 0.15), Math.floor(height * 0.5)],  // left side blue
    [Math.floor(width * 0.85), Math.floor(height * 0.5)],  // right side blue
    [Math.floor(width * 0.5), Math.floor(height * 0.15)],  // top blue
    [Math.floor(width * 0.5), Math.floor(height * 0.85)],  // bottom blue
    [Math.floor(width * 0.2), Math.floor(height * 0.2)],   // top-left blue
    [Math.floor(width * 0.8), Math.floor(height * 0.8)],   // bottom-right blue
  ];

  for (const [x, y] of samplePoints) {
    const idx = (y * width + x) * channels;
    const r = raw[idx], g = raw[idx+1], b = raw[idx+2];
    const a = channels === 4 ? raw[idx+3] : 255;
    console.log(`Pixel[${x},${y}]: (${r},${g},${b},${a})`);
  }

  // Find the dominant blue by sampling opaque blue-ish pixels
  let rSum = 0, gSum = 0, bSum = 0, count = 0;
  for (const [x, y] of samplePoints) {
    const idx = (y * width + x) * channels;
    const a = channels === 4 ? raw[idx+3] : 255;
    if (a > 250) { // fully opaque
      rSum += raw[idx];
      gSum += raw[idx+1];
      bSum += raw[idx+2];
      count++;
    }
  }

  let BG;
  if (count > 0) {
    BG = {
      r: Math.round(rSum / count),
      g: Math.round(gSum / count),
      b: Math.round(bSum / count)
    };
  } else {
    BG = { r: 106, g: 155, b: 204 }; // fallback
  }
  console.log(`Detected BG: (${BG.r},${BG.g},${BG.b}) from ${count} samples`);

  // Flatten the image onto detected blue background
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
