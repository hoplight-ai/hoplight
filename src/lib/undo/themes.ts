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

// The tint is 24 percent of the hue; gold's is 36 percent, because a paler gold reads as cream and
// the site refuses a cream ground (scripts/no-cream-test.mjs: a warm tint lighter than 85 percent).
const T = (key: ThemeKey, name: string, hex: string, issues: IssueKey[], a = 0.24): Theme => ({ key, name, hex, tint: tintOf(hex, a), issues });

/** A signed square that steps back: the fill gold at the same 36 percent. */
export const SIGNED_TINT = tintOf('#D4950A', 0.36);

export const THEMES: Theme[] = [
  T('world', 'The world', '#2C5CA4', ['allies']),
  T('money', 'Money and work', '#E0A82A', ['prices', 'paycheck', 'farms-rural'], 0.36),
  T('land', 'Health, land and science', '#4AA36E', ['health', 'air-water', 'science']),
  T('people', 'Who counts', '#6C2763', ['immigrants', 'equal-treatment', 'women', 'lgbtq']),
  T('gov', 'Government and safety', '#CB5A41', ['government-works', 'checks-on-power', 'public-safety', 'veterans', 'schools']),
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
