'use client';

import { useState } from 'react';

// One copy button per draft post. The clipboard API first; on a browser that refuses it (an older
// phone, a page not on https), the text is put in a hidden textarea, selected and copied the old way.
// Nothing is sent anywhere: no tracking on this page (brief RJPAGE1, "No tracking added to the page").
export default function CopyButton({ text, label }: { text: string; label: string }) {
  const [state, setState] = useState<'idle' | 'done' | 'failed'>('idle');

  async function copy() {
    let ok = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        ok = true;
      }
    } catch {
      ok = false;
    }
    if (!ok) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.top = '0';
      ta.style.left = '0';
      ta.style.opacity = '0';
      ta.style.fontSize = '16px'; // iOS zooms the page on a smaller field
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      ta.setSelectionRange(0, text.length);
      try {
        ok = document.execCommand('copy');
      } catch {
        ok = false;
      }
      document.body.removeChild(ta);
    }
    setState(ok ? 'done' : 'failed');
    window.setTimeout(() => setState('idle'), 2400);
  }

  return (
    <button type="button" className="copy" onClick={copy} aria-label={`Copy the ${label} draft`}>
      <span aria-live="polite">{state === 'done' ? 'Copied' : state === 'failed' ? 'Select the text to copy' : 'Copy text'}</span>
    </button>
  );
}
