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
export function initRevengeOrJustice(root, opts) {
  if (!root || root.dataset.init) return;
  root.dataset.init = '1';
  var track = (opts && opts.track) || function(){};
  var from = 'paste';

  var API = '/api/revenge-or-justice';
  var $ = function(id){ return document.getElementById(id); };
  var esc = function(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // The rubric text comes from the route, so the page and the grader never drift.
  fetch(API, { credentials: 'same-origin' }).then(function(r){ return r.json(); }).then(function(j){
    if (!j || !j.rubric) return;
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
      (h ? '<img src="/api/revenge-or-justice/logo?host=' + encodeURIComponent(h) + '" alt="" width="20" height="20" loading="lazy" onerror="this.remove()">' : '') + '</span>';
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
  function personTag(name){
    var c = CHAMBER[name];
    return '<span class="who elected">' + (c === 'Senate' ? 'Sen. ' : c === 'House' ? 'Rep. ' : '') + '<b>' + esc(name) + '</b></span>';
  }
  // A quoted speaker from the reading: elected officials first, in gold (the same gold as the list's tags),
  // everyone else (staff, spokespeople, advocates) outlined in ink, each with the role the text gives them.
  var NOT_ELECTED = /\b(spokes\w*|aide|staff\w*|press secretary|adviser|advisor|strategist|operative|consultant|lawyer|attorney for|counsel|analyst|director|executive|ceo|founder|professor|former|candidate|nominee|activist|advocate|organizer|president of|head of|reporter|editor|columnist)\b/i;
  var ELECTED = /\b(rep\.|representative|sen\.|senator|congress\w*|governor|gov\.|mayor|speaker|whip|leader|ranking member|chair\w*|committee|caucus|vice president|president|attorney general|council\s?\w*|assembly\w*|state senator|delegate|lawmaker|legislator)\b|\b[DR]-[A-Z]{2}\b|\([DR][-–]/i;
  function elected(role){ role = String(role || ''); return !NOT_ELECTED.test(role) && ELECTED.test(role); }
  function speakerTag(sp){
    return '<span class="who ' + (elected(sp.role) ? 'elected' : 'other') + '"><b>' + esc(sp.name) + '</b>' + (sp.role ? '<span class="role">' + esc(sp.role) + '</span>' : '') + '</span>';
  }
  function quotedBlock(speakers){
    speakers = (speakers || []).filter(function(s){ return s && s.name; });
    if (!speakers.length) return '';
    var el = speakers.filter(function(s){ return elected(s.role); }), rest = speakers.filter(function(s){ return !elected(s.role); });
    var out = '';
    if (el.length) out += '<div class="qgroup"><span class="ql">' + (el.length === 1 ? 'Elected official quoted' : 'Elected officials quoted') + '</span><span class="tags">' + el.map(speakerTag).join('') + '</span></div>';
    if (rest.length) out += '<div class="qgroup"><span class="ql">' + (el.length ? 'Also quoted' : 'Quoted') + '</span><span class="tags">' + rest.map(speakerTag).join('') + '</span></div>';
    return out;
  }
  var feedByUrl = {};

  // A bar out from the centre: left of 50 for retribution, right of 50 for justice. Returns the inline style and the side class.
  function bar(pos, extra){
    var p = Math.max(0, Math.min(100, +pos || 0)), left = p < 50 ? p : 50, w = Math.abs(p - 50);
    return '<i class="bar ' + side(p) + (p < 50 ? ' left' : '') + (extra || '') + '" style="left:' + left + '%;width:' + w + '%" data-left="' + left + '%" data-width="' + w + '%"></i>';
  }

  // Whose words: the politicians and operatives first, the outlet's own framing on a toggle, the whole text last
  // (Whit, 2026-11-06: "in the output i should see the politicians and operative etc first, and i should be able
  // to toggle to have the outlet/coverage evaluated for the same thing"). Within a voice, one tab per issue.
  function render(reply){
    var voices = reply.voices || {};
    // The source line and who is quoted belong to the article, so they stay put whichever voice or issue is picked.
    var item = reply.fetched ? feedByUrl[reply.fetched] : null;
    var h = reply.fetched ? host(reply.fetched) : '';
    var outletName = (item && item.source) || (voices.coverage && voices.coverage.outlet) || h;
    $('srcline').innerHTML = outletName ? outletBadge(item ? item.host : h, outletName) +
      (item && item.title ? '<a class="art" href="' + esc(reply.fetched) + '" target="_blank" rel="noopener">' + esc(item.title) + '</a>' : reply.fetched ? '<a class="art" href="' + esc(reply.fetched) + '" target="_blank" rel="noopener">Read the article</a>' : '') : '';
    $('quoted').innerHTML = quotedBlock(voices.politicians && voices.politicians.speakers);
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

  function names(list){ var n = list.map(function(x){ return x.name; }); return n.length <= 1 ? n.join('') : n.slice(0, -1).join(', ') + ' and ' + n[n.length - 1]; }
  function show(j, issue, ctx){
    ctx = ctx || { kind: 'all' };
    var m = [];
    if (ctx.kind === 'politicians') m.push('The words of ' + esc(names(ctx.speakers)) + (ctx.share ? ', ' + esc(ctx.share) + '% of the text' : ''));
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
    $('headline').textContent = j.error ? 'This reading did not come back.' : rw(j.headline || '');

    var rows = j.rows || [];
    $('rows').innerHTML = rows.map(function(r, i){
      var s = side(r.position);
      return '<div class="ir" role="link" tabindex="0" data-row="' + i + '" aria-label="' + esc(r.title) + ': ' + sideWords(r.position) + ', ' + Math.round(r.position) + ' of 100 toward justice. Read the words behind it.">' +
        '<span class="t">' + esc(r.title) + '</span>' +
        '<span class="track">' + bar(r.position) + '</span>' +
        '<span class="n ' + s + '">' + Math.round(r.position) + '</span></div>';
    }).join('');

    $('detail').innerHTML = rows.map(function(r, i){
      var s = side(r.position);
      var ev = r.evidence ? '<dd class="ev"><mark>' + esc(r.evidence) + '</mark></dd>' : '<dd class="ev none">The text says nothing on this.</dd>';
      var said = 'They said';
      if (ctx.kind === 'coverage') said = '<b>' + esc(ctx.outlet ? ctx.outlet : 'The outlet') + '</b> wrote';
      else if (ctx.kind === 'politicians' && r.evidence) {
        var q = String(r.evidence).toLowerCase().replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/\s+/g, ' ').trim().slice(0, 80);
        var hit = (ctx.passages || []).filter(function(p){ return String(p.text || '').toLowerCase().replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/\s+/g, ' ').indexOf(q) >= 0; })[0];
        if (hit) said = '<b>' + esc(hit.who) + '</b> said';
      }
      var rec = r.precedent ? '<dt>The record</dt><dd class="rec">' + esc(r.precedent_line || '') + ' ' + esc(r.precedent.name) + ', ' + esc(r.precedent.year) + ' (' + src(r.precedent) + ').</dd>' : '';
      return '<article class="r" id="row' + i + '">' +
        '<div class="rh"><span class="thumb" aria-hidden="true">' + bar(r.position) + '</span>' +
        '<h3>' + esc(r.title) + '</h3><span class="side ' + s + '">' + Math.round(r.position) + ', ' + sideWords(r.position) + '</span></div>' +
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
      el.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
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
    $('what').innerHTML = it ? outletBadge(it.host, it.source) + ' ' + esc(it.title) : '<b>Read:</b> ' + esc(shown);
    root.classList.add('read');
    $('strip').classList.add('on');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
  $('again').addEventListener('click', function(){
    track('again');
    root.classList.remove('read');
    $('strip').classList.remove('on');
    $('out').classList.remove('on');
    $('t').value = '';
    $('t').focus();
    window.scrollTo({ top: 0, behavior: 'auto' });
  });

  // The headline list. A click drops the link in the box and submits it, so the strip and the result read as any pasted link.
  var FEED = '/api/revenge-or-justice/feed';
  function when(iso){ if (!iso) return ''; var d = new Date(iso); if (isNaN(d)) return ''; return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }); }
  fetch(FEED, { credentials: 'same-origin' }).then(function(r){ return r.json(); }).then(function(j){
    var items = j.items || [];
    // An empty or failed list leaves the column hidden; nothing about it is shown to a visitor.
    if (!items.length) return;
    $('feed').hidden = false;
    var SHOW = 8;
    $('feedlist').innerHTML = items.map(function(it, k){
      feedByUrl[it.url] = it;
      var hue = hueOf(it.host);
      var people = it.people || [];
      return '<li' + (k >= SHOW ? ' class="rj-more"' : '') + '><button type="button" class="pick"' + (hue ? ' style="--oc:' + hue + '"' : '') + ' data-url="' + esc(it.url) + '">' +
        '<span class="by">' + outletBadge(it.host, it.source) + (when(it.published) ? '<span class="when">' + when(it.published) + '</span>' : '') + '</span>' +
        '<span class="hl">' + esc(it.title) + '</span>' +
        (people.length ? '<span class="tags">' + people.map(personTag).join('') + '</span>' : '') +
        '</button></li>';
    }).join('') + (items.length > SHOW ? '<li class="all"><button type="button" class="quietbtn" id="feedall">All ' + items.length + ' articles</button></li>' : '');
    if ($('feedall')) $('feedall').addEventListener('click', function(){ track('headlines-all', { count: items.length }); $('feedlist').classList.add('open'); $('feedall').parentNode.removeChild($('feedall')); });
    Array.prototype.forEach.call($('feedlist').querySelectorAll('.pick'), function(b){
      b.addEventListener('click', function(){
        var list = $('feedlist').querySelectorAll('.pick');
        track('headline', { url: b.getAttribute('data-url').slice(0, 300), rank: Array.prototype.indexOf.call(list, b) + 1 });
        from = 'headline';
        $('t').value = b.getAttribute('data-url');
        if ($('f').requestSubmit) $('f').requestSubmit(); else $('f').dispatchEvent(new Event('submit', { cancelable: true }));
        window.scrollTo({ top: 0, behavior: 'auto' });
      });
    });
  }).catch(function(){ /* the column stays hidden */ });

  $('f').addEventListener('submit', function(e){
    e.preventDefault();
    var text = $('t').value.trim();
    if (!text) { $('status').textContent = 'Paste something first.'; $('status').className = 'err'; return; }
    var source = /^https?:\/\/\S+$/.test(text) ? 'url' : 'text';
    var came = from; from = 'paste';
    track('grade', { source: source, from: came, length: text.length, query: text.slice(0, 1000) });
    $('go').disabled = true;
    $('status').className = 'busy';
    $('status').textContent = 'Reading it against the rubric and the record. Twenty to forty seconds.';
    $('out').classList.remove('on');
    fetch(API, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: text }) })
      .then(function(r){ return r.json().then(function(j){ return { ok: r.ok, j: j }; }); })
      .then(function(x){
        if (!x.ok || x.j.error) { track('grade-failed', { source: source }); $('status').textContent = x.j.error || 'It failed.'; $('status').className = 'err'; return; }
        track('result', { source: source, verdict: String(x.j.verdict || 'none'), voices: [x.j.voices && x.j.voices.politicians ? 'politicians' : '', x.j.voices && x.j.voices.coverage ? 'coverage' : ''].filter(Boolean).join(',') || 'all' });
        $('status').textContent = ''; $('status').className = '';
        collapse(text);
        render(x.j);
      })
      .catch(function(err){ $('status').textContent = 'It failed: ' + err.message; $('status').className = 'err'; })
      .then(function(){ $('go').disabled = false; });
  });

}
