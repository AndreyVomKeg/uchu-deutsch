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

function floodFillEdges(data, width, height, channels) {
  const visited = new Uint8Array(width * height);
  const queue = [];

  const isLight = (idx) => {
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];
        return r > 140 && g > 140 && b > 140;
  };

  // Add all edge pixels to queue
  for (let x = 0; x < width; x++) {
    queue.push([x, 0]);
    queue.push([x, height - 1]);
  }
  for (let y = 0; y < height; y++) {
    queue.push([0, y]);
    queue.push([width - 1, y]);
  }

  while (queue.length > 0) {
    const [x, y] = queue.shift();
    if (x < 0 || x >= width || y < 0 || y >= height) continue;
    const pos = y * width + x;
    if (visited[pos]) continue;
    visited[pos] = 1;

    const idx = pos * channels;
    if (!isLight(idx)) continue;

    // Replace with bg color
    data[idx] = BG.r;
    data[idx + 1] = BG.g;
    data[idx + 2] = BG.b;
    data[idx + 3] = 255;

    // Add neighbors
    queue.push([x + 1, y]);
    queue.push([x - 1, y]);
    queue.push([x, y + 1]);
    queue.push([x, y - 1]);
  }
}

async function trimIcons() {
  const sourcePath = resolve(iconsDir, 'icon-512.png');
  const sourceBuffer = readFileSync(sourcePath);

  const { data, info } = await sharp(sourceBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;

  // Flood fill from edges - replace light border pixels with bg
  floodFillEdges(data, width, height, channels);

  const cleanedBuffer = await sharp(data, { raw: { width, height, channels } })
    .png()
    .toBuffer();

  for (const { name, size } of sizes) {
    const outPath = resolve(iconsDir, name);
    const tmpPath = outPath + '.tmp';

    await sharp(cleanedBuffer)
      .resize(size, size, { fit: 'contain', background: { ...BG, alpha: 1 } })
      .png()
      .toFile(tmpPath);

    unlinkSync(outPath);
    copyFileSync(tmpPath, outPath);
    unlinkSync(tmpPath);

    console.log(`Processed ${name} (${size}x${size})`);
  }
}

trimIcons().catch(err => {
  console.error('Icon processing failed:', err);
  process.exit(1);
});
