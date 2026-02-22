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

  // First flatten the image to remove transparency, using a neutral gray
  // Then read the raw pixels to analyze colors
  const flatBuf = await sharp(src)
    .flatten({ background: { r: 128, g: 128, b: 128 } })
    .raw()
    .toBuffer();

  // Sample at ~5% inward from each edge center - this should be in the blue zone
  const inset = Math.floor(w * 0.05);
  const edgeSamples = [
    [Math.floor(w / 2), inset],
    [Math.floor(w / 2), h - 1 - inset],
    [inset, Math.floor(h / 2)],
    [w - 1 - inset, Math.floor(h / 2)],
  ];

  let rSum = 0, gSum = 0, bSum = 0;
  for (const [x, y] of edgeSamples) {
    const idx = (y * w + x) * 3; // flattened = 3 channels
    rSum += flatBuf[idx]; gSum += flatBuf[idx + 1]; bSum += flatBuf[idx + 2];
    console.log(`Edge sample (${x},${y}): rgb(${flatBuf[idx]}, ${flatBuf[idx+1]}, ${flatBuf[idx+2]})`);
  }
  const bgR = Math.round(rSum / edgeSamples.length);
  const bgG = Math.round(gSum / edgeSamples.length);
  const bgB = Math.round(bSum / edgeSamples.length);
  console.log(`Detected BG: rgb(${bgR}, ${bgG}, ${bgB})`);

  // Check if detected color looks like the expected blue (~108,145,186)
  // If not, fall back to known blue
  const isBlue = bgB > bgR && bgB > bgG && bgR < 150 && bgG < 180;
  const finalR = isBlue ? bgR : 108;
  const finalG = isBlue ? bgG : 145;
  const finalB = isBlue ? bgB : 186;
  console.log(`Using BG: rgb(${finalR}, ${finalG}, ${finalB}) (${isBlue ? 'detected' : 'fallback'})`);

  // Now scan for the border width - look for where edge pixels differ from BG
  // Use flattened raw buffer with correct BG for color comparison  
  const flatBuf2 = await sharp(src)
    .flatten({ background: { r: finalR, g: finalG, b: finalB } })
    .raw()
    .toBuffer();

  function colorDist(idx) {
    const dr = flatBuf2[idx] - finalR;
    const dg = flatBuf2[idx + 1] - finalG;
    const db = flatBuf2[idx + 2] - finalB;
    return Math.sqrt(dr*dr + dg*dg + db*db);
  }

  const threshold = 30;
  const maxCrop = Math.floor(w * 0.04); // max 4% crop per side
  const cx = Math.floor(w / 2);
  const cy = Math.floor(h / 2);

  let topCrop = 0;
  for (let y = 0; y < maxCrop; y++) {
    if (colorDist((y * w + cx) * 3) < threshold) { topCrop = y; break; }
    topCrop = y + 1;
  }

  let bottomCrop = 0;
  for (let y = h - 1; y >= h - maxCrop; y--) {
    if (colorDist((y * w + cx) * 3) < threshold) { bottomCrop = h - 1 - y; break; }
    bottomCrop = h - y;
  }

  let leftCrop = 0;
  for (let x = 0; x < maxCrop; x++) {
    if (colorDist((cy * w + x) * 3) < threshold) { leftCrop = x; break; }
    leftCrop = x + 1;
  }

  let rightCrop = 0;
  for (let x = w - 1; x >= w - maxCrop; x--) {
    if (colorDist((cy * w + x) * 3) < threshold) { rightCrop = w - 1 - x; break; }
    rightCrop = w - x;
  }

  // Add 1px extra to ensure clean edge
  topCrop = Math.min(topCrop + 1, maxCrop);
  bottomCrop = Math.min(bottomCrop + 1, maxCrop);
  leftCrop = Math.min(leftCrop + 1, maxCrop);
  rightCrop = Math.min(rightCrop + 1, maxCrop);

  console.log(`Crop: top=${topCrop}, bottom=${bottomCrop}, left=${leftCrop}, right=${rightCrop} (max=${maxCrop})`);

  // Crop off the border, flatten onto BG
  const cropW = w - leftCrop - rightCrop;
  const cropH = h - topCrop - bottomCrop;

  const cropped = await sharp(src)
    .extract({ left: leftCrop, top: topCrop, width: cropW, height: cropH })
    .flatten({ background: { r: finalR, g: finalG, b: finalB } })
    .toBuffer();

  console.log(`Cropped to ${cropW}x${cropH}`);

  // Place on square BG-colored canvas
  const dim = Math.max(cropW, cropH);
  const tmpPath = resolve(iconsDir, 'icon-processed.png');

  await sharp({
    create: { width: dim, height: dim, channels: 3, background: { r: finalR, g: finalG, b: finalB } }
  })
    .composite([{
      input: cropped,
      left: Math.floor((dim - cropW) / 2),
      top: Math.floor((dim - cropH) / 2)
    }])
    .png()
    .toFile(tmpPath);

  console.log(`Created ${dim}x${dim} square icon`);

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
