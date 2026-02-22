import sharp from 'sharp';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, unlinkSync, copyFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const iconsDir = resolve(root, 'public/icons');

// Target blue background color from the icon design
const BG = { r: 106, g: 155, b: 204 };

const sizes = [
  { name: 'icon-180.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 }
];

function floodFillWithColor(data, width, height, channels) {
  const visited = new Uint8Array(width * height);
  let head = 0;
  const queue = [];
  let replaced = 0;

  const shouldReplace = (idx) => {
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    // Replace if light/white/gray (background outside rounded rect)
    // The blue bg is r:106 g:155 b:204 - these are NOT light
    // Light pixels have all channels > 180
    if (r > 180 && g > 180 && b > 180) return true;
    // Also replace near-white with some transparency
    if (channels === 4) {
      const a = data[idx + 3];
      if (a < 200) return true;
    }
    return false;
  };

  // Seed from all 4 edges
  for (let x = 0; x < width; x++) {
    queue.push(x); // top row
    queue.push((height - 1) * width + x); // bottom row
  }
  for (let y = 0; y < height; y++) {
    queue.push(y * width); // left col
    queue.push(y * width + (width - 1)); // right col
  }

  while (head < queue.length) {
    const pos = queue[head++];
    if (visited[pos]) continue;
    visited[pos] = 1;

    const x = pos % width;
    const y = Math.floor(pos / width);
    const idx = pos * channels;

    if (!shouldReplace(idx)) continue;

    // Replace with blue BG color (fully opaque)
    data[idx] = BG.r;
    data[idx + 1] = BG.g;
    data[idx + 2] = BG.b;
    if (channels === 4) data[idx + 3] = 255;
    replaced++;

    // Add neighbors
    if (x > 0) queue.push(pos - 1);
    if (x < width - 1) queue.push(pos + 1);
    if (y > 0) queue.push(pos - width);
    if (y < height - 1) queue.push(pos + width);
  }

  return replaced;
}

async function main() {
  const src = resolve(iconsDir, 'icon-512.png');
  const img = sharp(src);
  const meta = await img.metadata();
  console.log(`Source: ${meta.width}x${meta.height}, ${meta.channels} channels`);

  // Get raw pixel data
  const raw = await img.raw().toBuffer();
  const { width, height, channels } = meta;

  // Flood fill edges with blue BG color
  const replaced = floodFillWithColor(raw, width, height, channels);
  console.log(`Flood fill replaced ${replaced} pixels with blue BG`);

  // Create processed source from modified raw data
  const processed = sharp(raw, {
    raw: { width, height, channels }
  });

  // Save as temp file for resizing
  const tmpPath = resolve(iconsDir, 'icon-processed.png');
  await processed.png().toFile(tmpPath);

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
