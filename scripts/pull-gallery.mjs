// Copies the public-tier gallery pieces off the vault app so hoplight.ai serves them itself.
//
// Whit, 2026-09-15: the portfolio should not send people from hoplight.ai to a vercel.app address.
// The vault gallery stays as the gated shelf; this is a one-way snapshot of what it already shows
// to anybody, so nothing private can arrive through here. Re-run it when the public shelf changes.
//
// Usage: node scripts/pull-gallery.mjs

import { mkdir, writeFile, copyFile } from 'node:fs/promises';
import path from 'node:path';

const VAULT = 'https://vault-sigma-two.vercel.app';
const ROOT = process.cwd();
const OUT = path.join(ROOT, 'public', 'portfolio');
const THUMBS_IN = path.join(ROOT, '..', 'vault', 'public', 'thumbs');

const DOCS = [
  'dnc-autopsy-taken-apart',
  'ai-governance-checklist',
  'ai-lobbyist-player-map',
  'cba-win-pattern-playbook',
  'every-political-dollar-buys-less',
  'federal-agency-ai-inventory',
  'hoplight-persuasion-story-page',
  'oregon-school-budget-report',
  'pdi-trust-dilution-model',
  'redistricting-seat-shifts',
  'where-political-money-actually-works',
  'worker-equity-dilution-at-ge',
];

// Bet Appetit is left out on purpose: its thumbnail shows real names, and the demo copy gets its own.
const THUMBS = [
  'agis-policy-search-aria',
  'ai-governance-checklist',
  'ai-lobbyist-player-map',
  'cba-win-pattern-playbook',
  'dnc-autopsy-taken-apart',
  'every-political-dollar-buys-less',
  'federal-agency-ai-inventory',
  'oregon-school-budget-report',
  'pdi-trust-dilution-model',
  'redistricting-seat-shifts',
  'what-s-human',
  'where-political-money-actually-works',
  'which-ai-should-i-use',
  'worker-equity-dilution-at-ge',
];

await mkdir(path.join(OUT, 'thumbs'), { recursive: true });

let failed = 0;
for (const slug of DOCS) {
  const res = await fetch(`${VAULT}/api/portfolio/${slug}`);
  if (!res.ok) {
    console.log(`FAIL ${slug}: ${res.status}`);
    failed++;
    continue;
  }
  const html = await res.text();
  // A root-relative asset would resolve against hoplight.ai and break silently.
  const rootRefs = html.match(/(?:src|href)="\/(?!\/)[^"]*"/g) ?? [];
  await writeFile(path.join(OUT, `${slug}.html`), html);
  console.log(`ok   ${slug}.html ${Math.round(html.length / 1024)}KB root-refs=${rootRefs.length}`);
}

for (const slug of THUMBS) {
  await copyFile(path.join(THUMBS_IN, `${slug}.jpg`), path.join(OUT, 'thumbs', `${slug}.jpg`));
}
console.log(`thumbs copied: ${THUMBS.length}`);
process.exit(failed ? 1 : 0);
