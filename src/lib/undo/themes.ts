import type { IssueKey } from './issues.ts';

// The five themes of the Undo List's first screen (UNDOTREE1, 2026-11-18). The sixteen "who feels it"
// issues stay in the data; on the page they fold into five themes, one hue each, because Whit could
// not hold ten-plus colours (UNDOQUILT1 done-file, 2026-11-18). Each issue key sits in exactly one
// theme, pinned by scripts/undo-classify.test.mjs. The hues were checked in OKLCH and in grayscale by
// the mockup lane (smallest grey step 25 of 255); gold and green are too light for text, so theme
// names are set in navy beside a swatch.

export type ThemeKey = 'world' | 'money' | 'land' | 'people' | 'gov';

export interface Theme {
  key: ThemeKey;
  name: string;
  hex: string;
  /** The light step a square takes when it is not the one in view: its own hue, never grey. */
  tint: string;
  issues: IssueKey[];
}

/** Mixes a hex colour toward white: a of the colour, 1 - a of white. */
export function tintOf(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  const mix = (c: number) => Math.round(c * a + 255 * (1 - a)).toString(16).padStart(2, '0');
  return `#${mix((n >> 16) & 255)}${mix((n >> 8) & 255)}${mix(n & 255)}`.toUpperCase();
}

// The tint is 24 percent of the hue; gold's is 42 percent, because a paler gold reads as cream and
// the site refuses a cream ground (scripts/no-cream-test.mjs: a warm tint lighter than 85 percent).
// The five hues sit on five grey steps about evenly spread (Rec. 601 luma 35, 71, 110, 151, 188;
// round three of UNDOTREE1, 2026-11-18), so the tree still reads in grayscale: who counts darkest,
// money lightest.
const T = (key: ThemeKey, name: string, hex: string, issues: IssueKey[], a = 0.24): Theme => ({ key, name, hex, tint: tintOf(hex, a), issues });

/** A signed square is hollow: white inside with a 2px navy edge (round three of UNDOTREE1,
 *  2026-11-18). It differs from every theme square by shape, so it survives grayscale and colour
 *  blindness; a navy fill read the same as the who-counts plum in grey. When it steps back, the
 *  edge goes to 36 percent navy. */
export const SIGNED = '#FFFFFF';
export const SIGNED_EDGE = '#0F1B2D';
export const SIGNED_TINT = tintOf(SIGNED_EDGE, 0.36);

/** Rec. 601 luma, the grey a colour prints as. */
export function greyOf(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return Math.round(0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255));
}

export const THEMES: Theme[] = [
  T('world', 'The world', '#234C8A', ['allies']),
  T('money', 'Money and work', '#EDBA42', ['prices', 'paycheck', 'farms-rural'], 0.42),
  T('land', 'Health, land and science', '#3A8C5A', ['health', 'air-water', 'science']),
  T('people', 'Who counts', '#3E1238', ['immigrants', 'equal-treatment', 'women', 'lgbtq']),
  T('gov', 'Government and safety', '#E57B5E', ['government-works', 'checks-on-power', 'public-safety', 'veterans', 'schools']),
];

export const THEME_BY_KEY: Record<ThemeKey, Theme> = Object.fromEntries(THEMES.map((t) => [t.key, t])) as Record<ThemeKey, Theme>;

const THEME_OF_ISSUE = new Map<IssueKey, ThemeKey>(THEMES.flatMap((t) => t.issues.map((i) => [i, t.key] as const)));

export function themeOfIssue(issue: IssueKey): ThemeKey | undefined {
  return THEME_OF_ISSUE.get(issue);
}

/** One theme per action: its first issue tag's theme, else its order's first issue's, else
 *  government and safety. Every square wears exactly one, so the chips' counts add up to the squares. */
export function themeOfRow(row: { issues?: readonly IssueKey[] }, orderIssues: readonly IssueKey[] = []): ThemeKey {
  for (const i of [...(row.issues ?? []), ...orderIssues]) {
    const t = THEME_OF_ISSUE.get(i);
    if (t) return t;
  }
  return 'gov';
}

/** Theme order for sorting squares inside a rectangle. */
export const THEME_RANK: Record<ThemeKey, number> = Object.fromEntries(THEMES.map((t, i) => [t.key, i])) as Record<ThemeKey, number>;
