// The grader's page script, ported 2026-11-06 from quick-tools/tools/justice-or-retribution.html as it stood
// (build v6) and kept as plain script on purpose: the exhibit is drawn by id into static markup the
// React tree never re-renders, so the two never fight over the same nodes. Only the three lines that
// name a route or the page root changed. Edits to the reading, the bars, the tiers or the headline list
// belong here and in the quick-tools original alike until that page is retired.
export function initRevengeOrJustice(root) {
  if (!root || root.dataset.init) return;
  root.dataset.init = '1';

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
  $('showr').addEventListener('click', function(){ $('rubric').classList.toggle('on'); });

  function side(pos){ return pos >= 62 ? 'justice' : pos <= 38 ? 'retribution' : 'mixed'; }
  // On hoplight.ai the bad side is called revenge (Whit, 2026-11-06: make justice the second thing so it rings). The API's word stays retribution; only what is shown changes.
  function word(s){ return s === 'retribution' ? 'revenge' : s; }
  // The same swap in the model's own prose (the claim, the critiques, the rewrites and their reasons); the quoted evidence is the source's words and is never touched.
  function rw(s){ return String(s == null ? '' : s).replace(/\bRetribution\b/g, 'Revenge').replace(/\bretribution\b/g, 'revenge'); }
  function sideWords(pos){ var s = side(pos); return s === 'mixed' ? 'mixed' : 'leans ' + word(s); }
  function src(p){ return p && p.url ? '<a href="' + esc(p.url) + '" target="_blank" rel="noopener">' + esc(p.source) + '</a>' : esc(p && p.source || ''); }
  function host(u){ try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return u; } }

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
    var views = [];
    if (voices.politicians) views.push({ k: 'politicians', label: 'The politicians', j: voices.politicians });
    if (voices.coverage) views.push({ k: 'coverage', label: 'The coverage', j: voices.coverage });
    views.push({ k: 'all', label: views.length ? 'All of it' : 'All together', j: reply });
    var vt = $('voices'), tabs = $('issues'), issues = reply.issues || [];
    var issuesOf = reply.issues_of || 'all';
    if (views.length > 1) {
      vt.innerHTML = views.map(function(v){ return '<button type="button" role="tab" data-v="' + v.k + '" aria-selected="false">' + esc(v.label) + '</button>'; }).join('');
      vt.classList.add('on');
      Array.prototype.forEach.call(vt.querySelectorAll('button'), function(b){
        b.addEventListener('click', function(){ pick(b.getAttribute('data-v')); window.scrollTo({ top: 0, behavior: 'auto' }); });
      });
    } else { vt.innerHTML = ''; vt.classList.remove('on'); }
    function ctxFor(v){
      if (v.k === 'politicians') return { kind: 'politicians', speakers: v.j.speakers || [], passages: v.j.passages || [], share: v.j.share };
      if (v.k === 'coverage') return { kind: 'coverage', outlet: v.j.outlet || '', share: v.j.share };
      return { kind: 'all' };
    }
    function pick(k){
      Array.prototype.forEach.call(vt.querySelectorAll('button'), function(b){ b.setAttribute('aria-selected', b.getAttribute('data-v') === k ? 'true' : 'false'); });
      var v = views.filter(function(x){ return x.k === k; })[0] || views[views.length - 1];
      var ctx = ctxFor(v);
      var withIssues = issues.length >= 2 && ((k === 'politicians' && issuesOf === 'politicians') || (k === 'all' && issuesOf === 'all'));
      if (withIssues) {
        tabs.innerHTML = '<button type="button" role="tab" data-k="all" aria-selected="true">All together</button>' +
          issues.map(function(it, n){ return '<button type="button" role="tab" data-k="' + n + '" aria-selected="false">' + esc(it.name) + '</button>'; }).join('');
        tabs.classList.add('on');
        Array.prototype.forEach.call(tabs.querySelectorAll('button'), function(b){
          b.addEventListener('click', function(){
            var key = b.getAttribute('data-k');
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
    else if (ctx.kind === 'coverage') m.push((ctx.outlet ? esc(ctx.outlet) + '\u2019s' : 'The outlet\u2019s') + ' own framing' + (ctx.share ? ', ' + esc(ctx.share) + '% of the text' : ''));
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
      var ev = r.evidence ? '<dd class="ev">' + esc(r.evidence) + '</dd>' : '<dd class="ev none">The text says nothing on this.</dd>';
      var said = 'They said';
      if (ctx.kind === 'coverage') said = (ctx.outlet ? ctx.outlet : 'The outlet') + ' wrote';
      else if (ctx.kind === 'politicians' && r.evidence) {
        var q = String(r.evidence).toLowerCase().replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/\s+/g, ' ').trim().slice(0, 80);
        var hit = (ctx.passages || []).filter(function(p){ return String(p.text || '').toLowerCase().replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/\s+/g, ' ').indexOf(q) >= 0; })[0];
        if (hit) said = hit.who + ' said';
      }
      var rec = r.precedent ? '<dt>The record</dt><dd class="rec">' + esc(r.precedent_line || '') + ' ' + esc(r.precedent.name) + ', ' + esc(r.precedent.year) + ' (' + src(r.precedent) + ').</dd>' : '';
      return '<article class="r" id="row' + i + '">' +
        '<div class="rh"><span class="thumb" aria-hidden="true">' + bar(r.position) + '</span>' +
        '<h3>' + esc(r.title) + '</h3><span class="side ' + s + '">' + Math.round(r.position) + ', ' + sideWords(r.position) + '</span></div>' +
        '<dl class="tiers"><dt>' + esc(said) + '</dt>' + ev +
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
        navigator.clipboard.writeText(t).then(function(){ b.textContent = 'Copied'; setTimeout(function(){ b.textContent = 'Copy this rewrite'; }, 1500); });
      });
    });
  }

  function collapse(text){
    var isUrl = /^https?:\/\/\S+$/.test(text);
    var shown = isUrl ? host(text) : text.replace(/\s+/g, ' ').slice(0, 140) + (text.length > 140 ? '…' : '');
    $('what').innerHTML = '<b>Read:</b> ' + esc(shown);
    root.classList.add('read');
    $('strip').classList.add('on');
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
  $('again').addEventListener('click', function(){
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
    if (!items.length) { $('feednote').textContent = j.error || 'No headline in the last two weeks matched the names and the key words.'; $('feednote').className = 'note' + (j.error ? ' err' : ''); return; }
    $('feednote').textContent = '';
    var SHOW = 8;
    $('feedlist').innerHTML = items.map(function(it, k){
      var who = (it.people || []).join(', ');
      return '<li' + (k >= SHOW ? ' class="rj-more"' : '') + '><button type="button" class="pick" data-url="' + esc(it.url) + '"><span class="hl">' + esc(it.title) + '</span>' +
        '<span class="by"><b>' + esc(it.source) + '</b>' + (when(it.published) ? ' · ' + when(it.published) : '') + (who ? ' · ' + esc(who) : '') + '</span></button></li>';
    }).join('') + (items.length > SHOW ? '<li class="all"><button type="button" class="quietbtn" id="feedall">All ' + items.length + ' articles</button></li>' : '');
    if ($('feedall')) $('feedall').addEventListener('click', function(){ $('feedlist').classList.add('open'); $('feedall').parentNode.removeChild($('feedall')); });
    Array.prototype.forEach.call($('feedlist').querySelectorAll('.pick'), function(b){
      b.addEventListener('click', function(){
        $('t').value = b.getAttribute('data-url');
        if ($('f').requestSubmit) $('f').requestSubmit(); else $('f').dispatchEvent(new Event('submit', { cancelable: true }));
        window.scrollTo({ top: 0, behavior: 'auto' });
      });
    });
  }).catch(function(err){ $('feednote').textContent = 'The headline list did not load: ' + err.message; $('feednote').className = 'note err'; });

  $('f').addEventListener('submit', function(e){
    e.preventDefault();
    var text = $('t').value.trim();
    if (!text) { $('status').textContent = 'Paste something first.'; $('status').className = 'err'; return; }
    $('go').disabled = true;
    $('status').className = 'busy';
    $('status').textContent = 'Reading it against the rubric and the record. Twenty to forty seconds.';
    $('out').classList.remove('on');
    fetch(API, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: text }) })
      .then(function(r){ return r.json().then(function(j){ return { ok: r.ok, j: j }; }); })
      .then(function(x){
        if (!x.ok || x.j.error) { $('status').textContent = x.j.error || 'It failed.'; $('status').className = 'err'; return; }
        $('status').textContent = ''; $('status').className = '';
        collapse(text);
        render(x.j);
      })
      .catch(function(err){ $('status').textContent = 'It failed: ' + err.message; $('status').className = 'err'; })
      .then(function(){ $('go').disabled = false; });
  });

}
