// The grader's page script, ported 2026-11-06 from quick-tools/tools/justice-or-retribution.html as it stood
// (build v6) and kept as plain script on purpose: the exhibit is drawn by id into static markup the
// React tree never re-renders, so the two never fight over the same nodes. Only the three lines that
// name a route or the page root changed. Edits to the reading, the bars, the tiers or the headline list
// belong here and in the quick-tools original alike until that page is retired.
//
// Anonymous usage (2026-11-07, Whit: "user actions to be logged anonymized. queries and setting etc."):
// `opts.track` is src/lib/track.ts's track() bound to this tool. It logs a reading asked for (how it
// came in, its length, the first thousand characters as `query`), the verdict shown, the voice and
// issue picked, a headline clicked, a rewrite copied. What the server keeps and cuts: src/lib/signal.ts.

// Pure drawing helpers, at module scope so the page can draw the headline cards on the server (lane
// RJFAST1, 2026-11-10: the list arrives with the page). Nothing here touches the document.
var esc = function(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };

function host(u){ try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return u; } }

// Branding (Whit, 2026-11-09: "the news articles should jump off the page including the outlet that wrote
// them, there is not bold, no highlighting, no branding"). Each outlet shows its own icon (served through
// this site, never from the visitor's browser to a third party), its name in bold capitals, and its colour
// as the card's edge where the colour is well known; every other outlet takes the ink.
var OUTLET_HUE = {
  'cnn.com': '#CC0000', 'theguardian.com': '#052962', 'time.com': '#E90606', 'usatoday.com': '#0098FE',
  'newsweek.com': '#E1251B', 'yahoo.com': '#6001D2', 'reuters.com': '#FA6400', 'apnews.com': '#E2231A',
  'foxnews.com': '#003366', 'nypost.com': '#C8102E', 'politico.com': '#DC0D15', 'axios.com': '#2A62D6',
  'huffpost.com': '#0DBE98', 'theatlantic.com': '#E7131A', 'thehill.com': '#0B3B6E', 'npr.org': '#237BBD',
  'nbcnews.com': '#2D5DA8', 'msnbc.com': '#2D5DA8', 'ms.now': '#2D5DA8', 'dailykos.com': '#E8641B',
  'newrepublic.com': '#D52B1E', 'motherjones.com': '#C8102E', 'rollcall.com': '#0B3B6E', 'salon.com': '#CF3A2C',
  'timesofindia.indiatimes.com': '#B71C1C', 'abc7.com': '#1B4E9B', 'abcnews.go.com': '#1B4E9B', 'cbsnews.com': '#1B4E9B'
};
function hueOf(h){ h = String(h || '').replace(/^www\./, ''); if (OUTLET_HUE[h]) return OUTLET_HUE[h]; var parts = h.split('.'); return OUTLET_HUE[parts.slice(-2).join('.')] || ''; }
function logo(h, name){
  var initial = esc(String(name || h || '?').replace(/^the\s+/i, '').charAt(0).toUpperCase());
  return '<span class="logo" aria-hidden="true"><span class="mono">' + initial + '</span>' +
    // The icon stays invisible until it has loaded, so a slow or missing icon shows the outlet's letter on its colour, never an empty box.
    (h ? '<img src="/api/revenge-or-justice/logo?host=' + encodeURIComponent(h) + '" alt="" width="24" height="24" loading="lazy" onload="this.classList.add(\'ok\')" onerror="this.remove()">' : '') + '</span>';
}
// Where the news search gives an outlet a name nobody would know it by.
var OUTLET_NAME = { 'ms.now': 'MS NOW', 'msnbc.com': 'MS NOW' };
function outletBadge(h, name){
  var hue = hueOf(h);
  name = OUTLET_NAME[String(h || '').replace(/^www\./, '')] || name;
  return '<span class="outlet"' + (hue ? ' style="--oc:' + hue + '"' : '') + '>' + logo(h, name) + '<b>' + esc(name || h) + '</b></span>';
}

// Who is in it. The headline list names the Democrats the list watches (quick-tools lib/justice-feed.mjs);
// the chamber here is only for the title on the tag, so a name missing from this map still gets a tag.
var CHAMBER = {
  'Jamie Raskin': 'House', 'Robert Garcia': 'House', 'Hakeem Jeffries': 'House', 'Katherine Clark': 'House',
  'Pete Aguilar': 'House', 'Richard Neal': 'House', 'Maxine Waters': 'House', 'Frank Pallone': 'House',
  'Rosa DeLauro': 'House', 'Bennie Thompson': 'House', 'Jim Himes': 'House', 'Gregory Meeks': 'House',
  'Chuck Schumer': 'Senate', 'Dick Durbin': 'Senate', 'Elizabeth Warren': 'Senate', 'Ron Wyden': 'Senate',
  'Richard Blumenthal': 'Senate', 'Gary Peters': 'Senate'
};

// A headline's officials, from the list's tagger; an older list carries only the watched names.
function officialsOf(it){
  if (it.officials && it.officials.length) return it.officials;
  return (it.people || []).map(function(n){ return { name: n, role: CHAMBER[n] === 'Senate' ? 'Senator' : CHAMBER[n] === 'House' ? 'Representative' : '', kind: 'elected' }; });
}

// The dial (Whit, 2026-11-09: "oh oh oh snopes has those little dials"; on the mockup: "that topline is stornger
// as a dial ... the article one is good. the name and quote is good- but the 5 measures i think should be the
// bars still"). A half circle from revenge (left) to justice (right) in three bands at the tool's own cut-offs,
// 38 and 62; the needle points at the score, the score sits under the hub in its side's colour, and the band
// the score falls in is drawn full while the other two step back. Big for the verdict, small on an article
// card and on each person. An empty value draws an empty dial that says "Tap to read".
var DC = { revenge: '#9c3327', mixed: '#CFCAC0', justice: '#D4950A', ink: '#0F1B2D', stone: '#575752', gold: '#996D00', empty: '#E4E7EC' };
function dpt(cx, cy, r, v){ var a = Math.PI - (v / 100) * Math.PI; return [cx + r * Math.cos(a), cy - r * Math.sin(a)]; }
function darc(cx, cy, r, a, b){ var p = dpt(cx, cy, r, a), q = dpt(cx, cy, r, b); return 'M' + p[0].toFixed(2) + ' ' + p[1].toFixed(2) + ' A' + r + ' ' + r + ' 0 0 1 ' + q[0].toFixed(2) + ' ' + q[1].toFixed(2); }
function dside(v){ return v >= 62 ? 'justice' : v <= 38 ? 'revenge' : 'mixed'; }
// `wait` draws the big dial a first reading is filling: its three bands in their own colours, stepped back, no
// needle, "Reading" under the hub (lane RJFAST1, 2026-11-10: the wait shows what the visitor is about to get).
function dial(v, size, wait){
  var big = size === 'big';
  var W = big ? 300 : 120, r = big ? 118 : 44, sw = big ? 26 : 11;
  var cx = W / 2, cy = r + sw / 2 + 4, H = cy + (big ? 60 : 32);
  var has = v !== '' && v != null && !isNaN(+v);
  if (has) v = Math.round(+v);
  var label = has ? (dside(v) === 'mixed' ? 'Mixed' : dside(v) === 'revenge' ? 'Leans revenge' : 'Leans justice') + ', ' + v + ' of 100 toward justice' : wait ? 'Being read now' : 'Not read yet';
  var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" role="img" aria-label="' + label + '">';
  [[0, 38, 'revenge'], [38, 62, 'mixed'], [62, 100, 'justice']].forEach(function(b){
    var on = has && dside(v) === b[2];
    s += '<path d="' + darc(cx, cy, r, b[0] + (b[0] ? 1.2 : 0), b[1] - (b[1] < 100 ? 1.2 : 0)) + '" fill="none" stroke="' + (has || wait ? DC[b[2]] : DC.empty) + '" stroke-width="' + sw + '" stroke-opacity="' + (has && !on ? 0.6 : !has && wait ? 0.28 : 1) + '"/>';
  });
  if (big) [0, 25, 50, 75, 100].forEach(function(t){ var a = dpt(cx, cy, r + sw / 2 + 4, t), b = dpt(cx, cy, r + sw / 2 + 10, t); s += '<line x1="' + a[0].toFixed(2) + '" y1="' + a[1].toFixed(2) + '" x2="' + b[0].toFixed(2) + '" y2="' + b[1].toFixed(2) + '" stroke="' + DC.stone + '" stroke-width="1.5"/>'; });
  if (has) {
    var tip = dpt(cx, cy, r - sw / 2 - (big ? 6 : 3), v), a = Math.PI - (v / 100) * Math.PI, hw = big ? 7 : 4;
    var l = [cx + hw * Math.cos(a + Math.PI / 2), cy - hw * Math.sin(a + Math.PI / 2)], rr = [cx + hw * Math.cos(a - Math.PI / 2), cy - hw * Math.sin(a - Math.PI / 2)];
    s += '<path class="needle" d="M' + l[0].toFixed(2) + ' ' + l[1].toFixed(2) + ' L' + tip[0].toFixed(2) + ' ' + tip[1].toFixed(2) + ' L' + rr[0].toFixed(2) + ' ' + rr[1].toFixed(2) + ' Z" fill="' + DC.ink + '"/>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (big ? 11 : 6) + '" fill="' + DC.ink + '"/><circle cx="' + cx + '" cy="' + cy + '" r="' + (big ? 4 : 2) + '" fill="#fff"/>';
    var col = dside(v) === 'revenge' ? DC.revenge : dside(v) === 'justice' ? DC.gold : DC.stone;
    s += '<text x="' + cx + '" y="' + (cy + (big ? 50 : 26)) + '" text-anchor="middle" font-size="' + (big ? 44 : 22) + '" font-weight="800" fill="' + col + '">' + v + '</text>';
  } else if (wait) {
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (big ? 11 : 6) + '" fill="' + DC.ink + '"/><circle cx="' + cx + '" cy="' + cy + '" r="' + (big ? 4 : 2) + '" fill="#fff"/>';
    s += '<text x="' + cx + '" y="' + (cy + (big ? 46 : 26)) + '" text-anchor="middle" font-size="' + (big ? 20 : 13) + '" font-weight="700" fill="' + DC.ink + '">Reading</text>';
  } else {
    s += '<text x="' + cx + '" y="' + (cy + 22) + '" text-anchor="middle" font-size="13" font-weight="600" fill="' + DC.stone + '">Tap to read</text>';
  }
  if (big) {
    s += '<text x="' + (cx - r) + '" y="' + (cy + 22) + '" text-anchor="middle" font-size="13" font-weight="600" fill="' + DC.revenge + '">Revenge</text>';
    s += '<text x="' + (cx + r) + '" y="' + (cy + 22) + '" text-anchor="middle" font-size="13" font-weight="600" fill="' + DC.gold + '">Justice</text>';
  }
  return s + '</svg>';
}

// One date format on the server and in the browser, so the card the page arrives with is the card the script keeps.
function when(iso){ if (!iso) return ''; var d = new Date(iso); if (isNaN(d)) return ''; return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'America/New_York' }); }

function verdictWords(v){ return v === 'retribution' || v === 'revenge' ? 'Leans revenge' : v === 'justice' ? 'Leans justice' : v === 'mixed' ? 'Mixed' : ''; }
function verdictClass(v){ return v === 'retribution' || v === 'revenge' ? 'revenge' : v === 'justice' ? 'justice' : 'mixed'; }

// The article's dial on its card: its stored reading where there is one, else an empty dial that fills once it
// is read. A reading this site holds in full is marked, since a click on it answers at once.
function cardDial(it){
  var has = it.reading && it.reading.position != null;
  var v = has ? it.reading.verdict || dside(+it.reading.position) : '';
  return '<span class="cdial" aria-hidden="' + (has ? 'false' : 'true') + '">' + dial(has ? it.reading.position : '', 'small') +
    (has && verdictWords(v) ? '<span class="cv ' + verdictClass(v) + '">' + verdictWords(v) + '</span>' : '') +
    (it.held ? '<span class="cheld">Full reading ready</span>' : '') + '</span>';
}

var SHOW = 8;
/** The headline list's cards, the same on the server (drawn into the page) and in the browser (the fallback). */
export function feedCardsHtml(items){
  items = items || [];
  return items.map(function(it, k){
    var hue = hueOf(it.host);
    var people = officialsOf(it);
    return '<li' + (k >= SHOW ? ' class="rj-more"' : '') + '><button type="button" class="pick' + (it.held ? ' held' : '') + '"' + (hue ? ' style="--oc:' + hue + '"' : '') + ' data-url="' + esc(it.url) + '">' +
      '<span class="cbody">' +
      '<span class="by">' + outletBadge(it.host, it.source) + (when(it.published) ? '<span class="when">' + when(it.published) + '</span>' : '') + '</span>' +
      '<span class="hl">' + esc(it.title) + '</span>' +
      // The officials as a plain byline, name in bold and role after it (the approved mockup, 2026-11-09).
      bylineHtml(people) +
      '</span>' + cardDial(it) + '</button></li>';
  }).join('') + (items.length > SHOW ? '<li class="all"><button type="button" class="quietbtn" id="feedall">All ' + items.length + ' articles</button></li>' : '');
}
// The article at the top of the reading: its outlet, its headline as the headline it is, its officials.
function artHtml(item, link){
  return '<div class="art-by">' + outletBadge(item.host, item.source) + '</div><a class="art-hl" href="' + esc(link) + '" target="_blank" rel="noopener">' + esc(item.title) + '</a>' +
    bylineHtml(officialsOf(item)).replace('class="byline"', 'class="byline art-byline"');
}
function bylineHtml(people){
  return people.length ? '<span class="byline">' + people.map(function(o){ return '<span><b>' + esc(o.name) + '</b>' + (o.role ? ', ' + esc(o.role) : '') + '</span>'; }).join('') + '</span>' : '';
}

// The stages the grader runs, in its own order (quick-tools api/justice-or-retribution.js: fetch the page, split
// the voices, split the issues, then every grade at once, each grade carrying the five rows, the precedent pair
// and the rewrites). The grader does not stream, so `at` is when the page moves its own marker on, an estimate
// from the "twenty to forty seconds" the page has always given; nothing on screen says a stage has finished,
// and the last one holds until the reply arrives.
var STAGES = [
  { at: 0, name: 'Getting the article', what: 'The page itself, from the outlet that published it.' },
  { at: 3000, name: 'Separating the politicians from the outlet', what: 'Who said what in their own words, and what the outlet wrote around them. Each is read on its own.' },
  { at: 9000, name: 'Finding the issues', what: 'Each issue the words take up gets its own reading.' },
  { at: 14000, name: 'Reading the five measures', what: 'Each measure below is a question, answered from the words quoted.' },
  { at: 22000, name: 'Matching the precedent', what: 'One who did this and kept the public, one who did this and lost them.' },
  { at: 27000, name: 'Writing the rewrites', what: 'Same facts, none added. Each rewrite borrows one move from the record.' }
];

// The rubric as the grader holds it, for the empty bars when its own copy (the GET) has not arrived yet.
var RUBRIC = [
  { key: 'practice', title: 'Practice, not person', question: 'Is the subject a practice, named by what it did, or a person, named by who he is?' },
  { key: 'price', title: 'Priced in the listener’s money', question: 'Does it say what this cost the reader: their bill, their paycheck, their safety, their vote?' },
  { key: 'remedy', title: 'Ends in a remedy', question: 'Does it name the law, rule, vote or office that stops this from happening again?' },
  { key: 'umpire', title: 'Umpire, not prosecutor-candidate', question: 'Does the speaker sound like someone with nothing to gain from the subject’s fall, or like someone running against him?' },
  { key: 'knot', title: 'Anchored back to the listener', question: 'Does it tie the corruption to what matters most to the listener, so the two become one story?' }
];

export function initRevengeOrJustice(root, opts) {
  if (!root || root.dataset.init) return;
  root.dataset.init = '1';
  var track = (opts && opts.track) || function(){};
  var from = 'paste';

  var API = '/api/revenge-or-justice';
  var $ = function(id){ return document.getElementById(id); };
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // The rubric text comes from the route, so the page and the grader never drift; until it arrives the empty bars
  // of a first reading carry the copy above.
  var rubric = RUBRIC;
  fetch(API, { credentials: 'same-origin' }).then(function(r){ return r.json(); }).then(function(j){
    if (!j || !j.rubric) return;
    if (j.rubric.length === 5) rubric = j.rubric;
    $('rubric').innerHTML = j.rubric.map(function(r){ return '<dt>' + esc(r.title) + '</dt><dd>' + esc(r.question) + '</dd>'; }).join('');
    if (j.available === false) { $('status').textContent = 'The grader is off on this deploy.'; $('status').className = 'err'; $('go').disabled = true; }
  }).catch(function(){});
  $('showr').addEventListener('click', function(){ var on = $('rubricbox').classList.toggle('on'); $('showr').setAttribute('aria-expanded', on ? 'true' : 'false'); });

  function side(pos){ return pos >= 62 ? 'justice' : pos <= 38 ? 'retribution' : 'mixed'; }
  // On hoplight.ai the bad side is called revenge (Whit, 2026-11-06: make justice the second thing so it rings). The API's word stays retribution; only what is shown changes.
  function word(s){ return s === 'retribution' ? 'revenge' : s; }
  // The same swap in the model's own prose (the claim, the critiques, the rewrites and their reasons); the quoted evidence is the source's words and is never touched.
  function rw(s){ return String(s == null ? '' : s).replace(/\bRetribution\b/g, 'Revenge').replace(/\bretribution\b/g, 'revenge'); }
  function sideWords(pos){ var s = side(pos); return s === 'mixed' ? 'mixed' : 'leans ' + word(s); }
  function src(p){ return p && p.url ? '<a href="' + esc(p.url) + '" target="_blank" rel="noopener">' + esc(p.source) + '</a>' : esc(p && p.source || ''); }

  // A quoted speaker from the reading: elected officials first, in gold (the same gold as the list's tags),
  // everyone else (staff, spokespeople, advocates) outlined in ink, each with the role the text gives them.
  var NOT_ELECTED = /\b(spokes\w*|aide|staff\w*|press secretary|adviser|advisor|strategist|operative|consultant|lawyer|attorney for|counsel|analyst|director|executive|ceo|founder|professor|former|candidate|nominee|activist|advocate|organizer|president of|head of|reporter|editor|columnist)\b/i;
  // A chair counts only of a committee or caucus, and a leader or whip only of a party or chamber, so a
  // company's chairman or a union's leader is never tagged as elected.
  var ELECTED = /\b(rep\.|representative|sen\.|senator|congress(man|woman|member|person)|governor|gov\.|mayor|speaker of|house speaker|ranking member|vice president|president of the united states|attorney general|council\s?(member|man|woman)|assembly(member|man|woman)|state senator|state representative|delegate|lawmaker|legislator)\b|\b(majority|minority|democratic|republican|house|senate)\s+(leader|whip)\b|\bchair\w*\b.*\b(committee|subcommittee|caucus)\b|\b[DR]-[A-Z]{2}\b|\([DR][-–]/i;
  function elected(role){ role = String(role || '').trim(); return /^(the\s+)?(u\.?s\.?\s+)?president$/i.test(role) || (!NOT_ELECTED.test(role) && ELECTED.test(role)); }
  // Three kinds, three treatments (Whit, 2026-11-09: "the quotes from all elected and govt officials need to be
  // fair game"): elected officials in gold, appointed government officials in blue, everyone else outlined.
  // The grader names the kind; an older reply without one falls back to reading the role.
  function kindOf(sp){ return sp && (sp.kind === 'elected' || sp.kind === 'official' || sp.kind === 'other') ? sp.kind : (elected(sp && sp.role) ? 'elected' : 'other'); }
  function tagHtml(sp, withRole){
    return '<span class="who ' + kindOf(sp) + '"><b>' + esc(sp.name) + '</b>' + (withRole && sp.role ? '<span class="role">' + esc(sp.role) + '</span>' : '') + '</span>';
  }
  var GROUP_LABEL = { elected: 'Elected officials', official: 'Government officials', other: 'Also quoted' };
  var feedByUrl = {};
  // What is on screen now, so the one-page PDF matches it: the reply, and the reading shown (voice, issue or person).
  var lastReply = null, last = null;

  // A bar out from the centre: left of 50 for retribution, right of 50 for justice. Returns the inline style and the side class.
  function bar(pos, extra){
    var p = Math.max(0, Math.min(100, +pos || 0)), left = p < 50 ? p : 50, w = Math.abs(p - 50);
    return '<i class="bar ' + side(p) + (p < 50 ? ' left' : '') + (extra || '') + '" style="left:' + left + '%;width:' + w + '%" data-left="' + left + '%" data-width="' + w + '%"></i>';
  }


  // Whose words: the politicians and operatives first, the outlet's own framing on a toggle, the whole text last
  // (Whit, 2026-11-06: "in the output i should see the politicians and operative etc first, and i should be able
  // to toggle to have the outlet/coverage evaluated for the same thing"). Within a voice, one tab per issue.
  function render(reply){
    stopWait();
    lastReply = reply;
    var voices = reply.voices || {};
    // The article over the claim: its outlet and its headline as the headline it is, with the officials the list
    // names as the byline the waiting screen showed. A pasted link the list does not hold shows the outlet the
    // grader read and the address; pasted text shows nothing here.
    var item = reply.fetched ? feedByUrl[reply.fetched] : null;
    if (item) $('art').innerHTML = artHtml(item, reply.fetched);
    else if (reply.fetched) $('art').innerHTML = '<div class="art-by">' + outletBadge(host(reply.fetched), (voices.coverage && voices.coverage.outlet) || host(reply.fetched)) + '</div><a class="art-link" href="' + esc(reply.fetched) + '" target="_blank" rel="noopener">' + esc(host(reply.fetched)) + '</a>';
    else $('art').innerHTML = '';
    // The list's card for this article takes the reading too, so its dial and verdict fill once read, and it is
    // marked as held: the site now keeps this reading, so the next click on it answers at once.
    if (item && !reply.error && reply.mean_position != null) {
      item.reading = { position: reply.mean_position, verdict: reply.verdict, headline: reply.headline };
      item.held = { read_at: reply.read_at || new Date().toISOString() };
      var pick = $('feedlist').querySelector('.pick[data-url="' + (window.CSS && CSS.escape ? CSS.escape(reply.fetched) : reply.fetched) + '"]');
      var card = pick && pick.querySelector('.cdial');
      if (card) { card.outerHTML = cardDial(item); pick.classList.add('held'); }
    }
    // Who is quoted, one row each, every row placed on the same revenge-to-justice line by that person's own
    // words (Whit, 2026-11-09: "if i click on the quoted person chip, maybe it expands to show the quotes? and
    // i want to be able to toggle to different electeds or officials to see how their framing stacks up").
    // A tap opens that person's quotes under their row and turns the reading below to their words alone; a
    // second tap, or "Everyone together", turns it back. The panel belongs to the article, so it stays put
    // whichever voice or issue is picked. An older reply has no per-person grades: its rows carry no mark.
    var pol = voices.politicians;
    var people = pol ? (pol.by_speaker || (pol.speakers || []).map(function(s){
      return { name: s.name, role: s.role, kind: s.kind, passages: (pol.passages || []).filter(function(p){ return p.who === s.name; }).map(function(p){ return p.text; }) };
    })) : [];
    var chosen = -1;
    function drawPeople(){
      if (!people.length) { $('quoted').innerHTML = ''; return; }
      var html = '<div class="pl-head"><span class="ql">Who is quoted</span><span class="pl-hint">Tap a name for their words and their reading</span></div>';
      var last = '';
      people.forEach(function(p, i){
        var kind = kindOf(p);
        if (people.length > 1 && kind !== last) { html += '<div class="pl-group">' + GROUP_LABEL[kind] + '</div>'; last = kind; }
        var graded = p.verdict && !p.error;
        var pos = graded ? (p.mean_position != null ? p.mean_position : 50) : null;
        html += '<button type="button" class="prow' + (i === chosen ? ' on' : '') + '" data-p="' + i + '" aria-expanded="' + (i === chosen ? 'true' : 'false') + '" aria-controls="pq' + i + '">' +
          // A byline (name, then role) and the person's own dial (the approved mockup, 2026-11-09).
          '<span class="pwho"><span class="pname k-' + kindOf(p) + '">' + esc(p.name) + '</span>' + (p.role ? '<span class="prole">' + esc(p.role) + '</span>' : '') + '</span>' +
          // With one person quoted, their dial would repeat the big one, so it is left out.
          '<span class="pdial" aria-hidden="true">' + (graded && people.length > 1 ? dial(pos, 'small') : '') + '</span>' +
          '<span class="sr">' + (graded ? sideWords(pos) + ', ' + Math.round(pos) + ' of 100 toward justice. ' : '') + (i === chosen ? 'Showing their words.' : 'Show their words and their reading.') + '</span>' +
          '</button>' +
          '<div class="pquotes" id="pq' + i + '"' + (i === chosen ? '' : ' hidden') + '>' +
          (p.passages || []).map(function(t){ return '<blockquote>“' + esc(String(t).replace(/^["“]+|["”]+$/g, '')) + '”</blockquote>'; }).join('') +
          '<button type="button" class="quietbtn pl-all">Everyone together</button></div>';
      });
      $('quoted').innerHTML = html;
      Array.prototype.forEach.call($('quoted').querySelectorAll('.prow'), function(b){
        b.addEventListener('click', function(){ choose(+b.getAttribute('data-p')); });
      });
      Array.prototype.forEach.call($('quoted').querySelectorAll('.pl-all'), function(b){
        b.addEventListener('click', function(){ choose(chosen); });
      });
    }
    function choose(i){
      if (i === chosen) { track('person', { person: 'all' }); pick('politicians'); return; }
      var p = people[i];
      chosen = i;
      track('person', { person: String(p.name).slice(0, 80), kind: kindOf(p) });
      Array.prototype.forEach.call(vt.querySelectorAll('button'), function(b){ b.setAttribute('aria-selected', b.getAttribute('data-v') === 'politicians' ? 'true' : 'false'); });
      tabs.innerHTML = ''; tabs.classList.remove('on');
      drawPeople();
      // A person whose words were not graded on their own (one speaker, or an older reply) shows the politicians' reading.
      var j = p.verdict || p.error ? p : pol;
      show(j, null, { kind: 'person', person: p, speakers: [p], passages: (p.passages || []).map(function(t){ return { who: p.name, text: t }; }), share: p.share });
    }
    var views = [];
    if (voices.politicians) views.push({ k: 'politicians', label: 'The politicians', j: voices.politicians });
    if (voices.coverage) views.push({ k: 'coverage', label: 'The coverage', j: voices.coverage });
    // A column or an editorial has no politicians' words: the coverage is the whole text, so there is one reading and no toggle.
    if (!(voices.coverage && voices.coverage.whole && !voices.politicians)) views.push({ k: 'all', label: views.length ? 'All of it' : 'All together', j: reply });
    var vt = $('voices'), tabs = $('issues'), issues = reply.issues || [];
    var issuesOf = reply.issues_of || 'all';
    if (views.length > 1) {
      vt.innerHTML = views.map(function(v){ return '<button type="button" role="tab" data-v="' + v.k + '" aria-selected="false">' + esc(v.label) + '</button>'; }).join('');
      vt.classList.add('on');
      Array.prototype.forEach.call(vt.querySelectorAll('button'), function(b){
        b.addEventListener('click', function(){ track('voice', { voice: b.getAttribute('data-v') }); pick(b.getAttribute('data-v')); window.scrollTo({ top: 0, behavior: 'auto' }); });
      });
    } else { vt.innerHTML = ''; vt.classList.remove('on'); }
    function ctxFor(v){
      if (v.k === 'politicians') return { kind: 'politicians', speakers: v.j.speakers || [], passages: v.j.passages || [], share: v.j.share };
      if (v.k === 'coverage') return { kind: 'coverage', outlet: v.j.outlet || '', share: v.j.whole ? 0 : v.j.share, fetched: reply.fetched };
      return { kind: 'all' };
    }
    function pick(k){
      chosen = -1;
      drawPeople();
      Array.prototype.forEach.call(vt.querySelectorAll('button'), function(b){ b.setAttribute('aria-selected', b.getAttribute('data-v') === k ? 'true' : 'false'); });
      var v = views.filter(function(x){ return x.k === k; })[0] || views[views.length - 1];
      var ctx = ctxFor(v);
      var withIssues = issues.length >= 2 && ((k === 'politicians' && issuesOf === 'politicians') || (k === 'all' && issuesOf === 'all') || (k === 'coverage' && v.j.whole && issuesOf === 'all'));
      if (withIssues) {
        tabs.innerHTML = '<button type="button" role="tab" data-k="all" aria-selected="true">All together</button>' +
          issues.map(function(it, n){ return '<button type="button" role="tab" data-k="' + n + '" aria-selected="false">' + esc(it.name) + '</button>'; }).join('');
        tabs.classList.add('on');
        Array.prototype.forEach.call(tabs.querySelectorAll('button'), function(b){
          b.addEventListener('click', function(){
            var key = b.getAttribute('data-k');
            track('issue', { voice: k, issue: key === 'all' ? 'all' : String(issues[+key] && issues[+key].name || key).slice(0, 120) });
            Array.prototype.forEach.call(tabs.querySelectorAll('button'), function(x){ x.setAttribute('aria-selected', x.getAttribute('data-k') === key ? 'true' : 'false'); });
            if (key === 'all') show(v.j, null, ctx); else show(issues[+key], issues[+key], ctx);
            window.scrollTo({ top: 0, behavior: 'auto' });
          });
        });
      } else { tabs.innerHTML = ''; tabs.classList.remove('on'); }
      show(v.j, null, ctx);
    }
    pick(views[0].k);
  }

  // The five measures, each a term that opens a small window over the page (Whit, 2026-11-09: "i wanted these
  // metrics defined- someone should be able to click on the metric and a pop up happens that explains what this
  // means, why it matters, what it activates in a reader/listener"). One sentence each, so the window fits a
  // phone screen (design review, 2026-11-09); the cases behind them are in the reading's own record.
  var TERMS = {
    practice: {
      means: 'Whether the words name a thing that was done, like a fee charged or a rule broken, or a person to be brought down.',
      matters: 'A practice can be ended by a law; a named villain makes people ask whether this is about him or about them.',
      activates: 'A practice makes a listener ask if it happened to them; an enemy makes them pick a team, and swing voters may pick the other one.'
    },
    price: {
      means: 'Whether the words say what this cost the listener: their bill, paycheck, premium, safety or vote.',
      matters: 'Without a price tag, wrongdoing sounds like a fight between powerful people; with one, it becomes the listener’s fight.',
      activates: 'Self-interest: a cost on their own bill reads as news about them, while an abstract wrong reads as politics and gets tuned out.'
    },
    remedy: {
      means: 'Whether the words name the law, rule or vote that stops this from happening again.',
      matters: 'An inquiry that ends in a fix reads as governing; one that ends in punishment reads as payback.',
      activates: 'A reason to back the effort; with no remedy, a listener hears a grievance with no end and decides the point is the fight.'
    },
    umpire: {
      means: 'Whether the speaker sounds like someone with nothing to gain from the subject’s fall, or like a rival running against them.',
      matters: 'Listeners judge the motive before they weigh the facts.',
      activates: 'Trust: an umpire lowers a listener’s guard, while a rival sets off “they are just out to get him” and the facts bounce off.'
    },
    knot: {
      means: 'Whether the words tie the wrongdoing to what matters most in the listener’s own life, so the two become one story.',
      matters: '“They are corrupt” and “costs are up” each lose alone; tied together, each proves the other.',
      activates: 'Recognition, the sense that this is why life is harder, which moves voters who could go either way more than outrage does.'
    }
  };
  function term(key, title){
    return TERMS[key] ? '<button type="button" class="term" data-term="' + esc(key) + '" aria-haspopup="dialog">' + esc(title) + '</button>' : esc(title);
  }
  var pop = document.createElement('div');
  pop.className = 'rj-pop';
  pop.setAttribute('role', 'dialog');
  pop.hidden = true;
  root.appendChild(pop);
  var popFor = null;
  function closePop(back){ if (pop.hidden) return; pop.hidden = true; if (back && popFor) popFor.focus(); if (popFor) popFor.setAttribute('aria-expanded', 'false'); popFor = null; }
  function openPop(btn){
    var key = btn.getAttribute('data-term'), t = TERMS[key];
    if (!t) return;
    if (popFor === btn && !pop.hidden) { closePop(false); return; }
    closePop(false);
    track('term', { term: key });
    pop.setAttribute('aria-label', btn.textContent);
    pop.innerHTML = '<div class="pop-h"><h4>' + esc(btn.textContent) + '</h4><button type="button" class="pop-x" aria-label="Close">×</button></div>' +
      '<dl><dt>What it means</dt><dd>' + esc(t.means) + '</dd><dt>Why it matters</dt><dd>' + esc(t.matters) + '</dd><dt>What it sets off in a listener</dt><dd>' + esc(t.activates) + '</dd></dl>';
    pop.hidden = false;
    popFor = btn;
    btn.setAttribute('aria-expanded', 'true');
    var r = btn.getBoundingClientRect(), base = root.getBoundingClientRect();
    var w = Math.min(380, window.innerWidth - 32);
    pop.style.width = w + 'px';
    var left = Math.max(16, Math.min(r.left, window.innerWidth - w - 16));
    pop.style.left = (left - base.left) + 'px';
    // Below the term when it fits on screen, else above it.
    var above = r.bottom + 8 + pop.offsetHeight > window.innerHeight && r.top - 8 - pop.offsetHeight > 0;
    pop.style.top = (above ? r.top - base.top - 8 - pop.offsetHeight : r.bottom - base.top + 8) + 'px';
    pop.querySelector('.pop-x').addEventListener('click', function(){ closePop(true); });
  }
  // One listener for every term on the page, wherever it is drawn. A term inside a reading row opens its
  // window and does not also jump to the words behind the row.
  root.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('.term');
    if (b) { e.preventDefault(); e.stopPropagation(); openPop(b); return; }
    if (!pop.hidden && !pop.contains(e.target)) closePop(false);
  }, true);
  root.addEventListener('focusin', function(e){
    var b = e.target.closest && e.target.closest('.term');
    if (b && b.matches(':focus-visible') && popFor !== b) openPop(b);
  });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape') closePop(true); });
  window.addEventListener('resize', function(){ closePop(false); });
  function show(j, issue, ctx){
    ctx = ctx || { kind: 'all' };
    last = { j: j, issue: issue, ctx: ctx };
    // Share follows the reading on screen: shown when it carries a signed link, the open panel closed on a change.
    $('share').hidden = !j.share;
    closeShare();
    var m = [];
    // A reading from the site's copy says the day it was made, as a date (RJFAST1, 2026-11-10).
    if (lastReply && lastReply.cached && lastReply.read_at && when(lastReply.read_at)) m.push('Read on ' + when(lastReply.read_at));
    // The names are already on the tags above, so this line keeps only the share.
    if (ctx.kind === 'politicians' && ctx.share) m.push('Their words are ' + esc(ctx.share) + '% of the text');
    else if (ctx.kind === 'person') m.push('Read on ' + esc(ctx.person.name) + '’s words alone' + (ctx.share ? ', ' + esc(ctx.share) + '% of the text' : ''));
    else if (ctx.kind === 'coverage') { m.push((ctx.outlet ? esc(ctx.outlet) + '\u2019s' : 'The outlet\u2019s') + ' own framing' + (ctx.share ? ', ' + esc(ctx.share) + '% of the text' : '')); if (!ctx.share && ctx.fetched) m.push('Read from <a href="' + esc(ctx.fetched) + '" target="_blank" rel="noopener">' + esc(host(ctx.fetched)) + '</a>'); }
    if (issue) {
      m.push('This issue is ' + esc(issue.share) + '% of ' + (ctx.kind === 'politicians' ? 'their words' : 'the text'));
    } else if (ctx.kind === 'all') {
      if (j.fetched) m.push('Read from <a href="' + esc(j.fetched) + '" target="_blank" rel="noopener">' + esc(host(j.fetched)) + '</a>');
      if (j.voices && (j.voices.politicians || j.voices.coverage)) m.push('every voice together');
    }
    if (j.fallbacks && j.fallbacks.length) m.push('<span class="warn">' + j.fallbacks.length + (j.fallbacks.length === 1 ? ' model refused' : ' models refused') + ' before this one answered</span>');
    if (j.error) m.push('<span class="warn">this reading could not be graded: ' + esc(j.error) + '</span>');
    $('meta').innerHTML = m.join(' · ');
    $('verdict').textContent = j.error ? '' : (j.verdict === 'mixed' ? 'Mixed' : j.verdict ? 'Leans ' + word(j.verdict) : '');
    $('verdict').className = 'v ' + (j.verdict === 'retribution' ? 'revenge' : j.verdict === 'justice' ? 'justice' : 'mixed');
    // The dial reads the same score the verdict word is read from: the mean of the five rows.
    var mean = j.mean_position != null ? j.mean_position : ((j.rows || []).length ? (j.rows || []).reduce(function(t, r){ return t + (+r.position || 0); }, 0) / j.rows.length : null);
    $('dial').innerHTML = j.error || mean == null ? '' : dial(mean, 'big');
    $('headline').textContent = j.error ? 'This reading did not come back.' : rw(j.headline || '');

    var rows = j.rows || [];
    $('rows').innerHTML = rows.map(function(r, i){
      var s = side(r.position);
      return '<div class="ir" role="link" tabindex="0" data-row="' + i + '" aria-label="' + esc(r.title) + ': ' + sideWords(r.position) + ', ' + Math.round(r.position) + ' of 100 toward justice. Read the words behind it.">' +
        '<span class="t">' + term(r.key, r.title) + '</span>' +
        '<span class="track">' + bar(r.position) + '</span>' +
        '<span class="n ' + s + '">' + Math.round(r.position) + '</span></div>';
    }).join('');

    $('detail').innerHTML = rows.map(function(r, i){
      var s = side(r.position);
      var ev = r.evidence ? '<dd class="ev"><mark>' + esc(r.evidence) + '</mark></dd>' : '<dd class="ev none">The text says nothing on this.</dd>';
      var said = 'They said';
      if (ctx.kind === 'coverage') said = '<b>' + esc(ctx.outlet ? ctx.outlet : 'The outlet') + '</b> wrote';
      else if ((ctx.kind === 'politicians' || ctx.kind === 'person') && r.evidence) {
        var q = String(r.evidence).toLowerCase().replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/\s+/g, ' ').trim().slice(0, 80);
        var hit = (ctx.passages || []).filter(function(p){ return String(p.text || '').toLowerCase().replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/\s+/g, ' ').indexOf(q) >= 0; })[0];
        // The speaker wears the same tag as in "who is quoted", so the eye ties the quote back to the person.
        if (hit) { var sp = (ctx.speakers || []).filter(function(s){ return s.name === hit.who; })[0] || { name: hit.who }; said = tagHtml(sp, false); }
      }
      var rec = r.precedent ? '<dt>The record</dt><dd class="rec">' + esc(r.precedent_line || '') + ' ' + esc(r.precedent.name) + ', ' + esc(r.precedent.year) + ' (' + src(r.precedent) + ').</dd>' : '';
      return '<article class="r" id="row' + i + '">' +
        '<div class="rh"><span class="thumb" aria-hidden="true">' + bar(r.position) + '</span>' +
        '<h3>' + term(r.key, r.title) + '</h3><span class="side ' + s + '">' + Math.round(r.position) + ', ' + sideWords(r.position) + '</span></div>' +
        '<dl class="tiers"><dt>' + said + '</dt>' + ev +
        '<dt>How it reads</dt><dd class="crit">' + esc(rw(r.critique)) + '</dd>' + rec + '</dl></article>';
    }).join('');

    $('reframes').innerHTML = (j.reframes || []).map(function(f, i){
      var b = f.borrows ? ' Borrows ' + esc(f.borrows.name) + ', ' + esc(f.borrows.year) + ' (' + src(f.borrows) + ').' : '';
      return '<div class="reframe"><h3>' + esc(rw(f.label || ('Rewrite ' + (i + 1)))) + '</h3>' +
        '<p class="t" id="rf' + i + '">' + esc(rw(f.text)) + '</p>' +
        '<p class="why">' + esc(rw(f.why)) + b + '</p><button class="copy" type="button" data-copy="rf' + i + '">Copy this rewrite</button></div>';
    }).join('') || '<p class="h2sub">No rewrite came back.</p>';
    if (j.dropped && j.dropped.length) {
      $('reframes').innerHTML += '<p class="dropped">' + j.dropped.length + (j.dropped.length === 1 ? ' rewrite was' : ' rewrites were') + ' thrown away for carrying a number the text does not contain (' + esc(j.dropped.map(function(d){ return d.numbers.join(', '); }).join('; ')) + ').</p>';
    }

    function precBlock(tag, p){
      if (!p) return '';
      return '<div class="prec"><div class="tag ' + tag + '">' + (tag === 'better' ? 'Did it better' : 'Did it worse') + '</div><h3>' + esc(p.name) + '</h3><div class="yr">' + esc(p.year) + '</div>' +
        '<p class="this">' + esc(rw(p.why_this_one)) + '</p><p>' + esc(p.move) + '</p><p>' + esc(p.lesson) + '</p><p class="src">' + src(p) + '</p></div>';
    }
    $('prec').innerHTML = precBlock('better', j.precedent && j.precedent.better) + precBlock('worse', j.precedent && j.precedent.worse);

    $('out').classList.add('on');
    // One motion moment: each bar grows out from the centre line to its reading.
    var bars = document.querySelectorAll('#rows .bar');
    if (!reduced) {
      Array.prototype.forEach.call(bars, function(b){ b.style.transition = 'none'; b.style.left = '50%'; b.style.width = '0%'; });
      requestAnimationFrame(function(){ requestAnimationFrame(function(){
        Array.prototype.forEach.call(bars, function(b){ b.style.transition = ''; b.style.left = b.getAttribute('data-left'); b.style.width = b.getAttribute('data-width'); });
      }); });
    }
    Array.prototype.forEach.call(document.querySelectorAll('#rows .ir'), function(el){
      var go = function(){ var t = $('row' + el.getAttribute('data-row')); if (!t) return; t.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); t.classList.remove('lit'); void t.offsetWidth; t.classList.add('lit'); };
      el.addEventListener('click', go);
      el.addEventListener('keydown', function(e){ if (e.target !== el) return; if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
    });
    Array.prototype.forEach.call(document.querySelectorAll('.copy'), function(b){
      b.addEventListener('click', function(){
        var t = $(b.getAttribute('data-copy')).textContent;
        track('copy-rewrite', { which: b.getAttribute('data-copy') });
        navigator.clipboard.writeText(t).then(function(){ b.textContent = 'Copied'; setTimeout(function(){ b.textContent = 'Copy this rewrite'; }, 1500); });
      });
    });
  }

  function collapse(text){
    var isUrl = /^https?:\/\/\S+$/.test(text);
    var shown = isUrl ? host(text) : text.replace(/\s+/g, ' ').slice(0, 140) + (text.length > 140 ? '…' : '');
    var it = isUrl ? feedByUrl[text] : null;
    // An article from the list shows its outlet and headline over the claim, so the strip carries only "Read
    // another"; a pasted link or text is named here.
    $('what').innerHTML = it ? '' : '<b>Read:</b> ' + esc(shown);
    root.classList.add('read');
    $('strip').classList.add('on');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
  // The one-page PDF (Whit, 2026-11-09: "can we make this produce a pdf 1 pager w the assessment and recs for
  // better, justics framing?"). A Letter page built from the reading on screen, appended to <body> so the print
  // styles can hide everything else, then the browser's own print, whose "Save as PDF" writes a real PDF with
  // selectable text. Claim first: the article, the dial and the verdict; then the five measures; then the
  // rewrites that would read as justice and the record behind them. Shrunk to fit if a long reading would spill
  // onto a second page.
  function trunc(s, n){ s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).replace(/\s+\S*$/, '') + '…' : s; }
  function onePager(){
    if (!lastReply || !last) return null;
    var reply = lastReply, j = last.j, ctx = last.ctx, issue = last.issue;
    var item = reply.fetched ? feedByUrl[reply.fetched] : null;
    var cov = reply.voices && reply.voices.coverage;
    var outlet = item ? item.source : (cov && cov.outlet) || (reply.fetched ? host(reply.fetched) : '');
    var whose = ctx.kind === 'person' ? ctx.person.name + '’s own words' : ctx.kind === 'politicians' ? 'The politicians’ own words' : ctx.kind === 'coverage' ? (outlet || 'The outlet') + '’s own framing' : 'The whole text';
    if (issue) whose += ', on ' + issue.name;
    var mean = j.mean_position != null ? j.mean_position : null;
    var verdictWord = j.verdict === 'mixed' ? 'Mixed.' : j.verdict ? 'Leans ' + word(j.verdict) + '.' : '';
    var vClass = j.verdict === 'retribution' ? 'revenge' : j.verdict === 'justice' ? 'justice' : 'mixed';
    var today = new Date();
    var dateStr = today.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    var rows = (j.rows || []).map(function(r){
      var p = Math.max(0, Math.min(100, +r.position || 0)), s = side(p);
      var left = p < 50 ? p : 50, w = Math.abs(p - 50);
      return '<div class="pp-row"><div class="pp-rh"><span class="pp-rt">' + esc(r.title) + '</span><span class="pp-rn ' + s + '">' + Math.round(p) + '</span></div>' +
        '<div class="pp-track"><i class="pp-bar ' + s + '" style="left:' + left + '%;width:' + w + '%"></i></div>' +
        '<p class="pp-crit">' + esc(trunc(rw(r.critique), 320)) + '</p>' +
        (r.evidence ? '<p class="pp-ev">“' + esc(trunc(r.evidence, 150)) + '”</p>' : '') + '</div>';
    }).join('');
    var people = (reply.voices && reply.voices.politicians && reply.voices.politicians.by_speaker || []).filter(function(p){ return p.verdict && !p.error && p.mean_position != null; });
    var peopleHtml = people.length > 1 ? '<section class="pp-people"><h2>Who is quoted</h2><div class="pp-plist">' + people.map(function(p){
      return '<div class="pp-p"><div class="pp-pd">' + dial(p.mean_position, 'small') + '</div><div><b>' + esc(p.name) + '</b>' + (p.role ? '<span>' + esc(p.role) + '</span>' : '') + '</div></div>';
    }).join('') + '</div></section>' : '';
    var recs = (j.reframes || []).slice(0, 3).map(function(f, i){
      return '<div class="pp-rec"><div class="pp-recn">' + (i + 1) + '</div><div><h3>' + esc(rw(f.label || ('Rewrite ' + (i + 1)))) + '</h3><p class="pp-rect">' + esc(trunc(rw(f.text), 420)) + '</p>' +
        (f.why ? '<p class="pp-why">' + esc(trunc(rw(f.why), 200)) + (f.borrows ? ' Borrows ' + esc(f.borrows.name) + ', ' + esc(f.borrows.year) + '.' : '') + '</p>' : '') + '</div></div>';
    }).join('') || '<p class="pp-why">No rewrite came back for this reading.</p>';
    var prec = j.precedent || {};
    function precLine(tag, p){ return p ? '<div class="pp-prec ' + tag + '"><span class="pp-ptag">' + (tag === 'better' ? 'Did it better' : 'Did it worse') + '</span><b>' + esc(p.name) + '</b>, ' + esc(p.year) + '. ' + esc(trunc(p.lesson, 170)) + '</div>' : ''; }
    var html =
      '<header class="pp-head"><div class="pp-brand"><b>Revenge or <span>Justice</span></b><span class="pp-by">Hoplight</span></div><div class="pp-date">Read ' + esc(dateStr) + '</div></header>' +
      (item || outlet ? '<section class="pp-art">' + (outlet ? '<div class="pp-outlet">' + esc(outlet) + (item && item.published ? ' · ' + esc(when(item.published)) : '') + '</div>' : '') +
        (item ? '<h1>' + esc(item.title) + '</h1>' : '') + (reply.fetched ? '<div class="pp-url">' + esc(trunc(reply.fetched, 110)) + '</div>' : '') + '</section>' : '') +
      '<section class="pp-verdict"><div class="pp-dial">' + (mean != null ? dial(mean, 'big') : '') + '</div><div class="pp-vw"><div class="pp-whose">' + esc(whose) + '</div>' +
        '<p class="pp-claim"><b class="pp-v ' + vClass + '">' + esc(verdictWord) + '</b> ' + esc(rw(j.headline || '')) + '</p></div></section>' +
      peopleHtml +
      '<section class="pp-cols"><div class="pp-col"><h2>The five measures</h2><div class="pp-ends"><span>Revenge</span><span>Justice</span></div>' + rows + '</div>' +
        '<div class="pp-col"><h2>Say it so it lands</h2><p class="pp-sub">Same facts, none added. Each rewrite borrows one move from the record.</p>' + recs +
        '<h2 class="pp-h2b">The record</h2>' + precLine('better', prec.better) + precLine('worse', prec.worse) + '</div></section>' +
      '<footer class="pp-foot">hoplight.ai/revenge-or-justice · The rubric: the subject is a practice, priced in what it cost people, ending in the remedy, from a speaker with nothing to gain, anchored back to the listener.</footer>';
    var box = document.createElement('div');
    box.id = 'rj-print';
    box.innerHTML = html;
    var fileTitle = 'Revenge or Justice - ' + (outlet ? outlet + ' - ' : '') + (item ? trunc(item.title, 60) + ' - ' : '') + today.toISOString().slice(0, 10);
    return { box: box, fileTitle: fileTitle };
  }
  $('pdf').addEventListener('click', function(){
    var made = onePager();
    if (!made) return;
    var old = document.getElementById('rj-print');
    if (old) old.parentNode.removeChild(old);
    document.body.appendChild(made.box);
    // One page: a long reading is shrunk until it fits a Letter page inside half-inch margins (7.5 by 10 inches).
    var maxH = 960, h = made.box.scrollHeight;
    if (h > maxH) made.box.style.zoom = String(Math.max(0.6, maxH / h));
    track('pdf', { voice: last && last.ctx ? last.ctx.kind : 'all', zoom: h > maxH ? Math.round(maxH / h * 100) : 100 });
    var keep = document.title;
    document.title = made.fileTitle;
    var done = function(){ document.title = keep; var b = document.getElementById('rj-print'); if (b) b.parentNode.removeChild(b); window.removeEventListener('afterprint', done); };
    window.addEventListener('afterprint', done);
    setTimeout(function(){ window.print(); }, 50);
  });
  // Sharing (Whit, 2026-11-09: "we need social sharing- ... the graphic showing the eval of the quotes, a link to
  // the article included, and a very quick summary of whay this tool does and what the grade was"). The grader
  // route signs every reading it returns (src/lib/rj-share.ts); the link opens a page at /revenge-or-justice/r/
  // with the article link and what the tool is, and its preview card (/api/og/rj/) is the question, the outlet's
  // icon, the headline, the dial and the verdict with its one line. Each button below is a plain link the reader
  // chooses to follow; nothing is sent anywhere until they do.
  var SHARE_ORIGIN = 'https://hoplight.ai';
  function closeShare(){ var box = $('sharebox'); if (box && !box.hidden) { box.hidden = true; box.innerHTML = ''; $('share').setAttribute('aria-expanded', 'false'); } }
  function shareText(){
    var reply = lastReply || {}, j = last.j, item = reply.fetched ? feedByUrl[reply.fetched] : null;
    var title = (item && item.title) || (reply.article && reply.article.title) || '';
    var outlet = (item && item.source) || (reply.article && reply.article.site) || (reply.voices && reply.voices.coverage && reply.voices.coverage.outlet) || '';
    var score = Math.round(j.mean_position != null ? j.mean_position : 50);
    var how = j.verdict === 'mixed' ? 'reads as mixed' : 'leans ' + word(j.verdict);
    var subject = title ? (outlet ? outlet + '’s “' : '“') + trunc(title, 90) + '”' : 'This statement';
    if (last.ctx.kind === 'person') subject = last.ctx.person.name + (title ? ', in “' + trunc(title, 70) + '”,' : '');
    return { line: 'Does this sound like revenge or justice? ' + subject + ' ' + how + ', ' + score + ' of 100.', article: reply.fetched || '' };
  }
  $('share').addEventListener('click', function(){
    var box = $('sharebox');
    if (!box.hidden) { closeShare(); return; }
    var token = last && last.j && last.j.share;
    if (!token) return;
    var url = SHARE_ORIGIN + '/revenge-or-justice/r/' + token;
    var t = shareText();
    track('share-open', { voice: last.ctx.kind });
    var enc = encodeURIComponent;
    var links = [
      ['X', 'https://twitter.com/intent/tweet?text=' + enc(t.line) + '&url=' + enc(url)],
      ['Bluesky', 'https://bsky.app/intent/compose?text=' + enc(t.line + ' ' + url)],
      ['Threads', 'https://www.threads.net/intent/post?text=' + enc(t.line + ' ' + url)],
      ['LinkedIn', 'https://www.linkedin.com/sharing/share-offsite/?url=' + enc(url)],
      ['Facebook', 'https://www.facebook.com/sharer/sharer.php?u=' + enc(url)],
      ['Email', 'mailto:?subject=' + enc('Does this sound like revenge or justice?') + '&body=' + enc(t.line + '\n\n' + url + (t.article ? '\n\nThe article: ' + t.article : ''))]
    ];
    box.innerHTML =
      '<img class="sb-card" src="/api/og/rj/' + esc(token) + '" alt="The card this link shows when it is shared" width="1200" height="630">' +
      '<div class="sb-side"><p class="sb-line">' + esc(t.line) + '</p>' +
      '<div class="sb-copy"><input type="text" readonly value="' + esc(url) + '" aria-label="Share link"><button type="button" class="sb-copybtn">Copy link</button></div>' +
      '<div class="sb-nets">' + links.map(function(l){ return '<a class="sb-net" href="' + esc(l[1]) + '" target="_blank" rel="noopener noreferrer" data-net="' + l[0] + '">' + l[0] + '</a>'; }).join('') +
      (navigator.share ? '<button type="button" class="sb-net sb-more">More…</button>' : '') + '</div></div>';
    box.hidden = false;
    $('share').setAttribute('aria-expanded', 'true');
    box.querySelector('.sb-copybtn').addEventListener('click', function(e){
      var b = e.currentTarget;
      track('share', { net: 'copy' });
      navigator.clipboard.writeText(t.line + ' ' + url + (t.article ? '\nThe article: ' + t.article : '')).then(function(){ b.textContent = 'Copied'; setTimeout(function(){ b.textContent = 'Copy link'; }, 1500); });
    });
    Array.prototype.forEach.call(box.querySelectorAll('a.sb-net'), function(a){ a.addEventListener('click', function(){ track('share', { net: a.getAttribute('data-net') }); }); });
    var more = box.querySelector('.sb-more');
    if (more) more.addEventListener('click', function(){ track('share', { net: 'native' }); navigator.share({ title: 'Revenge or Justice', text: t.line, url: url }).catch(function(){}); });
  });
  $('again').addEventListener('click', function(){
    closeShare();
    runId += 1; // a reading still on its way is dropped when it lands
    stopWait();
    $('go').disabled = false;
    track('again');
    root.classList.remove('read');
    $('strip').classList.remove('on');
    $('out').classList.remove('on');
    $('t').value = '';
    $('t').focus();
    window.scrollTo({ top: 0, behavior: 'auto' });
  });

  // The headline list. A click drops the link in the box and submits it, so the strip and the result read as any pasted link.
  // Since RJFAST1 (2026-11-10) the page arrives with the list already drawn from the server's shared copy
  // (`opts.items`, the same cards feedCardsHtml draws here); the request below is only the fallback for a page
  // drawn while that copy was empty.
  var FEED = '/api/revenge-or-justice/feed';
  function wireFeed(items){
    items.forEach(function(it){ feedByUrl[it.url] = it; });
    $('feed').hidden = false;
    if ($('feedall')) $('feedall').addEventListener('click', function(){ track('headlines-all', { count: items.length }); $('feedlist').classList.add('open'); $('feedall').parentNode.removeChild($('feedall')); });
    Array.prototype.forEach.call($('feedlist').querySelectorAll('.pick'), function(b){
      b.addEventListener('click', function(){
        var list = $('feedlist').querySelectorAll('.pick');
        track('headline', { url: b.getAttribute('data-url').slice(0, 300), rank: Array.prototype.indexOf.call(list, b) + 1, held: b.classList.contains('held') });
        from = 'headline';
        $('t').value = b.getAttribute('data-url');
        if ($('f').requestSubmit) $('f').requestSubmit(); else $('f').dispatchEvent(new Event('submit', { cancelable: true }));
        window.scrollTo({ top: 0, behavior: 'auto' });
      });
    });
  }
  var given = (opts && opts.items) || [];
  if (given.length) {
    if (!$('feedlist').querySelector('.pick')) $('feedlist').innerHTML = feedCardsHtml(given);
    wireFeed(given);
  } else {
    fetch(FEED, { credentials: 'same-origin' }).then(function(r){ return r.json(); }).then(function(j){
      var items = j.items || [];
      // An empty or failed list leaves the column hidden; nothing about it is shown to a visitor.
      if (!items.length) return;
      $('feedlist').innerHTML = feedCardsHtml(items);
      wireFeed(items);
    }).catch(function(){ /* the column stays hidden */ });
  }

  // A shared reading's "See the full reading" link arrives with ?u=<the article>: the box is filled and waits
  // for "Read it", so a visitor from a share decides when a reading is run.
  try {
    var pre = new URLSearchParams(window.location.search).get('u');
    if (pre && /^https?:\/\/\S+$/.test(pre) && pre.length < 2000) { $('t').value = pre; from = 'share'; }
  } catch (e) { /* no prefill */ }

  // The waiting screen (lane RJFAST1, 2026-11-10; Whit: "we need great ui for maintianing attentoin and
  // demonstratting features before someone navigates away"). In the same turn as the submit, the result area
  // takes the screen in the shape the reading will fill: the article (outlet, headline, officials) from the
  // list item in hand, its quick read on the dial where the list carries one, the stages the grader runs with
  // the current one named, and the five measures as empty bars each carrying its question, the two precedent
  // slots, the words behind each reading and the three rewrites as outlines of what is coming. When the reply
  // lands each fills in place. A reading the site already holds skips the stages and opens at once.
  var runId = 0, waitTimer = null, waitT0 = 0, waitStage = 0;
  function stopWait(){
    if (waitTimer) { clearTimeout(waitTimer); waitTimer = null; }
    $('out').classList.remove('wait');
    $('out').classList.remove('failed');
    $('stages').innerHTML = '';
  }
  function drawStages(i, failed){
    var s = STAGES[i];
    $('stages').innerHTML =
      '<p class="st-now"><span class="st-lead">' + (failed ? 'Stopped at' : 'Now') + '</span><span class="st-name">' + esc(s.name) + '</span></p>' +
      (failed
        ? '<p class="st-what st-err">' + esc(failed) + '</p><p class="st-act"><button type="button" class="rj-btn" id="retry">Try again</button></p>'
        : '<p class="st-what">' + esc(s.what) + '</p>') +
      '<ol class="st-list" aria-label="What the reading does, in order">' + STAGES.map(function(x, k){
        return '<li class="' + (k < i ? 'past' : k === i ? 'here' : 'ahead') + '"' + (k === i ? ' aria-current="step"' : '') + '>' + esc(x.name) + '</li>';
      }).join('') + '</ol>' +
      (failed ? '' : '<p class="st-note">A first reading takes twenty to forty seconds. An article read before opens at once.</p>');
  }
  function advance(){
    var t = Date.now() - waitT0, i = waitStage;
    while (i + 1 < STAGES.length && STAGES[i + 1].at <= t) i++;
    if (i !== waitStage) { waitStage = i; drawStages(i); }
    // The last stage holds until the reply arrives.
    if (waitStage + 1 < STAGES.length) waitTimer = setTimeout(advance, Math.max(50, STAGES[waitStage + 1].at - t));
  }
  function sk(cls){ return '<span class="sk ' + cls + '" aria-hidden="true"></span>'; }
  function waitScreen(text){
    var isUrl = /^https?:\/\/\S+$/.test(text);
    var it = isUrl ? feedByUrl[text] : null;
    collapse(text);
    $('share').hidden = true;
    $('voices').innerHTML = ''; $('voices').classList.remove('on');
    $('issues').innerHTML = ''; $('issues').classList.remove('on');
    $('quoted').innerHTML = '';
    if (it) $('art').innerHTML = artHtml(it, text);
    else if (isUrl) $('art').innerHTML = '<div class="art-by">' + outletBadge(host(text), host(text)) + '</div><a class="art-link" href="' + esc(text) + '" target="_blank" rel="noopener">' + esc(host(text)) + '</a>';
    else $('art').innerHTML = '';
    // The quick read: the light reading the list carries (the whole text in one pass), labelled as such.
    var quick = it && it.reading && it.reading.position != null ? it.reading : null;
    var qv = quick ? quick.verdict || dside(+quick.position) : '';
    $('dial').innerHTML = quick ? dial(quick.position, 'big') : dial('', 'big', true);
    $('verdict').textContent = quick ? verdictWords(qv) : '';
    $('verdict').className = 'v' + (quick ? ' ' + verdictClass(qv) : '');
    $('headline').textContent = quick ? rw(quick.headline || '') : '';
    $('meta').innerHTML = quick ? '<b class="qr">Quick read</b> of the whole text in one pass. The full reading replaces it when it lands.' : '';
    $('rows').innerHTML = rubric.map(function(r){
      return '<div class="ir wait" data-key="' + esc(r.key) + '"><span class="t">' + term(r.key, r.title) + '</span>' +
        '<span class="track"><span class="q">' + esc(r.question) + '</span></span><span class="n"></span></div>';
    }).join('');
    var slot = function(tag){ return '<div class="prec wait"><div class="tag ' + tag + '">' + (tag === 'better' ? 'Did it better' : 'Did it worse') + '</div>' + sk('h') + sk('yr') + sk('l') + sk('l') + sk('l s') + '</div>'; };
    $('prec').innerHTML = slot('better') + slot('worse');
    $('detail').innerHTML = rubric.map(function(r){
      return '<article class="r wait"><div class="rh"><span class="thumb" aria-hidden="true"></span><h3>' + esc(r.title) + '</h3></div>' +
        '<dl class="tiers"><dt>They said</dt><dd>' + sk('l') + sk('l s') + '</dd><dt>How it reads</dt><dd>' + sk('l') + sk('l') + sk('l s') + '</dd></dl></article>';
    }).join('');
    $('reframes').innerHTML = [1, 2, 3].map(function(){ return '<div class="reframe wait">' + sk('h') + sk('l') + sk('l') + sk('l') + sk('l s') + '</div>'; }).join('');
    $('out').classList.remove('failed');
    $('out').classList.add('on');
    $('out').classList.add('wait');
    if (waitTimer) { clearTimeout(waitTimer); waitTimer = null; }
    if (it && it.held) { $('stages').innerHTML = ''; return; }
    waitT0 = Date.now(); waitStage = 0;
    drawStages(0);
    advance();
  }
  function failWait(message){
    if (waitTimer) { clearTimeout(waitTimer); waitTimer = null; }
    $('out').classList.add('failed');
    drawStages(waitStage, message);
    var retry = $('retry');
    if (retry) retry.addEventListener('click', function(){ track('retry'); run(lastText); });
  }

  var lastText = '';
  function run(text){
    var source = /^https?:\/\/\S+$/.test(text) ? 'url' : 'text';
    var came = from; from = 'paste';
    var my = ++runId;
    lastText = text;
    track('grade', { source: source, from: came, length: text.length, query: text.slice(0, 1000) });
    $('go').disabled = true;
    $('status').textContent = ''; $('status').className = '';
    waitScreen(text);
    fetch(API, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: text }) })
      .then(function(r){ return r.json().then(function(j){ return { ok: r.ok, j: j }; }, function(){ return { ok: false, j: { error: 'The grader sent back something this page cannot read.' } }; }); })
      .then(function(x){
        if (my !== runId) return;
        if (!x.ok || x.j.error) { track('grade-failed', { source: source }); failWait(sentence(x.j.error || 'The reading did not come back.')); return; }
        track('result', { source: source, cached: !!x.j.cached, verdict: String(x.j.verdict || 'none'), voices: [x.j.voices && x.j.voices.politicians ? 'politicians' : '', x.j.voices && x.j.voices.coverage ? 'coverage' : ''].filter(Boolean).join(',') || 'all' });
        render(x.j);
      })
      .catch(function(err){ if (my === runId) failWait(sentence('The reading did not come back: ' + err.message)); })
      .then(function(){ if (my === runId) $('go').disabled = false; });
  }
  // What failed, as a sentence: a capital first and a full stop last.
  function sentence(s){ s = String(s || '').trim(); if (!s) return ''; s = s.charAt(0).toUpperCase() + s.slice(1); return /[.!?]$/.test(s) ? s : s + '.'; }

  $('f').addEventListener('submit', function(e){
    e.preventDefault();
    var text = $('t').value.trim();
    if (!text) { $('status').textContent = 'Paste something first.'; $('status').className = 'err'; return; }
    run(text);
  });

}
