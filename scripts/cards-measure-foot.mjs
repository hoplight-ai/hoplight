#!/usr/bin/env node
// Measures the frame and the lockup on exported link-preview cards from their pixels, so the live
// renderer can be held to the numbers of public/mockups/card-frames.html (treatment 3) and
// public/mockups/card-lockup.html (option b). Prints, per card: the window's box, the mat colour, the
// bloom's ink box, the H's ink box and the word's ink box, in card pixels.
// Run: node scripts/cards-measure-foot.mjs <card.png> [<card.png> ...]

import sharp from 'sharp';

const gold = ([r, g, b]) => r > 120 && r - b > 60 && g > 70;
const light = ([r, g, b]) => r > 120 && g > 120 && b > 120 && Math.abs(r - b) < 40;

for (const file of process.argv.slice(2)) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = (x, y) => {
    const i = (y * info.width + x) * 3;
    return [data[i], data[i + 1], data[i + 2]];
  };
  const box = (test, x0, x1, y0, y1) => {
    const b = [Infinity, Infinity, -1, -1];
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (test(px(x, y))) {
      b[0] = Math.min(b[0], x); b[1] = Math.min(b[1], y); b[2] = Math.max(b[2], x + 1); b[3] = Math.max(b[3], y + 1);
    }
    return { left: b[0], top: b[1], right: b[2], bottom: b[3], w: b[2] - b[0], h: b[3] - b[1] };
  };
  // The window: the first row and column, from the card's middle outward, that are not the mat.
  const mat = px(4, 4);
  const notMat = (x, y) => { const p = px(x, y); return Math.abs(p[0] - mat[0]) + Math.abs(p[1] - mat[1]) + Math.abs(p[2] - mat[2]) > 24; };
  let top = 0; while (top < 315 && !notMat(600, top)) top++;
  let left = 0; while (left < 600 && !notMat(left, 300)) left++;
  let right = info.width - 1; while (right > 600 && !notMat(right, 300)) right--;
  let bottom = info.height - 1; while (bottom > 315 && !notMat(600, bottom)) bottom--;
  const out = {
    card: file.split('/').pop(),
    size: `${info.width}x${info.height}`,
    mat: `#${mat.map((c) => c.toString(16).padStart(2, '0')).join('').toUpperCase()}`,
    window: { left, top, right: right + 1, bottom: bottom + 1, w: right + 1 - left, h: bottom + 1 - top },
    bloom: box(gold, 80, 150, 530, 630),
    H: box(light, 145, 200, 530, 630),
    word: box(light, 145, 420, 530, 630),
  };
  console.log(JSON.stringify(out));
}
