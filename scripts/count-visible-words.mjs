// Counts the words a visitor can see on a served page, nav and footer included.
//
//   node scripts/count-visible-words.mjs [origin]      default origin http://localhost:8793
//
// Whit, 2026-10-20: the restructured pages have word budgets (home 60 to 90, products 70 to 100,
// insights 90 to 120, services 80 to 110). This reads the HTML the server sends and drops what no one
// sees: the head, scripts and styles, drawings (svg, canvas), text hidden with .sr-only, and the
// skip link that shows only on focus. Everything else counts, including the Pause control and the
// numerals marked aria-hidden. A word is a run of characters between spaces that holds a letter or digit.

const ORIGIN = process.argv[2] || 'http://localhost:8793';
const BUDGETS = { '/': [60, 90], '/products': [70, 100], '/insights': [90, 120], '/services': [80, 110] };

function visibleText(html) {
  let body = html.slice(html.indexOf('<body'));
  body = body.replace(/<(script|style|noscript|svg|canvas)\b[\s\S]*?<\/\1>/gi, ' ');
  body = body.replace(/<(\w+)\b[^>]*class="[^"]*\bsr-only\b[^"]*"[^>]*>[\s\S]*?<\/\1>/gi, ' ');
  body = body.replace(/<a\b[^>]*class="[^"]*\bskip-link\b[^"]*"[^>]*>[\s\S]*?<\/a>/gi, ' ');
  body = body.replace(/<[^>]+>/g, ' ');
  return body
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/&rsquo;/g, '’').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ').trim();
}

let failed = false;
for (const [route, [lo, hi]] of Object.entries(BUDGETS)) {
  const res = await fetch(ORIGIN + route);
  const text = visibleText(await res.text());
  const words = text.split(' ').filter((w) => /[\p{L}\p{N}]/u.test(w));
  const ok = words.length >= lo && words.length <= hi;
  if (!ok) failed = true;
  console.log(`${ok ? 'ok  ' : 'OVER'} ${route.padEnd(10)} ${String(words.length).padStart(3)} words (budget ${lo} to ${hi})`);
  if (process.env.SHOW) console.log('     ' + text);
}
process.exit(failed ? 1 : 0);
