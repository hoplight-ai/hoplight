// THE SIGN-IN PAGE: one password field, no username, no browser box.
//
// A read-only copy of quick-tools/lib/sign-in-page.mjs (Ops LOGIN1, 2026-09-26), lifted into this
// repo on 2026-10-19 (Whit: "5 yes", hidden pages go behind the existing one-password sign-in).
// quick-tools wrote that file to be lifted: it imports nothing, reads no env var and knows nothing
// about the site it sits in. Keep it that way, and keep the words and the look in step with the
// original so the one sign-in reads as one sign-in on every Hoplight site. Re-copy it from
// quick-tools rather than editing it here.
//
// THE RULE IT SERVES. A browser asking for a PAGE with no credential gets this page with a 200 and
// NO WWW-Authenticate header, so the browser never raises its own box. Everything else (scripts,
// curl, fetch from a page, anything under /api/, and any page asked for with ?dialog=1) still
// gets the 401 with the Basic challenge. That old door is the recovery path and it never closes.
//
// Inline and self-contained: a page shown to someone without the password cannot load anything
// else from behind it. No script, no external font, no image.

export const SIGN_IN_TITLE = 'Hoplight tools';
export const SIGN_IN_LINE = "This is Whit's private workspace. Sign in with the site password.";
export const WRONG_LINE = 'That password did not match.';

const TEMPLATE = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>{{TITLE}}</title>
<style>
:root{--bg:#ffffff;--ink:#0f1b2d;--soft:#2a3f5f;--line:#7b828c;--field:#ffffff;--warn:#9c3327;--gold:#d4950a;--gold-hot:#e8a820;--on-gold:#0f1b2d;--ring:#996d00}
@media (prefers-color-scheme:dark){:root{--bg:#0f1b2d;--ink:#e8ecf1;--soft:#b4bfcf;--line:#7d8794;--field:#162640;--warn:#f0907f;--ring:#d4950a}}
html,body{margin:0;background:var(--bg);color:var(--ink)}
body{min-height:100vh;display:grid;place-items:center;padding:0 16px;box-sizing:border-box;
  font:17px/1.6 Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif}
main{width:100%;max-width:420px}
h1{margin:0 0 12px;font-size:23px;font-weight:500;letter-spacing:-.01em;line-height:1.3}
h1::after{content:"";display:block;width:56px;height:2px;margin-top:12px;background:var(--gold)}
p{margin:0;color:var(--soft)}
form{margin-top:22px;display:grid;gap:10px}
label{font-size:15px;color:var(--soft)}
input{font:inherit;padding:10px 14px;border:1px solid var(--line);border-radius:4px;
  background:var(--field);color:var(--ink);width:100%;box-sizing:border-box;min-height:44px}
input:focus{outline:none;box-shadow:0 0 0 3px var(--ring)}
button{font:inherit;font-weight:500;min-height:44px;padding:0 18px;border:1px solid var(--gold);border-radius:4px;
  background:var(--gold);color:var(--on-gold);cursor:pointer}
button:hover{background:var(--gold-hot);border-color:var(--gold-hot)}
button:focus-visible{outline:none;box-shadow:0 0 0 3px var(--ring)}
.wrong{color:var(--warn);font-weight:500}
</style>
</head>
<body>
<main>
<h1>{{TITLE}}</h1>
<p>{{LINE}}</p>
<form method="post" action="{{ACTION}}">
{{WRONG}}<label for="pw">Password</label>
<input id="pw" type="password" name="password" autocomplete="current-password" autofocus required>
<input type="hidden" name="next" value="{{NEXT}}">
<button type="submit">Sign in</button>
</form>
</main>
</body>
</html>
`;

// Every attribute in the template is double-quoted, so these four are the whole set; the
// apostrophe in "Whit's" stays an apostrophe.
export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Where a successful sign-in may send the browser: a path on this same site, or `/`.
 * Accepted only when it starts with `/` and not `//`, carries no backslash or control character
 * (browsers read `/\evil` as `//evil`), and still resolves to this origin.
 */
export function safeNext(next) {
  if (typeof next !== 'string' || !next.startsWith('/') || next.startsWith('//')) return '/';
  if (/[\\\u0000-\u001f\u007f]/.test(next)) return '/';
  try {
    const base = 'https://same-origin.invalid';
    const url = new URL(next, base);
    if (url.origin !== base) return '/';
    return url.pathname + url.search;
  } catch {
    return '/';
  }
}

/**
 * Is this a browser asking for a page? GET or HEAD, Accept naming text/html, not under /api/,
 * and not asking for the old box on purpose with ?dialog=1. Anything else keeps the 401.
 */
export function isPageRequest(request) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return false;
  const url = new URL(request.url);
  if (url.pathname === '/api' || url.pathname.startsWith('/api/')) return false;
  if (url.searchParams.get('dialog') === '1') return false;
  return (request.headers.get('accept') || '').includes('text/html');
}

/** The page itself, as a string. `wrong` adds the one line above the field. */
export function signInPage({ title = SIGN_IN_TITLE, line = SIGN_IN_LINE, next = '/', wrong = false, action = '/api/grant' } = {}) {
  const fill = {
    TITLE: escapeHtml(title),
    LINE: escapeHtml(line),
    ACTION: escapeHtml(action),
    NEXT: escapeHtml(safeNext(next)),
    WRONG: wrong ? `<p class="wrong" role="alert">${escapeHtml(WRONG_LINE)}</p>\n` : '',
  };
  return TEMPLATE.replace(/\{\{(TITLE|LINE|ACTION|NEXT|WRONG)\}\}/g, (_, key) => fill[key]);
}

/** The page as a response: 200, HTML, never cached, and no WWW-Authenticate header. */
export function signInResponse(options = {}) {
  return new Response(signInPage(options), {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
    },
  });
}
