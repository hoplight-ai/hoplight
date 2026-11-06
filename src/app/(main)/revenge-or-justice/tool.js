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
  function sideWords(pos){ var s = side(pos); return s === 'mixed' ? 'mixed' : 'leans ' + word(s); }
  function src(p){ return p && p.url ? '<a href="' + esc(p.url) + '" target="_blank" rel="noopener">' + esc(p.source) + '</a>' : esc(p && p.source || ''); }
  function host(u){ try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return u; } }

  // A bar out from the centre: left of 50 for retribution, right of 50 for justice. Returns the inline style and the side class.
  function bar(pos, extra){
    var p = Math.max(0, Math.min(100, +pos || 0)), left = p < 50 ? p : 50, w = Math.abs(p - 50);
    return '<i class="bar ' + side(p) + (p < 50 ? ' left' : '') + (extra || '') + '" style="left:' + left + '%;width:' + w + '%" data-left="' + left + '%" data-width="' + w + '%"></i>';
  }

  // A text about several issues gets one tab per issue, each graded on its own passages, and the whole text last.
  function render(reply){
    var issues = reply.issues || [];
    var tabs = $('issues');
    if (issues.length >= 2) {
      tabs.innerHTML = issues.map(function(it, k){ return '<button type="button" role="tab" data-k="' + k + '" aria-selected="false">' + esc(it.name) + '</button>'; }).join('') +
        '<button type="button" role="tab" data-k="all" aria-selected="false">All together</button>';
      tabs.classList.add('on');
      Array.prototype.forEach.call(tabs.querySelectorAll('button'), function(b){
        b.addEventListener('click', function(){ select(b.getAttribute('data-k')); window.scrollTo({ top: 0, behavior: 'auto' }); });
      });
      select('0');
    } else {
      tabs.innerHTML = ''; tabs.classList.remove('on');
      show(reply, null);
    }
    function select(k){
      Array.prototype.forEach.call(tabs.querySelectorAll('button'), function(b){ b.setAttribute('aria-selected', b.getAttribute('data-k') === k ? 'true' : 'false'); });
      if (k === 'all') show(reply, null); else show(issues[+k], issues[+k]);
    }
  }

  function show(j, issue){
    var m = [];
    if (issue) {
      m.push('This issue is ' + esc(issue.share) + '% of the text');
    } else {
      if (j.fetched) m.push('Read from <a href="' + esc(j.fetched) + '" target="_blank" rel="noopener">' + esc(host(j.fetched)) + '</a>');
      if (j.issues && j.issues.length >= 2) m.push('all ' + j.issues.length + ' issues together');
    }
    if (j.fallbacks && j.fallbacks.length) m.push('<span class="warn">' + j.fallbacks.length + (j.fallbacks.length === 1 ? ' model refused' : ' models refused') + ' before this one answered</span>');
    if (j.error) m.push('<span class="warn">this issue could not be graded: ' + esc(j.error) + '</span>');
    $('meta').innerHTML = m.join(' · ');
    $('verdict').textContent = j.error ? '' : (j.verdict === 'mixed' ? 'Mixed' : j.verdict ? 'Leans ' + word(j.verdict) : '');
    $('headline').textContent = j.error ? 'The grade for this issue did not come back.' : (j.headline || '');

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
      var rec = r.precedent ? '<dt>The record</dt><dd class="rec">' + esc(r.precedent_line || '') + ' ' + esc(r.precedent.name) + ', ' + esc(r.precedent.year) + ' (' + src(r.precedent) + ').</dd>' : '';
      return '<article class="r" id="row' + i + '">' +
        '<div class="rh"><span class="thumb" aria-hidden="true">' + bar(r.position) + '</span>' +
        '<h3>' + esc(r.title) + '</h3><span class="side ' + s + '">' + Math.round(r.position) + ', ' + sideWords(r.position) + '</span></div>' +
        '<dl class="tiers"><dt>They said</dt>' + ev +
        '<dt>How it reads</dt><dd class="crit">' + esc(r.critique || '') + '</dd>' + rec + '</dl></article>';
    }).join('');

    $('reframes').innerHTML = (j.reframes || []).map(function(f, i){
      var b = f.borrows ? ' Borrows ' + esc(f.borrows.name) + ', ' + esc(f.borrows.year) + ' (' + src(f.borrows) + ').' : '';
      return '<div class="reframe"><h3>' + esc(f.label || ('Rewrite ' + (i + 1))) + '</h3>' +
        '<p class="t" id="rf' + i + '">' + esc(f.text || '') + '</p>' +
        '<p class="why">' + esc(f.why || '') + b + '</p><button class="copy" type="button" data-copy="rf' + i + '">Copy this rewrite</button></div>';
    }).join('') || '<p class="h2sub">No rewrite came back.</p>';
    if (j.dropped && j.dropped.length) {
      $('reframes').innerHTML += '<p class="dropped">' + j.dropped.length + (j.dropped.length === 1 ? ' rewrite was' : ' rewrites were') + ' thrown away for carrying a number the text does not contain (' + esc(j.dropped.map(function(d){ return d.numbers.join(', '); }).join('; ')) + ').</p>';
    }

    function precBlock(tag, p){
      if (!p) return '';
      return '<div class="prec"><div class="tag ' + tag + '">' + (tag === 'better' ? 'Did it better' : 'Did it worse') + '</div><h3>' + esc(p.name) + '</h3><div class="yr">' + esc(p.year) + '</div>' +
        '<p class="this">' + esc(p.why_this_one || '') + '</p><p>' + esc(p.move) + '</p><p>' + esc(p.lesson) + '</p><p class="src">' + src(p) + '</p></div>';
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
