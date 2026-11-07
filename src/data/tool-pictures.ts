// The one picture each tool's link-preview card draws beside or above its name, taken from what a
// person sees on that tool's own first screen, so the preview looks like the app they land on (Whit,
// 2026-10-22: "people will have greater trust if the formatting of the output loks like the toolkit
// they recieved"). Drawn as plain SVG strings so the card route and node scripts render them alike.
//
// The colours here are the tools' own, read from their first screens on 2026-11-07, not Hoplight's;
// that is why this file sits beside src/data/tools.ts and not under src/lib/brand, whose palette guard
// allows only the site's tokens. The Hoplight band on every card stays in src/lib/brand/tool-card.ts.

import type { ToolBrand } from './tools.ts';

/** Every picture is drawn in a square of this many units. */
export const PIC = 280;

const svg = (body: string, view = `0 0 ${PIC} ${PIC}`) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${view}">${body}</svg>`;

/** Revenge or Justice: the result rows' centre line, revenge running left in red, justice right in navy. */
function bars(b: ToolBrand): string {
  const rows = [-0.62, 0.86, 0.4, -0.28];
  const mid = PIC / 2;
  const rowH = 52;
  const top = (PIC - rows.length * rowH) / 2;
  const parts = rows.map((v, i) => {
    const y = top + i * rowH + rowH / 2;
    const w = Math.abs(v) * (mid - 8);
    const x = v < 0 ? mid - w : mid;
    return `<line x1="8" y1="${y}" x2="${PIC - 8}" y2="${y}" stroke="${b.ink}" stroke-opacity="0.16" stroke-width="2"/>`
      + `<rect x="${x.toFixed(1)}" y="${y - 13}" width="${w.toFixed(1)}" height="26" rx="5" fill="${v < 0 ? '#9C3327' : b.ink}"/>`;
  });
  return svg(parts.join('') + `<line x1="${mid}" y1="${top - 10}" x2="${mid}" y2="${top + rows.length * rowH + 10}" stroke="${b.ink}" stroke-width="3"/>`);
}

/** The Undo List: the signature field, outlined squares, the first stretch signed in gold. */
function field(b: ToolBrand): string {
  const cols = 8, cell = 26, gap = 8;
  const off = (PIC - (cols * cell + (cols - 1) * gap)) / 2;
  const cells: string[] = [];
  for (let k = 0; k < cols * cols; k++) {
    const x = off + (k % cols) * (cell + gap);
    const y = off + Math.floor(k / cols) * (cell + gap);
    cells.push(k < 27
      ? `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="3" fill="${b.accent}"/>`
      : `<rect x="${x + 1.75}" y="${y + 1.75}" width="${cell - 3.5}" height="${cell - 3.5}" rx="2.5" fill="none" stroke="${b.ink}" stroke-width="3.5"/>`);
  }
  return svg(cells.join(''));
}

/** Gut Check: one card at a time, the top card lit. */
function cards(b: ToolBrand): string {
  return svg(
    `<rect x="62" y="44" width="156" height="204" rx="18" fill="none" stroke="${b.ink}" stroke-opacity="0.35" stroke-width="4" transform="rotate(-9 140 146)"/>`
    + `<rect x="62" y="40" width="156" height="204" rx="18" fill="${b.accent}" transform="rotate(5 140 142)"/>`
    + `<rect x="92" y="96" width="96" height="10" rx="5" fill="${b.ground}" fill-opacity="0.85" transform="rotate(5 140 142)"/>`
    + `<rect x="92" y="122" width="64" height="10" rx="5" fill="${b.ground}" fill-opacity="0.55" transform="rotate(5 140 142)"/>`,
  );
}

/** Rumi Español: Rumi the cat, as the app's first screen and its own preview card draw it. */
function cat(): string {
  return svg(
    '<path d="M22 40 L18 14 L42 28 Z" fill="#3a2a5c"/><path d="M78 40 L82 14 L58 28 Z" fill="#3a2a5c"/>'
    + '<path d="M25 37 L23 21 L38 30 Z" fill="#e0409a"/><path d="M75 37 L77 21 L62 30 Z" fill="#e0409a"/>'
    + '<ellipse cx="50" cy="55" rx="31" ry="28" fill="#4a3570"/>'
    + '<path d="M30 30 C22 44 21 60 26 78 L34 76 C29 60 30 45 37 33 Z" fill="#b07bff"/>'
    + '<path d="M26 78 C27 84 29 88 32 92 L40 88 C36 84 35 80 34 76 Z" fill="#3ab8f0"/>'
    + '<ellipse cx="40" cy="53" rx="5.5" ry="6.5" fill="#fff"/><ellipse cx="61" cy="53" rx="5.5" ry="6.5" fill="#fff"/>'
    + '<circle cx="40.5" cy="54" r="3.2" fill="#1b1233"/><circle cx="61.5" cy="54" r="3.2" fill="#1b1233"/>'
    + '<circle cx="42" cy="52" r="1.1" fill="#fff"/><circle cx="63" cy="52" r="1.1" fill="#fff"/>'
    + '<path d="M50 62 l-3.5 -3 h7 Z" fill="#ffc0dd"/>'
    + '<path d="M50 65 q-4 4 -7 1 M50 65 q4 4 7 1" stroke="#1b1233" stroke-width="1.8" fill="none" stroke-linecap="round"/>'
    + '<path d="M28 60 h-9 M28 65 h-8 M72 60 h9 M72 65 h8" stroke="#ffffff" stroke-opacity="0.4" stroke-width="1.6" stroke-linecap="round"/>',
    '6 8 88 88',
  );
}

/** Letters: the traced letter as the app first shows it, its start dot, and the arrow for which way to go. */
function letter(b: ToolBrand): string {
  return svg(
    `<path d="M96 56 V214 H206" fill="none" stroke="${b.ink}" stroke-opacity="0.16" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>`
    + `<path d="M96 56 V150" fill="none" stroke="${b.accent}" stroke-width="10" stroke-linecap="round"/>`
    + `<path d="M76 140 L96 172 L116 140 Z" fill="${b.accent}"/>`
    + `<circle cx="96" cy="56" r="26" fill="${b.accent}"/>`,
  );
}

// A coarse equirectangular world, one character per dot: '#' land, 'u' the United States, which the
// AGIS map shades darkest. Hand-drawn for a 280-unit picture; it only has to read as the map.
const WORLD = [
  '................................',
  '......#####.....#.##########....',
  '..##uuuuu#.##...##############..',
  '..#uuuuuu#.....###############..',
  '...uuuuu#......############.#...',
  '....####.......##########.......',
  '.....###.......#########........',
  '......##........######..##......',
  '.......###......#####....#......',
  '........####....####.....##.....',
  '........#####....###......#.##..',
  '.........####....##.......####..',
  '.........###.....#.........##...',
  '.........##.....................',
  '..........#.....................',
];

/** AGIS policy search: the white map panel under the purple header, states shaded in the app's purple. */
function map(): string {
  const pitch = 7.6, dot = 6, x0 = 18, y0 = 84;
  const dots: string[] = [];
  WORLD.forEach((row, r) => [...row].forEach((c, k) => {
    if (c === '.') return;
    const fill = c === 'u' ? '#6F3DB8' : (k * 7 + r * 3) % 5 === 0 ? '#A784DE' : '#D8CCF0';
    dots.push(`<rect x="${(x0 + k * pitch).toFixed(1)}" y="${(y0 + r * pitch).toFixed(1)}" width="${dot}" height="${dot}" rx="1.5" fill="${fill}"/>`);
  }));
  return svg(`<rect x="6" y="66" width="268" height="150" rx="14" fill="#FFFFFF"/>` + dots.join(''));
}

/** AI Election Errors: the assistant's answer with the wrong date struck out, and the correction under it. */
function bubble(): string {
  return svg(
    '<rect x="20" y="40" width="240" height="124" rx="16" fill="#EEF0F3"/>'
    + '<rect x="42" y="62" width="70" height="10" rx="5" fill="#8A8F98"/>'
    + '<rect x="42" y="90" width="72" height="20" rx="3" fill="#F5D547"/>'
    + '<rect x="50" y="96" width="56" height="8" rx="4" fill="#1A1A1A" fill-opacity="0.55"/>'
    + '<rect x="40" y="99" width="76" height="3" fill="#1A1A1A"/>'
    + '<rect x="124" y="94" width="112" height="12" rx="6" fill="#1A1A1A" fill-opacity="0.7"/>'
    + '<rect x="42" y="126" width="170" height="12" rx="6" fill="#1A1A1A" fill-opacity="0.7"/>'
    + '<rect x="40" y="190" width="5" height="62" fill="#1A1A1A"/>'
    + '<rect x="60" y="196" width="180" height="12" rx="6" fill="#1A1A1A" fill-opacity="0.45"/>'
    + '<rect x="60" y="218" width="150" height="12" rx="6" fill="#1A1A1A" fill-opacity="0.45"/>'
    + '<rect x="60" y="240" width="90" height="12" rx="6" fill="#1A1A1A" fill-opacity="0.45"/>',
  );
}

/** Bet Appétit: the rosette at the top of its red band. */
function rosette(b: ToolBrand): string {
  const petals = Array.from({ length: 6 }, (_, i) => {
    const a = (i * Math.PI) / 3 - Math.PI / 2;
    return `<circle cx="${(140 + Math.cos(a) * 52).toFixed(1)}" cy="${(140 + Math.sin(a) * 52).toFixed(1)}" r="40" fill="${b.ink}"/>`;
  }).join('');
  return svg(petals + `<circle cx="140" cy="140" r="58" fill="${b.ink}"/><circle cx="140" cy="140" r="22" fill="${b.ground}"/>`);
}

/** DNC autopsy, taken apart: the report's own sentences, each in a tinted block with a red rule. */
function quotes(b: ToolBrand): string {
  const block = (y: number, widths: number[]) =>
    `<rect x="16" y="${y}" width="248" height="${22 + widths.length * 20}" rx="4" fill="#F4E5E4"/>`
    + `<rect x="16" y="${y}" width="6" height="${22 + widths.length * 20}" fill="${b.accent}"/>`
    + widths.map((w, i) => `<rect x="38" y="${y + 14 + i * 20}" width="${w}" height="9" rx="4.5" fill="${b.ink}" fill-opacity="0.7"/>`).join('');
  return svg(block(22, [204, 190, 120]) + block(118, [196, 150]) + block(194, [180, 206, 90]));
}

/** Oregon school budget report: thirteen years of school, K to 12, and the year a student never gets. */
function years(b: ToolBrand): string {
  const cells: string[] = [];
  for (let k = 0; k < 13; k++) {
    const x = 26 + (k % 4) * 60;
    const y = 26 + Math.floor(k / 4) * 60;
    cells.push(k < 12
      ? `<rect x="${x}" y="${y}" width="48" height="48" rx="4" fill="${b.ink}"/>`
      : `<rect x="${x + 2}" y="${y + 2}" width="44" height="44" rx="3" fill="none" stroke="${b.accent}" stroke-width="4" stroke-dasharray="8 6"/>`);
  }
  return svg(cells.join(''));
}

/** What's Human?: the outlined choice chips of its first screen, one chosen. */
function chips(b: ToolBrand): string {
  const row = (y: number, n: number, on = -1) => Array.from({ length: n }, (_, i) =>
    i === on
      ? `<rect x="${20 + i * 62}" y="${y}" width="54" height="30" rx="5" fill="${b.ink}"/>`
      : `<rect x="${21 + i * 62}" y="${y + 1}" width="52" height="28" rx="4.5" fill="none" stroke="${b.ink}" stroke-opacity="0.45" stroke-width="2"/>`).join('');
  return svg(
    `<rect x="20" y="40" width="80" height="8" rx="4" fill="${b.ink}" fill-opacity="0.5"/>` + row(58, 4, 1)
    + `<rect x="20" y="114" width="120" height="8" rx="4" fill="${b.ink}" fill-opacity="0.5"/>` + row(132, 4) + row(170, 3)
    + `<rect x="21" y="221" width="114" height="30" rx="4.5" fill="none" stroke="${b.ink}" stroke-opacity="0.45" stroke-width="2"/>`
    + `<rect x="145" y="221" width="114" height="30" rx="4.5" fill="none" stroke="${b.ink}" stroke-opacity="0.45" stroke-width="2"/>`,
  );
}

/** Which AI should I use?: the picker's table, each plan and tier marked red, yellow or green. */
function picker(b: ToolBrand): string {
  const tone = [['#F6D5D1', '#B3261E'], ['#F8E9B9', '#8A6A00'], ['#D9EED9', '#2E7D32']];
  const grid = [[0, 0, 1, 1], [0, 1, 1, 1], [2, 1, 2, 2], [2, 2, 2, 2]];
  const rows = grid.map((r, i) => {
    const y = 78 + i * 46;
    return `<rect x="22" y="${y + 9}" width="44" height="10" rx="5" fill="${b.ink}" fill-opacity="0.75"/>`
      + r.map((t, j) => `<rect x="${80 + j * 46}" y="${y}" width="40" height="28" rx="6" fill="${tone[t][0]}"/>`
        + `<rect x="${88 + j * 46}" y="${y + 11}" width="24" height="6" rx="3" fill="${tone[t][1]}"/>`).join('');
  }).join('');
  return svg(
    `<rect x="8" y="30" width="264" height="232" rx="12" fill="#FFFFFF" stroke="${b.ink}" stroke-opacity="0.18" stroke-width="2"/>`
    + `<rect x="22" y="48" width="70" height="12" rx="6" fill="${b.ink}"/>` + rows,
  );
}

/** Worker equity dilution at GE: the workforce as a grey area over eighty years, the pool line spiking green. */
function area(b: ToolBrand): string {
  const ws = [70, 96, 120, 150, 140, 168, 190, 176, 200, 186, 214, 160, 120, 92];
  const step = 236 / (ws.length - 1);
  const pts = ws.map((v, i) => `${(22 + i * step).toFixed(1)},${(250 - v).toFixed(1)}`).join(' ');
  const pool = [6, 8, 8, 10, 12, 12, 16, 22, 30, 60, 150, 196, 120, 70];
  const line = pool.map((v, i) => `${(22 + i * step).toFixed(1)},${(250 - v).toFixed(1)}`).join(' ');
  return svg(
    `<line x1="22" y1="250" x2="258" y2="250" stroke="${b.ink}" stroke-opacity="0.35" stroke-width="2"/>`
    + `<polygon points="22,250 ${pts} 258,250" fill="#D5DBE3" stroke="#4B5563" stroke-width="2.5" stroke-linejoin="round"/>`
    + `<polyline points="${line}" fill="none" stroke="#2E7D32" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/>`,
  );
}

/** The picture for a brand, or null when the tool has none. */
export function pictureSvg(b: ToolBrand): string | null {
  switch (b.glyph) {
    case 'bars': return bars(b);
    case 'field': return field(b);
    case 'cards': return cards(b);
    case 'cat': return cat();
    case 'letter': return letter(b);
    case 'map': return map();
    case 'bubble': return bubble();
    case 'rosette': return rosette(b);
    case 'quotes': return quotes(b);
    case 'years': return years(b);
    case 'chips': return chips(b);
    case 'picker': return picker(b);
    case 'area': return area(b);
    default: return null;
  }
}
