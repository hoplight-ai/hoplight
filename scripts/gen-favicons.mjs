import sharp from "sharp";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const pub = (name) => join(root, "public", name);

const svg = readFileSync(pub("favicon.svg"));
const sizes = {
  "favicon-16.png": 16,
  "favicon-32.png": 32,
  "favicon-48.png": 48,
  "apple-touch-icon.png": 180,
  "favicon-192.png": 192,
  "favicon-512.png": 512,
};
for (const [name, size] of Object.entries(sizes)) {
  await sharp(svg, { density: 384 }).resize(size, size).png().toFile(pub(name));
}

// Social card
const og = readFileSync(pub("og.svg"));
await sharp(og, { density: 144 }).resize(1200, 630).png().toFile(pub("og.png"));

console.log("favicons + og written");
