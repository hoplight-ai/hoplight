// No page on hoplight.ai aims at people. Runs in prebuild, so a page that does cannot deploy.
//
//   node scripts/check-no-aim-at-people.mjs              the check: exits 1 and names every line that fails
//   node scripts/check-no-aim-at-people.mjs --prove-red  the matcher on fixed sentences, so it is seen saying no
//
// Whit, 2026-10-14, verbatim: "we have to eradicate "aiming at" people, ever, in all instances- this
// work space, but also all my accounts, all my tools and products. aiming at someone is violence. we
// dont do that." The Rayli page said the message is "built for the person you are actually aiming
// at" and closed on his quote "moves the person you're aiming at". Both were rewritten that day to
// "the person you want to reach", the same words now on Rayli's own sign-in screen.
//
// Every file under src/ and public/ is read, and "aim at / aims at / aimed at / aiming at / re-aiming
// at" with at most one word between fails, as does "aim for" followed by a person or a group. The rule
// is absolute on purpose: a line that aims at a deadline costs one rewrite, and a matcher that tried
// to tell people from deadlines is where the wording would get back in.
//
// NOT READ: src/data/undo/, the summaries of government actions behind /undo, which describe what a
// policy is "aimed at" (cost overruns, benefit programs) in the words of the record being summarised.
//
// Pure: reads files under the repo root as text. No network, no credential.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SERVED = ['src', 'public'];
const SKIP = new Set(['node_modules', '.next']);
const SKIP_PATHS = ['src/data/undo'];
const TEXT = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.css', '.html', '.json', '.md', '.mdx', '.txt', '.svg']);

const AIM_AT = /\b(?:re-?)?aim(?:s|ed|ing)?\s+(?:[\w’']+\s+)?at\b/i;
const AIM_FOR_PEOPLE = /\b(?:re-?)?aim(?:s|ed|ing)?\s+for\s+(?:the\s+|a\s+|an\s+|your\s+|our\s+|their\s+|this\s+|that\s+)?(?:people|person|someone|somebody|anyone|nobody|voters?|members?|audiences?|readers?|listeners?|workers?|you|them|him|her|us|families|parents|residents|reporters?|journalists?|lawmakers?|segments?|groups?)\b/i;
export const offends = (line) => AIM_AT.test(line) || AIM_FOR_PEOPLE.test(line);

if (process.argv.includes('--prove-red')) {
  const catchThese = ['built for the person you are actually aiming at.', 'moves the person you&rsquo;re aiming at.', 'aim for voters'];
  const passThese = ['moves the person you want to reach.', 'Aim for 150 to 300 words.'];
  let bad = 0;
  for (const s of catchThese) if (!offends(s)) { bad++; console.log(`FAIL not caught: ${s}`); }
  for (const s of passThese) if (offends(s)) { bad++; console.log(`FAIL wrongly caught: ${s}`); }
  console.log(bad ? `prove-red: ${bad} wrong` : `prove-red: ${catchThese.length} caught, ${passThese.length} passed`);
  process.exit(bad ? 1 : 0);
}

const files = [];
const walk = (d) => {
  for (const n of readdirSync(d)) {
    if (SKIP.has(n)) continue;
    const p = join(d, n);
    if (SKIP_PATHS.includes(relative(ROOT, p))) continue;
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (TEXT.has(extname(n).toLowerCase()) && st.size < 8_000_000) files.push(p);
  }
};
for (const d of SERVED) walk(join(ROOT, d));

const hits = [];
for (const f of files) readFileSync(f, 'utf8').split('\n').forEach((l, i) => {
  if (offends(l)) hits.push(`${relative(ROOT, f)}:${i + 1}: ${l.trim().slice(0, 160)}`);
});
if (hits.length) {
  console.log(`FAIL ${hits.length} line(s) on hoplight.ai aim at someone. Rewrite each as writing for, speaking to or reaching people:`);
  for (const h of hits) console.log(`  ${h}`);
  process.exit(1);
}
console.log(`ok no page on hoplight.ai aims at people (${files.length} files read)`);
