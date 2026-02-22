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
  const w = meta.width;
  const h = meta.height;
  const ch = meta.channels;
  console.log(`Source: ${w}x${h}, ${ch} ch`);

  const raw = await sharp(src).raw().toBuffer();

  // Sample the blue BG color from center of each edge (25% inward)
  const inset = Math.floor(w * 0.25);
  const centerSamples = [
    [Math.floor(w / 2), inset],           // top-ish center
    [Math.floor(w / 2), h - inset],       // bottom-ish center
    [inset, Math.floor(h / 2)],           // left-ish center
    [w - inset, Math.floor(h / 2)],       // right-ish center
  ];

  let rSum = 0, gSum = 0, bSum = 0;
  for (const [x, y] of centerSamples) {
    const idx = (y * w + x) * ch;
    rSum += raw[idx]; gSum += raw[idx + 1]; bSum += raw[idx + 2];
    console.log(`Inner sample (${x},${y}): rgb(${raw[idx]}, ${raw[idx+1]}, ${raw[idx+2]})`);
  }
  const bgR = Math.round(rSum / centerSamples.length);
  const bgG = Math.round(gSum / centerSamples.length);
  const bgB = Math.round(bSum / centerSamples.length);
  console.log(`Detected inner BG: rgb(${bgR}, ${bgG}, ${bgB})`);

  // Scan from top edge inward to find where the border ends
  // Border pixel = significantly different from bgR/bgG/bgB
  function colorDist(idx) {
    const dr = raw[idx] - bgR;
    const dg = raw[idx + 1] - bgG;
    const db = raw[idx + 2] - bgB;
    return Math.sqrt(dr*dr + dg*dg + db*db);
  }

  const threshold = 40; // color distance threshold
  const cx = Math.floor(w / 2);
  const cy = Math.floor(h / 2);

  // Find top border
  let topCrop = 0;
  for (let y = 0; y < h / 2; y++) {
    const idx = (y * w + cx) * ch;
    if (colorDist(idx) < threshold) { topCrop = y; break; }
  }

  // Find bottom border
  let bottomCrop = h;
  for (let y = h - 1; y > h / 2; y--) {
    const idx = (y * w + cx) * ch;
    if (colorDist(idx) < threshold) { bottomCrop = y + 1; break; }
  }

  // Find left border
  let leftCrop = 0;
  for (let x = 0; x < w / 2; x++) {
    const idx = (cy * w + x) * ch;
    if (colorDist(idx) < threshold) { leftCrop = x; break; }
  }

  // Find right border  
  let rightCrop = w;
  for (let x = w - 1; x > w / 2; x--) {
    const idx = (cy * w + x) * ch;
    if (colorDist(idx) < threshold) { rightCrop = x + 1; break; }
  }

  console.log(`Border detected: top=${topCrop}, bottom=${h-bottomCrop}, left=${leftCrop}, right=${w-rightCrop}`);

  // Crop the border off and flatten onto BG color
  const cropW = rightCrop - leftCrop;
  const cropH = bottomCrop - topCrop;
  
  const cropped = await sharp(src)
    .extract({ left: leftCrop, top: topCrop, width: cropW, height: cropH })
    .flatten({ background: { r: bgR, g: bgG, b: bgB } })
    .toBuffer();

  console.log(`Cropped to ${cropW}x${cropH}`);

  // Create square output: place cropped image centered on BG-colored square
  const maxDim = Math.max(cropW, cropH);
  const tmpPath = resolve(iconsDir, 'icon-processed.png');
  
  await sharp({
    create: { width: maxDim, height: maxDim, channels: 3, background: { r: bgR, g: bgG, b: bgB } }
  })
    .composite([{
      input: cropped,
      left: Math.floor((maxDim - cropW) / 2),
      top: Math.floor((maxDim - cropH) / 2)
    }])
    .png()
    .toFile(tmpPath);

  console.log(`Created ${maxDim}x${maxDim} square icon`);

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
