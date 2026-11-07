/* Hoplight signal kit, 2026-11-07. Feedback and anonymous usage for tools hosted off hoplight.ai.
   <script src="https://hoplight.ai/kit/signal.js" defer></script>
   hoplightSignal.track('gut-check', 'vote', { card: 'ai-1', side: 'agree' });
   hoplightSignal.feedback('gut-check', 'The deck froze', 'me@example.org').then(function (ok) {});
   No cookie, no stored id. What is kept is written in hoplight.ai's src/lib/signal.ts. */
(function () {
  var s = document.currentScript;
  var url = (s && s.src ? new URL(s.src).origin : 'https://hoplight.ai') + '/api/signal';
  function body(o) { o.path = location.pathname; return JSON.stringify(o); }
  function flat(p) {
    var o = {}, k, v;
    for (k in p || {}) {
      v = p[k];
      if (typeof v === 'string') o[k] = v.slice(0, 1000);
      else if (typeof v === 'number' || typeof v === 'boolean') o[k] = v;
    }
    return o;
  }
  function track(tool, action, props) {
    try {
      var b = body({ kind: 'event', tool: tool, action: action, props: flat(props) });
      // text/plain keeps the beacon a simple request; the site reads the body as JSON either way.
      if (!(navigator.sendBeacon && navigator.sendBeacon(url, new Blob([b], { type: 'text/plain' })))) {
        fetch(url, { method: 'POST', mode: 'cors', headers: { 'Content-Type': 'text/plain' }, body: b, keepalive: true }).catch(function () {});
      }
    } catch (e) {}
  }
  function feedback(tool, message, contact) {
    return fetch(url, {
      method: 'POST', mode: 'cors', headers: { 'Content-Type': 'application/json' },
      body: body({ kind: 'feedback', tool: tool, action: 'feedback', message: message, contact: contact || undefined })
    }).then(function (r) { return r.ok; }, function () { return false; });
  }
  window.hoplightSignal = { track: track, feedback: feedback };
})();
