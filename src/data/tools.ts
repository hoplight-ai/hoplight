// Every tool and piece the portfolio can show, with the day it goes public and whether it has
// passed the go-public checklist. Whit, 2026-11-07: "can you schedule website updates? like maybe
// launch portfolio page w 3 builds and i keep adding on a posting schedule."
//
// The portfolio page shows an entry only when its release day has come (releaseAt, a plain date read
// as midnight in America/Los_Angeles) AND cleared is true. The page revalidates hourly, so a cleared
// entry appears on its day with no deploy. `cleared` flips to true only once
// `npm run launch:check -- <slug>` passes for that tool; until then the date alone shows nothing.
//
// `brand` is the tool's own look, which its link-preview card (/api/og/tool/<slug>) draws as the main
// field above the one Hoplight band, with one picture from src/data/tool-pictures.ts. Every tool's
// colours, face and picture were read from its own first screen on 2026-11-07, so the preview looks
// like the app a stranger lands on; only the band is Hoplight's.
//
// Imported by the page, the card route, the signal route and by node scripts (launch check, tests),
// so this file keeps relative imports with their .ts extension and only erasable TypeScript.

import { FACTS } from '../lib/facts.ts';

export type ToolKind = 'live' | 'interactive';

/**
 * Which part of the portfolio an entry sits in: a product someone uses, or a report someone reads.
 * Whit, 2026-11-07: "we had previously split out reports from apps and dashboards and I think we need
 * that sort of division ... like dilution at GE is a report." Required, so no drop lands without one.
 */
export type Shelf = 'product' | 'report';

/** The one picture a card draws (src/data/tool-pictures.ts), taken from the tool's own first screen. */
export type ToolGlyph =
  | 'none' | 'bars' | 'field' | 'cards' | 'cat' | 'letter' | 'map' | 'bubble' | 'rosette' | 'quotes'
  | 'years' | 'chips' | 'picker' | 'area';

export interface ToolBrand {
  /** The card's main field. */
  ground: string;
  /** The tool's one accent: the second word of a two-tone name, the lit part of a glyph. */
  accent: string;
  /** The name's colour on the ground. */
  ink: string;
  /** Google Fonts family the name is set in, and its weight. */
  display: { family: string; weight: number };
  /**
   * The name as drawn, one entry per line; `accent: true` paints that line in the accent, `mark` lays
   * a highlighter colour behind it, as the tool's own headline does.
   */
  wordmark: { text: string; accent?: boolean; mark?: string }[];
  glyph: ToolGlyph;
  /**
   * Two cards whose names run long (Oregon, GE) draw a smaller picture (240) so the name holds two lines;
   * Oregon's heavy face also sets its name at 100px. Every other card stays at 280 and 112px (third
   * visual review, 2026-11-07).
   */
  pic?: number;
  namePx?: number;
  /** Portfolio tile only (the card without its band): white top, the brand colour on the name and
   *  behind the picture, so a full-colour ground does not pull the eye ahead of the first tile.
   *  The link-preview card keeps the full ground. Design review of the rebuilt portfolio, 2026-11-07. */
  tileOnWhite?: boolean;
}

export interface Tool {
  slug: string;
  name: string;
  /** One sentence: what it is, for the portfolio card and the preview description. */
  line: string;
  href: string;
  kind: ToolKind;
  /** A product shows on /portfolio; a report is listed on /insights with Whit's writing (PORTSPLIT1, 2026-11-07). */
  shelf: Shelf;
  brand: ToolBrand;
  /** YYYY-MM-DD, the day it goes public, read as midnight America/Los_Angeles. */
  releaseAt: string;
  /** True only once the tool has passed the go-public checklist (npm run launch:check). */
  cleared: boolean;
  /** The slug of an older entry this one takes the place of once it is showing. */
  replaces?: string;
}

// The site's own tokens (src/app/globals.css :root), for pieces that carry the Hoplight look.
const NAVY = '#0F1B2D';
const WHITE = '#FFFFFF';
const GOLD = '#D4950A';
const GOLD_DEEP = '#996D00';


// The gallery as it stood on 2026-10-21, after Whit's removals that day ("i want these removed from
// my hoplight.ai portfolio"), kept exactly: same pieces, same words, same order. They share one
// release date so the newest-first sort leaves that order alone.
const GALLERY_AS_OF = '2026-10-21';

export const TOOLS: Tool[] = [
  // ---- The first drop, 2026-11-10 (Whit, 2026-11-07: "launch portfolio page w 3 builds") ----
  {
    slug: 'revenge-or-justice',
    name: 'Revenge or Justice',
    line: 'Paste a statement or a link. It says whether the words sound like revenge or justice, and how to say it so it lands.',
    href: '/revenge-or-justice',
    kind: 'live',
    shelf: 'product',
    // The page's own look: white ground, navy type, the result rows' centre line with revenge
    // running left in flag red and justice running right in navy. "Justice" rings second (Whit,
    // 2026-11-06: "make justice the second thing so that it rings").
    brand: {
      ground: WHITE,
      accent: GOLD_DEEP,
      ink: NAVY,
      display: { family: 'Albert Sans', weight: 600 },
      wordmark: [{ text: 'Revenge or' }, { text: 'Justice', accent: true }],
      glyph: 'bars',
    },
    releaseAt: '2026-11-10',
    cleared: false,
  },
  {
    slug: 'undo',
    name: 'The Undo List',
    line: 'Everything the second Trump administration did, sorted by what it takes to undo it in 2029.',
    href: '/undo',
    kind: 'live',
    shelf: 'product',
    // The page's own look: the signature field, one outlined square per pen item, gold when signed.
    brand: {
      ground: WHITE,
      accent: GOLD,
      ink: NAVY,
      display: { family: 'Albert Sans', weight: 600 },
      wordmark: [{ text: 'The Undo' }, { text: 'List' }],
      glyph: 'field',
    },
    releaseAt: '2026-11-10',
    cleared: false,
  },
  {
    slug: 'gut-check',
    name: 'Gut Check',
    line: 'Take a side on AI, the midterms, psychedelics, golf or the baseball draft, one card at a time.',
    href: 'https://gut-check-hoplight.vercel.app/play',
    kind: 'live',
    shelf: 'product',
    // Read from gut-check-hoplight.vercel.app/play on 2026-11-07: navy and gold, Inter.
    brand: {
      ground: NAVY,
      accent: '#E0A62A',
      ink: '#EDF0F4',
      display: { family: 'Inter', weight: 700 },
      wordmark: [{ text: 'Gut Check' }],
      glyph: 'cards',
    },
    // Moved up from 2026-11-10 (Whit, 2026-11-07: "get gut punch up early"); cleared on his call
    // before the security report exists.
    releaseAt: '2026-11-07',
    cleared: true,
  },

  // ---- Queued on the posting calendar (publicist, 2026-11-07) ----
  {
    slug: 'rumi',
    name: 'Rumi Español',
    line: 'A Spanish app for a five-year-old who cannot read yet. Tap, listen, repeat.',
    href: 'https://rumi-rouge.vercel.app',
    kind: 'live',
    shelf: 'product',
    // Read from rumi-rouge.vercel.app on 2026-11-07: a bright purple first screen (a purple to pink
    // gradient there; one flat purple here, since a card carries no gradient), white heavy sans, and
    // Rumi the cat, drawn as the app draws it. "Español" keeps the gold of the app's own preview card.
    brand: {
      ground: '#8E3FD3',
      accent: '#FFC53D',
      ink: WHITE,
      display: { family: 'Inter', weight: 800 },
      wordmark: [{ text: 'Rumi' }, { text: 'Español', accent: true }],
      glyph: 'cat',
    },
    releaseAt: '2026-11-24',
    cleared: false,
  },
  {
    slug: 'letters',
    name: 'Letters',
    line: 'A letter-formation app for a four-year-old: where each stroke starts, which way it goes, and in what order. Then paper.',
    href: 'https://letters-ten-eta.vercel.app',
    kind: 'live',
    shelf: 'product',
    // Read from letters-ten-eta.vercel.app on 2026-11-07. Its warm paper ground is a cream, which a
    // Hoplight surface never carries (Whit, 2026-10-06), so the card takes the app's own cool ground
    // (#E9F0F3, one of its three themes) with its ink and its burnt-orange start marker.
    brand: {
      ground: '#E9F0F3',
      accent: '#B4541A',
      ink: '#3A3226',
      display: { family: 'Inter', weight: 700 },
      wordmark: [{ text: 'Letters' }],
      glyph: 'letter',
    },
    releaseAt: '2026-12-09',
    cleared: false,
  },

  // ---- The gallery as of 2026-10-21, unchanged ----
  // The gallery used to live on the vault app's vercel.app address. Whit, 2026-09-15: it belongs on
  // hoplight.ai. The interactive pieces are served from public/portfolio/ (npm run gallery:pull).
  {
    slug: 'dnc-autopsy-taken-apart',
    name: 'DNC autopsy, taken apart',
    line: 'The party’s own 2024 after-action report, argued from its own numbers.',
    href: '/portfolio/dnc-autopsy-taken-apart.html',
    kind: 'interactive',
    shelf: 'report',
    brand: {
      // The report page: white, near-black type, its numbers and quote rules in red.
      ground: WHITE,
      accent: '#B3261E',
      ink: '#16181D',
      display: { family: 'Inter', weight: 700 },
      wordmark: [{ text: 'DNC' }, { text: 'autopsy,' }, { text: 'taken apart', accent: true }],
      glyph: 'quotes',
    },
    releaseAt: GALLERY_AS_OF,
    cleared: true,
  },
  // "(ARIA)" dropped (copy review, 2026-09-16): the card's own blurb never explains what ARIA
  // stands for, and AGIS is already the load-bearing name here.
  {
    slug: 'agis-policy-search-aria',
    name: 'AGIS policy search',
    line: `${FACTS.agis.sources} sources, ${FACTS.agis.jurisdictions} jurisdictions, searchable in plain English.`,
    href: '/agis',
    kind: 'live',
    shelf: 'product',
    brand: {
      // The AGIS header: its purple, white type in Barlow Semi Condensed, the map panel under it.
      ground: '#6F3DB8',
      accent: '#F5C842',
      ink: WHITE,
      display: { family: 'Barlow Semi Condensed', weight: 900 },
      wordmark: [{ text: 'AGIS policy' }, { text: 'search' }],
      glyph: 'map',
      tileOnWhite: true,
    },
    releaseAt: GALLERY_AS_OF,
    cleared: true,
  },
  // Whit, 2026-10-20: "add AI Election Errors to the hoplight.ai portfolio page." Served at
  // /ai-election-errors from its own Vercel project (see next.config.ts rewrites).
  {
    slug: 'ai-election-errors',
    name: 'AI Election Errors',
    line: 'Did a chatbot give someone wrong election information? A public form that builds the shared record.',
    href: '/ai-election-errors',
    kind: 'live',
    shelf: 'product',
    brand: {
      // The intake page: white, Source Serif headline with a yellow highlighter, the assistant's answer.
      ground: WHITE,
      accent: '#1A1A1A',
      ink: '#1A1A1A',
      display: { family: 'Source Serif 4', weight: 600 },
      wordmark: [{ text: 'AI Election' }, { text: 'Errors', mark: '#F5D547' }],
      glyph: 'bubble',
    },
    releaseAt: GALLERY_AS_OF,
    cleared: true,
  },
  {
    slug: 'bet-appetit',
    name: 'Bet Appetit',
    line: 'Bet tracker skinned as the Michelin Guide. Bets paid in dinners. Demo copy with invented data.',
    href: '/bet-appetit',
    kind: 'live',
    shelf: 'product',
    brand: {
      // The guide's red band, its white serif name and rosette.
      ground: '#A4212F',
      accent: WHITE,
      ink: WHITE,
      display: { family: 'EB Garamond', weight: 500 },
      wordmark: [{ text: 'Bet' }, { text: 'Appétit' }],
      glyph: 'rosette',
      tileOnWhite: true,
    },
    releaseAt: GALLERY_AS_OF,
    cleared: true,
  },
  {
    slug: 'oregon-school-budget-report',
    name: 'Oregon school budget report',
    line: 'Where Oregon K-12 money actually goes.',
    href: '/portfolio/oregon-school-budget-report.html',
    kind: 'interactive',
    shelf: 'report',
    brand: {
      // The report's first screen: a black Archivo headline on white, its eyebrow in red.
      ground: WHITE,
      accent: '#B42318',
      ink: '#111111',
      display: { family: 'Archivo', weight: 900 },
      wordmark: [{ text: 'Oregon school' }, { text: 'budget report' }],
      pic: 240,
      namePx: 100,
      glyph: 'years',
    },
    releaseAt: GALLERY_AS_OF,
    cleared: true,
  },
  {
    slug: 'what-s-human',
    name: 'What’s Human?',
    line: 'Guess whether a person or a machine wrote the text. Live vote tally.',
    href: 'https://whatshuman.vercel.app',
    kind: 'live',
    shelf: 'product',
    brand: {
      // The game's near-black ground, Lora title, outlined choice chips.
      ground: '#0D1017',
      accent: WHITE,
      ink: '#F2F2F2',
      display: { family: 'Lora', weight: 600 },
      wordmark: [{ text: 'What’s' }, { text: 'Human?' }],
      glyph: 'chips',
    },
    releaseAt: GALLERY_AS_OF,
    cleared: true,
  },
  {
    slug: 'which-ai-should-i-use',
    name: 'Which AI should I use?',
    line: 'Answer a few questions, get told which model fits the job.',
    href: '/tools/which-ai',
    kind: 'live',
    shelf: 'product',
    brand: {
      // The picker page: the site's white and navy, its table of red, yellow and green.
      ground: WHITE,
      accent: GOLD_DEEP,
      ink: NAVY,
      display: { family: 'Albert Sans', weight: 600 },
      wordmark: [{ text: 'Which AI' }, { text: 'should I use?' }],
      glyph: 'picker',
    },
    releaseAt: GALLERY_AS_OF,
    cleared: true,
  },
  {
    slug: 'worker-equity-dilution-at-ge',
    name: 'Worker equity dilution at GE',
    line: '80 years of worker equity draining out of one company.',
    href: '/portfolio/worker-equity-dilution-at-ge.html',
    kind: 'interactive',
    shelf: 'report',
    brand: {
      // The model page: white, navy title, the grey workforce area and the green pool line.
      ground: WHITE,
      accent: '#2E7D32',
      ink: '#1F2A44',
      display: { family: 'Inter', weight: 700 },
      wordmark: [{ text: 'Worker equity' }, { text: 'dilution at GE' }],
      pic: 240,
      glyph: 'area',
    },
    releaseAt: GALLERY_AS_OF,
    cleared: true,
  },
];

export const TOOL_BY_SLUG: Record<string, Tool> = Object.fromEntries(TOOLS.map((t) => [t.slug, t]));

/**
 * The instant a YYYY-MM-DD release day begins in America/Los_Angeles. Tries the standard-time offset
 * (UTC-8) first and moves an hour earlier if that instant falls in daylight time, so the answer is
 * right on either side of a clock change.
 */
export function releaseInstant(day: string): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!m) return Number.POSITIVE_INFINITY; // a malformed date never releases
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const pst = Date.UTC(y, mo - 1, d, 8);
  const hour = Number(
    new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', hourCycle: 'h23' }).format(new Date(pst)),
  );
  return hour === 0 ? pst : pst - (hour - 0) * 60 * 60 * 1000;
}

export interface VisibleOptions {
  /** Also show entries whose release day has come but which are not cleared (preview renders only). */
  includeUncleared?: boolean;
}

/**
 * What the portfolio shows at `now`: released and cleared entries, newest release first (ties keep
 * their order in TOOLS), minus any older entry a showing entry replaces.
 */
export function visibleTools(now: number, tools: Tool[] = TOOLS, opts: VisibleOptions = {}): Tool[] {
  const showing = tools.filter((t) => releaseInstant(t.releaseAt) <= now && (t.cleared || opts.includeUncleared === true));
  const replaced = new Set(showing.map((t) => t.replaces).filter((s): s is string => Boolean(s)));
  return showing
    .filter((t) => !replaced.has(t.slug))
    .map((t, i) => ({ t, i, at: releaseInstant(t.releaseAt) }))
    .sort((a, b) => b.at - a.at || a.i - b.i)
    .map((x) => x.t);
}

/**
 * The entries of `list` on one shelf, in its order (already scheduled by visibleTools). /portfolio shows
 * the products; /insights lists the reports beside Whit's writing (PORTSPLIT1 round two, 2026-11-07).
 */
export function onShelf(shelf: Shelf, list: Tool[]): Tool[] {
  return list.filter((t) => t.shelf === shelf);
}

/**
 * The clock the portfolio reads. Outside production (local runs and preview deploys) the env var
 * PORTFOLIO_NOW (any date Date can parse) stands in for now, so a render can show a future drop;
 * PORTFOLIO_SHOW_UNCLEARED=1 also shows entries not yet cleared. Production ignores both.
 */
export function portfolioClock(env: Record<string, string | undefined>, real: number = Date.now()): { now: number; includeUncleared: boolean } {
  if (env.VERCEL_ENV === 'production') return { now: real, includeUncleared: false };
  const override = env.PORTFOLIO_NOW ? Date.parse(env.PORTFOLIO_NOW) : NaN;
  return { now: Number.isNaN(override) ? real : override, includeUncleared: env.PORTFOLIO_SHOW_UNCLEARED === '1' };
}
