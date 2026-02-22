import sharp from 'sharp';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, unlinkSync, copyFileSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const iconsDir = resolve(root, 'public/icons');

const BG = { r: 106, g: 155, b: 204 };

const sizes = [
  { name: 'icon-180.png', size: 180 },
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 }
];

function colorDist(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function floodFillWithColor(data, width, height, channels) {
  const visited = new Uint8Array(width * height);
  let head = 0;
  const queue = [];
  let replaced = 0;

  const shouldReplace = (idx) => {
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
    // Calculate distance from target blue BG
    const dist = colorDist(r, g, b, BG.r, BG.g, BG.b);
    // Replace if pixel is far from the blue BG (> 60 distance)
    // This catches white, light gray, light blue transition pixels
    if (dist > 60) return true;
    // Also replace semi-transparent pixels
    if (channels === 4 && data[idx + 3] < 200) return true;
    return false;
  };

  // Seed from all 4 edges
  for (let x = 0; x < width; x++) {
    queue.push(x);
    queue.push((height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) {
    queue.push(y * width);
    queue.push(y * width + (width - 1));
  }

  while (head < queue.length) {
    const pos = queue[head++];
    if (visited[pos]) continue;
    visited[pos] = 1;

    const x = pos % width;
    const y = Math.floor(pos / width);
    const idx = pos * channels;

    if (!shouldReplace(idx)) continue;

    data[idx] = BG.r;
    data[idx + 1] = BG.g;
    data[idx + 2] = BG.b;
    if (channels === 4) data[idx + 3] = 255;
    replaced++;

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
  console.log(`Source: ${meta.width}x${meta.height}, ${meta.channels} ch`);

  const raw = await img.raw().toBuffer();
  const { width, height, channels } = meta;

  // Debug: sample corner and edge pixels
  const samplePixel = (x, y) => {
    const idx = (y * width + x) * channels;
    return `(${data[idx]},${data[idx+1]},${data[idx+2]}${channels===4?','+data[idx+3]:''})`;
  };
  const data = raw;
  console.log(`Corner[0,0]: ${samplePixel(0,0)}`);
  console.log(`Corner[${width-1},0]: ${samplePixel(width-1,0)}`);
  console.log(`Edge[${Math.floor(width/2)},0]: ${samplePixel(Math.floor(width/2),0)}`);
  console.log(`Edge[0,${Math.floor(height/2)}]: ${samplePixel(0,Math.floor(height/2))}`);
  console.log(`Center[${Math.floor(width/2)},${Math.floor(height/4)}]: ${samplePixel(Math.floor(width/2),Math.floor(height/4))}`);

  const replaced = floodFillWithColor(raw, width, height, channels);
  console.log(`Flood fill replaced ${replaced} pixels with blue BG`);

  const processed = sharp(raw, {
    raw: { width, height, channels }
  });

  const tmpPath = resolve(iconsDir, 'icon-processed.png');
  await processed.png().toFile(tmpPath);

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
