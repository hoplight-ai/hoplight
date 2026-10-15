#!/usr/bin/env node
// Captures the portfolio's screenshots fresh from each live piece with the Chrome on this Mac, so the
// page shows the work as it is today (2026-10-15: the AGIS shot still showed its retired purple
// design, Which AI the retired header, What's Human an empty first screen).
//
// Each target is drawn at 1440x900 and saved as public/portfolio/thumbs/<slug>.jpg at 1200x750, the
// size the page and scripts/optimize-portfolio-thumbs.mjs expect. Run `npm run portfolio:thumbs`
// afterwards for the WebP variants.
//
// Usage: node scripts/capture-portfolio-thumbs.mjs [--only slug,slug] [--out <dir>]
// Chrome exits 2 on a teardown watchdog after writing (seen 2026-10-11), so the file, not the exit
// code, is the test.

import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const arg = (name) => {
  const i = process.argv.indexOf(name);
  return i === -1 ? null : process.argv[i + 1];
};
const OUT = arg('--out') || join(root, 'public', 'portfolio', 'thumbs');
const ONLY = arg('--only')?.split(',') ?? null;

// Slug -> the address the portfolio links to. Static pieces are read from hoplight.ai itself.
const SITE = 'https://hoplight.ai';
export const TARGETS = {
  'agis-policy-search-aria': 'https://ai-policy-tool.vercel.app',
  'what-s-human': 'https://whatshuman.vercel.app',
  'bet-appetit-demo': `${SITE}/bet-appetit`,
  'which-ai-should-i-use': `${SITE}/tools/which-ai`,
  'pandoras-router': 'https://router.hoplight.ai',
  'dnc-autopsy-taken-apart': `${SITE}/portfolio/dnc-autopsy-taken-apart.html`,
  'ai-governance-checklist': `${SITE}/portfolio/ai-governance-checklist.html`,
  'ai-lobbyist-player-map': `${SITE}/portfolio/ai-lobbyist-player-map.html`,
  'cba-win-pattern-playbook': `${SITE}/portfolio/cba-win-pattern-playbook.html`,
  'every-political-dollar-buys-less': `${SITE}/portfolio/every-political-dollar-buys-less.html`,
  'federal-agency-ai-inventory': `${SITE}/portfolio/federal-agency-ai-inventory.html`,
  'hoplight-persuasion-story-page': `${SITE}/portfolio/hoplight-persuasion-story-page.html`,
  'oregon-school-budget-report': `${SITE}/portfolio/oregon-school-budget-report.html`,
  'pdi-trust-dilution-model': `${SITE}/portfolio/pdi-trust-dilution-model.html`,
  'redistricting-seat-shifts': `${SITE}/portfolio/redistricting-seat-shifts.html`,
  'where-political-money-actually-works': `${SITE}/portfolio/where-political-money-actually-works.html`,
  'worker-equity-dilution-at-ge': `${SITE}/portfolio/worker-equity-dilution-at-ge.html`,
};

const work = mkdtempSync(join(tmpdir(), 'pf-thumbs-'));
try {
  for (const [slug, url] of Object.entries(TARGETS)) {
    if (ONLY && !ONLY.includes(slug)) continue;
    const png = join(work, `${slug}.png`);
    try {
      execFileSync(CHROME, [
        '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
        `--user-data-dir=${join(work, `profile-${slug}`)}`, '--virtual-time-budget=4000',
        '--window-size=1440,900', `--screenshot=${png}`, url,
      ], { stdio: 'ignore', timeout: 90000 });
    } catch (err) {
      if (!existsSync(png) || statSync(png).size === 0) {
        console.log(`FAIL ${slug}: ${err.message.split('\n')[0]}`);
        continue;
      }
    }
    const info = await sharp(png).resize(1200, 750, { fit: 'cover', position: 'top' }).jpeg({ quality: 82, mozjpeg: true }).toFile(join(OUT, `${slug}.jpg`));
    console.log(`ok ${slug}: ${info.size} bytes`);
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
